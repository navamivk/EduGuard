const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Checking for id and roles in req.body
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    req.flash('info', `updated role for ${user.email} to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

router.get('/a_dashboard', async (req, res, next) => {
  // Render the user dashboard view here
  try{
    res.render('admindashboard', { user: req.user });
  }catch(error){
    next(error);
  }
});


// Route to render the assignment creation form
router.get('/assignments/create', async (req, res, next) => {
  try {
    res.render('assignment_creation' ); // Render the assignment creation form
  } catch (error) {
    // Handle errors, e.g., render an error page
    next(error);
  }
});

// Create new assignment for admin
router.post('/assignments', async (req, res, next) => {
  try {
    const { title, subject, description, deadline } = req.body;

    const adminId = req.user._id; // MongoDB ObjectId for the admin

    const assignment = new Assignment({
      title,
      subject,
      description,
      deadline,
      teacher: {
        id: adminId,
        name: req.user.name,
      },
    });

    await assignment.save();
    req.flash('success', 'Assignment created successfully');
    res.redirect('/admin/a_dashboard');
  } catch (error) {
    next(error);
  }
});

// View list of assignments by admin ID
router.get('/assignments', async (req, res, next) => {
  try {
    const adminId = req.user._id; // MongoDB ObjectId for the admin

    const assignments = await Assignment.find({ 'teacher.id': adminId });
    res.render('assignments', { assignments });
  } catch (error) {
    next(error);
  }
});

// View assignment details by admin ID
router.get('/assignments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid assignment ID');
      res.redirect('/admin/assignments');
      return;
    }

    const adminId = req.user._id; // MongoDB ObjectId for the admin
    const assignment = await Assignment.findOne({ _id: id, 'teacher.id': adminId });

    if (!assignment) {
      req.flash('error', 'Assignment not found for the admin');
      res.redirect('/admin/assignments');
      return;
    }

    res.render('assignment-details', { assignment });
  } catch (error) {
    next(error);
  }
});







module.exports = router;
