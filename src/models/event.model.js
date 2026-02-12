const mongoose = require("mongoose");
const { Schema } = mongoose;

// Event model for meetups, webinars, and other alumni/student events
const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    // organizer user reference
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date },
    // freeform location string (or virtual link)
    location: { type: String },
    capacity: { type: Number },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
