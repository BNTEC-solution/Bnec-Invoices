import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useCallback, useState, useEffect } from 'react';

export type LimitType = 'invoices' | 'products' | 'members' | 'organizations';

const PLAN_LIMITS = {
  free: {
    invoices: 5,
    products: 10,
    members: 2,
    organizations: 1
  },
  pro: {
    invoices: Infinity,
    products: Infinity,
    members: 10,
    organizations: 3
  },
  enterprise: {
    invoices: Infinity,
    products: Infinity,
    members: Infinity,
    organizations: Infinity
  }
};

export function usePlanLimits() {
  const { organization } = useAuth();
  const [usage, setUsage] = useState<Record<string, number>>({});

  const fetchUsage = useCallback(async () => {
    if (!organization) return;

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('metric, value')
      .eq('organization_id', organization.id);

    if (error) {
      console.error('Error fetching usage:', error);
      return;
    }

    const usageMap = (data || []).reduce((acc, curr) => ({
      ...acc,
      [curr.metric]: curr.value
    }), {});

    setUsage(usageMap);
  }, [organization]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const checkLimit = useCallback(async (type: LimitType) => {
    if (!organization) return { allowed: false, message: 'No organization active' };

    const plan = (organization.plan_id as keyof typeof PLAN_LIMITS) || 'free';
    const limit = PLAN_LIMITS[plan][type];

    if (limit === Infinity) return { allowed: true };

    const { data } = await supabase
      .from('usage_tracking')
      .select('value')
      .eq('organization_id', organization.id)
      .eq('metric', type)
      .maybeSingle();

    const currentUsage = data?.value || 0;

    if (currentUsage >= limit) {
      return { 
        allowed: false, 
        message: `Plan limit reached. You have used ${currentUsage}/${limit} ${type}. Upgrade to Pro for unlimited access!` 
      };
    }

    return { allowed: true, current: currentUsage, limit };
  }, [organization]);

  const isLimitReached = useCallback((type: LimitType) => {
    if (!organization) return false;
    const plan = (organization.plan_id as keyof typeof PLAN_LIMITS) || 'free';
    const limit = PLAN_LIMITS[plan][type];
    if (limit === Infinity) return false;
    return (usage[type] || 0) >= limit;
  }, [organization, usage]);

  const incrementUsage = useCallback(async (type: LimitType) => {
    if (!organization) return;

    const { data: currentData } = await supabase
      .from('usage_tracking')
      .select('value')
      .eq('organization_id', organization.id)
      .eq('metric', type)
      .maybeSingle();

    const newValue = (currentData?.value || 0) + 1;
    
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { error } = await supabase
      .from('usage_tracking')
      .upsert({
        organization_id: organization.id,
        metric: type,
        value: newValue,
        period_start: periodStart,
        period_end: periodEnd
      }, {
        onConflict: 'organization_id, metric, period_start'
      });

    if (error) {
      console.error('Error incrementing usage:', error);
    } else {
      fetchUsage(); // Refresh local state
    }
  }, [organization, fetchUsage]);

  return { checkLimit, incrementUsage, isLimitReached, usage };
}
