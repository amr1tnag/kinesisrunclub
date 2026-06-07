(function () {
  const REGISTRATION_KEY = "kinesisRunRegistrations";
  const navLinks = document.getElementById("navLinks");
  const menuButtons = document.querySelectorAll("[data-menu-toggle]");
  const hamburger = document.querySelector(".hamburger");
  const overlay = document.querySelector(".overlay");

  function setMenu(open) {
    if (!navLinks) {
      return;
    }

    navLinks.classList.toggle("active", open);
    overlay?.classList.toggle("active", open);
    document.body.classList.toggle("menu-open", open);
    hamburger?.setAttribute("aria-expanded", String(open));
  }

  function readRegistrations() {
    try {
      return JSON.parse(localStorage.getItem(REGISTRATION_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function writeRegistrations(registrations) {
    localStorage.setItem(REGISTRATION_KEY, JSON.stringify(registrations));
  }

  function formToObject(form) {
    const data = Object.fromEntries(new FormData(form).entries());

    return {
      submitted_at: new Date().toISOString(),
      full_name: data.full_name || "",
      phone: data.phone || "",
      instagram: data.instagram || "",
      gender: data.gender || "",
      age: data.age || "",
      distance: data.distance || "",
      frequency: data.frequency || "",
      transport:
        data.transport === "Other" && data.transport_other
          ? data.transport_other
          : data.transport || "",
      transport_other: data.transport_other || "",
      coming_from: data.coming_from || "",
      referrer: data.referrer || "",
      first_time: data.first_time || "",
    };
  }

  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMenu(!navLinks?.classList.contains("active"));
    });
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (form.hasAttribute("data-save-registration")) {
        const registrations = readRegistrations();
        registrations.push(formToObject(form));
        writeRegistrations(registrations);
      }

      const notice = form.closest(".card")?.querySelector("[data-form-notice]");
      if (notice) {
        notice.textContent = form.dataset.success || "Saved.";
        notice.classList.add("is-visible");
        notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      form.reset();

      if (form.dataset.redirect) {
        window.location.href = form.dataset.redirect;
      }
    });
  });

})();
