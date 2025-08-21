-- Sample data insertions for LunchBox Express
-- This creates demo users for each role with their related data

/*
# Sample Data for LunchBox Express

This file creates sample users and data for demonstration:
1. System Admin
2. Parent with children
3. Delivery staff member
4. School admin with school
5. Caterer with menu items
6. Sample orders and related data

## Demo Login Credentials:
- Admin: admin_user / password123
- Parent: rajesh_sharma / password123  
- Delivery: speedrider / password123
- School: dps_koramangala / password123
- Caterer: healthy_kitchen / password123
*/

-- Insert demo users
INSERT INTO users (id, username, email, phone, password_hash, role, account_status) VALUES
(gen_random_uuid(), 'admin_user', 'admin@lunchboxexpress.com', '+919876543210', '$2b$10$example_hash_admin', 'admin', 'active'),
(gen_random_uuid(), 'rajesh_sharma', 'rajesh.sharma@email.com', '+919876543211', '$2b$10$example_hash_parent', 'parent', 'active'),
(gen_random_uuid(), 'speedrider', 'arjun.kumar@email.com', '+919876543212', '$2b$10$example_hash_delivery', 'delivery_staff', 'active'),
(gen_random_uuid(), 'dps_koramangala', 'admin@dpskoramangala.edu.in', '+919876543213', '$2b$10$example_hash_school', 'school_admin', 'active'),
(gen_random_uuid(), 'healthy_kitchen', 'contact@healthykitchen.com', '+919876543214', '$2b$10$example_hash_caterer', 'caterer', 'active');

