const mongoose = require("mongoose");
const { Schema } = mongoose;

// JobPost represents opportunities posted by users (typically alumni or org accounts)
const JobPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: String, trim: true },
    // reference to the user who posted the job
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillsRequired: { type: [String], default: [] },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },
    applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobPost", JobPostSchema);
