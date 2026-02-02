import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 🔹 Get form values
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value; // used ONLY for auth
  const location = document.getElementById("location").value;
  const availability = document.getElementById("availability").value;
  const experience = document.getElementById("experience").value;
  const workDetails = document.getElementById("workDetails").value;

  // 🔹 Get selected skills (checkboxes)
  const skills = [];
  document.querySelectorAll(".skill-options input:checked").forEach((cb) => {
    skills.push(cb.value);
  });

  try {
    // 🔐 Create user in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 🔥 Store ALL worker details in Firestore
    await setDoc(doc(db, "workers", uid), {
      name: name,
      phone: phone,
      email: email,
      location: location,
      availability: availability,
      experience: Number(experience),
      skills: skills,
      workDetails: workDetails,
      role: "worker",
      createdAt: new Date()
    });

    alert("Worker registered successfully!");
    form.reset();
    window.location.href = "login.html";

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});