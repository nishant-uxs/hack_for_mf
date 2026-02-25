const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    console.log('🔍 Registration request:', req.body);
    
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const db = req.app.get('db');
    
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (row) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Check if admin email
      const isAdminEmail = process.env.ADMIN_EMAIL &&
        String(process.env.ADMIN_EMAIL).toLowerCase().trim() === String(email).toLowerCase().trim();

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 12);

      // Create user
      db.run(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone, isAdminEmail ? 'admin' : 'user'],
        function(err) {
          if (err) {
            console.error('❌ User creation error:', err);
            return res.status(500).json({
              success: false,
              message: 'Error creating user'
            });
          }

          const token = generateToken(this.lastID);

          console.log('✅ User created successfully');

          res.status(201).json({
            success: true,
            token,
            user: {
              id: this.lastID,
              name,
              email,
              role: isAdminEmail ? 'admin' : 'user'
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};
