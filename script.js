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
  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 48);
  };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
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
  const heroCopy = professionalHero.querySelector("[data-hero-copy]");

  const moveHero = (event) => {
    const rect = professionalHero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5);
    const y = ((event.clientY - rect.top) / rect.height - 0.5);

    professionalHero.style.setProperty("--hero-x", `${x * -8}px`);
    professionalHero.style.setProperty("--hero-y", `${y * -6}px`);
    professionalHero.style.setProperty("--hero-copy-x", `${x * 4}px`);
    professionalHero.style.setProperty("--hero-copy-y", `${y * 3}px`);
  };

  const resetHero = () => {
    professionalHero.style.setProperty("--hero-x", "0px");
    professionalHero.style.setProperty("--hero-y", "0px");
    professionalHero.style.setProperty("--hero-copy-x", "0px");
    professionalHero.style.setProperty("--hero-copy-y", "0px");
  };

  professionalHero.addEventListener("pointermove", moveHero, { passive: true });
  professionalHero.addEventListener("pointerleave", resetHero, { passive: true });

  if (heroCopy) {
    requestAnimationFrame(() => heroCopy.classList.add("is-ready"));
  }
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

const interactiveCards = document.querySelectorAll(".artist, .experience-card, .partner, .ticket-box");
if (!prefersReducedMotion && window.matchMedia("(pointer:fine)").matches) {
  interactiveCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.setProperty("--card-x", `${x * 2.5}px`);
      card.style.setProperty("--card-y", `${y * 2.5}px`);
    }, { passive:true });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--card-x");
      card.style.removeProperty("--card-y");
    }, { passive:true });
  });
}
