// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.assignAdminRole = functions.https.onCall(async (data, context) => {
  const { uid } = data;
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Must be an admin to assign roles.");
  }
  try {
    await admin.firestore().doc(`users/${uid}`).set({ role: "admin" }, { merge: true });
    return { message: "Admin role assigned successfully" };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", "Error assigning admin role", error);
  }
});