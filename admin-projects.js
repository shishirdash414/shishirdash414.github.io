import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import { auth } from "./firebase-config.js";



/* =========================================================
   FIRESTORE
========================================================= */

const db = getFirestore();



/* =========================================================
   FORM ELEMENTS
========================================================= */

const projectForm =
    document.getElementById("projectForm");


const formMessage =
    document.getElementById("formMessage");


const saveButton =
    document.querySelector(".save-project-button");


const clearButton =
    document.querySelector(".clear-button");


const cancelEditButton =
    document.getElementById("cancelEditButton");


const formHeading =
    document.getElementById("formHeading");


const formSubheading =
    document.getElementById("formSubheading");


/* =========================================================
   PROJECT LIST ELEMENTS
========================================================= */

const projectsList =
    document.getElementById("projectsList");


const projectsStatus =
    document.getElementById("projectsStatus");



/* =========================================================
   STATE
========================================================= */

let currentUser = null;

let editingProjectId = null;



/* =========================================================
   INITIAL AUTH UI
========================================================= */

saveButton.disabled = true;

saveButton.textContent =
    "Checking login...";


formMessage.textContent =
    "Checking authentication...";


formMessage.style.color =
    "#a5a8b3";



/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, async (user) => {

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
        "Save Project";


    formMessage.textContent =
        "Ready to add a project.";


    formMessage.style.color =
        "#8b7cff";


    /* Load existing projects */

    await loadProjects();

});



/* =========================================================
   LOAD PROJECTS
========================================================= */

async function loadProjects() {

    projectsStatus.textContent =
        "Loading projects...";


    projectsList.innerHTML = "";


    try {

        const projectsSnapshot =
            await getDocs(
                collection(db, "projects")
            );


        console.log(
            "Projects found:",
            projectsSnapshot.size
        );


        if (projectsSnapshot.empty) {

            projectsStatus.textContent =
                "No projects have been added yet.";


            projectsList.innerHTML = `
                <div class="empty-projects">
                    No projects found in Firestore.
                </div>
            `;

            return;
        }


        const projects = [];


        projectsSnapshot.forEach((documentSnapshot) => {

            projects.push({

                id: documentSnapshot.id,

                ...documentSnapshot.data()

            });

        });


        /*
         * Sort newest projects first.
         *
         * We do this in JavaScript rather than using
         * Firestore orderBy(), so existing documents
         * without timestamps will still work.
         */

        projects.sort((a, b) => {

            const dateA =
                a.createdAt?.toMillis
                    ? a.createdAt.toMillis()
                    : 0;


            const dateB =
                b.createdAt?.toMillis
                    ? b.createdAt.toMillis()
                    : 0;


            return dateB - dateA;

        });


        projectsStatus.textContent =
            `${projects.length} project${projects.length === 1 ? "" : "s"} found.`;


        projects.forEach((project) => {

            renderProject(project);

        });


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );


        projectsStatus.textContent =
            "Could not load projects.";


        projectsList.innerHTML = `
            <div class="empty-projects">
                Error loading projects:
                ${escapeHTML(error.message)}
            </div>
        `;

    }

}



/* =========================================================
   RENDER PROJECT
========================================================= */

