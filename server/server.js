const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = 5500;

const MAILCHIMP_API_KEY = process.env.NEWSLETTER;
const CALENDAR_API_KEY = process.env.CALENDAR;
const DATACENTER = 'us21';
const API_URL = `https://${DATACENTER}.api.mailchimp.com/3.0/campaigns`;

app.use(express.static(path.join(__dirname, '..')));

app.get('/config', (req, res) => {
  res.json({ calendarApiKey: CALENDAR_API_KEY });
});

app.get('/latest-newsletter', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`
      },
      params: {
        sort_field: 'send_time',
        sort_dir: 'DESC',
        status: 'sent',
        count: 1
      }
    });

    const latest = response.data.campaigns[0];
    const archiveUrl = latest.long_archive_url;

    res.send(`
      <iframe src="${archiveUrl}" width="100%" height="800px" style="border:0;"></iframe>
    `);
  } catch (error) {
    console.error('Error fetching newsletter:', error.message);
    res.status(500).send('Failed to load latest newsletter.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});