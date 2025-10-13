const modal = document.getElementById('miniMLModal');
const openBtn = document.getElementById('openMinimlBtn');
const closeBtn = document.getElementById('closeModalBtn');
const contentDiv = document.getElementById('modalContent');

openBtn.addEventListener('click', async () => {
    modal.style.display = 'flex';
    contentDiv.innerHTML = 'Loading...';

    try {
    const res = await fetch('/api/miniml');
    const data = await res.json();

    // Build HTML from API data
    let html = '';
    data.forEach(group => {
        html += `
        <div class="price-section">
            <div class="price-title">${group.price}</div>
            <ul>
            ${group.items.map(item => `
                <li>
                <strong>${item.product}</strong>
                <div class="flavours">${item.flavours.join(', ')}</div>
                </li>
            `).join('')}
            </ul>
        </div>
        `;
    });

    contentDiv.innerHTML = html;
    } catch (err) {
    console.error('Error loading MiniML data:', err);
    contentDiv.innerHTML = '<p>Failed to load data.</p>';
    }
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});