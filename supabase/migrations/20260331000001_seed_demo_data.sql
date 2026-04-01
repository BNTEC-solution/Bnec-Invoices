/*
  # Seed Demo Data for SaaS Platform
  
  ## Contents
  - Plans (Free, Pro, Enterprise)
  - A demo organization (Acme Solutions)
  - Demo clients and suppliers
  - Demo products and stock
  - Demo invoices and payments
  - Demo taxes and audit logs
*/

DO $$ 
DECLARE
    org_id UUID;
    user_id UUID;
    client_id UUID;
    supplier_id UUID;
    product_laptop_id UUID;
    product_monitor_id UUID;
    invoice_id UUID;
BEGIN
    -- 1. Create Plans
    INSERT INTO plans (id, name, description, price_monthly, price_yearly, features, max_invoices, max_users)
    VALUES 
        (gen_random_uuid(), 'Free', 'Perfect for individuals starting out', 0, 0, '{"invoices": true, "inventory": false}', 5, 1),
        (gen_random_uuid(), 'Pro', 'Scale your business with advanced tools', 29.99, 299.99, '{"invoices": true, "inventory": true, "reports": true}', 100, 5),
        (gen_random_uuid(), 'Enterprise', 'Full control for large organizations', 99.99, 999.99, '{"invoices": true, "inventory": true, "reports": true, "api": true}', NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- 2. Find or create a demo user (linked to existing auth if possible, otherwise skip seeding user-dependent data)
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        -- Ensure user profile exists
        INSERT INTO users (id, email, full_name)
        VALUES (user_id, 'demo@example.com', 'Demo User')
        ON CONFLICT (id) DO NOTHING;

        -- 3. Create Demo Organization
        INSERT INTO organizations (name, slug, currency, tax_rate, address)
        VALUES ('Acme Solutions', 'acme-solutions', 'USD', 20.00, '123 Tech Avenue, Silicon Valley, CA')
        RETURNING id INTO org_id;

        -- 4. Create Membership
        INSERT INTO memberships (user_id, organization_id, role)
        VALUES (user_id, org_id, 'owner');

        -- 5. Create Default Taxes
        INSERT INTO taxes (organization_id, name, rate, is_default)
        VALUES 
            (org_id, 'VAT 20%', 20.00, TRUE),
            (org_id, 'Zero Rate', 0.00, FALSE);

        -- 6. Create Suppliers
        INSERT INTO suppliers (organization_id, name, email, phone, address)
        VALUES (org_id, 'Global Tech Supply', 'orders@globaltech.com', '+1-555-0199', '456 Supply Way, Houston, TX')
        RETURNING id INTO supplier_id;

        -- 7. Create Clients
        INSERT INTO clients (organization_id, name, email, phone, address)
        VALUES (org_id, 'Stark Industries', 'tony@stark.com', '+1-555-0122', 'Malibu, Point Dume')
        RETURNING id INTO client_id;

        INSERT INTO clients (organization_id, name, email, phone, address)
        VALUES (org_id, 'Wayne Enterprises', 'bruce@wayne.com', '+1-555-0133', 'Gotham City, NJ');

        -- 8. Create Products
        INSERT INTO products (organization_id, supplier_id, name, description, sku, price, cost, quantity, low_stock_threshold)
        VALUES (org_id, supplier_id, 'Developer Laptop Pro', 'High-performance workstation for developers', 'LAP-001', 1999.99, 1200.00, 15, 5)
        RETURNING id INTO product_laptop_id;

        INSERT INTO products (organization_id, supplier_id, name, description, sku, price, cost, quantity, low_stock_threshold)
        VALUES (org_id, supplier_id, 'UltraSharp 27" Monitor', '4K Professional color-accurate monitor', 'MON-4K-27', 599.99, 350.00, 25, 10)
        RETURNING id INTO product_monitor_id;

        -- 9. Create Invoices
        INSERT INTO invoices (organization_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total, notes, created_by)
        VALUES (org_id, client_id, 'INV-WXP-001', 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days', 2599.98, 519.99, 3119.97, 'Thank you for your business!', user_id)
        RETURNING id INTO invoice_id;

        -- 10. Create Invoice Items
        INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total)
        VALUES 
            (invoice_id, product_laptop_id, 'Developer Laptop Pro', 1, 1999.99, 1999.99),
            (invoice_id, product_monitor_id, 'UltraSharp 27" Monitor', 1, 599.99, 599.99);

        -- 11. Create Payment
        INSERT INTO payments (invoice_id, amount, payment_date, payment_method, notes, created_by)
        VALUES (invoice_id, 3119.97, CURRENT_DATE - INTERVAL '14 days', 'bank_transfer', 'Payment cleared via Chase Bank', user_id);

        -- 12. Stock Movements
        INSERT INTO stock_movements (organization_id, product_id, type, quantity, reference_type, reference_id, notes, created_by)
        VALUES (org_id, product_laptop_id, 'out', 1, 'invoice', invoice_id, 'Sale for INV-WXP-001', user_id);

        -- 13. Audit Log
        INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, details)
        VALUES (org_id, user_id, 'create_invoice', 'invoice', invoice_id, '{"invoice_number": "INV-WXP-001"}');

        -- 14. Usage Tracking
        INSERT INTO usage_tracking (organization_id, metric, value, period_start, period_end)
        VALUES (org_id, 'invoices_created', 1, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '1 day');

    END IF;
END $$;
