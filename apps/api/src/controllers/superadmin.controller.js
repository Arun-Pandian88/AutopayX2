const User = require('../models/User');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const SystemLog = require('../models/SystemLog');

exports.getStats = async (req, res, next) => {
  try {
    // Total registered merchants
    const totalMerchants = await User.count({ where: { role: 'merchant' } });
    
    // Active merchants (Assuming 'active' status)
    const activeMerchants = await User.count({ where: { role: 'merchant', status: 'active' } });
    
    // Suspended merchants
    const suspendedMerchants = await User.count({ where: { role: 'merchant', status: 'suspended' } });

    // Active subscriptions
    const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });

    // Latest 5 registered merchants
    const latestMerchants = await User.findAll({
      where: { role: 'merchant' },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'business_name', 'email', 'status', 'createdAt']
    });

    // Total plans
    const totalPlans = await Plan.count({ where: { status: 'active' } });

    res.json({
      success: true,
      data: {
        totalMerchants,
        activeMerchants,
        suspendedMerchants,
        activeSubscriptions,
        totalPlans,
        latestMerchants
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await SystemLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// Plan Management
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

exports.createPlan = async (req, res, next) => {
  try {
    const { name, price, interval, features, limits, is_custom } = req.body;
    const plan = await Plan.create({ name, price, interval, features, limits, is_custom });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, interval, features, limits, is_custom, status } = req.body;
    
    const plan = await Plan.findByPk(id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    await plan.update({ name, price, interval, features, limits, is_custom, status });
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByPk(id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    
    await plan.destroy();
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
};

// Merchant Management
exports.getMerchants = async (req, res, next) => {
  try {
    const merchants = await User.findAll({
      where: { role: 'merchant' },
      attributes: ['id', 'name', 'business_name', 'email', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: merchants });
  } catch (error) {
    next(error);
  }
};

exports.updateMerchantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const merchant = await User.findOne({ where: { id, role: 'merchant' } });
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });

    await merchant.update({ status });
    res.json({ success: true, data: merchant });
  } catch (error) {
    next(error);
  }
};
