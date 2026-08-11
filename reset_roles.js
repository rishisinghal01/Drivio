import mongoose from "mongoose";

const MONGODB_URL = "mongodb+srv://rishi1462be24_db_user:EunqYrOOylaoTcKI@cluster0.k7dfrid.mongodb.net/rydex";

async function main() {
    await mongoose.connect(MONGODB_URL);
    
    const UserSchema = new mongoose.Schema({
        role: String,
        partnerOnboardingStep: Number
    }, { strict: false });
    
    const User = mongoose.model("User", UserSchema);
    
    const result = await User.updateMany(
        { role: "user", partnerOnboardingStep: { $gt: 0 } },
        { $set: { role: "partner" } }
    );
    
    console.log("Updated users back to partner:", result);
    process.exit(0);
}

main().catch(console.error);
