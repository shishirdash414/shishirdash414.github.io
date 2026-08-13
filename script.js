/* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");


/* Open / Close mobile menu */

menuToggle.addEventListener("click", function () {

    navMenu.classList.toggle("open");

});


/* =====================================================
   CLOSE MENU AFTER CLICKING A LINK
===================================================== */

const navLinks = document.querySelectorAll(".nav-link");


navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navMenu.classList.remove("open");

    });

});
