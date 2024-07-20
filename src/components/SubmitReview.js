import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, increment, orderBy, limit, query, getDocs } from 'firebase/firestore';
import { set, ref, getDatabase } from 'firebase/database';
import { firestore } from '../firebase/config';
import './SubmitReview.css';

function SubmitReview({ revieweeId }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const submitReview = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    if (!revieweeId) {
      console.error("revieweeId is missing");
      return;
    }

    const review = {
      reviewerId: user.uid,
      revieweeId,
      rating,
      reviewText,
      createdAt: serverTimestamp()
    };

    const db = getFirestore();
    await addDoc(collection(db, 'reviews'), review);

    // Update user ratings
    const userRef = doc(db, 'users', revieweeId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData) {
      const currentAverageRating = userData.averageRating || 0;
      const currentReviewCount = userData.reviewCount || 0;

      await updateDoc(userRef, {
        reviewCount: increment(1),
        averageRating: ((currentAverageRating * currentReviewCount) + rating) / (currentReviewCount + 1)
      });

      // Update top users
      updateTopUsers();
    } else {
      console.error("User data is missing or invalid.");
    }
  };

  return (
    <div className="submit-review">
      <h2>Submit Review</h2>
      <form onSubmit={submitReview}>
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="Rating (0-5)"
          required
        />
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review..."
          required
        ></textarea>
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

async function updateTopUsers() {
  const db = getFirestore();
  const usersQuery = query(collection(db, 'users'), orderBy('averageRating', 'desc'), limit(10));
  const usersSnapshot = await getDocs(usersQuery);
  const topUsers = {};
  usersSnapshot.forEach(doc => {
    topUsers[doc.id] = {
      userId: doc.id,
      averageRating: doc.data().averageRating
    };
  });
  await set(ref(getDatabase(), 'topUsers'), topUsers);
}

export default SubmitReview;