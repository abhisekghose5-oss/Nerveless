const path = require("path");
const { connect } = require(
  path.join(__dirname, "..", "src", "models", "index")
);
const Student = require(
  path.join(__dirname, "..", "src", "models", "student.model")
);
const Alumni = require(
  path.join(__dirname, "..", "src", "models", "alumni.model")
);
const User = require(path.join(__dirname, "..", "src", "models", "user.model"));
const matchService = require(
  path.join(__dirname, "..", "src", "services", "match.service")
);

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/nerveless-dev";

async function seed() {
  // Connect to DB and prepare test data
  await connect(MONGO_URI);
  console.log("Connected to DB");

  // Remove existing test data (careful in production)
  await User.deleteMany({ email: /@example.com$/ });

  // Create sample alumni users used by the demo matching test
  const alum = await Alumni.create({
    email: "alumni1@example.com",
    passwordHash: "x",
    name: "Alice Alumni",
    skills: ["data science", "python", "ml"],
    industry: "Technology",
    graduationYear: 2015,
    settings: { mentorshipAvailable: true },
    willingToMentor: true,
  });

  const alum2 = await Alumni.create({
    email: "alumni2@example.com",
    passwordHash: "x",
    name: "Bob Mentor",
    skills: ["product", "growth", "analytics"],
    industry: "Technology",
    graduationYear: 2012,
    settings: { mentorshipAvailable: true },
    willingToMentor: true,
  });

  // Create a sample student whose interests will be matched
  const student = await Student.create({
    email: "student1@example.com",
    passwordHash: "x",
    name: "Sally Student",
    skills: ["python"],
    interests: ["data science", "ml"],
    industry: "Technology",
    expectedGraduationYear: new Date().getFullYear() + 1,
  });

  console.log("Seeded users:", {
    student: student._id,
    alum: alum._id,
    alum2: alum2._id,
  });

  // Demonstrate running the match service directly (bypasses HTTP layer)
  const matches = await matchService.getMatchesForStudent(student._id, {
    willingToMentor: true,
    limit: 10,
  });
  console.log("Matches result:");
  console.log(JSON.stringify(matches, null, 2));

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
