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