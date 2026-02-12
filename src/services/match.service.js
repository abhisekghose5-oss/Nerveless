const User = require("../models/user.model");
const { normalizeTags } = require("../utils/normalize");

/**
 * getMatchesForStudent
 * - Builds a tag set from the student's skills/interests/tags
 * - Aggregates over alumni users computing intersections and a score
 * - Returns a ranked list of alumni with match breakdown fields
 *
 * NOTE: This is a simple, explainable heuristic. For larger datasets
 * consider precomputing inverted indexes or using embedding-based search.
 */
async function getMatchesForStudent(studentId, options = {}) {
  const student = await User.findById(studentId).lean();
  if (!student) throw new Error("Student not found");

  // canonical tag set for the student
  const tagSet = normalizeTags([
    ...(student.skills || []),
    ...(student.interests || []),
    ...(student.tags || []),
  ]);
  const studentConnections = (student.connections || []).map((id) =>
    id.toString()
  );

  // basic filters for candidate alumni
  const filters = { role: "alumni", isSuspended: false };
  if (options.willingToMentor !== undefined)
    filters["settings.mentorshipAvailable"] = options.willingToMentor;
  if (
    options.industries &&
    Array.isArray(options.industries) &&
    options.industries.length
  )
    filters.industry = { $in: options.industries };

  // aggregation pipeline computes overlaps and a weighted score
  const pipeline = [
    { $match: filters },
    {
      $addFields: {
        skillIntersection: { $size: { $setIntersection: ["$skills", tagSet] } },
        tagIntersection: { $size: { $setIntersection: ["$tags", tagSet] } },
        mutualConnections: {
          $size: { $setIntersection: ["$connections", studentConnections] },
        },
        industryMatch: {
          $cond: [{ $eq: ["$industry", student.industry] }, 1, 0],
        },
      },
    },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: ["$skillIntersection", 10] },
            { $multiply: ["$tagIntersection", 5] },
            { $multiply: ["$mutualConnections", 3] },
            { $multiply: ["$industryMatch", 8] },
          ],
        },
      },
    },
    { $sort: { score: -1, skillIntersection: -1 } },
    { $limit: options.limit || 20 },
    {
      $project: {
        // include explainable fields for the client
        score: 1,
        skillIntersection: 1,
        tagIntersection: 1,
        mutualConnections: 1,
        industry: 1,
        name: 1,
        avatarUrl: 1,
        bio: 1,
        skills: 1,
        tags: 1,
      },
    },
  ];

  const results = await User.aggregate(pipeline);
  return results;
}

module.exports = { getMatchesForStudent };
