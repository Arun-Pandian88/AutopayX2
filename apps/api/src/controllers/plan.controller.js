const Plan = require('../models/Plan');

exports.getActivePlans = async (req, res, next) => {
  try {
    const count = await Plan.count();
    if (count === 0) {
      await Plan.bulkCreate([
        {
          name: 'Growth',
          price: 999.00,
          interval: 'monthly',
          features: ['10 QR codes included', 'Instant activation', 'Priority Support', 'Webhook Integration'],
          limits: { qr_codes: 10, transactions_per_month: 500, webhooks: true },
          status: 'active'
        },
        {
          name: 'Pro',
          price: 2499.00,
          interval: 'monthly',
          features: ['Unlimited QR codes', 'Instant activation', 'Dedicated Support', 'Webhook & API Integration'],
          limits: { qr_codes: 9999, transactions_per_month: 9999, webhooks: true },
          status: 'active'
        }
      ]);
    }

    const plans = await Plan.findAll({
      where: { status: 'active' },
      order: [['price', 'ASC']]
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};
