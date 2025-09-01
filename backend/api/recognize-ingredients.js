
import fetch from 'node-fetch';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://smart-recipe-generator-iota-nine.vercel.app',
];

const PREVIEW_RE = /^https:\/\/smart-recipe-generator-[a-z0-9-]+\.vercel\.app$/i;

function matchOrigin(origin) {
  if (!origin) return '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (PREVIEW_RE.test(origin)) return origin;
  return '';
}

function setCors(req, res, { credentials = false } = {}) {
  const origin = matchOrigin(req.headers.origin || '');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  if (credentials) res.setHeader('Access-Control-Allow-Credentials', 'true');
  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', reqHeaders || 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
  return origin; 
}

export default async function handler(req, res) {

  const allowedOrigin = setCors(req, res, { credentials: true });

  if (req.method === 'OPTIONS') {
   
    res.setHeader('Access-Control-Max-Age', '3600');
    return res.status(204).end();
  }

  
  if (!allowedOrigin) {
    return res.status(403).json({ error: 'Origin not allowed by CORS' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64 } = req.body || {};
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
          features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
        },
      ],
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionPayload),
      }
    );

    const data = await response.json();
    const labels = data?.responses?.[0]?.labelAnnotations || [];
    const ingredients = labels
      .filter((l) => l.score > 0.6)
      .map((l) => l.description.toLowerCase());

    
    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    let recipes = [];
    if (SPOONACULAR_API_KEY && ingredients.length > 0) {
      try {
        const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients.join(","))}&number=5&apiKey=${SPOONACULAR_API_KEY}`;
        const spoonacularRes = await fetch(spoonacularUrl);
        if (spoonacularRes.ok) {
          recipes = await spoonacularRes.json();
        }
      } catch {
      }
    }

    return res.status(200).json({ ingredients, recipes });
  } catch {
    return res.status(500).json({ error: 'Vision API error' });
  }
}

