import mongoose from "mongoose";

const MONGODB_URL = "mongodb+srv://rishi1462be24_db_user:EunqYrOOylaoTcKI@cluster0.k7dfrid.mongodb.net/rydex";

async function main() {
    await mongoose.connect(MONGODB_URL);
    const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
    const users = await User.find({ role: "partner" });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

main().catch(console.error);
