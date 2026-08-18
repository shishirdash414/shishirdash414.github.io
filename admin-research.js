import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth
} from "./firebase-config.js";


const db = getFirestore();


const researchForm =
    document.getElementById("researchForm");

const formMessage =
    document.getElementById("formMessage");

const saveButton =
    document.querySelector(".save-research-button");


let currentUser = null;


/* =====================================================
   INITIAL STATE
===================================================== */

saveButton.disabled = true;

saveButton.textContent =
    "Checking login...";


formMessage.textContent =
    "Checking authentication...";

formMessage.style.color =
    "#a5a8b3";


/* =====================================================
   AUTHENTICATION
===================================================== */

onAuthStateChanged(auth, (user) => {

    console.log(
        "Firebase authentication state:",
        user
    );


    if (!user) {

        currentUser = null;

        saveButton.disabled = true;

        saveButton.textContent =
            "Login required";


        formMessage.textContent =
            "You are not logged in. Redirecting...";

        formMessage.style.color =
            "#ff7070";


        setTimeout(() => {

            window.location.href =
                "admin.html";

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
        "Save Research";


    formMessage.textContent =
        "Ready to add research.";

    formMessage.style.color =
        "#8b7cff";

});


/* =====================================================
   SAVE RESEARCH
===================================================== */

researchForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        console.log(
            "================================="
        );

        console.log(
            "SAVE RESEARCH BUTTON CLICKED"
        );

        console.log(
            "================================="
        );


        /* ---------------------------------------------
           CHECK AUTHENTICATION
        --------------------------------------------- */

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


        /* ---------------------------------------------
           GET FORM VALUES
        --------------------------------------------- */

        const title =
            document.getElementById(
                "researchTitle"
            ).value.trim();


        const area =
            document.getElementById(
                "researchArea"
            ).value;


        const status =
            document.getElementById(
                "researchStatus"
            ).value;


        const description =
            document.getElementById(
                "researchDescription"
            ).value.trim();


        const focus =
            document.getElementById(
                "researchFocus"
            ).value.trim();


        const dataSourcesInput =
            document.getElementById(
                "researchDataSources"
            ).value.trim();


        const modelsInput =
            document.getElementById(
                "researchModels"
            ).value.trim();


        const dataset =
            document.getElementById(
                "researchDataset"
            ).value.trim();


        const methodsInput =
            document.getElementById(
                "researchMethods"
            ).value.trim();


        const researchUrl =
            document.getElementById(
                "researchUrl"
            ).value.trim();


        const datasetUrl =
            document.getElementById(
                "datasetUrl"
            ).value.trim();


        const projectUrl =
            document.getElementById(
                "projectUrl"
            ).value.trim();


        const publication =
            document.getElementById(
                "publication"
            ).value.trim();


        const year =
            document.getElementById(
                "researchYear"
            ).value;


        const featured =
            document.getElementById(
                "researchFeatured"
            ).checked;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!title) {

            formMessage.textContent =
                "Please enter a research title.";

            formMessage.style.color =
                "#ff7070";

            return;
        }


        if (!area) {

            formMessage.textContent =
                "Please select a research area.";

            formMessage.style.color =
                "#ff7070";

            return;
        }


        if (!status) {

            formMessage.textContent =
                "Please select a research status.";

            formMessage.style.color =
                "#ff7070";

            return;
        }


        if (!description) {

            formMessage.textContent =
                "Please enter a research description.";

            formMessage.style.color =
                "#ff7070";

            return;
        }


        /* ---------------------------------------------
           CONVERT COMMA-SEPARATED VALUES TO ARRAYS
        --------------------------------------------- */

        const dataSources =
            dataSourcesInput
                ? dataSourcesInput
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item.length > 0)
                : [];


        const models =
            modelsInput
                ? modelsInput
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item.length > 0)
                : [];


        const methods =
            methodsInput
                ? methodsInput
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item.length > 0)
                : [];


        /* ---------------------------------------------
           PREPARE RESEARCH DATA
        --------------------------------------------- */

        const researchData = {

            title: title,

            area: area,

            status: status,

            description: description,

            focus: focus,

            dataSources: dataSources,

            models: models,

            dataset: dataset,

            methods: methods,

            researchUrl: researchUrl,

            datasetUrl: datasetUrl,

            projectUrl: projectUrl,

            publication: publication,

            year: year
                ? Number(year)
                : null,

            featured: featured,

            createdBy:
                currentUser.uid,

            createdAt:
                serverTimestamp()

        };


        console.log(
            "Research data:",
            researchData
        );


        /* ---------------------------------------------
           UI: SAVING
        --------------------------------------------- */

        formMessage.textContent =
            "Saving research...";

        formMessage.style.color =
            "#a5a8b3";


        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";


        /* ---------------------------------------------
           FIRESTORE
        --------------------------------------------- */

        try {

            console.log(
                "Attempting Firestore write..."
            );


            const documentReference =
                await addDoc(
                    collection(
                        db,
                        "research"
                    ),
                    researchData
                );


            console.log(
                "RESEARCH SAVED SUCCESSFULLY!",
                documentReference.id
            );


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            formMessage.textContent =
                "✓ Research saved successfully.";

            formMessage.style.color =
                "#8b7cff";


            researchForm.reset();


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
                "Save Research";

        }

    }
);
