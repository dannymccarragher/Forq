import dotenv from "dotenv";

dotenv.config();

console.log("\n=== Environment Variables Check ===\n");

// Check for OAuth 1.0 credentials (what we need now)
console.log("OAuth 1.0 Credentials (Required):");
console.log("FATSECRET_CONSUMER_KEY:", process.env.FATSECRET_CONSUMER_KEY ? "✅ SET" : "❌ NOT SET");
console.log("FATSECRET_CONSUMER_SECRET:", process.env.FATSECRET_CONSUMER_SECRET ? "✅ SET" : "❌ NOT SET");

console.log("\nOAuth 2.0 Credentials (Old - Not Used):");
console.log("FATSECRET_CLIENT_ID:", process.env.FATSECRET_CLIENT_ID ? "⚠️ SET (not used)" : "❌ NOT SET");
console.log("FATSECRET_CLIENT_SECRET:", process.env.FATSECRET_CLIENT_SECRET ? "⚠️ SET (not used)" : "❌ NOT SET");

console.log("\n=== What You Need to Do ===\n");

if (!process.env.FATSECRET_CONSUMER_KEY || !process.env.FATSECRET_CONSUMER_SECRET) {
    console.log("❌ Update your .env file to use OAuth 1.0 credentials:\n");
    console.log("1. Open apps/api/.env");
    console.log("2. Change these variable names:");
    console.log("   FROM: FATSECRET_CLIENT_ID");
    console.log("   TO:   FATSECRET_CONSUMER_KEY\n");
    console.log("   FROM: FATSECRET_CLIENT_SECRET");
    console.log("   TO:   FATSECRET_CONSUMER_SECRET\n");
    console.log("3. Use the SAME values (your credentials work for both OAuth 1.0 and 2.0)");
    console.log("4. Restart your server\n");
    
    console.log("Example .env file:");
    console.log("─".repeat(50));
    console.log("PORT=3000");
    console.log("NODE_ENV=development");
    console.log("FATSECRET_CONSUMER_KEY=7ca2a56300174a12...");
    console.log("FATSECRET_CONSUMER_SECRET=216ceb6305b34567...");
    console.log("─".repeat(50));
} else {
    console.log("✅ Environment variables are set correctly!");
    console.log("Your OAuth 1.0 credentials are ready to use.");
}

console.log();
