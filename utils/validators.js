const { body } = require('express-validator');
module.exports = {
  registerValidator: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail()
      .toLowerCase(),
    body('password')
      .trim()
      .isLength(2)
      .withMessage('Password length short, min 2 char required'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],

  changePasswordValidator: [
    body('oldPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
      .matches(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*[0-9])/)
      .withMessage('New password must contain at least one special character, one uppercase letter, and one numeric character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
};
