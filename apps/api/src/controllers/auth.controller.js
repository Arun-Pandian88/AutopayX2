const User = require('../models/User');
const Plan = require('../models/Plan');
const SystemLog = require('../models/SystemLog');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, business_name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user (Force role to merchant to prevent privilege escalation)
    const user = await User.create({
      name,
      business_name,
      email,
      password,
      role: 'merchant' // Always force merchant on public registration
    });

    // Set JWT as HTTP-Only Cookie
    const token = generateToken(user.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    await SystemLog.create({
      type: 'success',
      message: `New user registered: ${user.email} (${user.role})`,
      merchant_id: user.id
    });

    res.status(201).json({
      message: 'Registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        business_name: user.business_name
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user.id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Set role cookie (readable by frontend middleware)
      res.cookie('user_role', user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      await SystemLog.create({
        type: 'info',
        message: `User logged in: ${user.email}`,
        merchant_id: user.id
      });

      res.json({
        message: 'Logged in successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          business_name: user.business_name
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

exports.superadminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      // Check if user is actually a superadmin
      if (user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Access denied. Superadmin only.' });
      }

      const token = generateToken(user.id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Set role cookie (readable by frontend middleware)
      res.cookie('user_role', 'superadmin', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      res.json({
        message: 'Superadmin logged in successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid superadmin credentials' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // req.user is already set by the auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.getActivePlans = async (req, res, next) => {
  try {
    const plans = await Plan.findAll({ where: { status: 'active' }, order: [['price', 'ASC']] });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await SystemLog.create({
        type: 'info',
        message: `User logged out: ${req.user.email}`,
        merchant_id: req.user.id
      });
    }

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.cookie('user_role', '', {
      httpOnly: false,
      expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Forgot Password Flow
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.update({
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry
    });

    // In a real app, send an email. For this demo, we'll return the token.
    res.json({
      success: true,
      message: 'Password reset link generated',
      resetToken // Demo purpose only
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: { reset_token: token }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
       return res.status(400).json({ message: 'Reset token has expired' });
    }

    await user.update({
      password: newPassword,
      reset_token: null,
      reset_token_expiry: null
    });

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    // Fetch user with password
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    await user.update({ password: newPassword });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, company_name, business_name, email, avatar_url } = req.body;
    const bizName = company_name ?? business_name;
    await req.user.update({
      name: name ?? req.user.name,
      business_name: bizName ?? req.user.business_name,
      email: email ?? req.user.email,
      avatar_url: avatar_url !== undefined ? avatar_url : req.user.avatar_url
    });
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filter = req.query.filter || 'Today';

    const whereClause = { user_id: userId };
    
    if (filter === 'Today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      whereClause.createdAt = { [Op.gte]: startOfDay };
    } else if (filter === 'Last 7 Days') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      whereClause.createdAt = { [Op.gte]: date };
    } else if (filter === 'Last 30 Days') {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      whereClause.createdAt = { [Op.gte]: date };
    }

    const [totalOrders, successCount, pendingCount, failedCount, revenueResult, recentTransactions, allTxns] = await Promise.all([
      Transaction.count({ where: whereClause }),
      Transaction.count({ where: { ...whereClause, status: 'success' } }),
      Transaction.count({ where: { ...whereClause, status: 'processing' } }),
      Transaction.count({ where: { ...whereClause, status: 'failed' } }),
      Transaction.sum('amount', { where: { ...whereClause, status: 'success' } }),
      Transaction.findAll({ where: whereClause, order: [['createdAt', 'DESC']], limit: 5 }),
      Transaction.findAll({ where: whereClause, attributes: ['amount', 'status', 'payment_method', 'createdAt'] })
    ]);

    const successRate = totalOrders > 0 ? ((successCount / totalOrders) * 100).toFixed(1) : 0;
    
    // Group by Date for Chart Data
    const chartMap = {};
    allTxns.forEach(txn => {
      const dateStr = txn.createdAt.toISOString().split('T')[0];
      if (!chartMap[dateStr]) chartMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      chartMap[dateStr].orders += 1;
      if (txn.status === 'success') {
        chartMap[dateStr].revenue += parseFloat(txn.amount);
      }
    });
    const chartData = Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate Payment Method Split
    const methodCounts = { UPI: 0, Cards: 0, Netbanking: 0 };
    allTxns.forEach(txn => {
      if (txn.payment_method === 'UPI') methodCounts.UPI++;
      else if (txn.payment_method === 'Card') methodCounts.Cards++;
      else if (txn.payment_method === 'Netbanking') methodCounts.Netbanking++;
      else methodCounts.UPI++; // Default fallback
    });

    const paymentMethods = {
      UPI: totalOrders > 0 ? Math.round((methodCounts.UPI / totalOrders) * 100) : 0,
      Cards: totalOrders > 0 ? Math.round((methodCounts.Cards / totalOrders) * 100) : 0,
      Netbanking: totalOrders > 0 ? Math.round((methodCounts.Netbanking / totalOrders) * 100) : 0,
    };

    const stats = {
      totalRevenue: revenueResult || 0,
      totalOrders: totalOrders || 0,
      successRate: parseFloat(successRate),
      pending: pendingCount || 0,
      failed: failedCount || 0,
      chartData: chartData.length > 0 ? chartData : [{ date: new Date().toISOString().split('T')[0], revenue: 0, orders: 0 }],
      recentTransactions,
      paymentMethods
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

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
