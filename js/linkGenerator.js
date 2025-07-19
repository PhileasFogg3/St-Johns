function initLinkGenerator() {
    const isRoot = window.location.pathname == "/" || window.location.pathname == "/St-Johns/";
    const isHostname = window.location.hostname != "localhost";
    const basePath = isRoot ? "./" : "../";
    const basePathFinal = isHostname ? basePath + "St-Johns/" : basePath;

    const links = {
        "link-home": basePathFinal,
        "link-church": basePathFinal + "church/",
        "link-community": basePathFinal + "community/",
        "link-whats-on": basePathFinal + "whats-on/",
        "link-news": basePathFinal + "news/",
        "link-contact": basePathFinal + "contact/",
    };

    console.log(links);

    for (const [id, relativePath] of Object.entries(links)) {
        const el = document.getElementById(id);
        if (el) {
        try {
            // Use URL() safely with origin to ensure valid absolute URL
            const fullUrl = new URL(relativePath, window.location.origin);
            el.href = fullUrl.href;
        } catch (e) {
            console.error(`Invalid URL for ${id}:`, relativePath, e);
        }
        } else {
        console.warn(`Element with ID "${id}" not found`);
        }
    }
  // === Image src updates ===
    const images = {
        "link-facebook-png": basePathFinal + "resources/img/icons/facebook.png",
        "link-github-png": basePathFinal + "resources/img/icons/github.png",
        "link-youtube-png": basePathFinal + "resources/img/icons/youtube.png",
        "link-favicon-png": basePathFinal + "resources/img/favicon.png",
    };

    for (const [id, relativePath] of Object.entries(images)) {
        const el = document.getElementById(id);
        if (el) {
            try {
            const fullUrl = new URL(relativePath, window.location.origin);
            el.src = fullUrl.href;
            } catch (e) {
            console.error(`Invalid image src for ${id}:`, relativePath, e);
            }
        } else {
            console.warn(`Image with ID "${id}" not found`);
        }
    }
}