function renderProject(project) {

    const card =
        document.createElement("article");


    card.className =
        "project-admin-card";


    const technologies =
        Array.isArray(project.technologies)
            ? project.technologies
            : [];


    const technologyHTML =
        technologies.length > 0

            ? technologies
                .map(
                    technology => `
                        <span class="technology-tag">
                            ${escapeHTML(technology)}
                        </span>
                    `
                )
                .join("")

            : `
                <span class="technology-tag">
                    No technologies added
                </span>
            `;


    const githubHTML =
        project.github

            ? `
                <a
                    href="${escapeAttribute(project.github)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-card-link">

                    GitHub ↗

                </a>
            `

            : "";


    const demoHTML =
        project.demo

            ? `
                <a
                    href="${escapeAttribute(project.demo)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-card-link">

                    Live Demo ↗

                </a>
            `

            : "";


    const featuredHTML =
        project.featured

            ? `
                <span class="featured-badge">
                    ★ Featured
                </span>
            `

            : "";


    card.innerHTML = `

        <div class="project-card-top">

            <div>

                <h3 class="project-card-title">
                    ${escapeHTML(project.title || "Untitled Project")}
                </h3>

                <span class="project-card-category">
                    ${escapeHTML(project.category || "Other")}
                </span>

            </div>


            ${featuredHTML}

        </div>


        <p class="project-card-description">

            ${escapeHTML(
                project.description ||
                "No description provided."
            )}

        </p>


        <div class="project-card-technologies">

            ${technologyHTML}

        </div>


        ${
            githubHTML || demoHTML

                ? `
                    <div class="project-card-links">

                        ${githubHTML}

                        ${demoHTML}

                    </div>
                `

                : ""
        }


        <div class="project-card-actions">

            <button
                type="button"
                class="edit-project-button"
                data-id="${escapeAttribute(project.id)}">

                Edit

            </button>


            <button
                type="button"
                class="delete-project-button"
                data-id="${escapeAttribute(project.id)}">

                Delete

            </button>

        </div>

    `;


    projectsList.appendChild(card);


    /* Edit */

    card
        .querySelector(".edit-project-button")
        .addEventListener("click", () => {

            startEditing(project);

        });


    /* Delete */

    card
        .querySelector(".delete-project-button")
        .addEventListener("click", () => {

            deleteProject(project);

        });

}



/* =========================================================
   ADD / UPDATE PROJECT
========================================================= */

projectForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        console.log(
            "================================="
        );


        console.log(
            editingProjectId
                ? "UPDATE PROJECT"
                : "SAVE PROJECT"
        );


        console.log(
            "================================="
        );



        if (!currentUser) {

            formMessage.textContent =
                "Authentication is not ready. Please wait a moment.";


            formMessage.style.color =
                "#ff7070";


            return;

        }



        /* -------------------------------------------------
           GET FORM VALUES
        ------------------------------------------------- */

        const title =
            document
                .getElementById("projectTitle")
                .value
                .trim();


        const category =
            document
                .getElementById("projectCategory")
                .value;


        const description =
            document
                .getElementById("projectDescription")
                .value
                .trim();


        const technologiesInput =
            document
                .getElementById("projectTechnologies")
                .value
                .trim();


        const github =
            document
                .getElementById("projectGithub")
                .value
                .trim();


        const demo =
            document
                .getElementById("projectDemo")
                .value
                .trim();


        const image =
            document
                .getElementById("projectImage")
                .value
                .trim();


        const featured =
            document
                .getElementById("projectFeatured")
                .checked;



        /* -------------------------------------------------
           VALIDATION
        ------------------------------------------------- */

        if (!title) {

            showError(
                "Please enter a project title."
            );

            return;

        }


        if (!category) {

            showError(
                "Please select a category."
            );

            return;

        }


        if (!description) {

            showError(
                "Please enter a project description."
            );

            return;

        }



        /* -------------------------------------------------
           TECHNOLOGIES
        ------------------------------------------------- */

        const technologies =
            technologiesInput

                ? technologiesInput
                    .split(",")
                    .map(
                        item => item.trim()
                    )
                    .filter(
                        item => item.length > 0
                    )

                : [];



        /* -------------------------------------------------
           UI
        ------------------------------------------------- */

        formMessage.textContent =
            editingProjectId
                ? "Updating project..."
                : "Saving project...";


        formMessage.style.color =
            "#a5a8b3";


        saveButton.disabled = true;


        saveButton.textContent =
            editingProjectId
                ? "Updating..."
                : "Saving...";



        /* -------------------------------------------------
           PROJECT DATA
        ------------------------------------------------- */

        const projectData = {

            title: title,

            category: category,

            description: description,

            technologies: technologies,

            github: github,

            demo: demo,

            image: image,

            featured: featured

        };



        console.log(
            "Project data:",
            projectData
        );



        try {


            /* =================================================
               EDIT EXISTING PROJECT
            ================================================= */

            if (editingProjectId) {

                const projectReference =
                    doc(
                        db,
                        "projects",
                        editingProjectId
                    );


                await updateDoc(
                    projectReference,
                    projectData
                );


                console.log(
                    "Project updated:",
                    editingProjectId
                );


                formMessage.textContent =
                    "✓ Project updated successfully.";


                formMessage.style.color =
                    "#8b7cff";


                exitEditMode();


            }


            /* =================================================
               ADD NEW PROJECT
            ================================================= */

            else {

                projectData.createdBy =
                    currentUser.uid;


                projectData.createdAt =
                    serverTimestamp();


                const documentReference =
                    await addDoc(
                        collection(
                            db,
                            "projects"
                        ),
                        projectData
                    );


                console.log(
                    "Project created:",
                    documentReference.id
                );


                formMessage.textContent =
                    "✓ Project saved successfully.";


                formMessage.style.color =
                    "#8b7cff";


                projectForm.reset();

            }



            /* Refresh project list */

            await loadProjects();


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
                editingProjectId
                    ? "Update Project"
                    : "Save Project";

        }

    }
);



