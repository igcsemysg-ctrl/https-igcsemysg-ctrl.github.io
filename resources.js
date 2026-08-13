(function () {
  "use strict";

  const subjects = Array.isArray(window.IGCSEMYSG_SUBJECTS) ? window.IGCSEMYSG_SUBJECTS : [];
  const resources = Array.isArray(window.IGCSEMYSG_RESOURCES)
    ? window.IGCSEMYSG_RESOURCES.filter((item) => item.published !== false)
    : [];

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function isExternal(url) {
    return /^https?:\/\//i.test(url || "");
  }

  function buildResourceCard(resource) {
    const article = createElement("article", "resource-card");
    const top = createElement("div", "resource-card-top");
    top.append(
      createElement("span", "resource-subject", resource.subject),
      createElement("span", "resource-format", resource.type || "Resource")
    );

    const title = createElement("h2", "", resource.title);
    const description = createElement("p", "", resource.description);
    const meta = createElement("div", "resource-card-meta");
    meta.append(
      createElement("span", "", resource.board || "Subject resource"),
      createElement("span", "", resource.kind === "checklist" ? "Progress saves on this device" : "Free access")
    );

    const link = createElement("a", "resource-open", resource.kind === "checklist" ? "Open free checklist" : "Open free resource");
    link.href = resource.url;
    if (isExternal(resource.url)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.append(createElement("span", "", "→"));
    article.append(top, title, description, meta, link);
    return article;
  }

  function initResourceLibrary() {
    const grid = document.querySelector("#resource-grid");
    const subjectSelect = document.querySelector("#resource-subject");
    const search = document.querySelector("#resource-search");
    const count = document.querySelector("#resource-count");
    const empty = document.querySelector("#resource-empty");
    if (!grid || !subjectSelect || !search || !count || !empty) return;

    subjects.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      subjectSelect.append(option);
    });

    function render() {
      const selectedSubject = subjectSelect.value;
      const query = search.value.trim().toLowerCase();
      const visible = resources
        .filter((resource) => !selectedSubject || resource.subject === selectedSubject)
        .filter((resource) => {
          const searchable = [resource.title, resource.subject, resource.type, resource.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return !query || searchable.includes(query);
        })
        .sort((a, b) => (a.order || 999) - (b.order || 999) || a.title.localeCompare(b.title));

      grid.replaceChildren(...visible.map(buildResourceCard));
      count.textContent = `${visible.length} free resource${visible.length === 1 ? "" : "s"}`;
      empty.hidden = visible.length !== 0;
    }

    subjectSelect.addEventListener("change", render);
    search.addEventListener("input", render);
    render();
  }

  function readSavedChecklist(id) {
    try {
      const value = JSON.parse(localStorage.getItem(`igcsemysg-resource-${id}`) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function saveChecklist(id, completed) {
    try {
      localStorage.setItem(`igcsemysg-resource-${id}`, JSON.stringify(completed));
    } catch (error) {
      // The checklist still works when browser storage is unavailable.
    }
  }

  function initResourceViewer() {
    const view = document.querySelector("#resource-view");
    if (!view) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const resource = resources.find((item) => item.id === id && item.kind === "checklist");
    const missing = document.querySelector("#resource-not-found");
    if (!resource) {
      view.hidden = true;
      if (missing) missing.hidden = false;
      return;
    }

    document.title = `${resource.title} | IGCSEMYSG`;
    document.querySelector("#viewer-subject").textContent = resource.subject;
    document.querySelector("#viewer-title").textContent = resource.title;
    document.querySelector("#viewer-description").textContent = resource.description;
    document.querySelector("#viewer-board").textContent = resource.board || "Subject planning resource";

    const list = document.querySelector("#viewer-checklist");
    const progressText = document.querySelector("#viewer-progress-text");
    const progressBar = document.querySelector("#viewer-progress-bar");
    const reset = document.querySelector("#viewer-reset");
    const print = document.querySelector("#viewer-print");
    const completed = new Set(readSavedChecklist(resource.id));

    function updateProgress() {
      const total = resource.topics.length;
      const done = completed.size;
      const percentage = total ? Math.round((done / total) * 100) : 0;
      progressText.textContent = `${done} of ${total} areas marked complete`;
      progressBar.value = percentage;
      progressBar.textContent = `${percentage}%`;
      saveChecklist(resource.id, Array.from(completed));
    }

    resource.topics.forEach((topic, index) => {
      const label = createElement("label", "viewer-topic");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = completed.has(index);
      input.addEventListener("change", () => {
        if (input.checked) completed.add(index);
        else completed.delete(index);
        label.classList.toggle("is-complete", input.checked);
        updateProgress();
      });
      label.classList.toggle("is-complete", input.checked);
      label.append(
        input,
        createElement("span", "viewer-topic-number", String(index + 1).padStart(2, "0")),
        createElement("strong", "", topic),
        createElement("i", "", "✓")
      );
      list.append(label);
    });

    reset.addEventListener("click", () => {
      completed.clear();
      list.querySelectorAll("input").forEach((input) => {
        input.checked = false;
        input.closest(".viewer-topic").classList.remove("is-complete");
      });
      updateProgress();
    });
    print.addEventListener("click", () => window.print());
    updateProgress();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initResourceLibrary();
    initResourceViewer();
  });
})();
