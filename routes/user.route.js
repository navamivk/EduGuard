const router = require('express').Router();
const Assignment = require('../models/assignment.model');
const AssignmentSubmission = require('../models/assignment.submission');
const Grades = require('../models/grades.model');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { changePasswordValidator } = require('../utils/validators'); 
const User = require('../models/user.model');

router.get('/profile', async (req, res, next) => {
  // console.log(req.user);
  const person = req.user;
  res.render('profile', { person });
});

router.get('/s_dashboard', async (req, res, next) => {
  res.render('studentdashboard', { user: req.user });
});

// Change Password Route
router.get('/change-password', (req, res) => {
  res.render('change-password', { user: req.user, messages: req.flash() });
});

router.post('/change-password', changePasswordValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash('error', error.msg);
    });
    return res.redirect('/user/s_dashboard');
  }

  const { oldPassword, newPassword } = req.body;

  try {

    // Check if the current password matches the one stored in the database
    const passwordMatch = await bcrypt.compare(oldPassword, req.user.password);

    if (!passwordMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/user/s_dashboard');
    }

    // Update the user's password with the new one
    const userId = req.user._id;
    const user = await User.findById(userId);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    req.flash('success', 'Password changed successfully');
    res.redirect('/user/s_dashboard'); 
  } catch (error) {
    console.error('Error changing password:', error);
    req.flash('error', 'Failed to change password');
    res.redirect('/user/s_dashboard');
  }
});

router.get('/assignments', async (req, res, next) => {
  try {
    const assignments = await Assignment.find();
    res.render('student_assignments', { assignments });
  } catch (error) {
    next(error);
  }
});

router.post('/assignments/submit', async (req, res, next) => {
  try {
    const { assignmentId, submissionText} = req.body;
    const studentId = req.user._id; 

    const submission = new AssignmentSubmission({
      assignment: assignmentId, 
      student: studentId, 
      submissionDate: new Date(),
      content: submissionText, 
    });
    
    await submission.save();
    req.flash('success', 'Assignment submitted successfully');
    res.redirect('/student/assignments');
  } catch (error) {
    next(error);
  }
});

router.get('/view-grades', async (req, res) => {
  try {
    // const user = req.session.user;
    // console.log('User:', req.user);
    // const Name = user.name;
    // console.log('Name:', Name);
    // const email = user.email;
    // console.log('email:', email);
    const rollNumber = req.user.rollNumber;
    console.log('rollNumber:', rollNumber);
    const studentRecord = await Grades.findOne({ rollNumber });
    console.log('Student Record:', studentRecord);

    if (studentRecord) {
      res.render('view-grades', {studentRecord });
    } else {
      req.flash('info', 'No grades found for the student');
      res.redirect('/s_dashboard');
    }
  } catch (error) {
    console.error('Error retrieving grades:', error);
    req.flash('error', 'Error retrieving grades');
    res.redirect('/s_dashboard');
  }
});

module.exports = router;
