let pendingScroll = false;
function handleNavbar(scrollY) {
  if (pendingScroll) return;
  pendingScroll = true;
  requestAnimationFrame(() => {
    const n = document.querySelector(".navbar");
    if (n) n.classList.toggle("scrolled", scrollY > 80);
    pendingScroll = false;
  });
}
function toggleMenu() {
  const h = document.querySelector(".hamburger"), m = document.getElementById("mobileMenu");
  if (!h || !m) return;
  const o = !m.classList.contains("active");
  h.classList.toggle("active"), m.classList.toggle("active");
  if (o) {
    document.body.style.overflow = "hidden";
    const f = m.querySelector("nav a");
    if (f) f.focus();
  } else document.body.style.overflow = "";
}
function closeMenu() {
  const h = document.querySelector(".hamburger"), m = document.getElementById("mobileMenu");
  if (!h || !m) return;
  if (m.classList.contains("active")) {
    h.classList.remove("active"), m.classList.remove("active");
    document.body.style.overflow = "";
  }
}
function toggleFAQ(el) {
  if (!el) return;
  const item = el.closest(".faq-item");
  if (!item) return;
  const isActive = item.classList.contains("active");
  document.querySelectorAll(".faq-item").forEach((o) => {
    o.classList.remove("active");
    const q = o.querySelector(".faq-question");
    if (q) q.setAttribute("aria-expanded", "false");
  });
  if (!isActive) {
    item.classList.add("active");
    const q = item.querySelector(".faq-question");
    if (q) q.setAttribute("aria-expanded", "true");
  }
}
function downloadApp() {
  window.open("https://apps.apple.com/us/app/%D8%AF%D8%B1%D8%A8%D9%8A%D9%86%D9%8A/id6758008373", "_blank", "noopener,noreferrer");
}
function updateCopyrightYear() {
  const e = document.getElementById("current-year");
  if (e) e.textContent = new Date().getFullYear();
}
function animateCounter(c) {
  if (c.dataset.animated) return;
  c.dataset.animated = "true";
  const target = parseFloat(c.dataset.target), suffix = c.dataset.suffix || "", isDecimal = target % 1 !== 0, step = target / (1600 / 16);
  let current = 0;
  const update = () => {
    current += step;
    if (current >= target) {
      c.textContent = (isDecimal ? target.toLocaleString("ar-SA", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : target.toLocaleString("ar-SA")) + suffix;
      return;
    }
    c.textContent = (isDecimal ? current.toLocaleString("ar-SA", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.floor(current).toLocaleString("ar-SA")) + suffix;
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
function runWhenIdle(fn) {
  if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 2e3 });
  else setTimeout(fn, 1);
}
document.addEventListener("DOMContentLoaded", () => {
  updateCopyrightYear();
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.addEventListener("click", () => toggleFAQ(q));
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleFAQ(q); }
    });
  });
  document.querySelector(".hamburger")?.addEventListener("click", toggleMenu);
  document.querySelectorAll("#mobileMenu nav a").forEach((l) => l.addEventListener("click", closeMenu));
  document.querySelector("#mobileMenu .cta")?.addEventListener("click", () => { downloadApp(); closeMenu(); });
  document.querySelector(".desktop-cta")?.addEventListener("click", downloadApp);
  document.querySelectorAll(".cta-primary:not(.big)").forEach((b) => b.addEventListener("click", downloadApp));
  document.querySelector(".cta-secondary")?.addEventListener("click", () => document.getElementById("video-section")?.scrollIntoView({ behavior: "smooth" }));
  document.querySelectorAll(".btn-course").forEach((b) => b.addEventListener("click", downloadApp));
  document.querySelectorAll(".cta-section .cta-primary.big").forEach((b) => {
    if (b.dataset.href) b.addEventListener("click", () => { window.location.href = b.dataset.href; });
    else b.addEventListener("click", downloadApp);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  const menuEl = document.getElementById("mobileMenu");
  menuEl?.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = menuEl.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  runWhenIdle(() => {
    const startY = window.scrollY;
    document.querySelectorAll("section:not(.hero):not(.hero-small):not(.privacy-content), .stats-bar").forEach((el) => {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
    });
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));
    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(".stat-number[data-target]").forEach((c) => counterObs.observe(c));
    const qrObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("qr-visible"); e.target.classList.remove("qr-hidden"); } });
    }, { threshold: 0.2 });
    document.querySelectorAll(".qr-card, .contact-item").forEach((el) => { el.classList.add("qr-hidden"); qrObs.observe(el); });
    let ticking = false;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => { handleNavbar(y); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    handleNavbar(startY);
  });
});
