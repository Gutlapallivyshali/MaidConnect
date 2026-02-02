import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.sendBookingRequest = async (maidId, maidName) => {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login first");
    return;
  }

  await addDoc(collection(db, "requests"), {
  maidId: maidId,
  maidName: maidName,
  userId: user.uid,
  userName: user.email,              // ✅ ADD THIS
  userPhone: "Not provided",          // ✅ ADD THIS (optional)
  jobDescription: "House Cleaning",   // ✅ ADD THIS
  status: "pending",
  createdAt: new Date()
});

  alert("✅ Booking request sent!");
};