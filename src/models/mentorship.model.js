const mongoose = require("mongoose");
const { Schema } = mongoose;

// Message subdocument used for chat within a mentorship request thread
const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * MentorshipRequest
 * - Represents a mentorship conversation/request between a student and an alumni
 * - `studentSnapshot` captures the student's profile at request time for auditability
 */
const MentorshipRequestSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // snapshot of student profile to avoid leaking future edits
    studentSnapshot: { type: Object, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "closed"],
      default: "pending",
    },
    messages: { type: [MessageSchema], default: [] },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipRequest", MentorshipRequestSchema);
