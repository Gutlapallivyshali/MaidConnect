import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  
  try {
    // 🔐 1. Authenticate user
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 🔍 2. Check if worker
    const workerSnap = await getDoc(doc(db, "workers", uid));
    if (workerSnap.exists()) {
      // 👷 Worker → maid page
      window.location.href = "maid.html";
      return;
    }

    // 🔍 3. Check if customer
    const customerSnap = await getDoc(doc(db, "customers", uid));
    if (customerSnap.exists()) {
      // 👤 User → user page
      window.location.href = "user.html";
      return;
    }

    // ❌ No role found
    alert("No role found for this account.");

  } catch (error) {
    alert(error.message);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const pwd = document.getElementById("loginPassword");
    const btn = document.getElementById("togglePasswordBtn");
    const eye = document.getElementById("eyeIcon");

    if (!pwd || !btn) return;

    btn.addEventListener("click", () => {
        if (pwd.type === "password") {
            pwd.type = "text";
            eye.style.stroke = "#1f3c88";
        } else {
            pwd.type = "password";
            eye.style.stroke = "#6b7280";
        }
    });
});
});