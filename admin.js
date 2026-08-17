import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth } from "./firebase-config.js";


const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const userEmail =
    document.getElementById("userEmail");



onAuthStateChanged(auth, (user) => {

    if (user) {

        loginSection.style.display = "none";

        dashboardSection.style.display = "block";

        userEmail.textContent = user.email;

    } else {

        loginSection.style.display = "flex";

        dashboardSection.style.display = "none";

    }

});



loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginError.textContent = "";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Invalid email or password.";

    }

});



logoutButton.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(error);

    }

});
