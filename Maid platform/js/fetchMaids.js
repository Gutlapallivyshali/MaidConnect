import { db } from "../firebase.js";
import { 
    collection, getDocs, doc, updateDoc, query, where, limit, addDoc, 
    orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const maidsContainer = document.getElementById("maidsContainer");
const auth = getAuth();

async function fetchMaids() {
    const snapshot = await getDocs(collection(db, "workers"));
    maidsContainer.innerHTML = "";

    snapshot.forEach((workerDoc) => {
        const maid = workerDoc.data();
        const maidId = workerDoc.id; // Necessary for bookings

        if (!maid.name || !maid.location || !maid.availability) return;

        // ✅ Build skills chips
        let skillsHTML = "";
        if (maid.skills) {
            maid.skills.forEach(skill => {
                skillsHTML += `<span class="skill">${skill}</span>`;
            });
        }

        const card = document.createElement("div");
        card.className = "maid-card";

        card.innerHTML = `
            <h3>${maid.name}</h3>
            <span>${maid.location} • ${maid.availability}</span>
            <div class="rating-info" style="display: flex; align-items: center; gap: 8px; margin-top: 10px;">
                <span style="color: #fbbf24; font-size: 18px;">★</span>
                <strong>${maid.avgRating || "0.0"}</strong> 
                <span style="font-size: 11px; color: #6b7280;">(${maid.reviewcount || 0})</span>
                <span class="give-rating-link" style="font-size: 12px; color: #1f3c88; cursor: pointer; text-decoration: underline; margin-left: auto;">
                    Give Rating
                </span>
            </div>
            <div class="skills">${skillsHTML}</div>
            <p><strong>Experience:</strong> ${maid.experience} years</p>
            
            <button class="view-reviews-btn" style="width: 100%; background: #f3f4f6; color: #1f3c88; border: 1px solid #d1d5db; padding: 8px; border-radius: 8px; margin-top: 10px; cursor: pointer; font-size: 13px;">
                View Reviews
            </button>
            
            <div class="reviews-list" style="display: none; margin-top: 10px; background: #fafafa; padding: 10px; border-radius: 8px; max-height: 150px; overflow-y: auto; border: 1px solid #eee;">
                <p style="font-size: 12px; color: #6b7280;">Loading reviews...</p>
            </div>

            <div class="action-buttons">
                <button class="contact-btn">Contact</button>
                <button class="book-btn">Book Now</button>
            </div>
        `;

        // ✅ TOGGLE REVIEWS LOGIC
        const reviewBtn = card.querySelector(".view-reviews-btn");
        const reviewList = card.querySelector(".reviews-list");

        reviewBtn.addEventListener("click", async () => {
            if (reviewList.style.display === "none") {
                reviewList.style.display = "block";
                reviewBtn.innerText = "Hide Reviews";
                
                const reviewsQuery = query(
                    collection(db, "workers", workerDoc.id, "comments"),
                    orderBy("createdAt", "desc") 
                );
                
                const revSnap = await getDocs(reviewsQuery);
                reviewList.innerHTML = "";
                
                if (revSnap.empty) {
                    reviewList.innerHTML = "<p style='font-size: 12px; color: #9ca3af;'>No text reviews yet.</p>";
                } else {
                    revSnap.forEach(rDoc => {
                        const r = rDoc.data();
                        const reviewDate = r.createdAt ? r.createdAt.toDate().toLocaleDateString() : "Recently";
                        reviewList.innerHTML += `
                            <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <div style="color: #fbbf24; font-size: 10px;">${"★".repeat(r.rating)}</div>
                                    <small style="color: #9ca3af; font-size: 10px;">${reviewDate}</small>
                                </div>
                                <p style="font-size: 13px; color: #374151; margin: 2px 0;">${r.comment}</p>
                            </div>
                        `;
                    });
                }
            } else {
                reviewList.style.display = "none";
                reviewBtn.innerText = "View Reviews";
            }
        });

        // ✅ BUTTON LISTENERS
        card.querySelector(".give-rating-link").addEventListener("click", () => {
            if (typeof openRatingModal === "function") openRatingModal(maid.name);
        });

        card.querySelector(".contact-btn").addEventListener("click", () => {
            alert(`Contact: ${maid.phone}`);
        });

        // ✅ CONSOLIDATED BOOKING LOGIC
        card.querySelector(".book-btn").addEventListener("click", async () => {
            const user = auth.currentUser;
            if (!user) {
                alert("Please login to book a maid");
                return;
            }
            try {
                await addDoc(collection(db, "requests"), {
                    maidId: maidId,
                    workerName: maid.name,
                    workerPhone: maid.phone,
                    userId: user.uid,
                    status: "pending",
                    createdAt: serverTimestamp()
                });
                alert(`✅ Booking request sent to ${maid.name}`);
            } catch (error) {
                console.error("🔥 FIRESTORE ERROR:", error);
                alert("Booking failed: " + error.message);
            }
        });

        maidsContainer.appendChild(card);
    });
}

// ✅ GLOBAL SUBMISSION LOGIC FOR RATINGS
window.submitRating = async () => {
    const userScore = parseFloat(document.getElementById("ratingValue").value);
    const userComment = document.getElementById("reviewText").value;
    const maidName = window.currentMaidForRating;

    try {
        const q = query(collection(db, "workers"), where("name", "==", maidName), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return;

        const maidDoc = querySnapshot.docs[0];
        const maidRef = doc(db, "workers", maidDoc.id);
        const data = maidDoc.data();

        const oldCount = parseInt(data.reviewcount) || 0;
        const oldAvg = parseFloat(data.avgRating) || 5.0;
        const newCount = oldCount + 1;
        const newAvg = ((oldAvg * oldCount) + userScore) / newCount;

        await updateDoc(maidRef, {
            avgRating: newAvg.toFixed(1),
            reviewcount: newCount
        });

        if (userComment.trim() !== "") {
            await addDoc(collection(db, "workers", maidDoc.id, "comments"), {
                rating: userScore,
                comment: userComment,
                createdAt: serverTimestamp()
            });
        }

        alert("Rating submitted!");
        if (typeof closeRatingModal === "function") closeRatingModal();
        document.getElementById("reviewText").value = "";
        location.reload(); 
    } catch (e) {
        console.error("Rating Submission Error:", e);
    }
};

fetchMaids();