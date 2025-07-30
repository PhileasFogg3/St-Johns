// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = 5500;

const MAILCHIMP_API_KEY = process.env.NEWSLETTER;
const CALENDAR_API_KEY = process.env.CALENDAR;
const MAPS_API_KEY = process.env.MAPS;
const DATACENTER = 'us21';
const MAILCHIMP_API_URL = `https://${DATACENTER}.api.mailchimp.com/3.0/campaigns`;

app.get('/api/newsletter', async (req, res) => {
  try {
    const response = await axios.get(MAILCHIMP_API_URL, {
      headers: { 'Authorization': `apikey ${MAILCHIMP_API_KEY}` },
      params: {
        sort_field: 'send_time',
        sort_dir: 'DESC',
        status: 'sent',
        count: 1
      }
    });

    const latest = response.data.campaigns[0];
    const archiveUrl = latest.long_archive_url;
    res.json({ archiveUrl });

  } catch (error) {
    console.error('Newsletter error:', error.message);
    res.status(500).json({ error: 'Failed to load newsletter.' });
  }
});

app.get('/api/events', async (req, res) => {
  const { calendarId } = req.query;

  if (!calendarId) {
    return res.status(400).json({ error: 'Missing calendarId' });
  }

  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

  try {
    const response = await axios.get(url, {
      params: {
        key: CALENDAR_API_KEY,
        timeMin: now,
        singleEvents: true,
        orderBy: 'startTime'
      }
    });

    res.json(response.data.items || []);
  } catch (err) {
    console.error('Calendar error:', err.message);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

app.get('/api/map-embed', (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Missing address parameter' });
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodeURIComponent(address)}`;
  res.json({ embedUrl });
});

app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`St Johns Server is running on http://localhost:${PORT}`);
});