function initGroups() {
    const groupButtonsContainer = document.getElementById('communityGroupButtons');
    const modal = document.getElementById('groupModal');
    const closeModal = document.querySelector('.closeGroup');

    const modalTitle = document.getElementById('groupModalTitle');
    const modalIntro = document.getElementById('groupModalIntro');
    const modalEmail = document.getElementById('groupModalEmail');
    const modalPhone = document.getElementById('groupModalPhone');
    const modalSubs = document.getElementById('groupModalSubs');
    const modalMeet = document.getElementById('groupModalMeetingTime');
    const modalSlideshow = document.getElementById('modalImageSlideshow');

    if (!groupButtonsContainer) return;

    // Close modal handler
    if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
    if (window && modal) {
        window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        };
    }

    function createGroupButton(group) {
        const btn = document.createElement('button');
        btn.classList.add('event-btn'); // reuse same style as calendar
        btn.textContent = group.name;
        btn.onclick = () => openGroupModal(group);
        return btn;
    }

    function openGroupModal(group) {
        modalTitle.textContent = group.Header || group.name;
        modalIntro.textContent = group.Introduction || '';
        modalEmail.innerHTML = group.ContactEmail
        ? `<a href="mailto:${group.ContactEmail}">${group.ContactEmail}</a>`
        : '';
        modalPhone.innerHTML = group.ContactPhoneNumber
        ? `<a href="tel:${group.ContactPhoneNumber.replace(/\\s+/g, '')}">${group.ContactPhoneNumber}</a>`
        : '';
        modalSubs.textContent = group.SubsCost || '';

        modalMeet.textContent = group.MeetingTime || '';

        // Build slideshow
        modalSlideshow.innerHTML = '';
        if (group.images && group.images.length > 0) {
        group.images.forEach(url => {
            if (!url) return;
            const img = document.createElement('img');
            img.src = url;
            img.alt = group.name;
            img.style.maxWidth = '100%';
            modalSlideshow.appendChild(img);
        });
        }

        createImageSlideshow(group.images, 'modalImageSlideshow');

        modal.style.display = 'block';
    }

    function createImageSlideshow(urls, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if (!urls.length) return container.textContent = 'No images available.';
      
        let index = 0;
        const img = document.createElement('img');
        img.src = urls[index];
        img.style.maxWidth = '100%';
      
        const prev = document.createElement('button');
        prev.textContent = '←';
        prev.onclick = () => img.src = urls[(index = (index - 1 + urls.length) % urls.length)];
      
        const next = document.createElement('button');
        next.textContent = '→';
        next.onclick = () => img.src = urls[(index = (index + 1) % urls.length)];
      
        container.append(prev, img, next);
      }

    // Fetch group data from server
    fetch('/api/groups')
        .then(res => res.json())
        .then(groups => {
        groupButtonsContainer.innerHTML = '';
        groups.forEach(group => {
            const btn = createGroupButton(group);
            groupButtonsContainer.appendChild(btn);
        });
        })
        .catch(err => {
        console.error('Error loading groups:', err);
        groupButtonsContainer.innerHTML = '<p>Unable to load groups.</p>';
        });
}
  
initGroups();
  