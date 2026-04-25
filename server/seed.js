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

  // Seed nominees — clear existing and re-seed
  await Nominee.deleteMany({});
  console.log("Cleared existing nominees");
  {
    const nominees = [
      {
        name: "Shiva Prasath R",
        title: "Community Member",
        image: "",
        category: "Community Leader",
        linkedin: "https://www.linkedin.com/in/shivaprasathr396",
      },
      {
        name: "Harish Anbalagan",
        title: "Community Member",
        image: "",
        category: "Community Leader",
        linkedin: "https://www.linkedin.com/in/harishanbalagan/",
        twitter: "https://x.com/theflutterboi",
        github: "https://github.com/Harishwarrior",
      },
      {
        name: "Akash Senthil",
        title: "Community Member",
        image: "",
        category: "Community Leader",
        linkedin: "https://www.linkedin.com/in/akashprocoder",
        twitter: "https://x.com/akashprocoder",
        github: "https://github.com/AkashProfessionalCoder",
      },
      {
        name: "Justin Benito",
        title: "Community Member",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQHqxJcgC2lRgQ/profile-displayphoto-shrink_200_200/B56Zc7UgZxG0Ak-/0/1749046921446?e=1754524800&v=beta&t=GtKRFMjVkV0kQnR6gTDDZlkO0Qs-99_vf4mvUXdbKUk",
        category: "Community Leader",
        linkedin: "https://linkedin.com/in/justinbenito",
        twitter: "https://x.com/JustinbenitoB",
        github: "https://github.com/justinbenito",
      },
      {
        name: "Harish Raj R",
        title: "Community Member",
        image: "",
        category: "Community Leader",
      },
      {
        name: "Vaishnavi G",
        title: "Community Member",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQE166_DMPz2gQ/profile-displayphoto-scale_400_400/B56ZffMucGGQAg-/0/1751796346791?e=1778716800&v=beta&t=JbSfEcd8GCdLVoqBTYJ8cazfAlzfIxipwrBi1bJiaFI",
        category: "Community Leader",
        linkedin: "https://www.linkedin.com/in/vaishnavi-g-900b8121a",
      },
      {
        name: "Kumaran Karunakaran",
        title: "Community Member",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGPKVa2szIV0A/profile-displayphoto-scale_400_400/B56ZyQgWOIG4Ak-/0/1771950926995?e=1778716800&v=beta&t=Co21_5lhPB0_Fsi5SaReuS4j2dQTLr5mh0BNSCuhs8w",
        category: "Community Leader",
        linkedin: "https://www.linkedin.com/in/kumarankarunakaran/",
        github: "https://github.com/kumaran-flutter",
      },
    ];

    await Nominee.insertMany(nominees);
    console.log(`${nominees.length} nominees seeded`);
  }

  await mongoose.disconnect();
  console.log("Seed complete");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
