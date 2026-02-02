import { db } from "./firebase.js";
import { collection, addDoc } from 
"https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

document.getElementById("submitBtn").addEventListener("click", async () => {

  const name = document.getElementById("name").value;
  const skill = document.getElementById("skill").value;
  const city = document.getElementById("city").value;

  try {
    await addDoc(collection(db, "maids"), {
      name: name,
      skill: skill,
      city: city,
      createdAt: new Date()
    });
    alert("Saved to database!");
  } catch (e) {
    alert("Error saving data");
  }
});