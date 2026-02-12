const mongoose = require("mongoose");
const { Schema } = mongoose;

// Basic validators and helpers for the User schema
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const currentYear = new Date().getFullYear();

// Use discriminatorKey so we can extend User for `student` and `alumni` models
const baseOptions = {
  timestamps: true,
  discriminatorKey: "role",
};

/**
 * User schema (base)
 * - common fields for both Students and Alumni
 * - includes `skills`, `industry`, `graduationYear` used by matching logic
 */
const UserSchema = new Schema(
  {
    // discriminator key stored explicitly so queries can filter by role
    role: {
      type: String,
      index: true,
      required: true,
      enum: ["student", "alumni", "user"],
      default: "user",
    },
    // canonical email (unique)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: emailRegex,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    avatarUrl: { type: String, trim: true, default: null },
    bio: { type: String, trim: true, maxlength: 2000 },
    // Skills are stored canonicalized (lowercase, deduped)
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.every(
            (s) =>
              typeof s === "string" && s.trim().length > 0 && s.length <= 80
          ),
        message: "Invalid skills list",
      },
      set: (arr) => [
        ...new Set((arr || []).map((s) => s.toLowerCase().trim())),
      ],
    },
    industry: { type: String, trim: true, index: true, maxlength: 120 },
    // Graduation year used for filtering / relevance signals
    graduationYear: {
      type: Number,
      min: 1900,
      max: currentYear + 10,
      index: true,
    },
    location: {
      type: {
        city: String,
        region: String,
        country: String,
        coordinates: {
          type: [Number],
          validate: (v) =>
            !v || (Array.isArray(v) && (v.length === 2 || v.length === 0)),
        },
      },
      default: {},
    },
    // Tags are a union of skills + industry + explicit tags; kept canonical
    tags: {
      type: [String],
      default: [],
      set: (arr) => [
        ...new Set((arr || []).map((s) => s.toLowerCase().trim())),
      ],
    },
    connections: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    settings: {
      visibility: {
        type: String,
        enum: ["public", "private", "network"],
        default: "public",
      },
      mentorshipAvailable: { type: Boolean, default: false },
    },
    isSuspended: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  baseOptions
);

// Text index for search
UserSchema.index({ bio: "text", skills: "text", tags: "text" });
UserSchema.index({ skills: 1, industry: 1 });

// helpful instance method for display
UserSchema.methods.displayName = function () {
  return this.name;
};

// Ensure `tags` always includes skills + industry before save
UserSchema.pre("save", function (next) {
  const incoming = new Set([...(this.tags || []), ...(this.skills || [])]);
  if (this.industry) incoming.add(this.industry.toLowerCase().trim());
  this.tags = [...incoming];
  next();
});

module.exports = mongoose.model("User", UserSchema);
