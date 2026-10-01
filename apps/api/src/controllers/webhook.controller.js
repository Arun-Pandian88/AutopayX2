const WebhookEndpoint = require('../models/WebhookEndpoint');
const crypto = require('crypto');

// GET all webhooks for user
exports.getWebhooks = async (req, res) => {
  try {
    const webhooks = await WebhookEndpoint.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: webhooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching webhooks' });
  }
};

// CREATE webhook
exports.createWebhook = async (req, res) => {
  const { url, events, description } = req.body;
  try {
    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');
    const webhook = await WebhookEndpoint.create({
      user_id: req.user.id,
      url,
      events: events || 'all',
      description: description || '',
      secret,
      status: 'active'
    });
    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating webhook' });
  }
};

// UPDATE webhook
exports.updateWebhook = async (req, res) => {
  const { id } = req.params;
  const { url, events, description, status } = req.body;
  try {
    const webhook = await WebhookEndpoint.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    await webhook.update({
      url: url ?? webhook.url,
      events: events ?? webhook.events,
      description: description ?? webhook.description,
      status: status ?? webhook.status
    });
    res.json({ success: true, data: webhook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating webhook' });
  }
};

// DELETE webhook
exports.deleteWebhook = async (req, res) => {
  const { id } = req.params;
  try {
    const webhook = await WebhookEndpoint.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    await webhook.destroy();
    res.json({ success: true, message: 'Webhook deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting webhook' });
  }
};
