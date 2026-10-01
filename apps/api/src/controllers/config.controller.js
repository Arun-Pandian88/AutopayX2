const AppConfig = require('../models/AppConfig');

exports.getConfig = async (req, res, next) => {
  try {
    let config = await AppConfig.findOne({ where: { user_id: req.user.id } });
    
    if (!config) {
      config = await AppConfig.create({ user_id: req.user.id });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

exports.updateConfig = async (req, res, next) => {
  try {
    const { success_url, failed_url, webhook_url } = req.body;
    
    let config = await AppConfig.findOne({ where: { user_id: req.user.id } });
    
    if (!config) {
      config = await AppConfig.create({ user_id: req.user.id });
    }
    
    await config.update({
      success_url: success_url !== undefined ? success_url : config.success_url,
      failed_url: failed_url !== undefined ? failed_url : config.failed_url,
      webhook_url: webhook_url !== undefined ? webhook_url : config.webhook_url
    });
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};
