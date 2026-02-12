const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./user.model");

// Alumni discriminator schema
// - Extends base `User` with professional info used for matching and display
const AlumniSchema = new Schema(
  {
    // current employer and role
    currentCompany: { type: String, trim: true },
    position: { type: String, trim: true },
    // total years of experience
    yearsExperience: { type: Number, min: 0 },
    // graduation year for alumni (can alias base graduationYear)
    graduatedYear: { type: Number, min: 1900 },
    // indicates whether alumni are open to mentoring
    willingToMentor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Alumni = User.discriminator("alumni", AlumniSchema);
module.exports = Alumni;
