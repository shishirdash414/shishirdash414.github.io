import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth } from "./firebase-config.js";


const db = getFirestore();


const projectForm =
    document.getElementById("projectForm");

const formMessage =
    document.getElementById("formMessage");

const saveButton =
    document.querySelector(".save-project-button");


let currentUser = null;


saveButton.disabled = true;

saveButton.textContent = "Checking login...";


formMessage.textContent =
    "Checking authentication...";

formMessage.style.color =
    "#a5a8b3";


onAuthStateChanged(auth, (user) => {

    console.log("Firebase authentication state:", user);


    if (!user) {

        currentUser = null;

        saveButton.disabled = true;

        saveButton.textContent = "Login required";

        formMessage.textContent =
            "You are not logged in. Redirecting...";

        formMessage.style.color =
            "#ff7070";


        setTimeout(() => {

            window.location.href = "admin.html";

        }, 1500);


        return;
    }

    currentUser = user;


    console.log(
        "Authenticated user:",
        currentUser.email
    );


    saveButton.disabled = false;

    saveButton.textContent =
        "Save Project";


    formMessage.textContent =
        "Ready to add a project.";

    formMessage.style.color =
        "#8b7cff";

});


projectForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    console.log(
        "================================="
    );

    console.log(
        "SAVE PROJECT BUTTON CLICKED"
    );

    console.log(
        "================================="
    );


  

    if (!currentUser) {

        formMessage.textContent =
            "Authentication is not ready. Please wait a moment.";

        formMessage.style.color =
            "#ff7070";

        console.error(
            "No authenticated Firebase user."
        );

        return;
    }


    /* -------------------------------------------------
       GET FORM VALUES
    ------------------------------------------------- */

    const title =
        document.getElementById("projectTitle")
            .value
            .trim();


    const category =
        document.getElementById("projectCategory")
            .value;


    const description =
        document.getElementById("projectDescription")
            .value
            .trim();


    const technologiesInput =
        document.getElementById("projectTechnologies")
            .value
            .trim();


    const github =
        document.getElementById("projectGithub")
            .value
            .trim();


    const demo =
        document.getElementById("projectDemo")
            .value
            .trim();


    const image =
        document.getElementById("projectImage")
            .value
            .trim();


    const featured =
        document.getElementById("projectFeatured")
            .checked;



    if (!title) {

        formMessage.textContent =
            "Please enter a project title.";

        formMessage.style.color =
            "#ff7070";

        return;
    }


    if (!category) {

        formMessage.textContent =
            "Please select a category.";

        formMessage.style.color =
            "#ff7070";

        return;
    }


    if (!description) {

        formMessage.textContent =
            "Please enter a project description.";

        formMessage.style.color =
            "#ff7070";

        return;
    }


    const technologies =
        technologiesInput
            ? technologiesInput
                .split(",")
                .map(item => item.trim())
                .filter(item => item.length > 0)
            : [];


    formMessage.textContent =
        "Saving project...";

    formMessage.style.color =
        "#a5a8b3";

    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";




    const projectData = {

        title: title,

        category: category,

        description: description,

        technologies: technologies,

        github: github,

        demo: demo,

        image: image,

        featured: featured,

        createdBy: currentUser.uid,

        createdAt: serverTimestamp()

    };


    console.log(
        "Project data:",
        projectData
    );


    try {

        console.log(
            "Attempting Firestore write..."
        );


        const documentReference = await addDoc(
            collection(db, "projects"),
            projectData
        );


        console.log(
            "SUCCESS!",
            documentReference.id
        );


        formMessage.textContent =
            "✓ Project saved successfully.";

        formMessage.style.color =
            "#8b7cff";


        projectForm.reset();


    } catch (error) {

        console.error(
            "FIRESTORE ERROR:",
            error
        );


        console.error(
            "Error code:",
            error.code
        );


        console.error(
            "Error message:",
            error.message
        );


        formMessage.textContent =
            "Error: " + error.message;

        formMessage.style.color =
            "#ff7070";


    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            "Save Project";

    }

});
