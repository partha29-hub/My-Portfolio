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
                "http://partha-portfolio-api.onrender.com/api/contact",
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

/* ==========================================
   MONGODB BACKEND API INTEGRATION
   Existing CSS and HTML layout remain unchanged
========================================== */

const API_BASE_URL = "http://partha-portfolio-api.onrender.com/api";

// Escape database text before inserting it into HTML
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Allow only normal web links
function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

// Fetch data without breaking the existing static content
async function fetchApi(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success !== true) {
      throw new Error(`Unable to load ${endpoint}`);
    }

    return data;
  } catch (error) {
    console.warn(`Could not load ${endpoint}:`, error.message);
    return null;
  }
}

/* EDUCATION */
async function loadEducationFromAPI() {
  const data = await fetchApi("education");
  const container = document.querySelector(".education-container");

  if (!container || !data?.education?.length) return;

  container.innerHTML = data.education.map((item) => `
    <div class="education-card">
      <div class="education-icon">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <div class="education-content">
        <div class="education-year">${safeText(item.duration)}</div>
        
<h3>${safeText(item.degree)}</h3>

${item.specialization
  ? `<h4>${safeText(item.specialization)}</h4>`
  : ""}

${item.grade
  ? `<p class="education-grade">(${safeText(item.grade)})</p>`
  : ""}

<p>${safeText(item.institution)}</p>

<p class="education-description">
  ${safeText(item.description)}
</p>

      </div>
    </div>
  `).join("");
}

