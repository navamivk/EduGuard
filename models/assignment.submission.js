const mongoose = require('mongoose');

const AssignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment', // Reference to the Assignment model
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
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
