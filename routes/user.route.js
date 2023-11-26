const router = require('express').Router();
const Assignment = require('../models/assignment.model');
const AssignmentSubmission = require('../models/assignment.submission');
const Grades = require('../models/grades.model');

router.get('/profile', async (req, res, next) => {
  // console.log(req.user);
  const person = req.user;
  res.render('profile', { person });
});

router.get('/s_dashboard', async (req, res, next) => {
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
    console.log('User:', req.user);
    const Name = req.user.name;
    console.log('Name:', Name);
    const email = req.user.email;
    console.log('email:', email);
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

// Function to convert map to table format
function convertMapToTable(gradesMap) {
  const table = [];
  for (const [subject, grade] of Object.entries(gradesMap)) {
    table.push({ subject, grade });
  }
  return table;
}



module.exports = router;
