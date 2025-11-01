document.addEventListener('DOMContentLoaded', () => init());

/* ------------------------ YAML Loading ------------------------ */
async function loadYAML(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
  const text = await res.text();
  return jsyaml.load(text);
}

async function loadPlaylists() {
  try {
    const data = await loadYAML('../resources/data/playlists.yml');
    return data || {};
  } catch (err) {
    console.error('Error loading playlists:', err);
    return {};
  }
}

/* ------------------------ Music Database Helpers ------------------------ */
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

/* ------------------------ Initialization ------------------------ */
async function init() {
  try {
    const data = await loadYAML('../resources/data/music.yml');
    const playlists = await loadPlaylists();
    window.musicData = data; // add after loading music.yml

    /* --- DOM elements --- */
    const select = document.getElementById('songSelect');
    const resultDiv = document.getElementById('result');
    const searchInput = document.getElementById('songSearch');
    const embedContainer = document.getElementById('embedContainer');

    const playlistSelect = document.getElementById('playlistSelect');
    const playlistSongsDiv = document.getElementById('playlistSongs');
    const createPlaylistBtn = document.getElementById('createPlaylistBtn');
    const deletePlaylistBtn = document.getElementById('deletePlaylistBtn');
    const addToPlaylistBtn = document.getElementById('addToPlaylistBtn');
    const savePlaylistsBtn = document.getElementById('savePlaylistsBtn');

    /* --- Songs setup --- */
    const allSongs = getAllSongs(data);

    select.innerHTML = '<option value="">-- Select a Song --</option>';
    allSongs.forEach(song => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = song;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      searchInput.value = '';
      hideSearchResults();
      const song = select.value;
      if (!song) return resultDiv.textContent = 'Select a song to see its locations.';
      showSongLocations(song, data, resultDiv, embedContainer);
    });

    setupSearchBox(allSongs, data, select, resultDiv, embedContainer);

    /* --- Playlist setup --- */
    function updatePlaylistDropdown() {
      playlistSelect.innerHTML = '<option value="">-- Select a Playlist --</option>';
      Object.entries(playlists).forEach(([key, pl]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = pl.name;
        playlistSelect.appendChild(opt);
      });
    }

    function refreshPlaylistSongs() {
      const key = playlistSelect.value;
      if (!key) {
        playlistSongsDiv.innerHTML = '';
        return;
      }
      const pl = playlists[key];

      // Build the song list with remove buttons
      playlistSongsDiv.innerHTML = `<strong>${pl.name}</strong><br>` +
        pl.songs.map((song, index) => `
          <div class="playlist-song" draggable="true" data-index="${index}">
            <span>${song}</span>
            <button class="removeSongBtn" data-song="${song}">Remove</button>
            <div class="playlist-embed" id="embed-${key}-${index}"></div>
          </div>
        `).join('');

      // Attach remove button handlers
      playlistSongsDiv.querySelectorAll('.removeSongBtn').forEach(btn => {
        btn.addEventListener('click', () => removeSongFromPlaylist(key, btn.dataset.song));
      });

      // Attach drag-and-drop handlers
      const items = playlistSongsDiv.querySelectorAll('.playlist-song');
      let draggedIndex = null;

      items.forEach(item => {
        item.addEventListener('dragstart', e => {
          draggedIndex = Number(item.dataset.index);
          e.dataTransfer.effectAllowed = "move";
        });

        item.addEventListener('dragover', e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        });

        item.addEventListener('drop', e => {
          e.preventDefault();
          const targetIndex = Number(item.dataset.index);
          if (draggedIndex === null || targetIndex === draggedIndex) return;

          const temp = pl.songs[draggedIndex];
          pl.songs.splice(draggedIndex, 1);
          pl.songs.splice(targetIndex, 0, temp);
          refreshPlaylistSongs();
        });
      });

      // Add embeds for each song in the playlist
      pl.songs.forEach((song, index) => {
        const locations = findSongLocationsWithTrack(song, window.musicData); // musicData must be global
        const links = locations.filter(l => l.link).map(l => l.link);
        const embedDiv = document.getElementById(`embed-${key}-${index}`);
        if (embedDiv) {
          embedDiv.innerHTML = links.length ? links.map(generateEmbed).join('<br>') : '<em>No digital version available</em>';
        }
      });
    }

    function removeSongFromPlaylist(playlistKey, songName) {
      const pl = playlists[playlistKey];
      pl.songs = pl.songs.filter(s => s !== songName);
      refreshPlaylistSongs();
    }

    function addSongToPlaylist(song) {
      const key = playlistSelect.value;
      if (!key) return alert('Select a playlist first.');
      const pl = playlists[key];
      if (!pl.songs.includes(song)) {
        pl.songs.push(song);
        refreshPlaylistSongs();
      }
    }

    playlistSelect.addEventListener('change', refreshPlaylistSongs);

    createPlaylistBtn.addEventListener('click', () => {
      const name = prompt('Enter a name for the new playlist:');
      if (!name) return;
      const id = name.toLowerCase().replace(/\s+/g, '_');
      if (playlists[id]) return alert('A playlist with this name already exists!');
      playlists[id] = { name, songs: [] };
      updatePlaylistDropdown();
      playlistSelect.value = id;
      refreshPlaylistSongs();
    });

    deletePlaylistBtn.addEventListener('click', async () => {
      const key = playlistSelect.value;
      if (!key) return;
      if (!confirm(`Delete playlist "${playlists[key].name}"?`)) return;

      delete playlists[key];          
      updatePlaylistDropdown();        
      playlistSongsDiv.innerHTML = ''; 

      // Automatically save changes to server
      try {
        const res = await fetch('/api/save-playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlists })
        });
        const data = await res.json();
        if (data.success) {
          alert('Playlist deleted and changes saved!');
        } else {
          alert('Playlist deleted locally, but failed to save to server: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Playlist deleted locally, but failed to save to server: ' + err.message);
      }
    });


    addToPlaylistBtn.addEventListener('click', () => {
      const song = select.value || searchInput.value;
      if (!song) return alert('Select or search a song first.');
      addSongToPlaylist(song);
    });

    savePlaylistsBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/save-playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlists })
        });
        const data = await res.json();
        if (data.success) alert('Playlists saved successfully!');
        else alert('Failed to save playlists: ' + (data.error || 'Unknown error'));
      } catch (err) {
        alert('Error saving playlists: ' + err.message);
      }
    });

    updatePlaylistDropdown();

  } catch (err) {
    console.error('Error loading music data or playlists:', err);
    document.getElementById('result').textContent = 'Failed to load music data. Check console.';
  }
}

