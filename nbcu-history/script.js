/* ===========================
   NBCU History - Interactive Script
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initThemeToggle();
  initTimeline();
  initTimelineFilters();
  initTabs();
  initPeacockContentTabs();
  initScrollAnimations();
  initStatsCounter();
  initQuiz();
  initModal();
  initSmoothScroll();
});

/* ===========================
   Navigation
   =========================== */
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
    updateActiveNavLink();
  });

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll(".section, .hero");
  const navLinks = document.querySelectorAll(".nav-links a");
  let currentSection = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 150 && rect.bottom > 150) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-section") === currentSection);
  });
}

/* ===========================
   Theme Toggle
   =========================== */
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");
  const savedTheme = localStorage.getItem("nbcuTheme");

  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeIcon.innerHTML = "&#9728;";
  }

  themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      themeIcon.innerHTML = "&#9790;";
      localStorage.setItem("nbcuTheme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      themeIcon.innerHTML = "&#9728;";
      localStorage.setItem("nbcuTheme", "light");
    }
  });
}

/* ===========================
   Timeline Scroll Animation
   =========================== */
function initTimeline() {
  const timelineItems = document.querySelectorAll(".timeline-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  timelineItems.forEach((item) => observer.observe(item));
}

/* ===========================
   Timeline Filters
   =========================== */
function initTimelineFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const timelineItems = document.querySelectorAll(".timeline-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      timelineItems.forEach((item) => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.classList.remove("hidden-by-filter");
          item.classList.add("visible");
        } else {
          item.classList.add("hidden-by-filter");
        }
      });
    });
  });
}

/* ===========================
   Read More / Expand Details
   =========================== */
function initModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  const modalContent = document.getElementById("modalContent");
  const modalClose = document.getElementById("modalClose");

  document.querySelectorAll(".read-more-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".timeline-card");
      const title = card.querySelector("h3").textContent;
      const year = card.querySelector(".timeline-year").textContent;
      const summary = card.querySelector("p").textContent;
      const detail = card.querySelector(".timeline-detail");
      const detailText = detail ? detail.querySelector("p").textContent : "";

      modalContent.innerHTML = `
        <span class="modal-year">${year}</span>
        <h3>${title}</h3>
        <p style="margin-bottom: 16px;">${summary}</p>
        ${detailText ? `<p>${detailText}</p>` : ""}
      `;

      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

/* ===========================
   Tabs (NBC & Universal)
   =========================== */
function initTabs() {
  document.querySelectorAll(".tabs").forEach((tabContainer) => {
    const btns = tabContainer.querySelectorAll(".tab-btn");
    const section = tabContainer.closest(".section");

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const tabId = btn.getAttribute("data-tab");
        section.querySelectorAll(".tab-content").forEach((content) => {
          content.classList.remove("active");
        });
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
          targetTab.classList.add("active");
          refreshScrollAnimations(targetTab);
        }
      });
    });
  });
}

/* ===========================
   Peacock Content Tabs
   =========================== */
function initPeacockContentTabs() {
  const catBtns = document.querySelectorAll(".content-cat-btn");
  const panels = document.querySelectorAll(".content-panel");

  catBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      catBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const cat = btn.getAttribute("data-cat");
      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === cat);
      });
    });
  });
}

/* ===========================
   Scroll Animations
   =========================== */
function initScrollAnimations() {
  const animatableElements = document.querySelectorAll(
    ".first-item, .classic-item, .info-card, .franchise-card, .news-card, .park-card, .country-card, .innovation-card, .feature-card, .stat-card"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) translateX(0) scale(1)";
        }
      });
    },
    { threshold: 0.1 }
  );

  animatableElements.forEach((el) => {
    if (!el.classList.contains("first-item") && !el.classList.contains("classic-item")) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    }
    observer.observe(el);
  });
}