/* EXPERIENCE */
async function loadExperienceFromAPI() {
  const data = await fetchApi("experience");
  const container = document.querySelector(".experience-container");

  if (!container || !data?.experiences?.length) return;

  container.innerHTML = data.experiences.map((item) => `
    <div class="experience-card">
      <div class="experience-icon">
        <i class="fa-solid fa-code"></i>
      </div>
      <div class="experience-date">${safeText(item.duration)}</div>
      <h3>${safeText(item.role)}</h3>
      <h4>${safeText(item.company)}</h4>
      <p>${safeText(item.description)}</p>
      <div class="experience-skills">
        ${(Array.isArray(item.technologies) ? item.technologies : [])
          .map((tech) => `<span>${safeText(tech)}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

/* PROJECTS */
async function loadProjectsFromAPI() {
  const data = await fetchApi("projects");
  const container = document.querySelector(".projects-container");

  if (!container || !data?.projects?.length) return;

  container.innerHTML = data.projects.map((item, index) => {
    const github = safeUrl(item.githubLink);
    const live = safeUrl(item.liveLink);

    return `
      <div class="project-card">
        <div class="project-icon">
          <i class="fa-solid fa-code"></i>
        </div>
        <div class="project-number">
          ${String(index + 1).padStart(2, "0")}
        </div>
        <h3>${safeText(item.title)}</h3>
        <p>${safeText(item.description)}</p>
        <div class="project-tech">
          ${(Array.isArray(item.technologies) ? item.technologies : [])
            .map((tech) => `<span>${safeText(tech)}</span>`).join("")}
        </div>
        
<div class="project-buttons">
  ${item.githubLink && item.githubLink.trim()
    ? `<a href="${safeUrl(item.githubLink)}"
         class="btn btn-outline"
         target="_blank" rel="noopener noreferrer">
         <i class="fa-brands fa-github"></i> GitHub
       </a>`
    : ""}

  ${item.liveLink && item.liveLink.trim()
    ? `<a href="${safeUrl(item.liveLink)}"
         class="btn btn-outline"
         target="_blank" rel="noopener noreferrer">
         <i class="fa-solid fa-arrow-up-right-from-square"></i>
         Live Demo
       </a>`
    : ""}
</div>

      </div>
    `;
  }).join("");
}

/* SKILLS
   Group individual skills into category cards.
   Original technical progress bars and tools remain untouched.
*/

async function loadSkillsFromAPI() {
  const data = await fetchApi("skills");

  if (!data?.skills || !Array.isArray(data.skills)) {
    console.error("Unable to load skills from API.");
    return;
  }

  const skills = data.skills;

  // 1. Category Skills
  const categoryContainer = document.querySelector(".skills-cards");

  if (categoryContainer) {
    const categorySkills = skills.filter(
      (skill) => !skill.type || skill.type === "category"
    );

    const groups = {};

    categorySkills.forEach((skill) => {
      const category = skill.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(skill);
    });

    const icons = {
      Frontend: "fa-solid fa-laptop-code",
      Backend: "fa-solid fa-server",
      "AI/ML": "fa-solid fa-brain",
      Database: "fa-solid fa-database",
      Other: "fa-solid fa-code"
    };

    categoryContainer.innerHTML = Object.entries(groups).map(
      ([category, items]) => `
        <div class="skill-card">
          <div class="skill-icon">
            <i class="${icons[category] || icons.Other}"></i>
          </div>
          <h3>${safeText(category)}</h3>
          <div class="skill-list">
            <p>${items.map(skill => safeText(skill.name)).join(", ")}</p>
          </div>
        </div>
      `
    ).join("");
  }

  // 2. Technical Skills: logo + percentage progress bars
  
  // 2. Technical Skills
  const technicalContainer = document.querySelector(".technical");

  if (technicalContainer) {
    const technicalSkills = skills.filter(
      skill => skill.type === "technical"
    );

    const heading = technicalContainer.querySelector("h3");

    technicalContainer.replaceChildren();
    if (heading) technicalContainer.appendChild(heading);

    technicalSkills.forEach(skill => {
      const percentage = Math.max(
        0,
        Math.min(100, Number(skill.percentage) || 0)
      );

      const row = document.createElement("div");
      row.className = "skill";

      const name = document.createElement("span");
      name.textContent = skill.name;
      
if (skill.icon) {
  const logo = document.createElement("img");
  logo.src = skill.icon;
  logo.alt = `${skill.name} logo`;
  logo.className = "technical-skill-logo";
  logo.onerror = () => logo.remove();

  name.prepend(logo);
}


      const progress = document.createElement("div");
      progress.className = "progress";

      const fill = document.createElement("div");
      fill.className = "progress-line";
      fill.style.width = `${percentage}%`;

      progress.appendChild(fill);

      const percent = document.createElement("span");
      percent.textContent = `${percentage}%`;

      row.append(name, progress, percent);
      technicalContainer.appendChild(row);
    });
  }

  // 3. Tools & Technologies
  const toolsContainer = document.querySelector(".tools-grid");

  if (toolsContainer) {
    const tools = skills.filter(skill => skill.type === "tool");

    toolsContainer.replaceChildren();

    tools.forEach(skill => {
      const item = document.createElement("div");
      item.className = "tool";

      if (skill.icon) {
        const logo = document.createElement("img");
        logo.src = skill.icon;
        logo.alt = `${skill.name} logo`;
        logo.className = "tool-logo";
        logo.onerror = () => logo.remove();
        item.appendChild(logo);
      }

      const name = document.createElement("span");
      name.textContent = skill.name;
      item.appendChild(name);

      toolsContainer.appendChild(item);
    });
  }
}

/* LOAD ALL DATABASE CONTENT */
document.addEventListener("DOMContentLoaded", () => {
  loadSkillsFromAPI();
  loadEducationFromAPI();
  loadExperienceFromAPI();
  loadProjectsFromAPI();
});

/* =====================================
   PROFILE SETTINGS - BACKEND CONNECTION
===================================== */

const PROFILE_API_URL = "http://partha-portfolio-api.onrender.com/api/profile/public";
const BACKEND_URL = "http://partha-portfolio-api.onrender.com";

async function loadProfileFromBackend() {
    try {
        const response = await fetch(PROFILE_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();

        // Supports either { profile: {...} } or { data: {...} }
        const profile = result.profile || result.data;

        if (result.success !== true || !profile) {
            console.error("Profile data not found:", result);
            return;
        }

        const name = document.getElementById("profileName");
        const title = document.getElementById("profileTitle");
        const about = document.getElementById("profileAbout");
        const image = document.getElementById("profileImage");

        if (name && profile.name) {
            name.textContent = profile.name;
        }

        
if (title && profile.title) {
    const titles = profile.title
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

    let titleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeTitle() {
        const currentTitle = titles[titleIndex];

        title.textContent = currentTitle.substring(0, charIndex);

        if (!deleting) {
            if (charIndex < currentTitle.length) {
                charIndex++;
                setTimeout(typeTitle, 100);
            } else {
                deleting = true;
                setTimeout(typeTitle, 1500);
            }
        } else {
            if (charIndex > 0) {
                charIndex--;
                setTimeout(typeTitle, 50);
            } else {
                deleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
                setTimeout(typeTitle, 400);
            }
        }
    }

    typeTitle();
}


        if (about && profile.about) {
            about.textContent = profile.about;
        }

        // Display the uploaded profile photo
        if (image && profile.profileImage) {
            const photo = profile.profileImage;

            image.src = /^https?:\/\//i.test(photo)
                ? photo
                : `${BACKEND_URL}/uploads/${photo.split("/").pop()}`;
        }

        // Update social links only when valid URLs are supplied
        const socialLinks = [
            ["linkedinLink", profile.linkedin],
            ["githubLink", profile.github],
            ["twitterLink", profile.twitter],
            ["instagramLink", profile.instagram]
        ];

        socialLinks.forEach(([id, url]) => {
            const element = document.getElementById(id);

            if (!element || !url) return;

            try {
                const parsedUrl = new URL(url);

                if (["https:", "http:"].includes(parsedUrl.protocol)) {
                    element.href = parsedUrl.href;
                }
            } catch {
                console.warn(`Invalid social link for ${id}`);
            }
        });

        // Update both resume buttons
        if (profile.resume) {
            const resumeUrl = /^https?:\/\//i.test(profile.resume)
                ? profile.resume
                : `${BACKEND_URL}/uploads/${profile.resume.split("/").pop()}`;

            const viewResume = document.getElementById("viewResumeBtn");
            const downloadResume =
                document.getElementById("downloadResumeBtn");

            if (viewResume) {
                viewResume.href = resumeUrl;
            }

            if (downloadResume) {
                downloadResume.href = resumeUrl;
                downloadResume.download = profile.resume.split("/").pop();
            }
        }

        console.log("Profile connected successfully:", profile);

    } catch (error) {
        console.error("Profile API connection failed:", error.message);
    }
}

document.addEventListener("DOMContentLoaded", loadProfileFromBackend);
