const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lunchbox_express',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('order_status_update', (data) => {
    io.to(data.userId).emit('order_update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // For demo purposes, we'll accept 'password123' for all users
    // In production, use proper password hashing
    const isValidPassword = password === 'password123';

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = now() WHERE id = $1',
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { userData, roleData, role } = req.body;
    
    // Check if username or email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [userData.username, userData.email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert user
    const userResult = await pool.query(
      'INSERT INTO users (username, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userData.username, userData.email, userData.phone, hashedPassword, role]
    );

    const userId = userResult.rows[0].id;

    // Insert role-specific data
    let roleId;
    switch (role) {
      case 'parent':
        const parentResult = await pool.query(
          'INSERT INTO parents (user_id, full_name, house_number, location_name, city_name, full_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [userId, roleData.fullName, roleData.houseNumber, roleData.locationName, roleData.cityName, roleData.fullAddress]
        );
        roleId = parentResult.rows[0].id;
        break;

      case 'delivery_staff':
        const deliveryResult = await pool.query(
          'INSERT INTO delivery_staff (user_id, full_name, duplicate_name, vehicle_type, vehicle_number, service_areas, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [userId, roleData.fullName, roleData.duplicateName, roleData.vehicleType, roleData.vehicleNumber, roleData.serviceAreas, roleData.address]
        );
        roleId = deliveryResult.rows[0].id;
        break;

      case 'school_admin':
        const schoolResult = await pool.query(
          'INSERT INTO schools (user_id, school_name, school_id, contact_person, established_year, classes_offered, school_address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [userId, roleData.schoolName, roleData.schoolId, roleData.contactPerson, roleData.establishedYear, roleData.classesOffered, roleData.schoolAddress]
        );
        roleId = schoolResult.rows[0].id;
        break;

      case 'caterer':
        const catererResult = await pool.query(
          'INSERT INTO caterers (user_id, business_name, contact_person, business_address) VALUES ($1, $2, $3, $4) RETURNING id',
          [userId, roleData.businessName, roleData.contactPerson, roleData.businessAddress]
        );
        roleId = catererResult.rows[0].id;
        break;
    }

    res.status(201).json({
      message: 'Account created successfully',
      userId,
      roleId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;
    let dashboardData = {};

    switch (role) {
      case 'parent':
        dashboardData = await getParentDashboard(userId);
        break;
      case 'delivery_staff':
        dashboardData = await getDeliveryDashboard(userId);
        break;
      case 'school_admin':
        dashboardData = await getSchoolDashboard(userId);
        break;
      case 'admin':
        dashboardData = await getAdminDashboard();
        break;
      case 'caterer':
        dashboardData = await getCatererDashboard(userId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Parent Dashboard Data
async function getParentDashboard(userId) {
  const parentResult = await pool.query(
    'SELECT * FROM parents WHERE user_id = $1',
    [userId]
  );
  const parent = parentResult.rows[0];

  const childrenResult = await pool.query(
    'SELECT c.*, s.school_name FROM children c LEFT JOIN schools s ON c.school_id = s.id WHERE c.parent_id = $1',
    [parent.id]
  );

  const todaysOrdersResult = await pool.query(
    `SELECT o.*, c.name as child_name, s.school_name, ds.duplicate_name as delivery_person
     FROM orders o
     LEFT JOIN children c ON o.child_id = c.id
     LEFT JOIN schools s ON o.school_id = s.id
     LEFT JOIN delivery_staff ds ON o.delivery_staff_id = ds.id
     WHERE o.parent_id = $1 AND DATE(o.created_at) = CURRENT_DATE
     ORDER BY o.created_at DESC`,
    [parent.id]
  );

  const recentOrdersResult = await pool.query(
    `SELECT o.*, c.name as child_name, s.school_name, p.status as payment_status
     FROM orders o
     LEFT JOIN children c ON o.child_id = c.id
     LEFT JOIN schools s ON o.school_id = s.id
     LEFT JOIN payments p ON o.id = p.order_id
     WHERE o.parent_id = $1
     ORDER BY o.created_at DESC
     LIMIT 10`,
    [parent.id]
  );

  const totalOrdersResult = await pool.query(
    'SELECT COUNT(*) as total FROM orders WHERE parent_id = $1',
    [parent.id]
  );

  const notificationsResult = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC LIMIT 5',
    [userId]
  );

  return {
    parent: parent,
    children: childrenResult.rows,
    todaysOrders: todaysOrdersResult.rows,
    recentOrders: recentOrdersResult.rows,
    stats: {
      childrenCount: childrenResult.rows.length,
      todaysOrdersCount: todaysOrdersResult.rows.length,
      totalOrders: parseInt(totalOrdersResult.rows[0].total),
      loyaltyPoints: parent.loyalty_points
    },
    notifications: notificationsResult.rows
  };
}

// Delivery Dashboard Data
async function getDeliveryDashboard(userId) {
  const deliveryStaffResult = await pool.query(
    'SELECT * FROM delivery_staff WHERE user_id = $1',
    [userId]
  );
  const deliveryStaff = deliveryStaffResult.rows[0];

  const todaysDeliveriesResult = await pool.query(
    `SELECT o.*, p.full_name as parent_name, c.name as child_name, s.school_name
     FROM orders o
     LEFT JOIN parents p ON o.parent_id = p.id
     LEFT JOIN children c ON o.child_id = c.id
     LEFT JOIN schools s ON o.school_id = s.id
     WHERE o.delivery_staff_id = $1 AND DATE(o.created_at) = CURRENT_DATE
     ORDER BY o.created_at DESC`,
    [deliveryStaff.id]
  );

  const leaderboardResult = await pool.query(
    `SELECT ds.duplicate_name, ds.total_deliveries, ds.rating, ds.total_earnings,
            ROW_NUMBER() OVER (ORDER BY ds.total_deliveries DESC, ds.rating DESC) as rank
     FROM delivery_staff ds
     ORDER BY rank
     LIMIT 10`
  );

  const notificationsResult = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC LIMIT 5',
    [userId]
  );

  return {
    deliveryStaff: deliveryStaff,
    todaysDeliveries: todaysDeliveriesResult.rows,
    leaderboard: leaderboardResult.rows,
    notifications: notificationsResult.rows,
    stats: {
      totalDeliveries: deliveryStaff.total_deliveries,
      rating: deliveryStaff.rating,
      totalEarnings: deliveryStaff.total_earnings,
      todaysDeliveries: todaysDeliveriesResult.rows.length
    }
  };
}

// School Dashboard Data
async function getSchoolDashboard(userId) {
  const schoolResult = await pool.query(
    'SELECT * FROM schools WHERE user_id = $1',
    [userId]
  );
  const school = schoolResult.rows[0];

  const todaysDeliveriesResult = await pool.query(
    `SELECT o.*, c.name as child_name, p.full_name as parent_name, ds.duplicate_name as delivery_person
     FROM orders o
     LEFT JOIN children c ON o.child_id = c.id
     LEFT JOIN parents p ON o.parent_id = p.id
     LEFT JOIN delivery_staff ds ON o.delivery_staff_id = ds.id
     WHERE o.school_id = $1 AND DATE(o.created_at) = CURRENT_DATE
     ORDER BY o.created_at DESC`,
    [school.id]
  );

  const classWiseSummary = await pool.query(
    `SELECT 
       c.class_name,
       COUNT(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN 1 END) as expected_today,
       COUNT(CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.status = 'delivered' THEN 1 END) as received_today,
       COUNT(CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.status != 'delivered' AND o.status != 'cancelled' THEN 1 END) as pending_today
     FROM children c
     LEFT JOIN orders o ON c.id = o.child_id
     WHERE c.school_id = $1
     GROUP BY c.class_name
     ORDER BY c.class_name`,
    [school.id]
  );

  return {
    school: school,
    todaysDeliveries: todaysDeliveriesResult.rows,
    classWiseSummary: classWiseSummary.rows,
    stats: {
      totalExpected: todaysDeliveriesResult.rows.length,
      totalReceived: todaysDeliveriesResult.rows.filter(o => o.status === 'delivered').length,
      totalMissing: todaysDeliveriesResult.rows.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length
    }
  };
}

// Admin Dashboard Data
async function getAdminDashboard() {
  const userStatsResult = await pool.query(
    `SELECT role, COUNT(*) as count FROM users GROUP BY role`
  );

  const orderStatsResult = await pool.query(
    `SELECT 
       COUNT(*) as total_orders,
       COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as todays_orders,
       SUM(total_amount) as total_revenue,
       SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END) as todays_revenue
     FROM orders`
  );

  const deliveryStatsResult = await pool.query(
    `SELECT status, COUNT(*) as count FROM delivery_staff GROUP BY status`
  );

  const recentOrdersResult = await pool.query(
    `SELECT o.*, c.name as child_name, s.school_name, p.full_name as parent_name
     FROM orders o
     LEFT JOIN children c ON o.child_id = c.id
     LEFT JOIN schools s ON o.school_id = s.id
     LEFT JOIN parents p ON o.parent_id = p.id
     ORDER BY o.created_at DESC
     LIMIT 10`
  );

  return {
    userStats: userStatsResult.rows,
    orderStats: orderStatsResult.rows[0],
    deliveryStats: deliveryStatsResult.rows,
    recentOrders: recentOrdersResult.rows
  };
}

// Caterer Dashboard Data
async function getCatererDashboard(userId) {
  const catererResult = await pool.query(
    'SELECT * FROM caterers WHERE user_id = $1',
    [userId]
  );
  const caterer = catererResult.rows[0];

  const menuItemsResult = await pool.query(
    'SELECT * FROM menu_items WHERE caterer_id = $1 ORDER BY created_at DESC',
    [caterer.id]
  );

  const ordersResult = await pool.query(
    `SELECT o.*, c.name as child_name, s.school_name, p.full_name as parent_name
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
     LEFT JOIN children c ON o.child_id = c.id
     LEFT JOIN schools s ON o.school_id = s.id
     LEFT JOIN parents p ON o.parent_id = p.id
     WHERE mi.caterer_id = $1
     ORDER BY o.created_at DESC
     LIMIT 20`,
    [caterer.id]
  );

  return {
    caterer: caterer,
    menuItems: menuItemsResult.rows,
    orders: ordersResult.rows,
    stats: {
      totalMenuItems: menuItemsResult.rows.length,
      activeMenuItems: menuItemsResult.rows.filter(item => item.is_available).length,
      totalOrders: ordersResult.rows.length,
      rating: caterer.rating
    }
  };
}

// Children Routes
app.post('/api/children', authenticateToken, async (req, res) => {
  try {
    const { name, age, className, schoolId, allergies, foodPreferences } = req.body;
    
    const parentResult = await pool.query(
      'SELECT id FROM parents WHERE user_id = $1',
      [req.user.id]
    );
    
    if (parentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const parentId = parentResult.rows[0].id;

    const result = await pool.query(
      'INSERT INTO children (parent_id, school_id, name, age, class_name, allergies, food_preferences) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [parentId, schoolId, name, age, className, allergies || [], foodPreferences || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add child error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get schools for dropdown
app.get('/api/schools', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, school_name FROM schools ORDER BY school_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get caterers and menu items
app.get('/api/caterers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
              json_agg(
                json_build_object(
                  'id', m.id,
                  'name', m.name,
                  'description', m.description,
                  'category', m.category,
                  'price', m.price,
                  'calories', m.calories,
                  'protein', m.protein,
                  'allergens', m.allergens,
                  'image_url', m.image_url,
                  'is_available', m.is_available
                )
              ) as menu_items
       FROM caterers c
       LEFT JOIN menu_items m ON c.id = m.caterer_id AND m.is_available = true
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.rating DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get caterers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update delivery staff availability
app.patch('/api/delivery/availability', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE delivery_staff SET status = $1 WHERE user_id = $2 RETURNING *',
      [status, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery staff not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
app.patch('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit real-time update
    const order = result.rows[0];
    io.emit('order_status_updated', {
      orderId: order.id,
      status: order.status,
      trackingId: order.tracking_id
    });

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const result = await pool.query(
      'UPDATE notifications SET is_read = true, read_at = now() WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;