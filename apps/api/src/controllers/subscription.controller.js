const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Notification = require('../models/Notification');

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
exports.subscribeToPlan = async (req, res, next) => {
  try {
    const { plan_id } = req.body;

    const plan = await Plan.findByPk(plan_id);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ message: 'Plan not found or inactive.' });
    }

    // Cancel any existing active subscription
    await Subscription.update(
      { status: 'cancelled' },
      { where: { user_id: req.user.id, status: 'active' } }
    );

    // Calculate period end
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create new subscription
    const sub = await Subscription.create({
      user_id: req.user.id,
      plan_id: plan.id,
      qr_codes_used: 0,
      transactions_used: 0,
      current_period_start: now,
      current_period_end: periodEnd,
      status: 'active',
    });

    // Send welcome notification
    await Notification.create({
      user_id: req.user.id,
      type: 'info',
      title: `Subscribed to ${plan.name}!`,
      message: `Welcome to the ${plan.name} plan. Your subscription is active until ${periodEnd.toLocaleDateString()}.`,
    });

    res.json({ success: true, data: sub });
  } catch (error) {
    next(error);
  }
};
