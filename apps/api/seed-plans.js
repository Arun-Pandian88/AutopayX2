require('dotenv').config();
const { connectDB } = require('./src/config/db');
const Plan = require('./src/models/Plan');
require('./src/models/User');
require('./src/models/Subscription');
require('./src/models/Notification');

const seedPlans = async () => {
  await connectDB();
  
  try {
    await Plan.destroy({ where: {} });

    const plansToInsert = [
      {
        name: 'Free',
        price: 0,
        interval: 'monthly',
        features: ['0 QR codes in total', 'Basic analytics', 'Email support'],
        limits: {
          qr_codes: 0,
          transactions_per_month: 0,
          webhooks: false,
          api_access: false,
          whatsapp_alerts: false,
          priority_support: false,
        },
        is_custom: false,
        status: 'active'
      },
      {
        name: 'Pro',
        price: 299,
        interval: 'monthly',
        features: ['3,000 QR codes in 30 days', 'Instant activation on payment', 'Priority support', 'Webhook access', 'API access'],
        limits: {
          qr_codes: 3000,
          transactions_per_month: 10000,
          webhooks: true,
          api_access: true,
          whatsapp_alerts: false,
          priority_support: true,
        },
        is_custom: false,
        status: 'active'
      },
      {
        name: 'Custom',
        price: 0,
        interval: 'monthly',
        features: ['Custom QR limits', 'Dedicated settlements', 'Account manager', 'WhatsApp alerts', 'Full API access'],
        limits: {
          qr_codes: 999999,
          transactions_per_month: 999999,
          webhooks: true,
          api_access: true,
          whatsapp_alerts: true,
          priority_support: true,
        },
        is_custom: true,
        status: 'active'
      }
    ];

    await Plan.bulkCreate(plansToInsert);

    console.log('✅ Successfully seeded 3 plans (Free, Pro, Custom)!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
