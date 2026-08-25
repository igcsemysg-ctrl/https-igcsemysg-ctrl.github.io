const WHATSAPP_NUMBER = "60172731112";

const diagnosticQuestions = [
  {
    category: "foundations",
    text: "A new topic feels difficult because some earlier ideas or terms are unclear."
  },
  {
    category: "foundations",
    text: "I can follow a worked example, but I cannot explain why each step works."
  },
  {
    category: "foundations",
    text: "The same misunderstandings return even after they have been corrected."
  },
  {
    category: "exam",
    text: "I understand lessons, but I still lose marks when answering exam questions."
  },
  {
    category: "exam",
    text: "Command words, answer structure or showing working often cost me marks."
  },
  {
    category: "exam",
    text: "Under timed conditions, I rush, leave questions incomplete or mismanage time."
  },
  {
    category: "language",
    text: "I need to reread questions several times before I understand what is required."
  },
  {
    category: "language",
    text: "I know the idea, but struggle to express it clearly in English."
  },
  {
    category: "language",
    text: "Long or text-heavy questions make it difficult to identify the important information."
  },
  {
    category: "routine",
    text: "Revision is inconsistent or usually begins close to an exam."
  },
  {
    category: "routine",
    text: "I spend more time rereading notes than testing what I can remember or apply."
  },
  {
    category: "routine",
    text: "I do not have a clear system for revisiting mistakes and weaker topics."
  },
  {
    category: "direction",
    text: "I am often unsure what to study first or what progress should look like."
  },
  {
    category: "direction",
    text: "It is difficult to begin or continue studying even when I know it matters."
  },
  {
    category: "direction",
    text: "Recent results have reduced my confidence, motivation or sense of direction."
  }
];

const diagnosticOptions = [
  { label: "Rarely", value: 0 },
  { label: "Sometimes", value: 1 },
  { label: "Often", value: 2 },
  { label: "Almost always", value: 3 }
];

const categoryDetails = {
  foundations: {
    name: "Concept foundations",
    summary: "Earlier concepts may need to be rebuilt before current work can become secure.",
    guidance: [
      "Pinpoint the exact prerequisite concept behind each recurring error.",
      "Rebuild understanding with short explanations, worked examples and student-led reasoning.",
      "Recheck the concept later through retrieval and mixed questions."
    ]
  },
  exam: {
    name: "Exam application",
    summary: "Knowledge may be present, but it is not yet transferring reliably into marks.",
    guidance: [
      "Practise command words and answer structures using syllabus-specific questions.",
      "Compare responses with mark schemes and examiner expectations.",
      "Use short timed sets before moving to complete papers."
    ]
  },
  language: {
    name: "Language & comprehension",
    summary: "Question wording or written expression may be obstructing subject knowledge.",
    guidance: [
      "Paraphrase each question before answering it.",
      "Build a focused bank of subject vocabulary and common command words.",
      "Use model responses to practise clear, accurate answer structure."
    ]
  },
  routine: {
    name: "Study consistency",
    summary: "The study process may need more structure, active practice and follow-through.",
    guidance: [
      "Create a realistic weekly rhythm with small, specific targets.",
      "Replace passive rereading with recall, questions and self-explanation.",
      "Maintain a simple error log and schedule spaced review."
    ]
  },
  direction: {
    name: "Motivation & direction",
    summary: "A lack of clarity, confidence or momentum may be making academic work harder to sustain.",
    guidance: [
      "Set one clear short-term goal and define the smallest useful next action.",
      "Connect current subjects with realistic academic or career pathways.",
      "Use regular check-ins and achievable milestones to rebuild confidence."
    ]
  }
};

const answers = Array(diagnosticQuestions.length).fill(null);
let currentQuestion = 0;

function createWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function initNavigation() {
  const toggle = document.querySelector(".menu-button");
  const menu = document.querySelector(".nav-links");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((item) => observer.observe(item));
}

