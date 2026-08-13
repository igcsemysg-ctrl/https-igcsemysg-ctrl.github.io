(function () {
  "use strict";

  const subjects = Array.isArray(window.IGCSEMYSG_SUBJECTS) ? window.IGCSEMYSG_SUBJECTS : [];
  const types = Array.isArray(window.IGCSEMYSG_RESOURCE_TYPES) ? window.IGCSEMYSG_RESOURCE_TYPES : [];
  const boards = Array.isArray(window.IGCSEMYSG_EXAM_BOARDS) ? window.IGCSEMYSG_EXAM_BOARDS : [];
  const resources = Array.isArray(window.IGCSEMYSG_RESOURCES)
    ? window.IGCSEMYSG_RESOURCES.filter((item) => item && item.published !== false)
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

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function appendOptions(select, values) {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  }

  function buildResourceCard(resource) {
    const article = createElement("article", `resource-card${resource.featured ? " resource-card-featured" : ""}`);
    const top = createElement("div", "resource-card-top");
    top.append(
      createElement("span", "resource-subject", resource.subject || "General"),
      createElement("span", "resource-format", resource.type || "Resource")
    );
    if (resource.featured) top.append(createElement("span", "resource-featured", "Featured"));

    const details = createElement("div", "resource-card-details");
    [resource.board, resource.syllabusCode ? `Syllabus ${resource.syllabusCode}` : "", resource.level, resource.fileSize]
      .filter(Boolean)
      .forEach((detail) => details.append(createElement("span", "", detail)));

    const topics = createElement("div", "resource-topic-list");
    const allTopics = Array.isArray(resource.topics) ? resource.topics.filter(Boolean) : [];
    allTopics.slice(0, 3).forEach((topic) => topics.append(createElement("span", "", topic)));
    if (allTopics.length > 3) topics.append(createElement("span", "resource-topic-more", `+${allTopics.length - 3}`));

    const footer = createElement("div", "resource-card-footer");
    const dateValue = resource.updatedDate || resource.publishedDate;
    const dateText = dateValue ? `${resource.updatedDate ? "Updated" : "Published"} ${formatDate(dateValue)}` : "Free resource";
    const link = createElement("a", "resource-open", "Open resource");
    link.href = resource.url || "#";
    if (!resource.url) {
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", (event) => event.preventDefault());
    } else if (isExternal(resource.url)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.append(createElement("span", "", "→"));
    footer.append(createElement("span", "resource-date", dateText), link);

    article.append(
      top,
      createElement("h2", "", resource.title || "Untitled resource"),
      createElement("p", "", resource.description || "Open this resource for further details.")
    );
    if (details.childElementCount) article.append(details);
    if (topics.childElementCount) article.append(topics);
    article.append(footer);
    return article;
  }

  function initResourceLibrary() {
    const grid = document.querySelector("#resource-grid");
    const subjectSelect = document.querySelector("#resource-subject");
    const typeSelect = document.querySelector("#resource-type");
    const boardSelect = document.querySelector("#resource-board");
    const sortSelect = document.querySelector("#resource-sort");
    const search = document.querySelector("#resource-search");
    const count = document.querySelector("#resource-count");
    const empty = document.querySelector("#resource-empty");
    const clear = document.querySelector("#resource-clear");
    if (!grid || !subjectSelect || !typeSelect || !boardSelect || !sortSelect || !search || !count || !empty || !clear) return;

    appendOptions(subjectSelect, subjects);
    appendOptions(typeSelect, types);
    appendOptions(boardSelect, boards);

    function render() {
      const selectedSubject = subjectSelect.value;
      const selectedType = typeSelect.value;
      const selectedBoard = boardSelect.value;
      const query = search.value.trim().toLowerCase();
      const visible = resources
        .filter((resource) => !selectedSubject || resource.subject === selectedSubject)
        .filter((resource) => !selectedType || resource.type === selectedType)
        .filter((resource) => !selectedBoard || resource.board === selectedBoard)
        .filter((resource) => {
          const searchable = [resource.title, resource.subject, resource.type, resource.board,
            resource.syllabusCode, resource.level, resource.description,
            ...(Array.isArray(resource.topics) ? resource.topics : [])]
            .filter(Boolean).join(" ").toLowerCase();
          return !query || searchable.includes(query);
        })
        .sort((a, b) => {
          if (sortSelect.value === "newest") {
            return String(b.updatedDate || b.publishedDate || "").localeCompare(String(a.updatedDate || a.publishedDate || ""));
          }
          if (sortSelect.value === "title") return String(a.title || "").localeCompare(String(b.title || ""));
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            (a.order || 9999) - (b.order || 9999) || String(a.title || "").localeCompare(String(b.title || ""));
        });

      grid.replaceChildren(...visible.map(buildResourceCard));
      count.textContent = resources.length
        ? `${visible.length} of ${resources.length} resource${resources.length === 1 ? "" : "s"}`
        : "Resource library being prepared";
      empty.hidden = visible.length !== 0;
      empty.querySelector("h2").textContent = resources.length ? "No matching resources." : "Resources are being prepared.";
      empty.querySelector("p").textContent = resources.length
        ? "Adjust the search or filters to view other materials."
        : "Revision notes, topical questions, papers and answer guidance will appear here as they are published.";
      clear.hidden = !resources.length || (!query && !selectedSubject && !selectedType && !selectedBoard);
    }

    [subjectSelect, typeSelect, boardSelect, sortSelect].forEach((select) => select.addEventListener("change", render));
    search.addEventListener("input", render);
    clear.addEventListener("click", () => {
      search.value = "";
      subjectSelect.value = "";
      typeSelect.value = "";
      boardSelect.value = "";
      sortSelect.value = "recommended";
      render();
      search.focus();
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", initResourceLibrary);
})();
