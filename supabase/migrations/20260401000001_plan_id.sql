/*
  # Add Subscription Tiers to Organizations
  
  1. New Fields:
    - Add `plan_id` to `organizations` table.
   
  2. Defaults:
    - Set default plan to 'free' for existing organizations.
*/

-- 1. Add plan_id to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free';

-- 2. Update usage_tracking table if needed (it already matches the schema I researched)
-- But I'll add a unique constraint on (organization_id, metric, period_start) to support upserts
ALTER TABLE usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_org_metric_period_key;
ALTER TABLE usage_tracking ADD CONSTRAINT usage_tracking_org_metric_period_key UNIQUE (organization_id, metric, period_start);
