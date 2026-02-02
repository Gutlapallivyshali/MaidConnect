// Function to show the modal
function openRatingModal(maidName) {
    window.selectedMaidForRating = maidName; // Save name globally
    document.getElementById("targetMaidName").innerText = maidName;
    document.getElementById("ratingModal").style.display = "flex";
}

// Function to hide the modal
function closeRatingModal() {
    document.getElementById("ratingModal").style.display = "none";
}

// Function to handle the button click
function submitRating() {
    const score = document.getElementById("ratingValue").value;
    alert("Thank you! You gave " + window.selectedMaidForRating + " a rating of " + score + " stars.");
    
    // In a real project, you would use fetch(SCRIPT_URL) here 
    // to save this rating to your Google Sheet.
    
    closeRatingModal();
}