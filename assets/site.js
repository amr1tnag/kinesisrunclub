(function () {
  const REGISTRATION_KEY = "kinesisRunRegistrations";
  const REGISTRATION_FIELDS = [
    "submitted_at",
    "full_name",
    "phone",
    "instagram",
    "gender",
    "age",
    "distance",
    "frequency",
    "transport",
    "transport_other",
    "coming_from",
    "referrer",
    "first_time",
  ];

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

  function formatDate(value) {
    if (!value) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  function getFilteredRegistrations() {
    const searchValue =
      document.querySelector("[data-registration-search]")?.value.trim().toLowerCase() ||
      "";
    const distanceValue =
      document.querySelector("[data-distance-filter]")?.value || "";
    const firstTimeValue =
      document.querySelector("[data-first-time-filter]")?.value || "";

    return readRegistrations()
      .filter((entry) => {
        const matchesSearch =
          !searchValue ||
          [
            entry.full_name,
            entry.phone,
            entry.instagram,
            entry.coming_from,
            entry.referrer,
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchValue);
        const matchesDistance = !distanceValue || entry.distance === distanceValue;
        const matchesFirstTime =
          !firstTimeValue || entry.first_time === firstTimeValue;

        return matchesSearch && matchesDistance && matchesFirstTime;
      })
      .slice()
      .reverse();
  }

  function updateStats(registrations) {
    setText("[data-total-registrations]", registrations.length);
    setText(
      "[data-five-k-count]",
      registrations.filter((entry) => entry.distance === "5KM").length
    );
    setText(
      "[data-first-time-count]",
      registrations.filter((entry) => entry.first_time === "Yes").length
    );
  }

  function renderRegistrations() {
    const tableBody = document.querySelector("[data-registrations-table]");
    if (!tableBody) {
      return;
    }

    const registrations = getFilteredRegistrations();
    updateStats(registrations);

    if (!registrations.length) {
      tableBody.innerHTML =
        '<tr><td colspan="12" class="muted">No registrations match the current view.</td></tr>';
      return;
    }

    tableBody.innerHTML = registrations
      .map(
        (entry) => `
          <tr>
            <td>${escapeHtml(formatDate(entry.submitted_at))}</td>
            <td>${escapeHtml(entry.full_name)}</td>
            <td>${escapeHtml(entry.phone)}</td>
            <td>${escapeHtml(entry.instagram)}</td>
            <td>${escapeHtml(entry.gender)}</td>
            <td>${escapeHtml(entry.age)}</td>
            <td>${escapeHtml(entry.distance)}</td>
            <td>${escapeHtml(entry.frequency)}</td>
            <td>${escapeHtml(entry.transport)}</td>
            <td>${escapeHtml(entry.coming_from)}</td>
            <td>${escapeHtml(entry.referrer)}</td>
            <td>${escapeHtml(entry.first_time)}</td>
          </tr>
        `
      )
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function csvValue(value) {
    const text = String(value || "");
    return `"${text.replaceAll('"', '""')}"`;
  }

  function exportRegistrations() {
    const registrations = getFilteredRegistrations().slice().reverse();
    if (!registrations.length) {
      alert("No registrations to export yet.");
      return;
    }

    const rows = [
      REGISTRATION_FIELDS.join(","),
      ...registrations.map((entry) =>
        REGISTRATION_FIELDS.map((field) => csvValue(entry[field])).join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `kinesis-registrations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function clearRegistrations() {
    const registrations = readRegistrations();
    if (!registrations.length) {
      alert("There is no test data to clear.");
      return;
    }

    if (confirm("Clear all saved registrations from this browser?")) {
      localStorage.removeItem(REGISTRATION_KEY);
      renderRegistrations();
    }
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

  document
    .querySelectorAll(
      "[data-registration-search], [data-distance-filter], [data-first-time-filter]"
    )
    .forEach((control) => {
      control.addEventListener("input", renderRegistrations);
      control.addEventListener("change", renderRegistrations);
    });

  document
    .querySelector("[data-export-registrations]")
    ?.addEventListener("click", exportRegistrations);

  document
    .querySelector("[data-clear-registrations]")
    ?.addEventListener("click", clearRegistrations);

  renderRegistrations();
})();
