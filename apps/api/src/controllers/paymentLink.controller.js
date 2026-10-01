const PaymentLink = require('../models/PaymentLink');
const crypto = require('crypto');

exports.getPaymentLinks = async (req, res, next) => {
  try {
    const links = await PaymentLink.findAll({ where: { user_id: req.user.id } });
    res.json({
      success: true,
      data: links
    });
  } catch (error) {
    next(error);
  }
};

exports.createPaymentLink = async (req, res, next) => {
  try {
    const { title, amount, type, expiry_date } = req.body;
    const link_id = 'link_' + crypto.randomBytes(6).toString('hex');
    
    const newLink = await PaymentLink.create({
      user_id: req.user.id,
      link_id,
      title,
      amount,
      type: type || 'single',
      status: 'active',
      expiry_date: expiry_date || null
    });
    
    res.status(201).json({
      success: true,
      data: newLink
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePaymentLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const link = await PaymentLink.findOne({ where: { id, user_id: req.user.id } });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    await link.destroy();
    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount } = req.body;
    const link = await PaymentLink.findOne({ where: { id, user_id: req.user.id } });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    
    if (title) link.title = title;
    if (amount !== undefined) link.amount = amount;
    
    await link.save();
    
    res.json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
};
