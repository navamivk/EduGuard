const router = require('express').Router();
const Assignment = require('../models/assignment.model');
const AssignmentSubmission = require('../models/assignment.submission');

router.get('/profile', async (req, res, next) => {
  // console.log(req.user);
  const person = req.user;
  res.render('profile', { person });
});

router.get('/s_dashboard', async (req, res, next) => {
  // Render the user dashboard view here
  res.render('studentdashboard', { user: req.user });
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

    // Create a new AssignmentSubmission document.
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


module.exports = router;
