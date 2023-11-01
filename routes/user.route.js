const router = require('express').Router();

router.get('/profile', async (req, res, next) => {
  // console.log(req.user);
  const person = req.user;
  res.render('profile', { person });
});

router.get('/s_dashboard', async (req, res, next) => {
  // Render the user dashboard view here
  res.render('studentdashboard', { user: req.user });
});

module.exports = router;
