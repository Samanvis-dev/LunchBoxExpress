-- LunchBox Express Database Schema
-- Complete PostgreSQL schema with UUID support, RLS, and comprehensive tables

/*
# LunchBox Express Database Schema

## Overview
This schema supports a comprehensive school lunch delivery system with:
1. Multi-role user management (Parent, Delivery Staff, School Admin, Caterer, System Admin)
2. Children/Student management
3. Caterer and menu item management
4. Order processing with tracking
5. Payment and loyalty system
6. Delivery route optimization
7. Notifications and feedback system
8. Analytics and reporting

## Security
- Row Level Security (RLS) enabled on all tables
- UUID primary keys for security
- Proper foreign key constraints with cascading
- CHECK constraints for data validation
- Comprehensive indexes for performance

## Key Features
- Real-time order tracking
- Loyalty points system
- Recurring orders
- Delivery route optimization
- Feedback and rating system
- Comprehensive analytics
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('parent', 'delivery_staff', 'school_admin', 'caterer', 'admin');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE delivery_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE order_type AS ENUM ('home', 'caterer');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'accepted', 'picked', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'upi', 'wallet', 'cod');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'order_update');
CREATE TYPE feedback_type AS ENUM ('order', 'caterer', 'delivery', 'general');
CREATE TYPE meal_category AS ENUM ('lunchbox', 'fruit_bowl', 'snack', 'beverage');
CREATE TYPE vehicle_type AS ENUM ('bike', 'scooter', 'van', 'cycle');

-- Users table (main authentication table)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username varchar(50) UNIQUE NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    phone varchar(20) UNIQUE NOT NULL,
    password_hash text NOT NULL,
    role user_role NOT NULL,
    account_status account_status DEFAULT 'active',
    last_login timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    full_name varchar(255) NOT NULL,
    house_number varchar(50),
    location_name varchar(100) NOT NULL,
    city_name varchar(100) NOT NULL,
    full_address text NOT NULL,
    children_count integer DEFAULT 0,
    loyalty_points integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Delivery staff table
CREATE TABLE IF NOT EXISTS delivery_staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    full_name varchar(255) NOT NULL,
    duplicate_name varchar(100) NOT NULL, -- Display name/alias
    vehicle_type vehicle_type NOT NULL,
    vehicle_number varchar(20) NOT NULL,
    service_areas text[], -- Array of service area names
    address text NOT NULL,
    rating decimal(3,2) DEFAULT 0.00,
    status delivery_status DEFAULT 'available',
    total_deliveries integer DEFAULT 0,
    total_earnings decimal(10,2) DEFAULT 0.00,
    active_since timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    school_name varchar(255) NOT NULL,
    school_id varchar(50) UNIQUE NOT NULL,
    contact_person varchar(255) NOT NULL,
    established_year integer,
    classes_offered text[], -- Array of class names
    school_address text NOT NULL,
    location jsonb, -- {lat, lng} for mapping
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Caterers table
CREATE TABLE IF NOT EXISTS caterers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    business_name varchar(255) NOT NULL,
    contact_person varchar(255) NOT NULL,
    business_address text NOT NULL,
    rating decimal(3,2) DEFAULT 0.00,
    location jsonb, -- {lat, lng} for mapping
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
    school_id uuid REFERENCES schools(id),
    name varchar(255) NOT NULL,
    age integer NOT NULL CHECK (age > 0 AND age < 25),
    class_name varchar(50) NOT NULL,
    allergies text[], -- Array of allergy names
    food_preferences text[], -- Array of preferences
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    caterer_id uuid REFERENCES caterers(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    category meal_category NOT NULL,
    items_included text[], -- Array of included items
    allergens text[], -- Array of allergen names
    price decimal(8,2) NOT NULL CHECK (price >= 0),
    calories integer,
    protein decimal(5,2),
    carbohydrates decimal(5,2),
    fat decimal(5,2),
    fiber decimal(5,2),
    image_url text,
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id varchar(20) UNIQUE NOT NULL,
    parent_id uuid REFERENCES parents(id),
    child_id uuid REFERENCES children(id),
    school_id uuid REFERENCES schools(id),
    delivery_staff_id uuid REFERENCES delivery_staff(id),
    order_type order_type NOT NULL,
    status order_status DEFAULT 'pending',
    is_recurring boolean DEFAULT false,
    recurring_days integer[], -- Array of weekday numbers (1-7)
    pickup_address text,
    delivery_address text NOT NULL,
    pickup_time timestamptz,
    delivery_time timestamptz,
    estimated_delivery_time timestamptz,
    actual_delivery_time timestamptz,
    total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
    delivery_fee decimal(6,2) DEFAULT 0,
    loyalty_points_used integer DEFAULT 0,
    loyalty_points_earned integer DEFAULT 0,
    qr_code text,
    special_instructions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid REFERENCES menu_items(id),
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price decimal(8,2) NOT NULL CHECK (unit_price >= 0),
    total_price decimal(8,2) NOT NULL CHECK (total_price >= 0),
    created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    amount decimal(10,2) NOT NULL CHECK (amount >= 0),
    method payment_method NOT NULL,
    provider varchar(100),
    transaction_id varchar(255),
    status payment_status DEFAULT 'pending',
    loyalty_points_used integer DEFAULT 0,
    processed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    type notification_type NOT NULL,
    is_read boolean DEFAULT false,
    read_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Delivery routes table
CREATE TABLE IF NOT EXISTS delivery_routes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_staff_id uuid REFERENCES delivery_staff(id) ON DELETE CASCADE,
    route_date date NOT NULL,
    total_distance decimal(8,2), -- in km
    estimated_duration integer, -- in minutes
    actual_duration integer, -- in minutes
    total_earnings decimal(10,2) DEFAULT 0,
    is_optimized boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Route stops table
CREATE TABLE IF NOT EXISTS route_stops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id uuid REFERENCES delivery_routes(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id),
    stop_type varchar(20) NOT NULL CHECK (stop_type IN ('pickup', 'delivery')),
    sequence_number integer NOT NULL,
    address text NOT NULL,
    location jsonb NOT NULL, -- {lat, lng}
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reached', 'completed')),
    estimated_time timestamptz,
    actual_time timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    description text,
    created_by uuid REFERENCES users(id),
    is_active boolean DEFAULT true,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Poll options table
CREATE TABLE IF NOT EXISTS poll_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
    option_text varchar(255) NOT NULL,
    votes_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
    option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    caterer_id uuid REFERENCES caterers(id) ON DELETE SET NULL,
    delivery_staff_id uuid REFERENCES delivery_staff(id) ON DELETE SET NULL,
    type feedback_type NOT NULL,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE caterers ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_orders_parent_id ON orders(parent_id);
CREATE INDEX idx_orders_delivery_staff_id ON orders(delivery_staff_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_menu_items_caterer_id ON menu_items(caterer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_delivery_routes_staff_id ON delivery_routes(delivery_staff_id);
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_staff_updated_at BEFORE UPDATE ON delivery_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_caterers_updated_at BEFORE UPDATE ON caterers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON delivery_routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update children count in parents table
CREATE OR REPLACE FUNCTION update_parent_children_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE parents SET children_count = children_count + 1 WHERE id = NEW.parent_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE parents SET children_count = children_count - 1 WHERE id = OLD.parent_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_children_count
    AFTER INSERT OR DELETE ON children
    FOR EACH ROW EXECUTE FUNCTION update_parent_children_count();

-- Create trigger to update delivery staff totals
CREATE OR REPLACE FUNCTION update_delivery_staff_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
        UPDATE delivery_staff 
        SET total_deliveries = total_deliveries + 1,
            total_earnings = total_earnings + COALESCE(NEW.delivery_fee, 0)
        WHERE id = NEW.delivery_staff_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_delivery_stats
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_delivery_staff_stats();

-- Create function to generate tracking ID
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TRK' || LPAD(EXTRACT(epoch FROM now())::text, 10, '0');
END;
$$ LANGUAGE plpgsql;