const User = require('../models/User');
const Organization = require('../models/Organization');

exports.createOrgUser = async (req, res) => {
  try {
    const { name, email, password, phone, organizationId } = req.body;

    if (!name || !email || !password || !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password, organizationId are required'
      });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'org_user',
      organization: org._id
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: org._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating org user',
      error: error.message
    });
  }
};
