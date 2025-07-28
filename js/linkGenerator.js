function initLinkGenerator() {
  const isRoot = window.location.pathname === "/" || window.location.pathname === "/stjohns/";
  const isHostname = window.location.hostname !== "localhost";
  const basePath = isRoot ? "./" : "../";
  const basePathFinal = isHostname ? basePath : basePath;

  const links = {
    "link-home": basePathFinal,
    "link-church": basePathFinal + "church/",
    "link-community": basePathFinal + "community/",
    "link-whats-on": basePathFinal + "whats-on/",
    "link-news": basePathFinal + "news/",
    "link-safeguarding": basePathFinal + "safeguarding/",
    "link-contact": basePathFinal + "contact/",
  };

  for (const [id, relativePath] of Object.entries(links)) {
    const el = document.getElementById(id);
    if (el) {
      try {
        const fullUrl = new URL(relativePath, window.location.origin);
        el.href = fullUrl.href;
      } catch (e) {
        console.error(`Invalid URL for ${id}:`, relativePath, e);
      }
    } else {
      console.warn(`Element with ID "${id}" not found`);
    }
  }

  // === Image src updates using class selectors ===
  const images = {
    "link-facebook-png": basePathFinal + "resources/img/icons/facebook.png",
    "link-github-png": basePathFinal + "resources/img/icons/github.png",
    "link-youtube-png": basePathFinal + "resources/img/icons/youtube.png",
    "link-favicon-png": basePathFinal + "resources/img/favicon.png",
  };

  for (const [className, relativePath] of Object.entries(images)) {
    const imageElements = document.querySelectorAll(`.${className}`);
    if (imageElements.length > 0) {
      try {
        const fullUrl = new URL(relativePath, window.location.origin).href;
        imageElements.forEach((img) => {
          img.src = fullUrl;
        });
      } catch (e) {
        console.error(`Invalid image src for ${className}:`, relativePath, e);
      }
    } else {
      console.warn(`No image elements found with class "${className}"`);
    }
  }
}