/* ------------------------ Display Songs ------------------------ */
function showSongLocations(song, data, resultDiv, embedContainer) {
  const locations = findSongLocationsWithTrack(song, data);
  if (locations.length) {
    resultDiv.innerHTML = `<strong>${song}</strong> found in:<br>` +
      locations.map(l => `• ${l.box}, ${l.disc}, Track ${l.track}`).join('<br>');

    const links = locations.filter(l => l.link).map(l => l.link);
    embedContainer.innerHTML = links.length ? links.map(generateEmbed).join('<br><br>') : '<em>No digital version available</em>';
  } else {
    resultDiv.textContent = `No locations found for "${song}".`;
    embedContainer.innerHTML = '';
  }
}

function generateEmbed(link) {
  if (!link) return '';

  if (link.includes('youtube.com') || link.includes('youtu.be')) {
    let videoId = link.includes('youtu.be') ? link.split('/').pop() : link.split('v=')[1]?.split('&')[0];
    return `<iframe width="400" height="225" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }

  if (link.includes('spotify.com')) {
    let embedLink = link.replace('open.spotify.com', 'open.spotify.com/embed');
    if (!embedLink.includes('/embed/')) embedLink = embedLink.replace('/track/', '/embed/track/');
    return `<iframe src="${embedLink}" width="400" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            <div style="font-size: 0.85em; color: #555; margin-bottom: 1em;">Full playback requires a Spotify account</div>`;
  }

  return `<a href="${link}" target="_blank">${link}</a>`;
}

/* ------------------------ Search ------------------------ */
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
    if (query.length > 0) select.value = '';

    if (!query) {
      resultsList.style.display = 'none';
      return;
    }

    const matches = allSongs.filter(song => song.toLowerCase().includes(query));
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
    if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) resultsList.style.display = 'none';
  });
}