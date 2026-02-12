const matchService = require("../services/match.service");

/**
 * Controller: getMatches
 * - expects authenticated `req.user` (JWT payload)
 * - delegates to service layer and returns results as JSON
 */
async function getMatches(req, res, next) {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // optional client-supplied options (filters, limit)
    const options = req.body.options || {};
    const matches = await matchService.getMatchesForStudent(userId, options);
    return res.json({ results: matches });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMatches };
