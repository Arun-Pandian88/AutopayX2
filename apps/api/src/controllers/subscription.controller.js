const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

// Get current user's subscription + plan + usage
exports.getMySubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({
      where: { user_id: req.user.id, status: 'active' },
    });

    if (!sub) {
      return res.json({ success: true, data: null });
    }

    const plan = await Plan.findByPk(sub.plan_id);

    res.json({
      success: true,
      data: {
        subscription: sub,
        plan: plan,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Use a resource (e.g., QR code generation) — checks limit and sends notification
exports.useResource = async (req, res, next) => {
  try {
    const { resource_type } = req.body; // 'qr_code' or 'transaction'

    const sub = await Subscription.findOne({
      where: { user_id: req.user.id, status: 'active' },
    });

    if (!sub) {
      return res.status(403).json({ message: 'No active subscription. Please subscribe to a plan.' });
    }

    const plan = await Plan.findByPk(sub.plan_id);
    const limits = plan.limits || {};

    if (resource_type === 'qr_code') {
      const limit = limits.qr_codes || 0;

      if (limit > 0 && sub.qr_codes_used >= limit) {
        // Create notification
        await Notification.create({
          user_id: req.user.id,
          type: 'limit_reached',
          title: 'QR Code Limit Reached!',
          message: `You have used all ${limit} QR codes in your ${plan.name} plan. Please upgrade to continue.`,
        });

        return res.status(429).json({
          message: `QR code limit reached (${sub.qr_codes_used}/${limit}). Please upgrade your plan.`,
          limit_reached: true,
        });
      }

      // Increment usage
      sub.qr_codes_used += 1;
      await sub.save();

      // 80% warning
      if (limit > 0 && sub.qr_codes_used >= Math.floor(limit * 0.8) && sub.qr_codes_used < limit) {
        await Notification.create({
          user_id: req.user.id,
          type: 'limit_warning',
          title: 'QR Code Limit Warning',
          message: `You have used ${sub.qr_codes_used} of ${limit} QR codes. Consider upgrading.`,
        });
      }

      return res.json({
        success: true,
        used: sub.qr_codes_used,
        limit: limit,
        remaining: limit > 0 ? limit - sub.qr_codes_used : 'unlimited',
      });
    }

    if (resource_type === 'transaction') {
      const limit = limits.transactions_per_month || 0;

      if (limit > 0 && sub.transactions_used >= limit) {
        await Notification.create({
          user_id: req.user.id,
          type: 'limit_reached',
          title: 'Transaction Limit Reached!',
          message: `You have used all ${limit} transactions this month in your ${plan.name} plan. Please upgrade.`,
        });

        return res.status(429).json({
          message: `Transaction limit reached (${sub.transactions_used}/${limit}). Please upgrade.`,
          limit_reached: true,
        });
      }

      sub.transactions_used += 1;
      await sub.save();

      // 80% warning
      if (limit > 0 && sub.transactions_used >= Math.floor(limit * 0.8) && sub.transactions_used < limit) {
        await Notification.create({
          user_id: req.user.id,
          type: 'limit_warning',
          title: 'Transaction Limit Warning',
          message: `You have used ${sub.transactions_used} of ${limit} transactions. Consider upgrading.`,
        });
      }

      return res.json({
        success: true,
        used: sub.transactions_used,
        limit: limit,
        remaining: limit > 0 ? limit - sub.transactions_used : 'unlimited',
      });
    }

    res.status(400).json({ message: 'Invalid resource_type. Use "qr_code" or "transaction".' });
  } catch (error) {
    next(error);
  }
};

// Get notifications for current user
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// Mark notifications as read
exports.markRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Subscribe to a plan (for merchants)
// Initiate subscription (creates a mock intent for now)
exports.initiateSubscription = async (req, res, next) => {
  try {
    const { plan_id } = req.body;
    const plan = await Plan.findByPk(plan_id);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ message: 'Plan not found or inactive.' });
    }
    
    // Create a transaction in DB
    const txn_id = 'sub_' + require('crypto').randomBytes(8).toString('hex');
    const order_id = 'plan_upgrade_' + plan_id;
    
    await Transaction.create({
      user_id: req.user.id,
      txn_id,
      order_id,
      amount: plan.price,
      status: 'processing',
      gateway_app: 'AutoPayX Platform',
      upi_id: 'autopayx@upi'
    });

    res.json({ success: true, data: { txn_id, plan_name: plan.name, amount: plan.price } });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const { txn_id } = req.params;
    const txn = await Transaction.findOne({ where: { txn_id, user_id: req.user.id } });
    
    if (!txn) return res.status(404).json({ success: false });
    
    if (txn.status === 'success') {
      res.json({ success: true, status: 'success' });
    } else {
      res.json({ success: true, status: 'processing' });
    }
  } catch (err) {
    next(err);
  }
};
