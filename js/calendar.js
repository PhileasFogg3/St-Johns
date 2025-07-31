const knownEventIcons = {
  'Tea with Santa': '../resources/img/events/tws.png',
};

function initCalendars() {
  const calendars = [
    {
      id: '1caeeeca11bfb78e255c5f8d2952c8d659b3e07ded752c560c52bda69ebb4b0d@group.calendar.google.com',
      name: 'Church Services',
    },
    {
      id: '603332964d6927f504aa328ec55b14aed51ac2d1f42fab0dd9f98297f3cb1652@group.calendar.google.com',
      name: 'Community Events',
    }
  ];

  const eventsTodayList = document.getElementById('eventsTodayList');
  const allEventsList = document.getElementById('allEventsList');
  const calendarFilterButtons = document.getElementById('calendarFilterButtons');

  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  let allEvents = [];

  const calendarButtonContainers = {};

  function fetchEventsForCalendar(calendar) {
    return fetch(`/api/events?calendarId=${encodeURIComponent(calendar.id)}`)
      .then(res => res.json())
      .then(items => (items || []).map(event => ({
        ...event,
        calendarId: calendar.id,
        calendarName: calendar.name,
      })));
  }

  function formatTimeOnly(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function formatDateTime(date) {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function linkify(text) {
    text = text.replace(/--/g, '<br>');
    text = text.replace(/(https:\/\/[^\s]+)/g, url =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    text = text.replace(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, email =>
      `<a href="mailto:${email}">${email}</a>`);
    text = text.replace(/\b(\+?\d[\d\s().-]{7,}\d)\b/g, phone => {
      const telHref = phone.replace(/[\s().-]/g, '');
      return `<a href="tel:${telHref}">${phone}</a>`;
    });
    return text;
  }

  function createEventListItem(event) {
    const start = event.start.dateTime || event.start.date;
    const end = event.end.dateTime || event.end.date;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startDateString = startDate.toISOString().split('T')[0];

    const li = document.createElement('li');
    li.classList.add('event-item');

    const title = document.createElement('div');
    title.classList.add('event-title');

    title.textContent = (startDateString === today)
      ? `${event.summary} — ${formatTimeOnly(startDate)}`
      : `${event.summary} — ${formatDateTime(startDate)}`;

    const details = document.createElement('div');
    details.classList.add('event-details');
    details.style.display = 'none';

    details.innerHTML =
      `<p><strong>Time:</strong> ${formatTimeOnly(startDate)} – ${formatTimeOnly(endDate)}</p>` +
      (event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : '') +
      (event.description ? `<p><strong>Description:</strong> ${linkify(event.description)}</p>` : '');

    title.addEventListener('click', () => {
      details.style.display = (details.style.display === 'none') ? 'block' : 'none';
    });

    li.appendChild(title);
    li.appendChild(details);

    return li;
  }

  function renderEvents(events, targetList) {
    if (!targetList) return;
    targetList.innerHTML = '';
    events.forEach(event => targetList.appendChild(createEventListItem(event)));
  }

  function filterEventsByCalendar(events, calendarId) {
    return events.filter(e => e.calendarId === calendarId);
  }

  function showNextEventForCalendar(calendarId) {
    const nowTime = new Date().getTime();
    return allEvents
      .filter(e => e.calendarId === calendarId)
      .sort((a, b) => new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date))
      .find(event => new Date(event.start.dateTime || event.start.date).getTime() >= nowTime);
  }

  function displayNextEvent(calendarId, calendarName, elementId) {
    const nextEvent = showNextEventForCalendar(calendarId);
    const container = document.getElementById(elementId);
    if (!container) return;

    if (nextEvent) {
      const start = new Date(nextEvent.start.dateTime || nextEvent.start.date);
      const timeString = formatDateTime(start);
      let location = nextEvent.location || '';

      if (location === "St John (Ellesmere) Community Centre, Algernon Rd, Walkden, Worsley, Manchester M28 3RE, UK") {
        location = "Community Centre";
      }

      container.innerHTML =
        `<b>${nextEvent.summary}</b><br>` +
        `<b>When</b>: ${timeString}<br>` +
        (location ? `<b>Location:</b> ${location}<br>` : '');
    } else {
      container.textContent = `No upcoming events found for ${calendarName}.`;
    }
  }

  const modal = document.getElementById('serviceModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalEventList = document.getElementById('modalEventList');
  const closeModal = document.querySelector('.close');

  if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
  if (window && modal) {
    window.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
  }

  function openServiceModal(serviceName, descriptionText, calendarId) {
    const matchingEvents = allEvents.filter(event =>
      event.summary === serviceName && event.calendarId === calendarId);

    modalTitle.textContent = serviceName;
    modalDescription.innerHTML = linkify(descriptionText);
    modalEventList.innerHTML = '';

    const modalMapContainer = document.getElementById('modalMapContainer');
    if (modalMapContainer) modalMapContainer.innerHTML = '';

    let mapInserted = false;

    if (matchingEvents.length === 0) {
      modalEventList.innerHTML = '<li>No matching events found.</li>';
    } else {
      matchingEvents.forEach(event => {
        const li = document.createElement('li');
        const start = new Date(event.start.dateTime || event.start.date);
        let location = event.location || '';

        if (!mapInserted && location && modalMapContainer) {
          const heading = document.createElement('h3');
          heading.textContent = 'Find Us';
          heading.style.marginTop = '1em';

          createGoogleMapsEmbed(location).then(iframe => {
            modalMapContainer.appendChild(heading);
            modalMapContainer.appendChild(iframe);
          });

          mapInserted = true;
        }

        if (location === "St John (Ellesmere) Community Centre, Algernon Rd, Walkden, Worsley, Manchester M28 3RE, UK") {
          location = "Community Centre";
        }

        li.innerHTML = `
          <strong>Date & Time:</strong> ${start.toLocaleString()}<br>
          ${location ? `<strong>Location:</strong> ${location}` : ''}
        `;
        modalEventList.appendChild(li);
      });
    }

    modal.style.display = 'block';
  }

  function createCalendarEventButtons(calendar) {
    const containerId = calendar.id === calendars[0].id ? 'churchEventButtons' : 'communityEventButtons';
    const container = document.getElementById(containerId);
    if (!container) return;

    const heading = container.previousElementSibling;
    if (!heading || heading.tagName !== 'H2') return;

    container.innerHTML = '';
    const calendarEvents = filterEventsByCalendar(allEvents, calendar.id);
    const addedSummaries = new Set();

    calendarEvents.forEach(event => {
      if (!event.summary || addedSummaries.has(event.summary)) return;
      addedSummaries.add(event.summary);

      const btn = document.createElement('button');
      btn.classList.add('event-btn');
      btn.textContent = event.summary;

      const iconUrl = knownEventIcons[event.summary];
      if (iconUrl) {
        btn.style.backgroundImage = `url('${iconUrl}')`;
        btn.style.backgroundSize = 'contain';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.style.color = 'rgba(255, 255, 255, 0.9)';
        btn.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.7)';
        btn.style.display = 'flex';
        btn.style.alignItems = 'flex-end';
        btn.style.justifyContent = 'center';
        btn.style.padding = '12px';

        if (window.innerWidth < 600) btn.style.backgroundImage = 'none';
      }

      btn.title = new Date(event.start.dateTime || event.start.date).toLocaleString();
      btn.onclick = () => {
        openServiceModal(event.summary, event.description || '', event.calendarId);
      };

      container.appendChild(btn);
    });

    container.style.display = 'none';
    heading.style.display = 'none';

    calendarButtonContainers[calendar.id] = { container, heading };
  }

  function setupFilterButtons() {
    if (!calendarFilterButtons) return;
    calendarFilterButtons.innerHTML = '';

    const calendarVisibility = {};

    const toggleCalendarVisibility = (calendarId) => {
      calendarVisibility[calendarId] = !calendarVisibility[calendarId];
      const { container, heading } = calendarButtonContainers[calendarId] || {};
      if (container && heading) {
        const visible = calendarVisibility[calendarId];
        container.style.display = visible ? 'flex' : 'none';
        heading.style.display = visible ? 'block' : 'none';
      }
    };

    const setAllCalendarsVisibility = (visible) => {
      Object.keys(calendarButtonContainers).forEach(calId => {
        calendarVisibility[calId] = visible;
        const { container, heading } = calendarButtonContainers[calId];
        if (container && heading) {
          container.style.display = visible ? 'flex' : 'none';
          heading.style.display = visible ? 'block' : 'none';
        }
      });
    };

    const allBtn = document.createElement('button');
    allBtn.textContent = 'Church Services and Events';
    allBtn.onclick = () => {
      const allVisible = Object.values(calendarVisibility).every(v => v);
      setAllCalendarsVisibility(!allVisible);
    };
    calendarFilterButtons.appendChild(allBtn);

    calendars.forEach(cal => {
      calendarVisibility[cal.id] = false;
      const btn = document.createElement('button');
      btn.textContent = cal.name;
      btn.onclick = () => toggleCalendarVisibility(cal.id);
      calendarFilterButtons.appendChild(btn);
    });
  }

  // Fetch events from proxy endpoints
  Promise.all(calendars.map(fetchEventsForCalendar))
    .then(results => {
      allEvents = results.flat();

      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      allEvents = allEvents.filter(event => {
        const start = new Date(event.start.dateTime || event.start.date);
        return event.calendarId === calendars[1].id || start <= threeMonthsFromNow;
      });

      allEvents.sort((a, b) =>
        new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date)
      );

      const todaysEvents = allEvents.filter(event => {
        const startDateString = (new Date(event.start.dateTime || event.start.date)).toISOString().split('T')[0];
        return startDateString === today;
      });

      if (eventsTodayList) renderEvents(todaysEvents, eventsTodayList);
      if (allEventsList) renderEvents(allEvents, allEventsList);

      createCalendarEventButtons(calendars[0]);
      createCalendarEventButtons(calendars[1]);
      setupFilterButtons();

      displayNextEvent(calendars[0].id, calendars[0].name, 'nextChurchEventDisplay');
      displayNextEvent(calendars[1].id, calendars[1].name, 'nextEventDisplay');
    })
    .catch(err => {
      console.error('Error loading events:', err);
      const fallbackMessages = [
        { id: 'allEventsList', message: '<li>Unable to load events.</li>' },
        { id: 'nextChurchEventDisplay', message: 'Unable to load next church event.' },
        { id: 'nextEventDisplay', message: 'Unable to load next community event.' },
        { id: 'churchEventButtons', message: 'Church event buttons unavailable.' },
        { id: 'communityEventButtons', message: 'Community event buttons unavailable.' }
      ];
      fallbackMessages.forEach(({ id, message }) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = message;
      });
    });
}

function createGoogleMapsEmbed(address) {
  return fetch(`/api/map-embed?address=${encodeURIComponent(address)}`)
    .then(res => res.json())
    .then(data => {
      const iframe = document.createElement('iframe');
      iframe.width = "100%";
      iframe.height = "300";
      iframe.style.border = "0";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.src = data.embedUrl;
      return iframe;
    });
}

initCalendars();