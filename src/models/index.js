const mongoose = require("mongoose");

async function connect(uri, opts = {}) {
  const defaultOpts = { useNewUrlParser: true, useUnifiedTopology: true };
  return mongoose.connect(uri, Object.assign(defaultOpts, opts));
}

module.exports = { connect, mongoose };