function refreshScrollAnimations(container) {
  const items = container.querySelectorAll(
    ".first-item, .classic-item, .info-card, .franchise-card, .news-card, .park-card"
  );
  items.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.05}s`;
    item.classList.add("visible");
    item.style.opacity = "1";
    item.style.transform = "translateY(0) translateX(0)";
  });
}

/* ===========================
   Stats Counter
   =========================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = "true";
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute("data-target"), 10);
  const duration = 2000;
  const stepTime = 30;
  const steps = duration / stepTime;
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, stepTime);
}

/* ===========================
   Quiz
   =========================== */
const quizQuestions = [
  {
    question: "In what year was NBC founded?",
    options: ["1920", "1926", "1932", "1941"],
    correct: 1
  },
  {
    question: "What was the original purpose of the NBC Peacock logo?",
    options: [
      "To represent NBC's six divisions",
      "To promote color television broadcasts",
      "To honor NBC's founder",
      "To symbolize national pride"
    ],
    correct: 1
  },
  {
    question: "How much did Comcast pay to acquire Sky in 2018?",
    options: ["$15 billion", "$22 billion", "$39 billion", "$45 billion"],
    correct: 2
  },
  {
    question: "Which Universal film is credited with inventing the 'summer blockbuster'?",
    options: ["E.T.", "Jurassic Park", "Back to the Future", "Jaws"],
    correct: 3
  },
  {
    question: "When did Peacock officially launch to the public?",
    options: ["March 2019", "July 2020", "November 2020", "January 2021"],
    correct: 1
  },
  {
    question: "Which countries does Sky operate in? (Select the best answer)",
    options: [
      "UK, France, Spain",
      "UK, Ireland, Germany, Austria, Italy, Switzerland",
      "UK, Ireland, Netherlands",
      "UK, Germany, Poland"
    ],
    correct: 1
  },
  {
    question: "What merger in 2004 created NBCUniversal?",
    options: [
      "NBC + Walt Disney Studios",
      "NBC + Vivendi Universal Entertainment",
      "NBC + 21st Century Fox",
      "NBC + Sony Pictures"
    ],
    correct: 1
  },
  {
    question: "Which show is the #1 most-streamed title on Peacock?",
    options: ["Friends", "Parks and Recreation", "The Office", "Saturday Night Live"],
    correct: 2
  }
];

let currentQuestion = 0;
let score = 0;
let quizAnswered = false;

function initQuiz() {
  renderQuestion();
  document.getElementById("restartQuiz").addEventListener("click", restartQuiz);
}

function renderQuestion() {
  const quizCard = document.getElementById("quizCard");
  const questionCounter = document.getElementById("questionCounter");
  const quizProgress = document.getElementById("quizProgress");
  const q = quizQuestions[currentQuestion];

  questionCounter.textContent = `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
  quizProgress.style.width = `${((currentQuestion) / quizQuestions.length) * 100}%`;

  quizCard.innerHTML = `
    <div class="quiz-question">${q.question}</div>
    <div class="quiz-options">
      ${q.options
        .map(
          (opt, i) =>
            `<button class="quiz-option" data-index="${i}">${opt}</button>`
        )
        .join("")}
    </div>
    <button class="quiz-next-btn" id="nextQuestion">Next Question</button>
  `;

  quizAnswered = false;

  quizCard.querySelectorAll(".quiz-option").forEach((optBtn) => {
    optBtn.addEventListener("click", () => handleAnswer(optBtn));
  });

  document.getElementById("nextQuestion").addEventListener("click", nextQuestion);
}

function handleAnswer(selectedBtn) {
  if (quizAnswered) return;
  quizAnswered = true;

  const selectedIndex = parseInt(selectedBtn.getAttribute("data-index"), 10);
  const correctIndex = quizQuestions[currentQuestion].correct;
  const options = document.querySelectorAll(".quiz-option");

  options.forEach((opt) => {
    const idx = parseInt(opt.getAttribute("data-index"), 10);
    if (idx === correctIndex) {
      opt.classList.add("correct");
    } else if (idx === selectedIndex && selectedIndex !== correctIndex) {
      opt.classList.add("wrong");
    }
    opt.style.pointerEvents = "none";
  });

  if (selectedIndex === correctIndex) {
    score++;
  }

  const nextBtn = document.getElementById("nextQuestion");
  nextBtn.classList.add("visible");
  if (currentQuestion === quizQuestions.length - 1) {
    nextBtn.textContent = "See Results";
  }
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= quizQuestions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults() {
  const quizCard = document.getElementById("quizCard");
  const quizResult = document.getElementById("quizResult");
  const resultScore = document.getElementById("resultScore");
  const resultMessage = document.getElementById("resultMessage");
  const questionCounter = document.getElementById("questionCounter");
  const quizProgress = document.getElementById("quizProgress");

  quizCard.hidden = true;
  quizResult.hidden = false;
  questionCounter.textContent = "Quiz Complete!";
  quizProgress.style.width = "100%";

  resultScore.textContent = `${score} / ${quizQuestions.length}`;

  const percentage = (score / quizQuestions.length) * 100;
  if (percentage === 100) {
    resultMessage.textContent = "Perfect score! You're a true NBCU historian!";
  } else if (percentage >= 75) {
    resultMessage.textContent = "Great job! You really know your media history!";
  } else if (percentage >= 50) {
    resultMessage.textContent = "Not bad! Scroll up to learn more about NBCU's history.";
  } else {
    resultMessage.textContent = "Keep exploring! There's a lot of fascinating history above.";
  }
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  document.getElementById("quizCard").hidden = false;
  document.getElementById("quizResult").hidden = true;
  renderQuestion();
}

/* ===========================
   Smooth Scroll
   =========================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = document.getElementById("navbar").offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    });
  });
}
