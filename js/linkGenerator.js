function initLinkGenerator() {
    const isRoot = window.location.pathname === "/" || window.location.pathname === "/St-Johns/";
    const basePath = isRoot ? "" : "/";

    const links = {
        "link-home": basePath,
        "link-church": basePath + "church/",
        "link-community": basePath + "community/",
        "link-whats-on": basePath + "whats-on/",
        "link-news": basePath + "news/",
        "link-contact": basePath + "contact/"
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
}  