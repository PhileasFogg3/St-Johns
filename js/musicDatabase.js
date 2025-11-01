document.addEventListener('DOMContentLoaded', () => init());

async function loadYAML(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
  const text = await res.text();
  return jsyaml.load(text);
}

// Handle both strings and objects with link
function findSongLocationsWithTrack(songName, data) {
  const results = [];
  const boxes = data.boxes;

  for (const [boxName, discs] of Object.entries(boxes)) {
    for (const [discName, songs] of Object.entries(discs)) {
      for (let i = 0; i < songs.length; i++) {
        const songEntry = songs[i];
        let title = typeof songEntry === 'string' ? songEntry : songEntry.title;
        if (title === songName) {
          results.push({
            box: formatName(boxName),
            disc: formatName(discName),
            track: i + 1,
            link: typeof songEntry === 'string' ? null : songEntry.link || null
          });
        }
      }
    }
  }

  return results;
}

function formatName(name) {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getAllSongs(data) {
  const songSet = new Set();
  for (const discs of Object.values(data.boxes)) {
    for (const songs of Object.values(discs)) {
      for (const songEntry of songs) {
        const title = typeof songEntry === 'string' ? songEntry : songEntry.title;
        songSet.add(title);
      }
    }
  }
  return [...songSet].sort((a, b) => a.localeCompare(b));
}

async function init() {
  try {
    const data = await loadYAML('../resources/data/music.yml');
    const select = document.getElementById('songSelect');
    const resultDiv = document.getElementById('result');
    const searchInput = document.getElementById('songSearch');
    const embedContainer = document.getElementById('embedContainer');

    const allSongs = getAllSongs(data);

    // Populate dropdown
    select.innerHTML = '<option value="">-- Select a Song --</option>';
    allSongs.forEach(song => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = song;
      select.appendChild(opt);
    });

    // Dropdown selection
    select.addEventListener('change', () => {
      searchInput.value = '';
      hideSearchResults();
      const song = select.value;
      if (!song) return resultDiv.textContent = 'Select a song to see its locations.';
      showSongLocations(song, data, resultDiv, embedContainer);
    });

    // Setup search box
    setupSearchBox(allSongs, data, select, resultDiv, embedContainer);

  } catch (err) {
    console.error('Error loading music data:', err);
    document.getElementById('result').textContent = 'Failed to load music data. Check console.';
  }
}

function showSongLocations(song, data, resultDiv, embedContainer) {
  const locations = findSongLocationsWithTrack(song, data);
  if (locations.length) {
    resultDiv.innerHTML = `<strong>${song}</strong> found in:<br>` +
      locations.map(l => `• ${l.box}, ${l.disc}, Track ${l.track}`).join('<br>');

    // Show embeds for all links if present
    const links = locations.filter(l => l.link).map(l => l.link);
    if (links.length > 0) {
      embedContainer.innerHTML = links.map(generateEmbed).join('<br><br>');
    } else {
      embedContainer.innerHTML = '<em>No digital version available</em>';
    }

  } else {
    resultDiv.textContent = `No locations found for "${song}".`;
    embedContainer.innerHTML = '';
  }
}

function generateEmbed(link) {
  if (!link) return '';

  // YouTube embed
  if (link.includes('youtube.com') || link.includes('youtu.be')) {
    let videoId = '';
    if (link.includes('youtu.be')) {
      videoId = link.split('/').pop();
    } else {
      videoId = link.split('v=')[1]?.split('&')[0];
    }
    return `<iframe width="400" height="225" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }

  // Spotify embed
  if (link.includes('spotify.com')) {
    let embedLink = link.replace('open.spotify.com', 'open.spotify.com/embed');
    if (!embedLink.includes('/embed/')) {
      embedLink = embedLink.replace('/track/', '/embed/track/');
    }
    return `<iframe src="${embedLink}" width="400" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            <div style="font-size: 0.85em; color: #555; margin-bottom: 1em;">
              Full playback requires a Spotify account
            </div>`;
  }

  // Fallback for other links
  return `<a href="${link}" target="_blank">${link}</a>`;
}

function hideSearchResults() {
  const list = document.getElementById('searchResults');
  if (list) list.style.display = 'none';
}

function setupSearchBox(allSongs, data, select, resultDiv, embedContainer) {
  const searchInput = document.getElementById('songSearch');
  const resultsList = document.getElementById('searchResults');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    resultsList.innerHTML = '';

    // Clear dropdown when typing
    if (query.length > 0) select.value = '';

    if (!query) {
      resultsList.style.display = 'none';
      return;
    }

    const matches = allSongs.filter(song =>
      song.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      resultsList.style.display = 'none';
      return;
    }

    matches.forEach(song => {
      const li = document.createElement('li');
      li.textContent = song;
      li.addEventListener('click', () => {
        searchInput.value = song;
        resultsList.style.display = 'none';
        showSongLocations(song, data, resultDiv, embedContainer);
      });
      resultsList.appendChild(li);
    });

    resultsList.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
      resultsList.style.display = 'none';
    }
  });
}