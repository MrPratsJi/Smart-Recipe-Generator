// Vercel Serverless Function for ingredient recognition
import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://smart-recipe-generator-git-main-pratyushs-projects-16e0bda5.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64 } = req.body;
  if (!base64) {
    return res.status(400).json({ error: 'Missing base64 image' });
  }

  const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;
  if (!GOOGLE_VISION_API_KEY) {
    return res.status(500).json({ error: 'Google Vision API key not configured' });
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
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionPayload)
      }
    );
    const data = await response.json();
    const labels = data.responses?.[0]?.labelAnnotations || [];
    const ingredients = labels
      .filter(l => l.score > 0.6)
      .map(l => l.description.toLowerCase());
    res.status(200).json({ ingredients });
  } catch (err) {
    res.status(500).json({ error: 'Vision API error' });
  }
}


