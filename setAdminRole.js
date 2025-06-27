require("dotenv").config(); // Must be first

const admin = require("firebase-admin");
const readline = require("readline");
const path = require("path");

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!keyPath) {
  console.error("❌ Missing GOOGLE_APPLICATION_CREDENTIALS in .env");
  process.exit(1);
}

const serviceAccount = require(path.resolve(keyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter Firebase UID to assign 'admin' role: ", (uid) => {
  if (!uid) {
    console.error("❌ UID is required.");
    rl.close();
    return;
  }

  admin
    .auth()
    .setCustomUserClaims(uid, { admin: true })
    .then(() => {
      console.log(`✅ Admin role assigned to UID: ${uid}`);
    })
    .catch((error) => {
      console.error("❌ Error assigning admin role:", error);
    })
    .finally(() => rl.close());
});
