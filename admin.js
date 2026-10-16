const API_BASE = "https://partha-portfolio-api.onrender.com/api/admin";
const PROJECTS_API = "https://partha-portfolio-api.onrender.com/api/projects";
const loginForm = document.getElementById("loginForm");
const isDashboard = window.location.pathname.endsWith("dashboard.html");
// ==============================
// LOGIN
// ==============================
if (loginForm) {
  if (sessionStorage.getItem("adminToken")) {
    window.location.replace("dashboard.html");
  }
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");
    const button = document.getElementById("loginButton");
    message.textContent = "";
    button.disabled = true;
    button.textContent = "Signing in...";
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }
      sessionStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("adminUsername", data.admin.username);
      window.location.replace("dashboard.html");
    } catch (error) {
      message.textContent =
        error.message === "Failed to fetch"
          ? "Cannot connect. Check that the backend is running."
          : error.message;
      message.style.color = "#ff7777";
    } finally {
      button.disabled = false;
      button.innerHTML = 'Sign In <span>→</span>';
    }
  });
}
// ==============================
// DASHBOARD AUTHENTICATION
// ==============================
if (isDashboard) {
  const token = sessionStorage.getItem("adminToken");
  if (!token) {
    window.location.replace("login.html");
  } else {
    verifyDashboardSession();
  }
}
async function verifyDashboardSession() {
  try {
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error("Your session has expired. Please log in again.");
    }
    const name = document.getElementById("adminName");
    if (name) name.textContent = data.admin.username || "Admin";
    initialiseDashboard();
  } catch (error) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUsername");
    alert(error.message || "Unable to verify your session.");
    window.location.replace("login.html");
  }
}
function initialiseDashboard() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUsername");
      window.location.replace("login.html");
    });
  }
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });
      link.classList.add("active");
    });
  });
  initialiseProjects();
  initialiseSkills();
  initialiseExperience();
  initialiseEducation();
  initialiseMessages();
  initialiseProfile();
}
// ==============================
// PROJECT MANAGEMENT
// ==============================
function initialiseProjects() {
  const projectForm = document.getElementById("projectForm");
  const showFormButton = document.getElementById("showProjectForm");
  const cancelFormButton = document.getElementById("cancelProjectForm");
  const cancelBottomButton = document.getElementById("cancelProjectFormBottom");
  const projectsList = document.getElementById("projectsList");
  const projectStatus = document.getElementById("projectStatus");
  const saveButton = document.getElementById("saveProjectBtn");
  // Allow the script to run on pages without the projects editor.
  if (!projectForm || !projectsList) return;
  let projects = [];
  function getToken() {
    return sessionStorage.getItem("adminToken");
  }
  function showStatus(message, isError = false) {
    projectStatus.textContent = message;
    projectStatus.classList.toggle("is-error", isError);
  }
  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${getToken()}`,
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUsername");
      window.location.replace("login.html");
      throw new Error("Your session expired. Please log in again.");
    }
    if (!response.ok || !data.success) {
      throw new Error(data.message || "The request could not be completed.");
    }
    return data;
  }
  function setFormOpen(open) {
    projectForm.hidden = !open;
    if (open) {
      projectForm.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("projectTitle").focus();
    }
  }
  function resetProjectForm() {
    projectForm.reset();
    document.getElementById("projectId").value = "";
    document.getElementById("projectFormTitle").textContent = "Add a new project";
    saveButton.textContent = "Save Project";
    showStatus("");
  }
  function safeExternalUrl(value) {
    if (!value) return "";
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
    } catch (_) {
      // Invalid URL: omit this link.
    }
    return "";
  }
  function addExternalLink(container, label, url) {
    const safeUrl = safeExternalUrl(url);
    if (!safeUrl) return;
    const link = document.createElement("a");
    link.href = safeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "project-external-link";
    link.textContent = label + " ↗";
    container.appendChild(link);
  }
  function renderProjects() {
    projectsList.replaceChildren();
    document.getElementById("projectCount").textContent =
      `${projects.length} ${projects.length === 1 ? "project" : "projects"}`;
    // Update the overview statistic.
    const projectCounter = document.querySelector(
      '.creative-stat .counter[data-count]'
    );
    if (projectCounter) {
      projectCounter.textContent = String(projects.length);
      projectCounter.dataset.count = String(projects.length);
    }
    if (projects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "project-empty";
      empty.textContent = "No projects yet. Select “Add Project” to create your first one.";
      projectsList.appendChild(empty);
      return;
    }
    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-item";
      const details = document.createElement("div");
      details.className = "project-item-details";
      const headingRow = document.createElement("div");
      headingRow.className = "project-item-heading";
      const title = document.createElement("h4");
      title.textContent = project.title;
      headingRow.appendChild(title);
      if (project.featured) {
        const featured = document.createElement("span");
        featured.className = "project-featured-badge";
        featured.textContent = "FEATURED";
        headingRow.appendChild(featured);
      }
      const description = document.createElement("p");
      description.className = "project-item-description";
      description.textContent = project.description;
      const technologies = document.createElement("p");
      technologies.className = "project-technologies";
      technologies.textContent =
        Array.isArray(project.technologies) && project.technologies.length
          ? project.technologies.join(" · ")
          : "No technologies listed";
      const links = document.createElement("div");
      links.className = "project-links";
      addExternalLink(links, "Live demo", project.liveLink);
      addExternalLink(links, "GitHub", project.githubLink);
      details.append(headingRow, description, technologies, links);
      if (project.image && safeExternalUrl(project.image)) {
        const image = document.createElement("img");
        image.className = "project-item-image";
        image.src = safeExternalUrl(project.image);
        image.alt = project.title;
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.addEventListener("error", () => image.remove());
        card.appendChild(image);
      }
      card.appendChild(details);
      const actions = document.createElement("div");
      actions.className = "project-item-actions";
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "project-edit-btn";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => editProject(project));
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "project-delete-btn";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteProject(project));
      actions.append(editButton, deleteButton);
      card.appendChild(actions);
      projectsList.appendChild(card);
    });
  }
  async function loadProjects() {
    projectsList.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "project-empty";
    loading.textContent = "Loading projects...";
    projectsList.appendChild(loading);
    try {
      const response = await fetch(PROJECTS_API);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load projects.");
      }
      projects = Array.isArray(data.projects) ? data.projects : [];
      renderProjects();
      showStatus("");
    } catch (error) {
      projectsList.replaceChildren();
      const message = document.createElement("p");
      message.className = "project-empty";
      message.textContent = error.message === "Failed to fetch"
        ? "Could not connect to the backend. Check that server.js is running."
        : error.message;
      projectsList.appendChild(message);
    }
  }
  function editProject(project) {
    document.getElementById("projectId").value = project._id;
    document.getElementById("projectTitle").value = project.title || "";
    document.getElementById("projectDescription").value = project.description || "";
    document.getElementById("projectTechnologies").value =
      Array.isArray(project.technologies) ? project.technologies.join(", ") : "";
    document.getElementById("projectImage").value = project.image || "";
    document.getElementById("projectLiveLink").value = project.liveLink || "";
    document.getElementById("projectGithubLink").value = project.githubLink || "";
    document.getElementById("projectFeatured").checked = Boolean(project.featured);
    document.getElementById("projectFormTitle").textContent = "Edit project";
    saveButton.textContent = "Update Project";
    showStatus("");
    setFormOpen(true);
  }
  async function deleteProject(project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await apiRequest(`${PROJECTS_API}/${encodeURIComponent(project._id)}`, {
        method: "DELETE"
      });
      showStatus("Project deleted successfully.");
      await loadProjects();
    } catch (error) {
      showStatus(error.message, true);
    }
  }
  showFormButton.addEventListener("click", () => {
    resetProjectForm();
    setFormOpen(true);
  });
  function cancelEditing() {
    resetProjectForm();
    setFormOpen(false);
  }
  cancelFormButton.addEventListener("click", cancelEditing);
  cancelBottomButton.addEventListener("click", cancelEditing);
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const projectId = document.getElementById("projectId").value;
    const projectData = {
      title: document.getElementById("projectTitle").value.trim(),
      description: document.getElementById("projectDescription").value.trim(),
      technologies: document.getElementById("projectTechnologies").value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      image: document.getElementById("projectImage").value.trim(),
      liveLink: document.getElementById("projectLiveLink").value.trim(),
      githubLink: document.getElementById("projectGithubLink").value.trim(),
      featured: document.getElementById("projectFeatured").checked
    };
    if (!projectData.title || !projectData.description) {
      showStatus("Project title and description are required.", true);
      return;
    }
    saveButton.disabled = true;
    saveButton.textContent = projectId ? "Updating..." : "Saving...";
    showStatus("");
    try {
      const url = projectId
        ? `${PROJECTS_API}/${encodeURIComponent(projectId)}`
        : PROJECTS_API;
      const data = await apiRequest(url, {
        method: projectId ? "PUT" : "POST",
        body: JSON.stringify(projectData)
      });
      resetProjectForm();
      setFormOpen(false);
      showStatus(data.message || "Project saved successfully.");
      await loadProjects();
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = document.getElementById("projectId").value
        ? "Update Project"
        : "Save Project";
    }
  });
  loadProjects();
}
// ==============================
// SKILLS MANAGEMENT
// ==============================

function initialiseSkills() {
  const form = document.getElementById("skillForm");
  const list = document.getElementById("skillsList");

  if (!form || !list) return;

  const API = "https://partha-portfolio-api.onrender.com/api/skills";
  const status = document.getElementById("skillStatus");
  const saveButton = document.getElementById("saveSkillBtn");

  const typeInput = document.getElementById("skillType");
  const percentageField = document.getElementById("skillPercentageField");
  const percentageInput = document.getElementById("skillPercentage");

  let skills = [];

  function showSkillStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  async function skillRequest(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUsername");
      window.location.replace("login.html");
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to complete the request.");
    }

    return data;
  }

  function safeSkillUrl(value) {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function updateTypeFields() {
    if (!typeInput || !percentageField || !percentageInput) return;

    const isTechnical = typeInput.value === "technical";
    percentageField.hidden = !isTechnical;
    percentageInput.required = isTechnical;
  }

  function resetSkillForm() {
    form.reset();
    document.getElementById("skillId").value = "";
    document.getElementById("skillFormTitle").textContent = "Add a new skill";
    saveButton.textContent = "Save Skill";
    updateTypeFields();
    showSkillStatus("");
  }

  function openSkillForm() {
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("skillName").focus();
  }

  function renderSkills() {
    list.replaceChildren();

    document.getElementById("skillCount").textContent =
      `${skills.length} ${skills.length === 1 ? "skill" : "skills"}`;

    const skillCounter = document.querySelector(
      ".creative-stat:nth-child(2) .counter"
    );

    if (skillCounter) {
      skillCounter.textContent = String(skills.length);
      skillCounter.dataset.count = String(skills.length);
    }

    if (!skills.length) {
      const empty = document.createElement("p");
      empty.className = "project-empty";
      empty.textContent = "No skills added yet. Select Add Skill to get started.";
      list.appendChild(empty);
      return;
    }

    skills.forEach((skill) => {
      const card = document.createElement("article");
      card.className = "skill-item";

      const identity = document.createElement("div");
      identity.className = "skill-identity";

      const iconBox = document.createElement("div");
      iconBox.className = "skill-logo";

      const iconUrl = safeSkillUrl(skill.icon || "");

      if (iconUrl) {
        const img = document.createElement("img");
        img.src = iconUrl;
        img.alt = `${skill.name} logo`;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.onerror = () => {
          iconBox.replaceChildren();
          iconBox.textContent = "◇";
        };
        iconBox.appendChild(img);
      } else {
        iconBox.textContent = "◇";
      }

      const details = document.createElement("div");
      details.className = "skill-details";

      const name = document.createElement("h4");
      name.textContent = skill.name || "Untitled skill";

      const category = document.createElement("p");
      category.className = "skill-category";
      category.textContent = skill.category || "Other";

      details.append(name, category);
      identity.append(iconBox, details);

      const typeLabel = document.createElement("span");
      typeLabel.className = "skill-level";

      if (skill.type === "technical") {
        typeLabel.textContent = `${skill.percentage ?? 0}%`;
      } else if (skill.type === "tool") {
        typeLabel.textContent = "Tool & Technology";
      } else {
        typeLabel.textContent = "Category Skill";
      }

      const actions = document.createElement("div");
      actions.className = "skill-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "project-edit-btn";
      edit.textContent = "Edit";

      edit.addEventListener("click", () => {
        document.getElementById("skillId").value = skill._id;
        document.getElementById("skillName").value = skill.name || "";
        document.getElementById("skillCategory").value = skill.category || "";
        document.getElementById("skillIcon").value = skill.icon || "";

        typeInput.value = ["category", "technical", "tool"].includes(skill.type)
          ? skill.type
          : "category";

        percentageInput.value = skill.percentage ?? "";
        updateTypeFields();

        document.getElementById("skillFormTitle").textContent = "Edit skill";
        saveButton.textContent = "Update Skill";
        showSkillStatus("");
        openSkillForm();
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "project-delete-btn";
      remove.textContent = "Delete";

      remove.addEventListener("click", async () => {
        if (!window.confirm(`Delete skill "${skill.name}"?`)) return;

        try {
          await skillRequest(`${API}/${encodeURIComponent(skill._id)}`, {
            method: "DELETE"
          });

          showSkillStatus("Skill deleted successfully.");
          await loadSkills();
        } catch (error) {
          showSkillStatus(error.message, true);
        }
      });

      actions.append(edit, remove);
      card.append(identity, typeLabel, actions);
      list.appendChild(card);
    });
  }

  async function loadSkills() {
    list.replaceChildren();

    const loading = document.createElement("p");
    loading.className = "project-empty";
    loading.textContent = "Loading skills...";
    list.appendChild(loading);

    try {
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load skills.");
      }

      skills = Array.isArray(data.skills) ? data.skills : [];
      renderSkills();
    } catch (error) {
      list.replaceChildren();

      const errorMessage = document.createElement("p");
      errorMessage.className = "project-empty";
      errorMessage.textContent =
        error.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure server.js is running."
          : error.message;

      list.appendChild(errorMessage);
    }
  }

  document.getElementById("showSkillForm").addEventListener("click", () => {
    resetSkillForm();
    openSkillForm();
  });

  function cancelSkillEditing() {
    resetSkillForm();
    form.hidden = true;
  }

  document.getElementById("cancelSkillForm")
    .addEventListener("click", cancelSkillEditing);

  document.getElementById("cancelSkillFormBottom")
    .addEventListener("click", cancelSkillEditing);

  typeInput.addEventListener("change", updateTypeFields);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("skillId").value;
    const selectedType = typeInput.value;
    const percentageValue = percentageInput.value;

    const payload = {
      name: document.getElementById("skillName").value.trim(),
      category: document.getElementById("skillCategory").value.trim() || "Other",
      type: selectedType,
      percentage:
        selectedType === "technical" ? Number(percentageValue) : null,
      icon: document.getElementById("skillIcon").value.trim()
    };

    if (!payload.name) {
      showSkillStatus("Skill name is required.", true);
      return;
    }

    if (
      selectedType === "technical" &&
      (
        percentageValue === "" ||
        !Number.isFinite(payload.percentage) ||
        payload.percentage < 0 ||
        payload.percentage > 100
      )
    ) {
      showSkillStatus("Enter a percentage between 0 and 100.", true);
      return;
    }

    if (payload.icon && !safeSkillUrl(payload.icon)) {
      showSkillStatus("Enter a valid HTTP or HTTPS logo URL.", true);
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = id ? "Updating..." : "Saving...";

    try {
      const data = await skillRequest(
        id ? `${API}/${encodeURIComponent(id)}` : API,
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );

      resetSkillForm();
      form.hidden = true;
      showSkillStatus(data.message || "Skill saved successfully.");
      await loadSkills();
    } catch (error) {
      showSkillStatus(error.message, true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = document.getElementById("skillId").value
        ? "Update Skill"
        : "Save Skill";
    }
  });

  updateTypeFields();
  loadSkills();
}

// ==============================
// EXPERIENCE MANAGEMENT
// ==============================
function initialiseExperience() {
  const form = document.getElementById("experienceForm");
  const list = document.getElementById("experiencesList");
  if (!form || !list) return;
  const API = "https://partha-portfolio-api.onrender.com/api/experience";
  const status = document.getElementById("experienceStatus");
  const saveButton = document.getElementById("saveExperienceBtn");
  let experiences = [];
  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }
  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUsername");
      window.location.replace("login.html");
      throw new Error("Your session expired. Please log in again.");
    }
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to complete the request.");
    }
    return data;
  }
  function resetForm() {
    form.reset();
    document.getElementById("experienceId").value = "";
    document.getElementById("experienceFormTitle").textContent =
      "Add experience";
    saveButton.textContent = "Save Experience";
    showStatus("");
  }
  function openForm() {
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("experienceRole").focus();
  }
  function editExperience(item) {
    document.getElementById("experienceId").value = item._id;
    document.getElementById("experienceRole").value = item.role || "";
    document.getElementById("experienceCompany").value = item.company || "";
    document.getElementById("experienceDuration").value = item.duration || "";
    document.getElementById("experienceDescription").value =
      item.description || "";
    document.getElementById("experienceTechnologies").value =
      Array.isArray(item.technologies) ? item.technologies.join(", ") : "";
    const iconSelect = document.getElementById("experienceIcon");
    const allowedIcons = ["code", "brain", "briefcase", "database", "graduation-cap"];
    iconSelect.value = allowedIcons.includes(item.icon) ? item.icon : "code";
    document.getElementById("experienceFormTitle").textContent =
      "Edit experience";
    saveButton.textContent = "Update Experience";
    showStatus("");
    openForm();
  }
  function renderExperiences() {
    list.replaceChildren();
    document.getElementById("experienceCount").textContent =
      `${experiences.length} ${
        experiences.length === 1 ? "experience" : "experiences"
      }`;
      // Update the Experience overview statistic
const experienceCounter = document.querySelector(
  ".creative-stat:nth-child(3) .counter"
);
if (experienceCounter) {
  experienceCounter.textContent = String(experiences.length);
  experienceCounter.dataset.count = String(experiences.length);
}
    if (!experiences.length) {
      const empty = document.createElement("p");
      empty.className = "project-empty";
      empty.textContent =
        "No experience added yet. Select “Add Experience” to get started.";
      list.appendChild(empty);
      return;
    }
    const iconSymbols = {
      code: "</>",
      brain: "AI",
      briefcase: "▣",
      database: "▤",
      "graduation-cap": "✦"
    };
    experiences.forEach((item) => {
      const card = document.createElement("article");
      card.className = "experience-admin-card";
      const icon = document.createElement("div");
      icon.className = "experience-admin-icon";
      icon.textContent = iconSymbols[item.icon] || "</>";
      const content = document.createElement("div");
      content.className = "experience-admin-content";
      const duration = document.createElement("span");
      duration.className = "experience-duration";
      duration.textContent = item.duration || "";
      const role = document.createElement("h4");
      role.textContent = item.role || "Untitled role";
      const company = document.createElement("p");
      company.className = "experience-company";
      company.textContent = item.company || "";
      const description = document.createElement("p");
      description.className = "experience-description";
      description.textContent = item.description || "";
      const tags = document.createElement("div");
      tags.className = "experience-tags";
      (Array.isArray(item.technologies) ? item.technologies : [])
        .forEach((technology) => {
          const tag = document.createElement("span");
          tag.className = "experience-tag";
          tag.textContent = technology;
          tags.appendChild(tag);
        });
      content.append(duration, role, company, description, tags);
      const actions = document.createElement("div");
      actions.className = "experience-admin-actions";
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "project-edit-btn";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => editExperience(item));
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "project-delete-btn";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", async () => {
        if (!confirm(`Delete experience at "${item.company}"?`)) return;
        try {
          await request(`${API}/${encodeURIComponent(item._id)}`, {
            method: "DELETE"
          });
          showStatus("Experience deleted successfully.");
          await loadExperiences();
        } catch (error) {
          showStatus(error.message, true);
        }
      });
      actions.append(editButton, deleteButton);
      card.append(icon, content, actions);
      list.appendChild(card);
    });
  }
  async function loadExperiences() {
    list.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "project-empty";
    loading.textContent = "Loading experience...";
    list.appendChild(loading);
    try {
      const response = await fetch(API);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load experience.");
      }
      experiences = Array.isArray(data.experiences)
        ? data.experiences
        : [];
      renderExperiences();
    } catch (error) {
      list.replaceChildren();
      const message = document.createElement("p");
      message.className = "project-empty";
      message.textContent =
        error.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that server.js is running."
          : error.message;
      list.appendChild(message);
    }
  }
  document.getElementById("showExperienceForm")
    .addEventListener("click", () => {
      resetForm();
      openForm();
    });
  function cancelForm() {
    resetForm();
    form.hidden = true;
  }
  document.getElementById("cancelExperienceForm")
    .addEventListener("click", cancelForm);
  document.getElementById("cancelExperienceFormBottom")
    .addEventListener("click", cancelForm);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("experienceId").value;
    const payload = {
      role: document.getElementById("experienceRole").value.trim(),
      company: document.getElementById("experienceCompany").value.trim(),
      duration: document.getElementById("experienceDuration").value.trim(),
      description: document.getElementById("experienceDescription").value.trim(),
      technologies: document.getElementById("experienceTechnologies").value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      icon: document.getElementById("experienceIcon").value
    };
    if (
      !payload.role ||
      !payload.company ||
      !payload.duration ||
      !payload.description
    ) {
      showStatus("Please complete all required fields.", true);
      return;
    }
    saveButton.disabled = true;
    saveButton.textContent = id ? "Updating..." : "Saving...";
    try {
      const data = await request(
        id ? `${API}/${encodeURIComponent(id)}` : API,
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );
      resetForm();
      form.hidden = true;
      showStatus(data.message || "Experience saved successfully.");
      await loadExperiences();
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = document.getElementById("experienceId").value
        ? "Update Experience"
        : "Save Experience";
    }
  });
  loadExperiences();
}
// ==============================
// EDUCATION MANAGEMENT
// ==============================
function initialiseEducation() {
  const form = document.getElementById("educationForm");
  const list = document.getElementById("educationList");
  if (!form || !list) return;
  const API = "https://partha-portfolio-api.onrender.com/api/education";
  const status = document.getElementById("educationStatus");
  const saveButton = document.getElementById("saveEducationBtn");
  let records = [];
  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }
  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUsername");
      window.location.replace("login.html");
      throw new Error("Session expired. Please log in again.");
    }
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to complete the request.");
    }
    return data;
  }
  function resetForm() {
    form.reset();
    document.getElementById("educationId").value = "";
    document.getElementById("educationFormTitle").textContent = "Add education";
    saveButton.textContent = "Save Education";
    showStatus("");
  }
  function openForm() {
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("educationDegree").focus();
  }
  function editRecord(record) {
    document.getElementById("educationId").value = record._id;
    document.getElementById("educationDegree").value = record.degree || "";
    document.getElementById("educationInstitution").value =
      record.institution || "";
    document.getElementById("educationDuration").value = record.duration || "";
    document.getElementById("educationGrade").value = record.grade || "";
    document.getElementById("educationDescription").value =
      record.description || "";
    document.getElementById("educationSpecialization").value =
       record.specialization || "";
    document.getElementById("educationFormTitle").textContent = "Edit education";
    saveButton.textContent = "Update Education";
    showStatus("");
    openForm();
  }
  function renderRecords() {
    list.replaceChildren();
    document.getElementById("educationCount").textContent =
      `${records.length} ${records.length === 1 ? "record" : "records"}`;
    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "project-empty";
      empty.textContent =
        "No education records yet. Select “Add Education” to get started.";
      list.appendChild(empty);
      return;
    }
    records.forEach((record) => {
      const card = document.createElement("article");
      card.className = "education-admin-card";
      const icon = document.createElement("div");
      icon.className = "education-admin-icon";
      icon.textContent = "▣";
      const details = document.createElement("div");
      details.className = "education-admin-details";
      const duration = document.createElement("span");
      duration.className = "education-duration";
      duration.textContent = record.duration || "";
      const degree = document.createElement("h4");
      degree.textContent = record.degree || "Qualification";
      const institution = document.createElement("p");
      institution.className = "education-institution";
      institution.textContent = record.institution || "";
      details.append(duration, degree);
if (record.specialization) {
  const specialization = document.createElement("p");
  specialization.className = "education-specialization";
  specialization.textContent = record.specialization;
  details.appendChild(specialization);
}
details.appendChild(institution);
      if (record.grade) {
        const grade = document.createElement("p");
        grade.className = "education-grade";
        grade.textContent = `Grade: ${record.grade}`;
        details.appendChild(grade);
      }
      if (record.description) {
        const description = document.createElement("p");
        description.className = "education-description";
        description.textContent = record.description;
        details.appendChild(description);
      }
      const actions = document.createElement("div");
      actions.className = "education-admin-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "project-edit-btn";
      edit.textContent = "Edit";
      edit.addEventListener("click", () => editRecord(record));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "project-delete-btn";
      remove.textContent = "Delete";
      remove.addEventListener("click", async () => {
        if (!window.confirm(`Delete "${record.degree}"?`)) return;
        try {
          const data = await request(
            `${API}/${encodeURIComponent(record._id)}`,
            { method: "DELETE" }
          );
          showStatus(data.message || "Education deleted successfully.");
          await loadRecords();
        } catch (error) {
          showStatus(error.message, true);
        }
      });
      actions.append(edit, remove);
      card.append(icon, details, actions);
      list.appendChild(card);
    });
  }
  async function loadRecords() {
    list.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "project-empty";
    loading.textContent = "Loading education...";
    list.appendChild(loading);
    try {
      const response = await fetch(API);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load education.");
      }
      records = Array.isArray(data.education) ? data.education : [];
      renderRecords();
    } catch (error) {
      list.replaceChildren();
      const message = document.createElement("p");
      message.className = "project-empty";
      message.textContent =
        error.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that server.js is running."
          : error.message;
      list.appendChild(message);
    }
  }
  document.getElementById("showEducationForm").addEventListener("click", () => {
    resetForm();
    openForm();
  });
  function cancelEditing() {
    resetForm();
    form.hidden = true;
  }
  document.getElementById("cancelEducationForm")
    .addEventListener("click", cancelEditing);
  document.getElementById("cancelEducationFormBottom")
    .addEventListener("click", cancelEditing);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("educationId").value;
    const payload = {
      degree: document.getElementById("educationDegree").value.trim(),
      institution: document.getElementById("educationInstitution").value.trim(),
      duration: document.getElementById("educationDuration").value.trim(),
      grade: document.getElementById("educationGrade").value.trim(),
      specialization: document
  .getElementById("educationSpecialization")
  .value.trim(),
      description: document.getElementById("educationDescription").value.trim()
    };
    if (!payload.degree || !payload.institution || !payload.duration) {
      showStatus("Please complete all required fields.", true);
      return;
    }
    saveButton.disabled = true;
    saveButton.textContent = id ? "Updating..." : "Saving...";
    try {
      const data = await request(
        id ? `${API}/${encodeURIComponent(id)}` : API,
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );
      resetForm();
      form.hidden = true;
      showStatus(data.message || "Education saved successfully.");
      await loadRecords();
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = document.getElementById("educationId").value
        ? "Update Education"
        : "Save Education";
    }
  });
  loadRecords();
}

/* ==============================
   CONTACT MESSAGES MANAGEMENT
============================== */

function initialiseMessages() {
    const list = document.getElementById("messagesList");
    const count = document.getElementById("messagesCount");
    const status = document.getElementById("messagesStatus");
    const refreshButton = document.getElementById("refreshMessagesBtn");

    if (!list || !count || !status || !refreshButton) return;

    const API = `${API_BASE}/contacts`;

    async function request(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
                ...(options.headers || {})
            }
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            sessionStorage.removeItem("adminToken");
            sessionStorage.removeItem("adminUsername");
            window.location.replace("login.html");
            throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load messages.");
        }

        return data;
    }

    function showStatus(message, isError = false) {
        status.textContent = message;
        status.classList.toggle("is-error", isError);
    }

    function renderMessages(messages) {
        list.replaceChildren();

        count.textContent =
            `${messages.length} ${messages.length === 1 ? "message" : "messages"}`;
        // Update the Messages count in the Overview card
const messageCounter = document.querySelector(
    ".creative-stat:nth-child(4) .counter"
);

if (messageCounter) {
    messageCounter.textContent = String(messages.length);
    messageCounter.dataset.count = String(messages.length);
}

        if (!messages.length) {
            const empty = document.createElement("p");
            empty.className = "project-empty";
            empty.textContent = "No contact messages received yet.";
            list.appendChild(empty);
            return;
        }

        messages.forEach((item) => {
            const card = document.createElement("article");
            card.className = "project-item";

            const details = document.createElement("div");
            details.className = "project-item-details";

            const name = document.createElement("h4");
            name.textContent = item.name || "Unknown sender";

            const email = document.createElement("p");
            email.className = "project-technologies";
            email.textContent = `Email: ${item.email || "Not provided"}`;

            const subject = document.createElement("p");
            subject.className = "project-item-description";
            subject.textContent = `Subject: ${item.subject || "No subject"}`;

            const message = document.createElement("p");
            message.className = "project-item-description";
            message.textContent = item.message || "";

            const date = document.createElement("small");
            date.textContent = item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "";

            details.append(name, email, subject, message, date);

            const actions = document.createElement("div");
            actions.className = "project-item-actions";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "project-delete-btn";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async () => {
                if (!window.confirm(`Delete the message from "${item.name}"?`)) {
                    return;
                }

                deleteButton.disabled = true;

                try {
                    const data = await request(
                        `${API}/${encodeURIComponent(item._id)}`,
                        { method: "DELETE" }
                    );

                    showStatus(data.message || "Message deleted successfully.");
                    await loadMessages();
                } catch (error) {
                    showStatus(error.message, true);
                    deleteButton.disabled = false;
                }
            });

            actions.appendChild(deleteButton);
            card.append(details, actions);
            list.appendChild(card);
        });
    }

    async function loadMessages() {
        list.replaceChildren();

        const loading = document.createElement("p");
        loading.className = "project-empty";
        loading.textContent = "Loading contact messages...";
        list.appendChild(loading);

        refreshButton.disabled = true;
        showStatus("");

        try {
            const data = await request(API);
            renderMessages(Array.isArray(data.contacts) ? data.contacts : []);
        } catch (error) {
            list.replaceChildren();

            const errorMessage = document.createElement("p");
            errorMessage.className = "project-empty";
            errorMessage.textContent = error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Check that server.js is running."
                : error.message;

            list.appendChild(errorMessage);
            count.textContent = "Unavailable";
        } finally {
            refreshButton.disabled = false;
        }
    }

    refreshButton.addEventListener("click", loadMessages);
    loadMessages();
}

// ==============================
// PROFILE MANAGEMENT
// ==============================


function initialiseProfile() {
    const profileForm = document.getElementById("profileForm");
    const photoForm = document.getElementById("profileImageForm");
    const resumeForm = document.getElementById("resumeForm");

    // Stop safely if this section is not present on the page.
    if (!profileForm || !photoForm || !resumeForm) {
        console.error("Profile section forms are missing.");
        return;
    }

    const API = "https://partha-portfolio-api.onrender.com/api/profile";
    const status = document.getElementById("profileStatus");
    const token = () => sessionStorage.getItem("adminToken");

    const field = (id) => document.getElementById(id);

    function showStatus(message, isError = false) {
        if (!status) return;

        status.textContent = message;
        status.classList.toggle("is-error", isError);
        status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    async function request(url, options = {}) {
        const authToken = token();

        if (!authToken) {
            throw new Error("Admin login expired. Please log in again.");
        }

        const headers = {
            Authorization: `Bearer ${authToken}`,
            ...(options.body instanceof FormData
                ? {}
                : options.body
                    ? { "Content-Type": "application/json" }
                    : {}),
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || `Request failed: ${response.status}`
            );
        }

        return data;
    }

    // Load current profile data.
    async function loadProfile() {
        showStatus("Loading profile...");

        try {
            const data = await request(`${API}/`);
            const profile = data.profile || data;

            field("profileNameInput").value = profile.name || "";
            field("profileTitleInput").value = profile.title || "";
            field("profileAboutInput").value = profile.about || "";
            field("linkedinInput").value = profile.linkedin || "";
            field("githubInput").value = profile.github || "";
            field("twitterInput").value = profile.twitter || "";
            field("instagramInput").value = profile.instagram || "";

            // Display the current resume when the API returns its path.
            const resumeElement = field("currentResume");
            if (resumeElement) {
                resumeElement.replaceChildren();

                if (profile.resume) {
                    const resumePath = String(profile.resume);
                    const link = document.createElement("a");

                    link.href = /^https?:\/\//i.test(resumePath)
                        ? resumePath
                        : `https://partha-portfolio-api.onrender.com/uploads/${resumePath.split("/").pop()}`;

                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = "Open current resume";
                    resumeElement.appendChild(link);
                } else {
                    resumeElement.textContent = "No resume uploaded yet.";
                }
            }

            // Show an existing photo preview when available.
            if (profile.profileImage) {
                const imagePath = String(profile.profileImage);
                const preview = field("profileImagePreview");
                const previewWrap = field("profileImagePreviewWrap");

                if (preview && previewWrap) {
                    preview.src = /^https?:\/\//i.test(imagePath)
                        ? imagePath
                        : `https://partha-portfolio-api.onrender.com/uploads/${imagePath.split("/").pop()}`;

                    previewWrap.hidden = false;
                }
            }

            showStatus("Profile loaded successfully.");
        } catch (error) {
            console.error("Load profile error:", error);
            showStatus(error.message, true);
        }
    }

    // Save text and social link fields.
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = field("saveProfileBtn");
        const originalText = button.textContent;

        const profileData = {
            name: field("profileNameInput").value.trim(),
            title: field("profileTitleInput").value.trim(),
            about: field("profileAboutInput").value.trim(),
            linkedin: field("linkedinInput").value.trim(),
            github: field("githubInput").value.trim(),
            twitter: field("twitterInput").value.trim(),
            instagram: field("instagramInput").value.trim()
        };

        button.disabled = true;
        button.textContent = "Saving...";

        try {
            const data = await request(`${API}/`, {
                method: "PUT",
                body: JSON.stringify(profileData)
            });

            showStatus(data.message || "Profile saved successfully.");
        } catch (error) {
            console.error("Save profile error:", error);
            showStatus(error.message, true);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    });

    // Shared upload handler for the photo and resume forms.
    function setupUpload(form, inputId, fieldName, buttonId, label) {
        const input = field(inputId);
        const button = field(buttonId);

        if (!input || !button) {
            console.error("Upload input/button is missing:", inputId);
            return;
        }

        form.addEventListener("submit", async (event) => {
            // Prevent the browser's default page-refresh submission.
            event.preventDefault();
            event.stopPropagation();

            console.log(`${label} submit event received`);

            const file = input.files && input.files[0];

            if (!file) {
                showStatus("Please select a file first.", true);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showStatus("File size must be 5 MB or less.", true);
                return;
            }

            if (fieldName === "resume" && file.type !== "application/pdf") {
                showStatus("Please select a PDF file for your resume.", true);
                return;
            }

            if (
                fieldName === "profileImage" &&
                !["image/jpeg", "image/png", "image/webp"].includes(file.type)
            ) {
                showStatus("Choose a JPG, PNG or WebP image.", true);
                return;
            }

            const originalText = button.textContent;
            const formData = new FormData();
            formData.append(fieldName, file);

            button.disabled = true;
            button.textContent = "Uploading...";
            showStatus(`Uploading ${label.toLowerCase()}...`);

            try {
                const data = await request(`${API}/upload`, {
                    method: "POST",
                    body: formData
                });

                input.value = "";

                showStatus(data.message || `${label} uploaded successfully.`);

                // Refresh saved profile details and the resume link.
                await loadProfile();
            } catch (error) {
                console.error(`${label} upload error:`, error);
                showStatus(error.message, true);
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }

    setupUpload(
        photoForm,
        "profileImageFile",
        "profileImage",
        "uploadPhotoBtn",
        "Profile photo"
    );

    setupUpload(
        resumeForm,
        "resumeFile",
        "resume",
        "uploadResumeBtn",
        "Resume"
    );

    // Preview the selected photo before uploading.
    field("profileImageFile").addEventListener("change", () => {
        const file = field("profileImageFile").files[0];
        const preview = field("profileImagePreview");
        const previewWrap = field("profileImagePreviewWrap");

        if (!file || !preview || !previewWrap) return;

        if (!file.type.startsWith("image/")) {
            showStatus("Please choose an image file.", true);
            return;
        }

        preview.src = URL.createObjectURL(file);
        previewWrap.hidden = false;
    });

    loadProfile();
}
