document.addEventListener("DOMContentLoaded", () => {
  const feedContainer = document.getElementById("rss-feed");
  const paginationContainer = document.getElementById("pagination-controls");
  if (!feedContainer || !paginationContainer) return;

  const RSS_URL = "https://www.achurchnearyou.com/church/16065/news/feed/";
  const ITEMS_PER_PAGE = 4;
  let currentPage = 1;
  let newsItems = [];

  function renderPage(page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToDisplay = newsItems.slice(start, end);

    const itemsHTML = itemsToDisplay.map(item => {
      let imageHTML = "";
      let plainTextDescription = item.description;
      if (item.description) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(item.description, "text/html");
        const img = doc.querySelector("img");
        if (img) {
          imageHTML = `<img src="${img.src}" alt="${item.title}" class="news-image" />`;
        }
        plainTextDescription = doc.body.textContent || item.description;
      }

      return `
        <div class="news-item">
          ${imageHTML}
          <h3>${item.title}</h3>
          ${item.pubDate && !isNaN(new Date(item.pubDate)) ? `<p><em>${new Date(item.pubDate).toLocaleDateString()}</em></p>` : ""}
          <p>${plainTextDescription}</p>
          <a href="${item.link}" target="_blank" class="read-more">Read full article</a>
        </div>
      `;
    }).join("");

    feedContainer.innerHTML = itemsHTML;
    renderPaginationControls(page);
  }

  function renderPaginationControls(current) {
    const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let controlsHTML = "";

    if (current > 1) {
      controlsHTML += `<button class="page-btn" data-page="${current - 1}">Previous</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      controlsHTML += `<button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (current < totalPages) {
      controlsHTML += `<button class="page-btn" data-page="${current + 1}">Next</button>`;
    }

    paginationContainer.innerHTML = controlsHTML;

    document.querySelectorAll(".page-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const newPage = parseInt(e.target.dataset.page, 10);
        currentPage = newPage;
        renderPage(currentPage);
      });
    });
  }

  fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.items || !data.items.length) {
        feedContainer.innerHTML = "<p>No news found.</p>";
        return;
      }

      newsItems = data.items;
      renderPage(currentPage);
    })
    .catch(error => {
      console.error("RSS fetch error:", error);
      feedContainer.innerHTML = "<p>Failed to load news feed.</p>";
    });
});