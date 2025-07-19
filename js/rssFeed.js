document.addEventListener("DOMContentLoaded", () => {
  const feedContainer = document.getElementById("rss-feed");
  if (!feedContainer) return;

  const RSS_URL = "https://www.achurchnearyou.com/church/16065/news/feed/";

  fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.items || !data.items.length) {
        feedContainer.innerHTML = "<p>No news found.</p>";
        return;
      }

      const itemsHTML = data.items.slice(0, 5).map(item => {
        // Parse image from description
        let imageHTML = "";
        if (item.description) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(item.description, "text/html");
          const img = doc.querySelector("img");
          if (img) {
            imageHTML = `<img src="${img.src}" alt="${item.title}" />`;
          }
        }

        return `
          <div class="news-item">
            ${imageHTML}
            <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
            ${item.pubDate && !isNaN(new Date(item.pubDate)) ? `<p><em>${new Date(item.pubDate).toLocaleDateString()}</em></p>` : ""}
            <p>${item.description}</p>
          </div>
        `;
      }).join("");

      feedContainer.innerHTML = itemsHTML;
    })
    .catch(error => {
      console.error("RSS fetch error:", error);
      feedContainer.innerHTML = "<p>Failed to load news feed.</p>";
    });
});