const body = document.body;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const sectionNavLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const revealItems = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll(".filter-chip");
const projectCards = document.querySelectorAll(".work-card");
const faqButtons = document.querySelectorAll(".faq-question");
const contactForm = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");
const yearTarget = document.getElementById("year");
const progressBar = document.querySelector(".scroll-progress span");
const tiltCards = document.querySelectorAll("[data-tilt]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(pointer: fine)");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const closeNav = () => {
  if (!header || !navToggle) {
    return;
  }

  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("nav-open");
};

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("nav-open", isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});

const updateScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const scrollRange =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? (window.scrollY / scrollRange) * 100 : 0;

  progressBar.style.width = `${progress}%`;
};

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -60px 0px"
    }
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(
          `.site-nav a[href="#${entry.target.id}"]`
        );

        if (!link || !entry.isIntersecting) {
          return;
        }

        sectionNavLinks.forEach((navLink) => {
          navLink.classList.remove("is-active");
        });
        link.classList.add("is-active");
      });
    },
    {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0
    }
  );

  document.querySelectorAll("main section[id]").forEach((section) => {
    if (section.id !== "top") {
      sectionObserver.observe(section);
    }
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((chip) => {
      const isActive = chip === button;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      const matches = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const shouldExpand = button.getAttribute("aria-expanded") !== "true";

    faqButtons.forEach((otherButton) => {
      const otherAnswer = otherButton.nextElementSibling;
      otherButton.setAttribute("aria-expanded", "false");

      if (otherAnswer) {
        otherAnswer.hidden = true;
      }
    });

    button.setAttribute("aria-expanded", String(shouldExpand));
    if (answer) {
      answer.hidden = !shouldExpand;
    }
  });
});

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      formNote.textContent = "Please complete the required fields first.";
      return;
    }

    const formData = new FormData(contactForm);
    const recipient =
      contactForm.dataset.recipient || "hello@seguinnewhomeframing.ca";
    const subject = `Project inquiry: ${
      formData.get("projectType") || "Seguin New Home Framing"
    }`;
    const bodyLines = [
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Phone: ${formData.get("phone") || ""}`,
      `Project type: ${formData.get("projectType") || ""}`,
      `Build location: ${formData.get("location") || ""}`,
      `Preferred timeline: ${formData.get("timeline") || ""}`,
      "",
      "Project details:",
      `${formData.get("details") || ""}`
    ];

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    formNote.textContent =
      "Your email app should open with your project brief filled in.";
    window.location.href = mailto;
  });
}

const resetTilt = (card) => {
  card.style.setProperty("--tilt-x", "0deg");
  card.style.setProperty("--tilt-y", "0deg");
};

if (finePointerQuery.matches && !reduceMotionQuery.matches) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-y", `${px * 8}deg`);
      card.style.setProperty("--tilt-x", `${py * -8}deg`);
    });

    card.addEventListener("pointerleave", () => {
      resetTilt(card);
    });

    card.addEventListener("pointerup", () => {
      resetTilt(card);
    });
  });
} else {
  tiltCards.forEach((card) => {
    resetTilt(card);
  });
}