function renderQuestion() {
  const panel = document.querySelector("#question-panel");
  if (!panel) return;
  const question = diagnosticQuestions[currentQuestion];
  const selected = answers[currentQuestion];
  const count = document.querySelector("#question-count");
  const percent = document.querySelector("#progress-percent");
  const bar = document.querySelector("#progress-bar");
  const previous = document.querySelector("#previous-question");
  const next = document.querySelector("#next-question");
  const error = document.querySelector("#diagnostic-error");

  count.textContent = `Question ${currentQuestion + 1} of ${diagnosticQuestions.length}`;
  const progress = Math.round(((currentQuestion + 1) / diagnosticQuestions.length) * 100);
  percent.textContent = `${progress}%`;
  bar.style.width = `${progress}%`;
  previous.disabled = currentQuestion === 0;
  next.textContent = currentQuestion === diagnosticQuestions.length - 1 ? "View my profile" : "Next";
  error.textContent = "";

  panel.innerHTML = `
    <fieldset class="question-fieldset">
      <legend>${question.text}</legend>
      <div class="answer-grid">
        ${diagnosticOptions
          .map(
            (option) => `
              <label class="answer-option ${selected === option.value ? "is-selected" : ""}">
                <input type="radio" name="diagnostic-answer" value="${option.value}" ${
                  selected === option.value ? "checked" : ""
                }>
                <span>${option.label}</span>
              </label>
            `
          )
          .join("")}
      </div>
    </fieldset>
  `;

  panel.querySelectorAll('input[name="diagnostic-answer"]').forEach((input) => {
    input.addEventListener("change", () => {
      answers[currentQuestion] = Number(input.value);
      panel.querySelectorAll(".answer-option").forEach((label) => label.classList.remove("is-selected"));
      input.closest(".answer-option").classList.add("is-selected");
      error.textContent = "";
    });
  });
}

function calculateResults() {
  const scores = Object.keys(categoryDetails).reduce((result, key) => {
    result[key] = 0;
    return result;
  }, {});

  diagnosticQuestions.forEach((question, index) => {
    scores[question.category] += answers[index];
  });

  return Object.entries(scores)
    .map(([key, score]) => ({
      key,
      score,
      percentage: Math.round((score / 9) * 100),
      ...categoryDetails[key]
    }))
    .sort((a, b) => b.score - a.score);
}

