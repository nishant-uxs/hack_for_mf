const Organization = require('../models/Organization');

exports.createOrganization = async (req, res) => {
  try {
    const { name, type, categories, contacts, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required'
      });
    }

    const org = await Organization.create({
      name,
      type,
      categories: Array.isArray(categories) ? categories : [],
      contacts: contacts || { emails: [] },
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    res.status(201).json({
      success: true,
      organization: org
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating organization',
      error: error.message
    });
  }
};

exports.listOrganizations = async (req, res) => {
  try {
    const { active } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const orgs = await Organization.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      organizations: orgs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations',
      error: error.message
    });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.categories && !Array.isArray(updates.categories)) {
      updates.categories = [];
    }

    const org = await Organization.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      organization: org
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating organization',
      error: error.message
    });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    await org.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Organization deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting organization',
      error: error.message
    });
  }
};
