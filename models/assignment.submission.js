const mongoose = require('mongoose');

const AssignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment', 
  },
  title: {
    type: String,
    ref: 'Assignment', 
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  rollNumber: {
    type: String,
    ref: 'User', 
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  submissionDate: {
    type: Date,
    required: true,
  },
  content: {
    type: String, 
  },
});

const AssignmentSubmission = mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema);

module.exports = AssignmentSubmission;
