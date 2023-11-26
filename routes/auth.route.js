const router = require('express').Router();
const User = require('../models/user.model');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const { registerValidator } = require('../utils/validators');
const svgCaptcha = require('svg-captcha');
const { authenticator, sendOTPEmail } = require('./otpUtils');

router.get(
  '/login',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {

    const captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;

    res.render('login', { captcha: captcha.data });
  }
);

router.post('/login', ensureLoggedOut({ redirectTo: '/' }), (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err || !user) {
      // Authentication failed
      req.flash('error', 'Invalid username or password');
      return res.redirect('/auth/login');
    }

    // Authentication succeeded, now check captcha
    const userCaptcha = req.body.captcha;
    if (userCaptcha !== req.session.captcha) {
      req.flash('error', 'CAPTCHA verification failed');
      return res.redirect('/auth/login');
    }

    // Both authentication and captcha check passed
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      if (user.role === 'ADMIN') {

        try {
          // Generate OTP
          const otp = authenticator.generate(user.email);
          await sendOTPEmail(user.email, otp);

          req.flash('info', 'OTP sent to your email. Please verify.');
          res.render('verify-otp', { userEmail: user.email });

        } catch (error) {
          console.error('Error generating or sending OTP:', error);
          req.flash('error', 'Failed to send OTP');
          res.redirect('/auth/login');
        }

      }

      if (user.role === 'CLIENT') {
        return res.redirect('/user/s_dashboard');
        
      } else {
        return res.redirect('/');
      }
    });
  })(req, res, next);
});

router.post('/verify-otp', (req, res) => {
  console.log('User Object:', req.user);
  const enteredOTP = req.body.otp;
  const userEmail = req.user.email;
  
  const isValid = authenticator.verify({
    token: enteredOTP,
    secret: userEmail,
  });

  if (isValid) {
    return res.redirect('/admin/a_dashboard');
  } else {
    req.logout();
    req.flash('error', 'Invalid OTP');
    return res.redirect('/auth/login');
  }
});

router.get(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('register');
  }
);

router.post(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('error', error.msg);
        });
        res.render('register', {
          name: req.body.name,
          rollNumber: req.body.rollNumber,
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }

      const { name, rollNumber, email } = req.body;
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash('warning', 'Username/email already exists');
        res.redirect('/auth/register');
        return;
      }
      const user = new User({ name, rollNumber, email, ...req.body });
      await user.save();
      req.flash(
        'success',
        `${user.email} registered succesfully, you can now login`
      );
      res.redirect('/auth/login');
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/logout',
  ensureLoggedIn({ redirectTo: '/' }),
  async (req, res, next) => {
    req.logout();
    res.redirect('/');
  }
);

module.exports = router;

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.redirect('/auth/login');
//   }
// }

// function ensureNOTAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     res.redirect('back');
//   } else {
//     next();
//   }
// }
