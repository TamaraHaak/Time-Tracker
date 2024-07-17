const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.dailyUserCleanup = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const topUsersSnapshot = await admin.database().ref('topUsers').once('value');
  const topUserIds = Object.keys(topUsersSnapshot.val());

  const usersSnapshot = await admin.firestore().collection('users').get();
  const batch = admin.firestore().batch();

  usersSnapshot.forEach(doc => {
    if (!topUserIds.includes(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();
  console.log('Deleted all users except top 10');
});