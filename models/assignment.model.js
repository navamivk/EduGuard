const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  teacher: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', 
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
});

const Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;