/* =========================================================
   START EDITING
========================================================= */

function startEditing(project) {

    editingProjectId =
        project.id;


    /* Fill form */

    document
        .getElementById("projectTitle")
        .value =
        project.title || "";


    document
        .getElementById("projectCategory")
        .value =
        project.category || "";


    document
        .getElementById("projectDescription")
        .value =
        project.description || "";


    document
        .getElementById("projectTechnologies")
        .value =
        Array.isArray(project.technologies)
            ? project.technologies.join(", ")
            : "";


    document
        .getElementById("projectGithub")
        .value =
        project.github || "";


    document
        .getElementById("projectDemo")
        .value =
        project.demo || "";


    document
        .getElementById("projectImage")
        .value =
        project.image || "";


    document
        .getElementById("projectFeatured")
        .checked =
        project.featured === true;



    /* Change form UI */

    formHeading.textContent =
        "Edit Project";


    formSubheading.textContent =
        "Update the details of this project.";


    saveButton.textContent =
        "Update Project";


    cancelEditButton.style.display =
        "inline-block";


    clearButton.style.display =
        "none";


    formMessage.textContent =
        `Editing "${project.title}".`;


    formMessage.style.color =
        "#8b7cff";



    /* Scroll to form */

    document
        .querySelector(".project-form-container")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}



/* =========================================================
   DELETE PROJECT
========================================================= */

async function deleteProject(project) {

    if (!currentUser) {

        showError(
            "You must be logged in to delete a project."
        );

        return;

    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {

        return;

    }


    try {

        projectsStatus.textContent =
            "Deleting project...";


        const projectReference =
            doc(
                db,
                "projects",
                project.id
            );


        await deleteDoc(
            projectReference
        );


        console.log(
            "Project deleted:",
            project.id
        );


        formMessage.textContent =
            "✓ Project deleted successfully.";


        formMessage.style.color =
            "#8b7cff";


        await loadProjects();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        formMessage.textContent =
            "Error deleting project: " +
            error.message;


        formMessage.style.color =
            "#ff7070";


        projectsStatus.textContent =
            "Could not delete project.";

    }

}



/* =========================================================
   CANCEL EDIT
========================================================= */

cancelEditButton.addEventListener(
    "click",
    () => {

        exitEditMode();

    }
);



/* =========================================================
   CLEAR BUTTON
========================================================= */

clearButton.addEventListener(
    "click",
    () => {

        if (editingProjectId) {

            exitEditMode();

        }

    }
);



/* =========================================================
   EXIT EDIT MODE
========================================================= */

function exitEditMode() {

    editingProjectId =
        null;


    projectForm.reset();


    formHeading.textContent =
        "Add New Project";


    formSubheading.textContent =
        "Enter the details of your project below.";


    saveButton.textContent =
        "Save Project";


    cancelEditButton.style.display =
        "none";


    clearButton.style.display =
        "inline-block";


    formMessage.textContent =
        "Ready to add a project.";


    formMessage.style.color =
        "#8b7cff";

}



/* =========================================================
   ERROR MESSAGE
========================================================= */

function showError(message) {

    formMessage.textContent =
        message;


    formMessage.style.color =
        "#ff7070";

}



/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



/* =========================================================
   ATTRIBUTE ESCAPING
========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);

}
