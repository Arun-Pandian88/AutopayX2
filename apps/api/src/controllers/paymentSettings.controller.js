const PaymentSetting = require('../models/PaymentSetting');

exports.getSettings = async (req, res) => {
  try {
    const settings = await PaymentSetting.findAll({ where: { user_id: req.user.id } });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

exports.saveMasterDetails = async (req, res) => {
  const { app_name, master_upi_id, upi_number, payee_name } = req.body;
  try {
    const [setting, created] = await PaymentSetting.findOrCreate({
      where: { user_id: req.user.id, app_name },
      defaults: { master_upi_id, upi_number, payee_name }
    });
    if (!created) {
      setting.master_upi_id = master_upi_id;
      setting.upi_number = upi_number;
      setting.payee_name = payee_name;
      await setting.save();
    }
    res.json({ message: 'Details saved successfully', setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving details' });
  }
};

exports.connectMailbox = async (req, res) => {
  const { app_name, mailbox_email, mailbox_password } = req.body;
  try {
    const [setting, created] = await PaymentSetting.findOrCreate({
      where: { user_id: req.user.id, app_name },
      defaults: { mailbox_email, mailbox_password, is_connected: true }
    });
    if (!created) {
      setting.mailbox_email = mailbox_email;
      setting.mailbox_password = mailbox_password;
      setting.is_connected = true;
      await setting.save();
    }
    res.json({ message: 'Mailbox connected successfully', setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error connecting mailbox' });
  }
};

exports.disconnectMailbox = async (req, res) => {
  const { app_name } = req.body;
  try {
    const setting = await PaymentSetting.findOne({ where: { user_id: req.user.id, app_name } });
    if (setting) {
      setting.mailbox_email = null;
      setting.mailbox_password = null;
      setting.is_connected = false;
      await setting.save();
    }
    res.json({ message: 'Mailbox disconnected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error disconnecting mailbox' });
  }
};

exports.saveRoutingList = async (req, res) => {
  const { app_name, auto_routing_enabled, routing_upi_list } = req.body;
  try {
    const [setting, created] = await PaymentSetting.findOrCreate({
      where: { user_id: req.user.id, app_name },
      defaults: { auto_routing_enabled, routing_upi_list }
    });
    if (!created) {
      setting.auto_routing_enabled = auto_routing_enabled;
      setting.routing_upi_list = routing_upi_list;
      await setting.save();
    }
    res.json({ message: 'Routing settings saved successfully', setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving routing settings' });
  }
};
