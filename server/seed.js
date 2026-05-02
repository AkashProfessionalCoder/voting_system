/**
 * Seed script — creates an admin user and sample nominees
 * Run: npm run seed
 *
 * Categories:
 *   - Developer
 *   - Founders
 *   - Organizer
 */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const Nominee = require("./models/Nominee");
const Settings = require("./models/Settings");
const connectDB = require("./config/db");

const seed = async () => {
  await connectDB();

  // ── Admin ────────────────────────────────────────────────────────────────
  const existingAdmin = await Admin.findOne({ username: "admin" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await Admin.create({ username: "admin", password: hashedPassword });
    console.log("Admin user created (username: admin, password: admin123)");
  } else {
    console.log("Admin user already exists");
  }

  // ── Nominees ─────────────────────────────────────────────────────────────
  await Nominee.deleteMany({});
  console.log("Cleared existing nominees");

  const nominees = [
    // ── Category: Developer ─────────────────────────────────────────────
    {
      name: "Akash Senthil",
      title: "Product Engineer",
      category: "Developer",
      image: "",
      linkedin: "https://www.linkedin.com/in/akashprocoder",
      twitter: "https://x.com/akashprocoder",
      github: "https://github.com/AkashProfessionalCoder",
    },
    {
      name: "Harish Anbalagan",
      title: "Senior Software Developer",
      category: "Developer",
      image: "",
      linkedin: "https://www.linkedin.com/in/harishanbalagan/",
      twitter: "https://x.com/theflutterboi",
      github: "https://github.com/Harishwarrior",
    },

    // ── Category: Founders ──────────────────────────────────────────────
    {
      name: "Harish Raj R",
      title: "Co-Founder",
      category: "Founders",
      image: "",
      linkedin: "",
      twitter: "",
      github: "",
    },
    {
      name: "Justin Benito",
      title: "Founder",
      category: "Founders",
      image:
        "https://media.licdn.com/dms/image/v2/D5603AQHqxJcgC2lRgQ/profile-displayphoto-shrink_200_200/B56Zc7UgZxG0Ak-/0/1749046921446?e=1754524800&v=beta&t=GtKRFMjVkV0kQnR6gTDDZlkO0Qs-99_vf4mvUXdbKUk",
      linkedin: "https://linkedin.com/in/justinbenito",
      twitter: "https://x.com/JustinbenitoB",
      github: "https://github.com/justinbenito",
    },

    // ── Category: Organizer ─────────────────────────────────────────────
    {
      name: "Kumaran Karunakaran",
      title: "Senior Software Developer",
      category: "Organizer",
      image:
        "https://media.licdn.com/dms/image/v2/D5603AQGPKVa2szIV0A/profile-displayphoto-scale_400_400/B56ZyQgWOIG4Ak-/0/1771950926995?e=1778716800&v=beta&t=Co21_5lhPB0_Fsi5SaReuS4j2dQTLr5mh0BNSCuhs8w",
      linkedin: "https://www.linkedin.com/in/kumarankarunakaran/",
      twitter: "",
      github: "https://github.com/kumaran-flutter",
    },
    {
      name: "Shiva Prasath R",
      title: "Software Engineer",
      category: "Organizer",
      image: "",
      linkedin: "https://www.linkedin.com/in/shivaprasathr396",
      twitter: "",
      github: "",
    },
    {
      name: "Vaishnavi G",
      title: "Senior Software Developer",
      category: "Organizer",
      image:
        "https://media.licdn.com/dms/image/v2/D5603AQE166_DMPz2gQ/profile-displayphoto-scale_400_400/B56ZffMucGGQAg-/0/1751796346791?e=1778716800&v=beta&t=JbSfEcd8GCdLVoqBTYJ8cazfAlzfIxipwrBi1bJiaFI",
      linkedin: "https://www.linkedin.com/in/vaishnavi-g-900b8121a",
      twitter: "",
      github: "",
    },
  ];

  await Nominee.insertMany(nominees);
  console.log(`${nominees.length} nominees seeded across 3 categories:`);
  console.log("  - Developer     : 2 nominees");
  console.log("  - Founders      : 2 nominees");
  console.log("  - Organizer     : 3 nominees");

  // ── Voting Deadline ───────────────────────────────────────────────────────
  const envDeadline = process.env.VOTING_DEADLINE;
  if (envDeadline) {
    const date = new Date(envDeadline);
    if (!isNaN(date.getTime())) {
      await Settings.findOneAndUpdate(
        { key: "global" },
        { votingDeadline: date },
        { upsert: true }
      );
      console.log(`Voting deadline set to: ${date.toLocaleString()}`);
    } else {
      console.warn("⚠️  VOTING_DEADLINE in .env is not a valid date — skipped.");
    }
  } else {
    console.log("ℹ️  No VOTING_DEADLINE in .env — deadline unchanged.");
  }

  await mongoose.disconnect();
  console.log("Seed complete");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
