const PaymentLink = require('../models/PaymentLink');
const PaymentSetting = require('../models/PaymentSetting');
const CheckoutTheme = require('../models/CheckoutTheme');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const crypto = require('crypto');

// GET /api/pay/:link_id — Public: Fetch checkout details for a payment link
exports.getCheckoutDetails = async (req, res, next) => {
  try {
    const { link_id } = req.params;

    const link = await PaymentLink.findOne({ where: { link_id } });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Payment link not found' });
    }

    if (link.status !== 'active') {
      return res.status(410).json({ success: false, message: 'This payment link is no longer active' });
    }

    if (link.expiry_date && new Date(link.expiry_date) < new Date()) {
      return res.status(410).json({ success: false, message: 'This payment link has expired' });
    }

    // Fetch merchant details
    const merchant = await User.findByPk(link.user_id, {
      attributes: ['id', 'name', 'business_name']
    });

    // Fetch merchant UPI ID from PaymentSettings
    const paymentSetting = await PaymentSetting.findOne({
      where: { user_id: link.user_id }
    });

    // Fetch checkout theme
    const theme = await CheckoutTheme.findOne({
      where: { user_id: link.user_id }
    });

    const upiId = paymentSetting?.master_upi_id || null;
    const payeeName = paymentSetting?.payee_name || merchant?.business_name || merchant?.name || 'Merchant';

    // Build UPI deep link for QR code
    let upiDeepLink = null;
    if (upiId) {
      upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${link.amount}&cu=INR&tn=${encodeURIComponent(link.title)}`;
    }

    res.json({
      success: true,
      data: {
        link_id: link.link_id,
        title: link.title,
        amount: parseFloat(link.amount),
        currency: 'INR',
        type: link.type,
        merchant: {
          name: merchant?.name,
          business_name: merchant?.business_name
        },
        upi_id: upiId,
        payee_name: payeeName,
        upi_deep_link: upiDeepLink,
        theme: theme ? {
          theme_id: theme.theme_id,
          business_name: theme.business_name,
          brand_color: theme.brand_color,
          brand_logo: theme.brand_logo,
          logo_type: theme.logo_type,
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/pay/:link_id/initiate — Public: Create a transaction when customer starts payment
exports.initiatePayment = async (req, res, next) => {
  try {
    const { link_id } = req.params;
    const { customer_name, customer_email } = req.body;

    const link = await PaymentLink.findOne({ where: { link_id } });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Payment link not found' });
    }

    if (link.status !== 'active') {
      return res.status(410).json({ success: false, message: 'This payment link is no longer active' });
    }

    // Generate unique txn_id and order_id
    const txn_id = 'txn_' + crypto.randomBytes(12).toString('hex');
    const order_id = 'ord_' + crypto.randomBytes(8).toString('hex');

    const transaction = await Transaction.create({
      user_id: link.user_id, // The merchant who owns the link
      txn_id,
      order_id,
      customer_name: customer_name || null,
      customer_email: customer_email || null,
      amount: link.amount,
      currency: 'INR',
      status: 'processing',
      payment_method: 'UPI',
    });

    // If single-use link, mark as inactive after first use
    if (link.type === 'single') {
      link.status = 'inactive';
      await link.save();
    }

    // --- AUTOMATIC VERIFICATION DELEGATED TO IMAP WORKER ---
    // The transaction status remains 'processing' until the IMAP worker
    // detects a matching bank email with the UTR and amount.


    res.status(201).json({
      success: true,
      data: {
        txn_id: transaction.txn_id,
        order_id: transaction.order_id,
        amount: parseFloat(transaction.amount),
        status: transaction.status,
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/pay/:link_id/status/:txn_id — Public: Poll for payment status
exports.checkStatus = async (req, res, next) => {
  try {
    const { txn_id } = req.params;

    if (!txn_id) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    const transaction = await Transaction.findOne({ where: { txn_id } });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: {
        txn_id: transaction.txn_id,
        status: transaction.status,
      }
    });
  } catch (error) {
    next(error);
  }
};
