const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./user.model");

// Student discriminator schema
// - Extends the base `User` model with student-specific fields
// - `interests` is used by the matching engine to find relevant alumni
const StudentSchema = new Schema(
  {
    university: { type: String, trim: true },
    degree: { type: String, trim: true },
    // explicit interests (canonicalized) used alongside `skills` and `tags`
    interests: {
      type: [String],
      default: [],
      set: (arr) => [
        ...new Set((arr || []).map((s) => s.toLowerCase().trim())),
      ],
    },
    // expected graduation year for students (separate from graduationYear)
    expectedGraduationYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 10,
    },
    // preferences students can specify to guide mentor suggestions
    mentorPreferences: {
      industries: { type: [String], default: [] },
      skills: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

const Student = User.discriminator("student", StudentSchema);
module.exports = Student;