-- Get user IDs for reference
DO $$
DECLARE
    admin_user_id uuid;
    parent_user_id uuid;
    delivery_user_id uuid;
    school_user_id uuid;
    caterer_user_id uuid;
    parent_id uuid;
    school_id uuid;
    caterer_id uuid;
    delivery_staff_id uuid;
    child1_id uuid;
    child2_id uuid;
    menu_item1_id uuid;
    menu_item2_id uuid;
    order1_id uuid;
    order2_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin_user';
    SELECT id INTO parent_user_id FROM users WHERE username = 'rajesh_sharma';
    SELECT id INTO delivery_user_id FROM users WHERE username = 'speedrider';
    SELECT id INTO school_user_id FROM users WHERE username = 'dps_koramangala';
    SELECT id INTO caterer_user_id FROM users WHERE username = 'healthy_kitchen';

    -- Insert parent details
    INSERT INTO parents (id, user_id, full_name, house_number, location_name, city_name, full_address, loyalty_points)
    VALUES (gen_random_uuid(), parent_user_id, 'Rajesh Sharma', '123A', 'Koramangala', 'Bangalore', '123A, 5th Block, Koramangala, Bangalore - 560034', 168)
    RETURNING id INTO parent_id;

    -- Insert delivery staff details
    INSERT INTO delivery_staff (id, user_id, full_name, duplicate_name, vehicle_type, vehicle_number, service_areas, address, rating, total_deliveries, total_earnings)
    VALUES (gen_random_uuid(), delivery_user_id, 'Arjun Kumar', 'SpeedRider123', 'bike', 'KA-05-MN-1234', 
            ARRAY['Koramangala', 'BTM Layout', 'Jayanagar'], 
            'HSR Layout, Bangalore', 4.8, 1250, 45000.00)
    RETURNING id INTO delivery_staff_id;

    -- Insert school details
    INSERT INTO schools (id, user_id, school_name, school_id, contact_person, established_year, classes_offered, school_address, location)
    VALUES (gen_random_uuid(), school_user_id, 'Delhi Public School', 'DPS001', 'Mrs. Sunita Rao', 1995, 
            ARRAY['LKG', 'UKG', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade'],
            'Koramangala, Bangalore - 560034',
            '{"lat": 12.9352, "lng": 77.6245}')
    RETURNING id INTO school_id;

    -- Insert caterer details
    INSERT INTO caterers (id, user_id, business_name, contact_person, business_address, rating, location, is_active)
    VALUES (gen_random_uuid(), caterer_user_id, 'Healthy Bites Kitchen', 'Mrs. Priya Menon', 'Indiranagar, Bangalore', 4.7, 
            '{"lat": 12.9718, "lng": 77.6410}', true)
    RETURNING id INTO caterer_id;

    -- Insert children
    INSERT INTO children (id, parent_id, school_id, name, age, class_name, allergies, food_preferences)
    VALUES 
    (gen_random_uuid(), parent_id, school_id, 'Kavya Sharma', 8, '3rd Grade', ARRAY['nuts'], ARRAY['vegetarian']),
    (gen_random_uuid(), parent_id, school_id, 'Arjun Sharma', 6, '1st Grade', ARRAY['dairy'], ARRAY['no-spicy'])
    RETURNING id INTO child1_id;

    -- Update parent children count
    UPDATE parents SET children_count = 2 WHERE id = parent_id;

    -- Insert menu items
    INSERT INTO menu_items (id, caterer_id, name, description, category, items_included, allergens, price, calories, protein, carbohydrates, fat, fiber, image_url, is_available)
    VALUES 
    (gen_random_uuid(), caterer_id, 'Healthy Veggie Lunchbox', 'Nutritious vegetarian meal with rice, dal, vegetables and curd', 'lunchbox', 
     ARRAY['Steamed Rice', 'Dal Tadka', 'Mixed Vegetables', 'Curd', 'Pickle'], ARRAY['gluten'], 120.00, 450, 15.5, 65.2, 8.3, 12.1,
     'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true),
    (gen_random_uuid(), caterer_id, 'Fresh Fruit Bowl', 'Seasonal fresh fruits with honey', 'fruit_bowl',
     ARRAY['Apple Slices', 'Orange Segments', 'Banana', 'Grapes', 'Honey'], ARRAY[], 80.00, 180, 2.1, 45.8, 0.5, 8.2,
     'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg', true)
    RETURNING id INTO menu_item1_id;

    -- Insert more caterer and menu items
    INSERT INTO caterers (id, user_id, business_name, contact_person, business_address, rating, location, is_active)
    VALUES (gen_random_uuid(), caterer_user_id, 'Mom''s Kitchen', 'Mrs. Lakshmi Iyer', 'Jayanagar, Bangalore', 4.9, 
            '{"lat": 12.9279, "lng": 77.5937}', true);

    -- Get the second caterer ID
    SELECT id INTO caterer_id FROM caterers WHERE business_name = 'Mom''s Kitchen';

    INSERT INTO menu_items (caterer_id, name, description, category, items_included, allergens, price, calories, protein, carbohydrates, fat, fiber, image_url, is_available)
    VALUES 
    (caterer_id, 'Traditional South Indian Meal', 'Authentic south Indian lunch with sambar, rasam and vegetables', 'lunchbox',
     ARRAY['Rice', 'Sambar', 'Rasam', 'Poriyal', 'Papad', 'Pickle'], ARRAY['gluten'], 140.00, 520, 18.2, 72.5, 12.1, 15.3,
     'https://images.pexels.com/photos/5938348/pexels-photo-5938348.jpeg', true),
    (caterer_id, 'Mixed Dry Fruit Bowl', 'Premium dry fruits and nuts', 'fruit_bowl',
     ARRAY['Almonds', 'Cashews', 'Dates', 'Raisins', 'Walnuts'], ARRAY['nuts'], 150.00, 320, 12.5, 25.8, 22.1, 6.2,
     'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg', true);

    -- Insert sample orders
    INSERT INTO orders (id, tracking_id, parent_id, child_id, school_id, delivery_staff_id, order_type, status, 
                       delivery_address, total_amount, delivery_fee, loyalty_points_earned, created_at)
    VALUES 
    (gen_random_uuid(), 'TRK' || LPAD(EXTRACT(epoch FROM now())::text, 10, '0'), parent_id, child1_id, school_id, delivery_staff_id, 
     'caterer', 'delivered', 'Delhi Public School, Koramangala, Bangalore', 200.00, 20.00, 9, now() - interval '1 day'),
    (gen_random_uuid(), 'TRK' || LPAD((EXTRACT(epoch FROM now()) + 1)::text, 10, '0'), parent_id, child1_id, school_id, delivery_staff_id, 
     'caterer', 'in_transit', 'Delhi Public School, Koramangala, Bangalore', 220.00, 20.00, 12, now())
    RETURNING id INTO order1_id;

    -- Insert order items
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
    SELECT o.id, m.id, 1, m.price, m.price
    FROM orders o, menu_items m
    WHERE o.parent_id = parent_id AND m.caterer_id IN (SELECT id FROM caterers LIMIT 2)
    LIMIT 4;

    -- Insert payments
    INSERT INTO payments (order_id, amount, method, status, processed_at)
    SELECT id, total_amount, 'upi', 'paid', created_at + interval '5 minutes'
    FROM orders WHERE parent_id = parent_id;

    -- Insert notifications
    INSERT INTO notifications (user_id, order_id, title, message, type, is_read)
    VALUES 
    (parent_user_id, order1_id, 'Order Delivered Successfully', 'Your order has been delivered to Delhi Public School', 'order_update', true),
    (parent_user_id, order2_id, 'Order Out for Delivery', 'Your order is on the way to school', 'order_update', false),
    (delivery_user_id, order2_id, 'New Delivery Assignment', 'You have been assigned a new delivery', 'info', false);

    -- Insert feedback
    INSERT INTO feedback (user_id, order_id, caterer_id, type, rating, comment)
    VALUES 
    (parent_user_id, order1_id, (SELECT caterer_id FROM menu_items WHERE id = menu_item1_id), 'order', 5, 'Excellent food quality and timely delivery!');

    -- Insert delivery route
    INSERT INTO delivery_routes (delivery_staff_id, route_date, total_distance, estimated_duration, total_earnings)
    VALUES (delivery_staff_id, CURRENT_DATE, 15.5, 120, 180.00);

    -- Insert polls
    INSERT INTO polls (title, description, created_by, is_active, expires_at)
    VALUES ('Preferred Meal Time', 'What time do you prefer lunch delivery at school?', admin_user_id, true, now() + interval '30 days');

    INSERT INTO poll_options (poll_id, option_text)
    SELECT p.id, unnest(ARRAY['11:30 AM - 12:00 PM', '12:00 PM - 12:30 PM', '12:30 PM - 1:00 PM', '1:00 PM - 1:30 PM'])
    FROM polls p WHERE title = 'Preferred Meal Time';

END $$;

-- Insert additional sample orders for better dashboard data
INSERT INTO orders (tracking_id, parent_id, child_id, school_id, delivery_staff_id, order_type, status, delivery_address, total_amount, delivery_fee, loyalty_points_earned, created_at)
SELECT 
    'TRK' || LPAD((EXTRACT(epoch FROM now()) + generate_series(1, 10))::text, 10, '0'),
    p.id,
    c.id,
    s.id,
    ds.id,
    'caterer',
    CASE 
        WHEN generate_series % 4 = 0 THEN 'delivered'
        WHEN generate_series % 4 = 1 THEN 'in_transit'
        WHEN generate_series % 4 = 2 THEN 'confirmed'
        ELSE 'pending'
    END,
    'Delhi Public School, Koramangala, Bangalore',
    150.00 + (generate_series * 10),
    20.00,
    8 + generate_series,
    now() - (generate_series || ' days')::interval
FROM generate_series(1, 10),
     parents p,
     children c,
     schools s,
     delivery_staff ds
WHERE c.parent_id = p.id
LIMIT 10;