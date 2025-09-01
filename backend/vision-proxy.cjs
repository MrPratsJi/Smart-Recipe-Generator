const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;
if (!GOOGLE_VISION_API_KEY) {
  console.error('Google Vision API key not configured');
  process.exit(1);
}

app.post('/recognize-ingredients', async (req, res) => {
  const { base64 } = req.body;
  console.log('Received /recognize-ingredients request');
  if (!base64) {
    console.error('Missing base64 image in request body');
    return res.status(400).json({ error: 'Missing base64 image' });
  }

  try {
    const visionPayload = {
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
        }
      ]
    };
    console.log('Sending payload to Google Vision API:', JSON.stringify(visionPayload).slice(0, 200) + '...');
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionPayload)
      }
    );
    console.log('Google Vision API response status:', response.status);
    const data = await response.json();
    console.log('Google Vision API response body:', JSON.stringify(data).slice(0, 500) + '...');
    const labels = data.responses?.[0]?.labelAnnotations || [];
    const ingredients = labels
      .filter(l => l.score > 0.6) 
      .map(l => l.description.toLowerCase());
    console.log('Extracted ingredients:', ingredients);
    res.json({ ingredients });
  } catch (err) {
    console.error('Error in /recognize-ingredients:', err);
    res.status(500).json({ error: 'Vision API error' });
  }
});

app.listen(5000, () => console.log('Vision proxy running on http://localhost:5000'));