function showResults() {
  const results = calculateResults();
  const primary = results[0];
  const secondary = results[1];
  const form = document.querySelector("#diagnostic-form");
  const resultPanel = document.querySelector("#diagnostic-result");
  const title = document.querySelector("#result-title");
  const summary = document.querySelector("#result-summary");
  const bars = document.querySelector("#result-bars");
  const guidance = document.querySelector("#result-guidance");
  const whatsapp = document.querySelector("#result-whatsapp");

  title.textContent = `Your strongest signal is ${primary.name.toLowerCase()}.`;
  summary.textContent =
    primary.score === 0
      ? "No strong barrier appeared in these responses. A tutor-led trial can still check subject-specific gaps."
      : `${primary.summary} A secondary signal appeared in ${secondary.name.toLowerCase()}, so both areas should be checked during consultation.`;

  bars.innerHTML = results
    .map(
      (result) => `
        <div class="result-row">
          <div>
            <span>${result.name}</span>
            <strong>${result.percentage}% signal</strong>
          </div>
          <div class="bar" aria-label="${result.name}: ${result.percentage}% signal">
            <i style="width: ${result.percentage}%"></i>
          </div>
        </div>
      `
    )
    .join("");

  guidance.innerHTML = `
    <strong>A sensible first response</strong>
    <ul>${primary.guidance.map((item) => `<li>${item}</li>`).join("")}</ul>
    <p class="diagnostic-note">This educational screening identifies study patterns; it is not a psychological or medical diagnosis. Persistent emotional or wellbeing concerns should be discussed with a qualified professional.</p>
  `;

  const profile = results.map((result) => `${result.name}: ${result.percentage}%`).join(", ");
  whatsapp.href = createWhatsAppUrl(
    `Hello IGCSEMYSG. I completed the study diagnostic. My profile was ${profile}. I would like to discuss the most suitable next step.`
  );

  form.hidden = true;
  resultPanel.hidden = false;
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initDiagnostic() {
  const start = document.querySelector("#start-assessment");
  const startPanel = document.querySelector("#diagnostic-start");
  const form = document.querySelector("#diagnostic-form");
  if (!start || !startPanel || !form) return;

  form.addEventListener("submit", (event) => event.preventDefault());

  start.addEventListener("click", () => {
    startPanel.hidden = true;
    form.hidden = false;
    renderQuestion();
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.querySelector("#previous-question").addEventListener("click", () => {
    if (currentQuestion > 0) {
      currentQuestion -= 1;
      renderQuestion();
    }
  });

  document.querySelector("#next-question").addEventListener("click", () => {
    if (answers[currentQuestion] === null) {
      document.querySelector("#diagnostic-error").textContent = "Choose the option that fits best before continuing.";
      return;
    }
    if (currentQuestion < diagnosticQuestions.length - 1) {
      currentQuestion += 1;
      renderQuestion();
    } else {
      showResults();
    }
  });

  document.querySelector("#restart-assessment").addEventListener("click", () => {
    answers.fill(null);
    currentQuestion = 0;
    document.querySelector("#diagnostic-result").hidden = true;
    form.hidden = false;
    renderQuestion();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function initEnquiryForm() {
  const form = document.querySelector("#enquiry-form");
  if (!form) return;
  const whatsappButton = document.querySelector("#enquiry-whatsapp-button");
  const attachmentInput = document.querySelector("#enquiry-attachments");
  const fileList = document.querySelector("#enquiry-file-list");
  const status = document.querySelector("#enquiry-status");
  const stepPanels = Array.from(form.querySelectorAll("[data-enquiry-step]"));
  const nextButton = document.querySelector("#enquiry-next");
  const backButton = document.querySelector("#enquiry-back");
  const stepLabel = document.querySelector("#enquiry-step-label");
  const stepTitle = document.querySelector("#enquiry-step-title");
  const progressBar = document.querySelector("#enquiry-progress-bar");
  const progressDots = Array.from(form.querySelectorAll(".intake-progress-dots i"));
  const review = document.querySelector("#enquiry-review");
  const success = document.querySelector("#enquiry-success");
  const maximumFiles = 3;
  const maximumFileSize = 10 * 1024 * 1024;
  const allowedFilePattern = /\.(pdf|doc|docx|jpe?g|png)$/i;
  const stepTitles = ["About the student", "Academic information", "Understanding the situation", "Goals and expectations", "Review and next step"];
  let currentStep = 1;
  const value = (selector) => document.querySelector(selector)?.value.trim() || "";
  const selectedFiles = () => Array.from(attachmentInput?.files || []);
  const safeText = (text) => text.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  const checkedValues = (name) => Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function renderFiles() {
    if (!fileList) return;
    const files = selectedFiles();
    fileList.classList.toggle("has-files", files.length > 0);
    if (!files.length) {
      fileList.innerHTML = "<span>No files selected</span><small>PDF, DOC, DOCX, JPG or PNG · up to 10 MB each · maximum 3 files</small>";
      return;
    }
    fileList.innerHTML = files
      .map((file) => `<span>${safeText(file.name)} · ${(file.size / 1024 / 1024).toFixed(1)} MB</span>`)
      .join("");
  }

  function validateFiles() {
    if (!attachmentInput) return true;
    const files = selectedFiles();
    attachmentInput.setCustomValidity("");
    if (files.length > maximumFiles) {
      attachmentInput.setCustomValidity(`Choose no more than ${maximumFiles} files.`);
      setStatus(`Please choose no more than ${maximumFiles} supporting files.`, true);
      return false;
    }
    const unsupported = files.find((file) => !allowedFilePattern.test(file.name));
    if (unsupported) {
      attachmentInput.setCustomValidity("Use PDF, DOC, DOCX, JPG or PNG files only.");
      setStatus(`${unsupported.name} is not a supported file type.`, true);
      return false;
    }
    const oversized = files.find((file) => file.size > maximumFileSize);
    if (oversized) {
      attachmentInput.setCustomValidity("Keep each file below 10 MB.");
      setStatus(`${oversized.name} is larger than 10 MB.`, true);
      return false;
    }
    return true;
  }

  function validatePanel(step) {
    const panel = stepPanels[step - 1];
    if (!panel) return true;
    for (const group of panel.querySelectorAll("[data-required-checkbox-group]")) {
      const first = group.querySelector('input[type="checkbox"]');
      const selected = group.querySelector('input[type="checkbox"]:checked');
      if (first) first.setCustomValidity(selected ? "" : "Select at least one option.");
    }
    if (step === 3 && !validateFiles()) return false;
    const controls = Array.from(panel.querySelectorAll("input,select,textarea"));
    const invalid = controls.find((control) => !control.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      setStatus("Complete the required information before continuing.", true);
      return false;
    }
    setStatus("");
    return true;
  }

  function updateStep(step) {
    currentStep = Math.min(Math.max(step, 1), stepPanels.length);
    stepPanels.forEach((panel, index) => {
      const active = index === currentStep - 1;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    if (stepLabel) stepLabel.textContent = `Step ${currentStep} of ${stepPanels.length}`;
    if (stepTitle) stepTitle.textContent = stepTitles[currentStep - 1];
    if (progressBar) progressBar.style.width = `${currentStep / stepPanels.length * 100}%`;
    progressDots.forEach((dot, index) => dot.classList.toggle("active", index < currentStep));
    if (backButton) backButton.hidden = currentStep === 1;
    if (nextButton) nextButton.hidden = currentStep === stepPanels.length;
    if (currentStep === stepPanels.length) renderReview();
  }

  function renderReview() {
    if (!review) return;
    const subjects = checkedValues("enquiry-subject");
    const situations = checkedValues("enquiry-situation");
    const goals = checkedValues("enquiry-goal");
    review.innerHTML = [
      ["Student", `${value("#enquiry-student-name")} · ${value("#enquiry-level")}`],
      ["Curriculum", form.querySelector('input[name="enquiry-board"]:checked')?.value || "Not provided"],
      ["Subjects", subjects.join(", ") || "Not provided"],
      ["Current situation", situations.join(", ") || "Not provided"],
      ["Goals", goals.join(", ") || "Not provided"]
    ].map(([label, content]) => `<div><span>${safeText(label)}</span><strong>${safeText(content)}</strong></div>`).join("");
  }

  function enquirySummary(channel) {
    const files = selectedFiles();
    const subjects = checkedValues("enquiry-subject");
    const situations = checkedValues("enquiry-situation");
    const goals = checkedValues("enquiry-goal");
    const board = form.querySelector('input[name="enquiry-board"]:checked')?.value || "Not provided";
    const attachmentSummary = files.length
      ? files.map((file, index) => `${index + 1}. ${file.name}`).join("\n")
      : "No supporting documents selected";
    return [
      "IGCSEMYSG — STUDENT LEARNING ENQUIRY",
      "",
      "PARENT / GUARDIAN",
      `Name: ${value("#enquiry-name")}`,
      `Preferred contact: ${value("#enquiry-contact-method")}`,
      `Email: ${value("#enquiry-email")}`,
      `Phone / WhatsApp: ${value("#enquiry-phone")}`,
      "",
      "STUDENT",
      `Name: ${value("#enquiry-student-name")}`,
      `Level: ${value("#enquiry-level")}`,
      `School type: ${value("#enquiry-school-type")}`,
      `Curriculum: ${board}`,
      `Subjects: ${subjects.join(", ")}`,
      "",
      "SITUATION SIGNALS",
      situations.join(", "),
      value("#enquiry-situation-other") || "No additional signal provided",
      "",
      "WHAT THE FAMILY HAS NOTICED",
      value("#enquiry-concern"),
      "",
      "SUPPORT ALREADY TRIED",
      value("#enquiry-tried") || "Not provided",
      "",
      "GOALS AND EXPECTATIONS",
      `Areas to improve: ${goals.join(", ")}`,
      `Specific outcome: ${value("#enquiry-outcome") || "Not provided"}`,
      `Upcoming exam / event: ${value("#enquiry-exam") || "Not provided"}`,
      `Date / timeframe: ${value("#enquiry-exam-date") || "Not provided"}`,
      "",
      "SUPPORTING DOCUMENTS PREPARED",
      attachmentSummary,
      "",
      files.length ? `Please attach the listed file${files.length === 1 ? "" : "s"} in ${channel} before sending.` : "No attachment is expected with this enquiry."
    ].join("\n");
  }

  attachmentInput?.addEventListener("change", () => {
    renderFiles();
    if (validateFiles()) setStatus(selectedFiles().length ? "Supporting files are ready to be attached in your chosen sending app." : "");
  });

  nextButton?.addEventListener("click", () => {
    if (!validatePanel(currentStep)) return;
    updateStep(currentStep + 1);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  backButton?.addEventListener("click", () => {
    updateStep(currentStep - 1);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("");
    if (!validatePanel(5) || !validateFiles()) return;
    const files = selectedFiles();
    const subject = `Student learning enquiry — ${value("#enquiry-student-name")} — ${checkedValues("enquiry-subject").join(", ")}`;
    const emailUrl = `mailto:enquiry@send.igcsemysg.site?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enquirySummary("your email app"))}`;
    setStatus(
      files.length
        ? "Your enquiry email is prepared. Attach the selected documents in the email window before sending."
        : "Your enquiry email is prepared and addressed to enquiry@send.igcsemysg.site."
    );
    if (success) success.hidden = false;
    window.location.href = emailUrl;
  });

  whatsappButton?.addEventListener("click", () => {
    setStatus("");
    if (!validatePanel(5) || !validateFiles()) return;
    const files = selectedFiles();
    setStatus(
      files.length
        ? "Your WhatsApp enquiry is organised and ready. Attach the selected documents in WhatsApp before sending."
        : "Your answers have been organised into a WhatsApp enquiry ready to send."
    );
    if (success) success.hidden = false;
    window.open(createWhatsAppUrl(enquirySummary("WhatsApp")), "_blank", "noopener,noreferrer");
  });

  renderFiles();
  updateStep(1);
}

function initCareerForm() {
  const form = document.querySelector("#career-form");
  if (!form) return;
  const success = document.querySelector("#career-success");
  const whatsappButton = document.querySelector("#career-whatsapp-button");
  const cvInput = document.querySelector("#career-cv");
  const coverLetterInput = document.querySelector("#career-cover-letter");
  const maximumFileSize = 10 * 1024 * 1024;
  const allowedFilePattern = /\.(pdf|doc|docx)$/i;
  const value = (id) => document.querySelector(id)?.value.trim() || "";
  const selectedFile = (input) => input?.files?.[0] || null;

  function validateFile(input, required) {
    if (!input) return true;
    const file = selectedFile(input);
    input.setCustomValidity("");
    if (!file) {
      if (required) input.setCustomValidity("Select your CV before continuing.");
      return !required;
    }
    if (!allowedFilePattern.test(file.name)) {
      input.setCustomValidity("Use a PDF, DOC or DOCX file.");
      return false;
    }
    if (file.size > maximumFileSize) {
      input.setCustomValidity("Keep each file below 10 MB.");
      return false;
    }
    return true;
  }

  function validateApplication() {
    validateFile(cvInput, true);
    validateFile(coverLetterInput, false);
    const valid = form.reportValidity();
    if (!valid && success) {
      success.textContent = "Complete the required fields and prepare your CV before choosing a submission route.";
      success.classList.add("is-error");
    }
    return valid;
  }

  function applicationSummary(channel) {
    const cv = selectedFile(cvInput);
    const coverLetter = selectedFile(coverLetterInput);
    return [
      "Hello IGCSEMYSG. I would like to apply as an online tutor.",
      "",
      `Name: ${value("#career-name")}`,
      `Email: ${value("#career-email")}`,
      `Phone: ${value("#career-phone")}`,
      `Location: ${value("#career-location")}`,
      `Subjects: ${value("#career-subjects")}`,
      `Boards/levels: ${value("#career-boards")}`,
      `Teaching experience: ${value("#career-experience")}`,
      `Availability: ${value("#career-availability")}`,
      `Teaching approach and interest: ${value("#career-message")}`,
      "",
      "Documents prepared:",
      `CV: ${cv ? cv.name : "Not selected"}`,
      `Cover letter: ${coverLetter ? coverLetter.name : "Not selected"}`,
      "",
      `Please remember to attach the listed document${coverLetter ? "s" : ""} in ${channel} before sending.`
    ].join("\n");
  }

  [cvInput, coverLetterInput].forEach((input) => {
    input?.addEventListener("change", () => {
      validateFile(input, input === cvInput);
      if (success) {
        success.textContent = "";
        success.classList.remove("is-error");
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateApplication()) return;
    const subject = `Online tutor application — ${value("#career-name")} — ${value("#career-subjects")}`;
    const emailUrl = `mailto:igcsemysg@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      applicationSummary("your email app")
    )}`;
    if (success) {
      success.textContent = "Your email application is prepared. Attach your CV and cover letter in the email window, then send it to igcsemysg@gmail.com.";
      success.classList.remove("is-error");
    }
    window.location.href = emailUrl;
  });

  whatsappButton?.addEventListener("click", () => {
    if (!validateApplication()) return;
    if (success) {
      success.textContent = "Your WhatsApp application is prepared. Attach your CV and cover letter in WhatsApp before sending.";
      success.classList.remove("is-error");
    }
    window.open(createWhatsAppUrl(applicationSummary("WhatsApp")), "_blank", "noopener,noreferrer");
  });
}

function initCareerApplicationDisclosure() {
  const disclosure = document.querySelector("#application-preparation");
  if (!disclosure) return;
  document.querySelectorAll("[data-open-career-application]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      disclosure.open = true;
      disclosure.scrollIntoView({ behavior: "smooth", block: "start" });
      const summary = disclosure.querySelector("summary");
      if (summary) summary.focus({ preventScroll: true });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initReveal();
  initDiagnostic();
  initEnquiryForm();
  initCareerForm();
  initCareerApplicationDisclosure();
});
