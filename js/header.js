console.log(window.location.pathname);
if (window.location.pathname == "/" || window.location.pathname == "/St-Johns/") {

  fetch("html/header.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("header-placeholder").innerHTML = html;

    setupTypewriterHero();
    setupMobileNavToggle();
    initLinkGenerator();
    highlightCurrentPage();
    displayPageName();

  });

} else {

  fetch("../html/header.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("header-placeholder").innerHTML = html;

    setupTypewriterHero();
    setupMobileNavToggle();
    initLinkGenerator();
    highlightCurrentPage();
    displayPageName();

  });

}


function setupTypewriterHero() {
    const texts = ["Church,", "Community,", "Family,", "St. Johns."];
    const heroTextsContainer = document.querySelector(".hero-texts");
    if (!heroTextsContainer) return;

    const displaySpan = document.createElement("span");
    displaySpan.classList.add("hero-text");
    heroTextsContainer.innerHTML = "";
    heroTextsContainer.appendChild(displaySpan);

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typingSpeed = 100;          // typing speed in ms per char
    const deletingSpeed = 150;        // deleting speed in ms per char
    const pauseAfterTyping = 2000;    // pause after fully typed
    const pauseAfterDeleting = 1000;  // extra pause before next word starts

    function type() {
        const currentText = texts[textIndex];

        if (!isDeleting) {
        // Typing forward
        displaySpan.textContent = currentText.substring(0, charIndex);
        charIndex++;

        if (charIndex > currentText.length) {
            // Finished typing, pause then start deleting
            setTimeout(() => {
            isDeleting = true;
            charIndex = currentText.length - 1;
            type();
            }, pauseAfterTyping);
        } else {
            setTimeout(type, typingSpeed);
        }
        } else {
        // Deleting backward
        displaySpan.textContent = currentText.substring(0, charIndex);
        charIndex--;

        if (charIndex < 0) {
            // Finished deleting, pause then move to next text
            setTimeout(() => {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            charIndex = 0;
            type();
            }, pauseAfterDeleting);
        } else {
            setTimeout(type, deletingSpeed);
        }
        }
    }

    type();

}   

function setupMobileNavToggle() {
  const navToggle = document.querySelector('.nav-toggle');
  const navContainer = document.querySelector('.nav-container');
  if (navToggle && navContainer) {
    navToggle.addEventListener('click', () => {
      navContainer.classList.toggle('open');
    });
  }
}

function highlightCurrentPage() {
  const currentPath = window.location.pathname.replace(/\/$/, "");
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    try {
      const linkPath = new URL(href, window.location.origin).pathname.replace(/\/$/, "");
      if (linkPath === currentPath) {
        link.classList.add("active");
      }
    } catch (e) {
      console.warn("Invalid href for URL():", href);
    }
  });
}

function displayPageName() {
  const pageNameContainer = document.querySelector(".page-name");
  if (!pageNameContainer) return;

  // Known slug-to-title mappings
  const pageMap = {
    "whats-on": "What's On",
    "contact": "Contact",
    "community": "Community",
    "church": "Church",
    "news": "News",
    "home": "St John's Church and Community Centre",
    "thank-you": "Thank You!",
    "safeguarding": "Safeguarding Policy"
  };

  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean);
  let slug = segments[segments.length - 1] || "home";

  // Remove file extension if any
  slug = slug.replace(/\.[^/.]+$/, "");

  // Convert hyphens to spaces and capitalize each word
  const friendlyName = pageMap[slug] || slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  pageNameContainer.innerHTML = `<h1>${friendlyName}</h1>`;
}