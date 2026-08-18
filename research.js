import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    app
} from "./firebase-config.js";


const db =
    getFirestore(app);


const researchGrid =
    document.getElementById(
        "researchGrid"
    );


/* =====================================================
   LOAD RESEARCH
===================================================== */

async function loadResearch() {

    try {

        console.log(
            "Loading research from Firestore..."
        );


        const researchQuery =
            query(
                collection(
                    db,
                    "research"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                researchQuery
            );


        researchGrid.innerHTML =
            "";


        if (snapshot.empty) {

            researchGrid.innerHTML = `

                <div class="research-message">

                    No research has been added yet.

                </div>

            `;

            return;

        }


        snapshot.forEach(
            (documentSnapshot) => {


                const data =
                    documentSnapshot.data();


                const card =
                    createResearchCard(
                        data
                    );


                researchGrid.appendChild(
                    card
                );

            }
        );


        console.log(
            "Research loaded:",
            snapshot.size
        );


    } catch (error) {


        console.error(
            "Error loading research:",
            error
        );


        researchGrid.innerHTML = `

            <div class="research-message research-error">

                Unable to load research.

                <br><br>

                Please check the browser console.

            </div>

        `;

    }

}


/* =====================================================
   CREATE CARD
===================================================== */

function createResearchCard(data) {


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "research-card";


    /* =================================================
       FEATURED
    ================================================== */

    if (data.featured === true) {


        const featured =
            document.createElement(
                "span"
            );


        featured.className =
            "featured-research";


        featured.textContent =
            "★ Featured";


        card.appendChild(
            featured
        );

    }


    /* =================================================
       TOP
    ================================================== */

    const top =
        document.createElement(
            "div"
        );


    top.className =
        "research-card-top";


    const area =
        document.createElement(
            "span"
        );


    area.className =
        "research-area";


    area.textContent =
        data.area || "Research";


    const status =
        document.createElement(
            "span"
        );


    status.className =
        "research-status";


    status.textContent =
        data.status || "Ongoing";


    top.appendChild(area);

    top.appendChild(status);


    card.appendChild(top);


    /* =================================================
       TITLE
    ================================================== */

    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        data.title || "Untitled Research";


    card.appendChild(title);


    /* =================================================
       DESCRIPTION
    ================================================== */

    const description =
        document.createElement(
            "p"
        );


    description.className =
        "research-description";


    description.textContent =
        data.description || "";


    card.appendChild(
        description
    );


    /* =================================================
       DETAILS
    ================================================== */

    const details =
        document.createElement(
            "div"
        );


    details.className =
        "research-details";


    addDetail(
        details,
        "Focus",
        data.focus
    );


    addDetail(
        details,
        "Data Sources",
        formatArray(
            data.dataSources
        )
    );


    addDetail(
        details,
        "Models",
        formatArray(
            data.models
        )
    );


    addDetail(
        details,
        "Dataset",
        data.dataset
    );


    if (data.year) {

        addDetail(
            details,
            "Year",
            data.year
        );

    }


    card.appendChild(
        details
    );


    /* =================================================
       METHODS
    ================================================== */

    if (
        Array.isArray(
            data.methods
        ) &&
        data.methods.length > 0
    ) {


        const methods =
            document.createElement(
                "div"
            );


        methods.className =
            "research-methods";


        data.methods.forEach(
            (method) => {


                const element =
                    document.createElement(
                        "span"
                    );


                element.className =
                    "research-method";


                element.textContent =
                    method;


                methods.appendChild(
                    element
                );

            }
        );


        card.appendChild(
            methods
        );

    }


    /* =================================================
       LINKS
    ================================================== */

    const links =
        document.createElement(
            "div"
        );


    links.className =
        "research-links";


    if (data.researchUrl) {


        links.appendChild(
            createLink(
                data.researchUrl,
                "Research Details ↗",
                true
            )
        );

    }


    if (data.datasetUrl) {


        links.appendChild(
            createLink(
                data.datasetUrl,
                "Dataset ↗",
                false
            )
        );

    }


    if (data.projectUrl) {


        links.appendChild(
            createLink(
                data.projectUrl,
                "View Project ↗",
                false
            )
        );

    }


    if (
        links.children.length > 0
    ) {

        card.appendChild(
            links
        );

    }


    return card;

}


/* =====================================================
   ADD DETAIL
===================================================== */

function addDetail(
    container,
    label,
    value
) {


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return;

    }


    const detail =
        document.createElement(
            "div"
        );


    detail.className =
        "research-detail";


    const labelElement =
        document.createElement(
            "span"
        );


    labelElement.className =
        "detail-label";


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "span"
        );


    valueElement.className =
        "detail-value";


    valueElement.textContent =
        value;


    detail.appendChild(
        labelElement
    );


    detail.appendChild(
        valueElement
    );


    container.appendChild(
        detail
    );

}


/* =====================================================
   FORMAT ARRAY
===================================================== */

function formatArray(value) {


    if (
        !Array.isArray(value)
    ) {

        return value || "";

    }


    return value.join(", ");

}


/* =====================================================
   CREATE LINK
===================================================== */

function createLink(
    url,
    text,
    primary
) {


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.target =
        "_blank";


    link.rel =
        "noopener noreferrer";


    link.className =
        "research-link";


    if (primary) {

        link.classList.add(
            "primary"
        );

    }


    link.textContent =
        text;


    return link;

}


/* =====================================================
   START
===================================================== */

loadResearch();
