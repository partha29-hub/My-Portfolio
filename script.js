// ===============================
// Smooth Active Navbar
// ===============================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("header nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if(link.getAttribute("href") === "#" + current){
            link.classList.add("active");
        }

    });

});


// ===============================
// Progress Bar Animation
// ===============================

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            document.querySelector(".html").style.width="95%";
            document.querySelector(".css").style.width="90%";
            document.querySelector(".js").style.width="85%";
            document.querySelector(".react").style.width="85%";
            document.querySelector(".python").style.width="80%";
            document.querySelector(".node").style.width="75%";

        }

    });

},{
    threshold:.5
});

observer.observe(document.querySelector(".technical"));


// ===============================
// Scroll Reveal Animation
// ===============================

const cards=document.querySelectorAll(".skill-card,.tool,.skill");

const reveal=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";
entry.target.style.transform="translateY(0)";

}

});

},{
threshold:.2
});

cards.forEach(card=>{

card.style.opacity="0";
card.style.transform="translateY(50px)";
card.style.transition=".7s ease";

reveal.observe(card);

});


// ===============================
// Mouse Glow Effect
// ===============================

document.addEventListener("mousemove",(e)=>{

document.documentElement.style.setProperty("--x",e.clientX+"px");
document.documentElement.style.setProperty("--y",e.clientY+"px");

});

// ===============================
// Mobile Menu
// ===============================

const menuIcon = document.getElementById("menu-icon");
const navbar = document.getElementById("navbar");

menuIcon.addEventListener("click", () => {

    navbar.classList.toggle("active");

    menuIcon.innerHTML = navbar.classList.contains("active")
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';

});


// Close menu after clicking a link

const mobileLinks = document.querySelectorAll("#navbar a");

mobileLinks.forEach(link => {

    link.addEventListener("click", () => {

        navbar.classList.remove("active");

        menuIcon.innerHTML =
            '<i class="fa-solid fa-bars"></i>';

    });

});
// ======================================
// CONTACT FORM - MONGODB CONNECTION
// ======================================

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        const submitButton = contactForm.querySelector("button");

        submitButton.disabled = true;

        submitButton.innerHTML = `
            Sending...
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;

        try {

            const response = await fetch(
                "http://localhost:5000/api/contact",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        subject,
                        message
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                formMessage.textContent =
                    "Message sent successfully! ✅";

                contactForm.reset();

            } else {

                formMessage.textContent =
                    data.message || "Something went wrong.";

            }

        } catch (error) {

            console.error("Error:", error);

            formMessage.textContent =
                "Unable to connect to server ❌";

        }

        submitButton.disabled = false;

        submitButton.innerHTML = `
            Send Message
            <i class="fa-solid fa-paper-plane"></i>
        `;

    });

}