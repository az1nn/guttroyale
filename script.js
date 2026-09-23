// GUTT ROYALE — interactive landing page
const eventDate = new Date("2026-11-27T20:00:00-03:00").getTime();
const countdownIds = ["days", "hours", "minutes", "seconds"];
const countdownNodes = countdownIds.map((id) => document.getElementById(id));

function renderCountdown(values) {
  countdownNodes.forEach((node, index) => {
    if (node) node.textContent = String(values[index]).padStart(2, "0");
  });
}

function updateCountdown() {
  const distance = eventDate - Date.now();

  if (distance <= 0) {
    renderCountdown([0, 0, 0, 0]);
    return false;
  }

  renderCountdown([
    Math.floor(distance / 86400000),
    Math.floor((distance / 3600000) % 24),
    Math.floor((distance / 60000) % 60),
    Math.floor((distance / 1000) % 60),
  ]);

  return true;
}

if (countdownNodes.some(Boolean)) {
  updateCountdown();
  const timer = window.setInterval(() => {
    if (!updateCountdown()) window.clearInterval(timer);
  }, 1000);
}

const revealTargets = document.querySelectorAll(".reveal, .artist, .experience-card, .partner, .section-heading, .about-text, .map-card, .ticket-box, .production-row, .faq-list details, [data-floating-deck]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    observer.observe(el);
  });
}

const header = document.querySelector("[data-floating-header]");
if (header) {
  let headerFrame = 0;

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 48);
    headerFrame = 0;
  };

  const requestHeaderSync = () => {
    if (!headerFrame) headerFrame = requestAnimationFrame(syncHeader);
  };

  syncHeader();
  window.addEventListener("scroll", requestHeaderSync, { passive: true });
}


const mobileMenu = document.querySelector(".mobile-menu");
if (mobileMenu) {
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => mobileMenu.removeAttribute("open"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") mobileMenu.removeAttribute("open");
  });
}


const professionalHero = document.querySelector("[data-hero]");
if (professionalHero && !prefersReducedMotion && window.matchMedia("(pointer:fine)").matches) {
  const current = { x: 0, y: 0, copyX: 0, copyY: 0 };
  const target = { x: 0, y: 0, copyX: 0, copyY: 0 };
  let heroFrame = 0;

  const renderHeroMotion = () => {
    const ease = 0.075;
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    current.copyX += (target.copyX - current.copyX) * ease;
    current.copyY += (target.copyY - current.copyY) * ease;

    professionalHero.style.setProperty("--hero-x", `${current.x.toFixed(2)}px`);
    professionalHero.style.setProperty("--hero-y", `${current.y.toFixed(2)}px`);
    professionalHero.style.setProperty("--hero-copy-x", `${current.copyX.toFixed(2)}px`);
    professionalHero.style.setProperty("--hero-copy-y", `${current.copyY.toFixed(2)}px`);

    const moving =
      Math.abs(target.x - current.x) > 0.05 ||
      Math.abs(target.y - current.y) > 0.05 ||
      Math.abs(target.copyX - current.copyX) > 0.05 ||
      Math.abs(target.copyY - current.copyY) > 0.05;

    heroFrame = moving ? requestAnimationFrame(renderHeroMotion) : 0;
  };

  const ensureHeroFrame = () => {
    if (!heroFrame) heroFrame = requestAnimationFrame(renderHeroMotion);
  };

  const moveHero = (event) => {
    const rect = professionalHero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    target.x = x * -4.5;
    target.y = y * -3.2;
    target.copyX = x * 2.2;
    target.copyY = y * 1.6;
    ensureHeroFrame();
  };

  const resetHero = () => {
    target.x = 0;
    target.y = 0;
    target.copyX = 0;
    target.copyY = 0;
    ensureHeroFrame();
  };

  professionalHero.addEventListener("pointermove", moveHero, { passive: true });
  professionalHero.addEventListener("pointerleave", resetHero, { passive: true });
}


const desktopNavLinks = [...document.querySelectorAll("[data-section-nav] a[href^='#']")];
const navSections = desktopNavLinks
  .map((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    return target ? { link, target } : null;
  })
  .filter(Boolean);

if (navSections.length && "IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navSections.forEach(({ link, target }) => {
      const active = target === visible.target;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }, {
    rootMargin: "-32% 0px -55% 0px",
    threshold: [0.05, 0.2, 0.45],
  });

  navSections.forEach(({ target }) => navObserver.observe(target));
}
