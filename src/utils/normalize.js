// normalizeTags: canonicalize arrays of strings into a deduped, lowercased set
function normalizeTags(arr = []) {
  if (!Array.isArray(arr)) return [];
  return [
    ...new Set(arr.map((s) => String(s).toLowerCase().trim()).filter(Boolean)),
  ];
}

module.exports = { normalizeTags };
