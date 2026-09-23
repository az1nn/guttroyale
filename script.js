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

const revealTargets = document.querySelectorAll(".reveal, .artist, .experience-card, .partner");
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

  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

const header = document.querySelector(".site-header");
if (header) {
  const syncHeader = () => {
    header.style.background = window.scrollY > 40
      ? "rgba(5,5,5,.92)"
      : "rgba(5,5,5,.72)";
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
