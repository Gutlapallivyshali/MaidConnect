// fetchJobRequests.js

const jobRequestsContainer = document.getElementById("jobRequestsContainer");

// Get logged-in maid ID (from auth or localStorage)
const maidId = localStorage.getItem("maidId"); // or from auth.currentUser.uid

function fetchJobRequests() {
    const db = firebase.firestore();
    const jobRequestsRef = db.collection("job_requests");

    // Fetch requests only for this maid
    jobRequestsRef.where("maidId", "==", maidId).get()
    .then((snapshot) => {
        jobRequestsContainer.innerHTML = ""; // clear old content

        if (snapshot.empty) {
            jobRequestsContainer.innerHTML = "<p>No job requests yet.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const request = doc.data();
            jobRequestsContainer.innerHTML += `
                <div class="job-card">
                    <h3>User: ${request.userName}</h3>
                    <p>Service: ${request.service}</p>
                    <p>Date: ${request.date}</p>
                    <p>Status: ${request.status}</p>
                </div>
            `;
        });
    })
    .catch((error) => {
        console.error("Error fetching job requests:", error);
        jobRequestsContainer.innerHTML = "<p>Failed to load job requests.</p>";
    });
}

// Call on page load
window.onload = fetchJobRequests;