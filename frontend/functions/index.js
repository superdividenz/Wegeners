const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addCustomer = functions.https.onRequest(async (req, res) => {
  try {
    const customer = req.body;
    const docRef = await admin.firestore().collection('customers').add(customer);
    res.status(200).send(`Customer added with ID: ${docRef.id}`);
  } catch (error) {
    res.status(500).send('Error adding customer: ' + error.message);
  }
});