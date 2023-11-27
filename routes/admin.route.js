const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');
const Grades = require('../models/grades.model');
const { registerValidator } = require('../utils/validators');
const { body, validationResult } = require('express-validator');

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
  
  try{
    res.render('admindashboard', { user: req.user });
  }catch(error){
    next(error);
  }
});

router.get('/admin-assignment', async (req, res, next) => {
  
  try{
    res.render('admin-assignment', { user: req.user });
  }catch(error){
    next(error);
  }
});


// Route to render the assignment creation form
router.get('/assignments/create', async (req, res, next) => {
  try {
    res.render('assignment_creation' ); 
  } catch (error) {
    next(error);
  }
});

// Create new assignment for admin
router.post('/assignments', async (req, res, next) => {
  try {
    const { title, subject, description, deadline } = req.body;

    const adminId = req.user._id; 

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
    const adminId = req.user._id; 

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

    const adminId = req.user._id; 
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

router.get('/add-grades', (req, res) => {
  res.render('add-grades');
});

router.post('/add-grades', async (req, res) => {
  try {
    const { rollNumber, subjectName, grade } = req.body;

    const existingRecord = await Grades.findOne({ rollNumber });

    console.log('Existing Record:', existingRecord);

    if (existingRecord) {
      // Student found, update the grade
      console.log('Grades Map Before Update:', existingRecord.grades);
      const update = { [`grades.${subjectName}`]: grade };
      await Grades.updateOne({ rollNumber }, { $set: update });
    } else {
      // Student not found, create a new record
      await Grades.create({
        rollNumber,
        grades: new Map([[subjectName, grade]]),
      });
    }

    req.flash('success', 'Grades added/updated successfully');
    res.redirect('/admin/add-grades');
  } catch (error) {
    console.error('Error adding/updating marks:', error);
    req.flash('error', 'Error adding/updating grades');
    res.redirect('/admin/add-grades');
  }
});

router.get(
  '/register',
  async (req, res, next) => {
    res.render('register');
  }
);

router.post(
  '/register',
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

      const { name, rollNumber, email, password } = req.body;


      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash('warning', 'Username/email already exists');
        res.redirect('/admin/register');  
        return;
      }
      const user = new User({ name, rollNumber, email, password });
      await user.save();
      req.flash(
        'success',
        `${user.email} registered successfully.`
      );
      res.redirect('/admin/register');  
    } catch (error) {
      next(error);
    }
  }
);




module.exports = router;
