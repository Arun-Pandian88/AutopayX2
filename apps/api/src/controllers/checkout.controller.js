const CheckoutTheme = require('../models/CheckoutTheme');

exports.getThemeSettings = async (req, res, next) => {
  try {
    let theme = await CheckoutTheme.findOne({ where: { user_id: req.user.id } });
    
    if (!theme) {
      theme = await CheckoutTheme.create({ user_id: req.user.id });
    }
    
    res.json({
      success: true,
      data: theme
    });
  } catch (error) {
    next(error);
  }
};

exports.updateThemeSettings = async (req, res, next) => {
  try {
    const { theme_id, business_name, brand_color, brand_logo, logo_type, background_image } = req.body;
    
    let theme = await CheckoutTheme.findOne({ where: { user_id: req.user.id } });
    
    if (!theme) {
      theme = await CheckoutTheme.create({ user_id: req.user.id });
    }
    
    await theme.update({
      theme_id: theme_id !== undefined ? theme_id : theme.theme_id,
      business_name: business_name !== undefined ? business_name : theme.business_name,
      brand_color: brand_color !== undefined ? brand_color : theme.brand_color,
      brand_logo: brand_logo !== undefined ? brand_logo : theme.brand_logo,
      logo_type: logo_type !== undefined ? logo_type : theme.logo_type,
      background_image: background_image !== undefined ? background_image : theme.background_image
    });
    
    res.json({
      success: true,
      data: theme
    });
  } catch (error) {
    next(error);
  }
};
