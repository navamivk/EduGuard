const mongoose = require('mongoose');

const gradesSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  grades: { type: Map, of: String },
});

const Grades = mongoose.model('Grades', gradesSchema);

module.exports = Grades;
