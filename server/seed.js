/**
 * Seed script — creates an admin user and sample nominees
 * Run: node server/seed.js
 */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const Nominee = require("./models/Nominee");
const connectDB = require("./config/db");

const seed = async () => {
  await connectDB();

  // Seed admin
  const existingAdmin = await Admin.findOne({ username: "admin" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await Admin.create({ username: "admin", password: hashedPassword });
    console.log("Admin user created (username: admin, password: admin123)");
  } else {
    console.log("Admin user already exists");
  }

  // Seed nominees
  const nomineeCount = await Nominee.countDocuments();
  if (nomineeCount === 0) {
    const nominees = [
      {
        name: "Ravi Kumar",
        title: "Flutter GDE & Community Lead",
        image: "",
        category: "Community Leader",
      },
      {
        name: "Priya Sharma",
        title: "Open Source Contributor",
        image: "",
        category: "Community Leader",
      },
      {
        name: "Arun Prakash",
        title: "Flutter Meetup Organizer",
        image: "",
        category: "Event Organizer",
      },
      {
        name: "Deepa Menon",
        title: "Workshop Conductor",
        image: "",
        category: "Event Organizer",
      },
      {
        name: "Karthik Raj",
        title: "Package Publisher (10+ packages)",
        image: "",
        category: "Open Source",
      },
      {
        name: "Sneha Iyer",
        title: "Flutter Documentation Lead",
        image: "",
        category: "Open Source",
      },
    ];

    await Nominee.insertMany(nominees);
    console.log(`${nominees.length} nominees seeded`);
  } else {
    console.log(`${nomineeCount} nominees already exist`);
  }

  await mongoose.disconnect();
  console.log("Seed complete");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
