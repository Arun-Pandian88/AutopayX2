const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

exports.getKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({ where: { user_id: req.user.id, status: 'active' } });
    const liveKeys = keys.filter(k => k.mode === 'live');
    const testKeys = keys.filter(k => k.mode === 'test');
    res.json({ success: true, data: { liveKeys, testKeys } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.generateKey = async (req, res) => {
  const { mode } = req.body;
  try {
    // Revoke old active keys for this mode
    await ApiKey.update({ status: 'revoked' }, { where: { user_id: req.user.id, mode, status: 'active' } });

    const keyPrefix = mode === 'live' ? 'aupi_live_' : 'aupi_test_';
    const newKey = keyPrefix + crypto.randomBytes(16).toString('hex');
    const newSecret = 'whsec_' + crypto.randomBytes(24).toString('hex');

    const apiKey = await ApiKey.create({
      user_id: req.user.id,
      mode,
      key: newKey,
      secret: newSecret
    });

    res.status(201).json({ success: true, data: apiKey });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteKey = async (req, res) => {
  try {
    await ApiKey.update({ status: 'revoked' }, { where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
