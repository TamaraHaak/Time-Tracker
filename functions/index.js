const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.scheduledFunction = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();
  const usersRef = db.collection('users');
  
  // Get top 10 users
  const topUsersSnapshot = await usersRef.orderBy('averageRating', 'desc').limit(10).get();
  const topUsersIds = topUsersSnapshot.docs.map(doc => doc.id);

  // Get all users
  const allUsersSnapshot = await usersRef.get();
  const allUsersIds = allUsersSnapshot.docs.map(doc => doc.id);

  // Filter out top users
  const usersToDelete = allUsersIds.filter(id => !topUsersIds.includes(id));

  // Delete users
  const batch = db.batch();
  usersToDelete.forEach(userId => {
    batch.delete(usersRef.doc(userId));
  });

  await batch.commit();
  console.log('Deleted users except top 10');
});