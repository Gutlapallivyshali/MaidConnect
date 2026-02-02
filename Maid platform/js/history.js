import { auth, db } from "../firebase.js";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("historyContainer");
let selectedRating = 0;
let currentMaidId = null;

auth.onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "login.html"; return; }

    const q = query(collection(db, "requests"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    container.innerHTML = snapshot.empty ? "<p>No bookings yet.</p>" : "";

    snapshot.forEach(docSnap => {
        const req = docSnap.data();
        const statusClass = req.status || "pending";
        const reasonHtml = (statusClass === 'declined' && req.declineReason) 
            ? `<div class="decline-reason"><strong>Reason:</strong> ${req.declineReason}</div>` : "";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${req.workerName}</h3>
            <p>Status: <span class="status ${statusClass}">${statusClass.toUpperCase()}</span></p>
            ${reasonHtml}
            <div class="actions">
                <button class="btn contact">Contact</button>
                ${statusClass === 'accepted' ? `<button class="btn rate" data-maid="${req.maidId}" data-name="${req.workerName}">Give Rating</button>` : ''}
            </div>
        `;

        card.querySelector(".contact").onclick = () => alert("Contact: " + req.workerPhone);
        
        const rateBtn = card.querySelector(".rate");
        if (rateBtn) {
            rateBtn.onclick = () => openRatingModal(rateBtn.dataset.maid, rateBtn.dataset.name);
        }
        container.appendChild(card);
    });
});

// --- RATING LOGIC ---

window.openRatingModal = (maidId, maidName) => {
    currentMaidId = maidId;
    document.getElementById("ratingTargetName").innerText = "Rate " + maidName;
    document.getElementById("ratingModal").style.display = "block";
    document.getElementById("ratingOverlay").style.display = "block";
};

window.closeRatingModal = () => {
    document.getElementById("ratingModal").style.display = "none";
    document.getElementById("ratingOverlay").style.display = "none";
    selectedRating = 0;
    resetStars();
};

// Handle Star Clicks
document.querySelectorAll(".star").forEach(star => {
    star.onclick = (e) => {
        selectedRating = parseInt(e.target.dataset.value);
        updateStars(selectedRating);
    };
});

function updateStars(val) {
    document.querySelectorAll(".star").forEach(s => {
        s.innerText = s.dataset.value <= val ? "★" : "☆";
    });
}

function resetStars() {
    document.querySelectorAll(".star").forEach(s => s.innerText = "☆");
    document.getElementById("ratingComment").value = "";
}

// Submit to Firestore
document.getElementById("submitRatingBtn").onclick = async () => {
    if (selectedRating === 0) { alert("Please select a star rating!"); return; }

    const comment = document.getElementById("ratingComment").value;
    const maidRef = doc(db, "workers", currentMaidId);

    try {
        // 1. Add comment to maid's subcollection
        const commentRef = doc(collection(db, "workers", currentMaidId, "comments"));
        await setDoc(commentRef, {
            rating: selectedRating,
            comment: comment,
            userName: auth.currentUser.displayName || "Anonymous",
            createdAt: serverTimestamp()
        });

        // 2. Update Maid's main profile stats (Average Rating calculation)
        const maidSnap = await getDoc(maidRef);
        const maidData = maidSnap.data();
        const oldCount = maidData.reviewcount || 0;
        const oldAvg = maidData.avgRating || 0;
        
        const newCount = oldCount + 1;
        const newAvg = ((oldAvg * oldCount) + selectedRating) / newCount;

        await updateDoc(maidRef, {
            reviewcount: newCount,
            avgRating: parseFloat(newAvg.toFixed(1))
        });

        alert("Thank you for your feedback!");
        closeRatingModal();
    } catch (err) {
        console.error("Error saving rating:", err);
        alert("Failed to save rating.");
    }
};