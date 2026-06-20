let pendingScroll = false;
function handleNavbar(scrollY) {
  if (pendingScroll) return;
  pendingScroll = true;
  requestAnimationFrame(() => {
    const navbar = document.querySelector(".navbar");
    if (navbar) navbar.classList.toggle("scrolled", scrollY > 80);
    pendingScroll = false;
  });
}

function toggleMenu() {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!hamburger || !mobileMenu) return;
  const isOpening = !mobileMenu.classList.contains("active");

  hamburger.classList.toggle("active");
  mobileMenu.classList.toggle("active");

  if (isOpening) {
    document.body.style.overflow = "hidden";
    const firstLink = mobileMenu.querySelector("nav a");
    if (firstLink) firstLink.focus();
  } else {
    document.body.style.overflow = "";
  }
}

function closeMenu() {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!hamburger || !mobileMenu) return;
  if (mobileMenu.classList.contains("active")) {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function toggleFAQ(el) {
  if (!el) return;
  const item = el.closest(".faq-item");
  if (!item) return;
  const isActive = item.classList.contains("active");
  document.querySelectorAll(".faq-item").forEach((other) => {
    other.classList.remove("active");
    const q = other.querySelector(".faq-question");
    if (q) q.setAttribute("aria-expanded", "false");
  });
  if (!isActive) {
    item.classList.add("active");
    const q = item.querySelector(".faq-question");
    if (q) q.setAttribute("aria-expanded", "true");
  }
}

function downloadApp() {
  window.open(
    "https://apps.apple.com/us/app/%D8%AF%D8%B1%D8%A8%D9%8A%D9%86%D9%8A/id6758008373",
    "_blank",
    "noopener,noreferrer",
  );
}

// Copyright year
function updateCopyrightYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Stats counter animation
function animateCounter(counter) {
  if (counter.dataset.animated) return;
  counter.dataset.animated = "true";
  const target = parseFloat(counter.dataset.target);
  const suffix = counter.dataset.suffix || "";
  const isDecimal = target % 1 !== 0;
  const duration = 1600;
  const step = target / (duration / 16);
  let current = 0;
  const update = () => {
    current += step;
    if (current >= target) {
      if (isDecimal) {
        counter.textContent =
          target.toLocaleString("ar-SA", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }) + suffix;
      } else {
        counter.textContent = target.toLocaleString("ar-SA") + suffix;
      }
      return;
    }
    if (isDecimal) {
      counter.textContent =
        current.toLocaleString("ar-SA", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }) + suffix;
    } else {
      counter.textContent =
        Math.floor(current).toLocaleString("ar-SA") + suffix;
    }
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

document.addEventListener("DOMContentLoaded", () => {
  // Read geometric properties FIRST, before any DOM writes (avoids forced reflow)
  const initialScrollY = window.scrollY;

  // ── All DOM writes are batched after reads ──

  updateCopyrightYear();

  // Exclude privacy-content from scroll reveal so it's visible immediately
  document.querySelectorAll("section:not(.hero):not(.hero-small):not(.privacy-content), .stats-bar").forEach((el) => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });

  // ── Scroll reveal ──
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
  });

  // ── Stats counter trigger ──
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(".stat-number[data-target]").forEach((counter) => {
    counterObserver.observe(counter);
  });

  // ── QR & contact animation ──
  const qrObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("qr-visible");
          entry.target.classList.remove("qr-hidden");
        }
      });
    },
    { threshold: 0.2 },
  );

  document.querySelectorAll(".qr-card, .contact-item").forEach((el) => {
    el.classList.add("qr-hidden");
    qrObserver.observe(el);
  });

  // ── Navbar scroll listener (avoid forced reflow: read scrollY outside rAF) ──
  let ticking = false;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        handleNavbar(y);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  handleNavbar(initialScrollY);

  // ── FAQ click & keyboard support ──
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.addEventListener("click", () => toggleFAQ(q));
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFAQ(q);
      }
    });
  });

  // ── Refactor inline onclick to event listeners ──
  // Menu toggle: hamburger button
  document.querySelector(".hamburger")?.addEventListener("click", toggleMenu);

  // Mobile menu links: close menu on click
  document.querySelectorAll("#mobileMenu nav a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Mobile CTA button
  document.querySelector("#mobileMenu .cta")?.addEventListener("click", () => {
    downloadApp();
    closeMenu();
  });

  // Desktop CTA
  document.querySelector(".desktop-cta")?.addEventListener("click", downloadApp);

  // Hero primary CTA
  document.querySelectorAll(".cta-primary:not(.big)").forEach((btn) => {
    btn.addEventListener("click", downloadApp);
  });

  // Hero secondary CTA (scroll to video)
  document.querySelector(".cta-secondary")?.addEventListener("click", () => {
    document.getElementById("video-section")?.scrollIntoView({ behavior: "smooth" });
  });

  // Course buttons
  document.querySelectorAll(".btn-course").forEach((btn) => {
    btn.addEventListener("click", downloadApp);
  });

  // CTA section button (big)
  document.querySelectorAll(".cta-section .cta-primary.big").forEach((btn) => {
    // Privacy page uses data-href to navigate back to index
    if (btn.dataset.href) {
      btn.addEventListener("click", () => {
        window.location.href = btn.dataset.href;
      });
    } else {
      btn.addEventListener("click", downloadApp);
    }
  });

  // Escape key to close mobile menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Keyboard trap in mobile menu (Tab cycling)
  const menuEl = document.getElementById("mobileMenu");
  menuEl?.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusable = menuEl.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
});
