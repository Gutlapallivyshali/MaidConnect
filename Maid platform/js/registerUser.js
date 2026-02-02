import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("userRegisterForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 🔹 Get form values
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value; // ONLY for auth
  const location = document.getElementById("location").value;
  const requirements = document.getElementById("requirements").value;

  try {
    // 🔐 Create user in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 🔥 Store customer profile in Firestore
    await setDoc(doc(db, "customers", uid), {
      name: name,
      phone: phone,
      email: email,
      location: location,
      requirements: requirements,
      role: "customer",
      createdAt: new Date()
    });

    alert("Customer registered successfully!");
    form.reset();
    window.location.href = "login.html";

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});
