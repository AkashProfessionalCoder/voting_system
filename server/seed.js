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
    {
      name: "Harish Anbalagan",
      title: "Your Designation",
      category: "Namma Flutter Consistent Contributor",
      image: "",
      linkedin: "https://www.linkedin.com/in/harishanbalagan",
      twitter: "https://x.com/theflutterboi",
      github: "https://github.com/Harishwarrior",
      medium: "",
      website: "",
    },
    {
      name: "Imran B",
      title: "Your Designation",
      category: "Namma Flutter Frequent Flutterer",
      image: "",
      linkedin: "",
      twitter: "",
      github: "https://github.com/Imran200216",
      medium: "",
      website: "",
    },
    {
      name: "Sanjivy Kumaravel",
      title: "Your Designation",
      category: "Namma Flutter Consistent Contributor",
      image: "",
      linkedin: "https://in.linkedin.com/in/sanjivy-kumaravel-1bb99a173",
      twitter: "",
      github: "",
      medium: "",
      website: "",
    },
    {
      name: "Abhishek Doshi",
      title: "Your Designation",
      category: "Namma Flutter Consistent Contributor",
      image: "",
      linkedin: "",
      twitter: "",
      github: "",
      medium: "",
      website: "https://abhishekdoshi.dev",
    },
    {
      name: "Firdous",
      title: "Your Designation",
      category: "Namma Flutter Consistent Contributor",
      image: "",
      linkedin: "https://www.linkedin.com/in/iamfirdous",
      twitter: "",
      github: "",
      medium: "",
      website: "",
    },
    {
      name: "Ashita Prasad",
      title: "Your Designation",
      category: "Namma Flutter Consistent Contributor",
      image: "",
      linkedin: "https://www.linkedin.com/in/ashitaprasad",
      twitter: "",
      github: "https://github.com/ashitaprasad",
      medium: "",
      website: "https://ashitaprasad.github.io",
    },
    {
      name: "Sathish Kumar J",
      title: "Your Designation",
      category: "Namma Flutter Consistent Contributor",
      image: "",
      linkedin: "",
      twitter: "",
      github: "",
      medium: "",
      website: "",
    },
    {
      name: "Madhumitha K",
      title: "Your Designation",
      category: "Namma Flutter Rising Star",
      image: "",
      linkedin: "https://www.linkedin.com/in/madhumitha-komarasamy-611356317",
      twitter: "",
      github: "",
      medium: "",
      website: "",
    },
    {
      name: "SRI VILLIAM SAI A",
      title: "Your Designation",
      category: "Namma Flutter Rising Star",
      image: "",
      linkedin: "",
      twitter: "",
      github: "https://github.com/srivilliamsai",
      medium: "",
      website: "",
    },
    {
      name: "Magesh K",
      title: "Your Designation",
      category: "Namma Flutter Frequent Flutterer",
      image: "",
      linkedin: "https://www.linkedin.com/in/mageshkanna",
      twitter: "",
      github: "",
      medium: "",
      website: "",
    },
    // {
    //   name: "Akash Senthil",
    //   title: "Your Designation",
    //   category: "Namma Flutter Consistent Contributor",
    //   image: "",
    //   linkedin: "https://www.linkedin.com/in/akashprocoder",
    //   twitter: "https://x.com/akashprocoder",
    //   github: "https://github.com/AkashProfessionalCoder",
    //   medium: "https://medium.com/@akashprocoder",
    //   website: "",
    // },
    {
      name: "Mohamed Athif N",
      title: "Your Designation",
      category: "Namma Flutter Rising Star",
      image: "",
      linkedin: "https://www.linkedin.com/in/n-mohamed-athif/",
      twitter: "",
      github: "https://github.com/A-THIF",
      medium: "",
      website: "",
    },
    {
      name: "Mohamed Ibrahim",
      title: "Your Designation",
      category: "Namma Flutter Consistent Contributor",
      image: "",
      linkedin: "https://www.linkedin.com/in/ibrahimrasith",
      twitter: "",
      github: "https://github.com/mohamed8270",
      medium: "",
      website: "",
    },
 
  ];

  await Nominee.insertMany(nominees);
  console.log(`${nominees.length} nominees seeded.`);

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
