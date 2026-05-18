import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: '2mb' }));

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['Approved', 'Rejected'] },
    summary: { type: Type.STRING },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          policy: { type: Type.STRING },
          problem: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ['policy', 'problem', 'recommendation']
      }
    }
  },
  required: ['status', 'summary', 'issues']
};

const productFeedSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    safeProductCount: { type: Type.INTEGER },
    riskyProducts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          policy: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ['id', 'title', 'policy', 'reason']
      }
    }
  },
  required: ['summary', 'safeProductCount', 'riskyProducts']
};

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing on server.');
  }
  return new GoogleGenAI({ apiKey });
}

app.post('/api/analyze-website', async (req, res) => {
  try {
    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ error: 'content is required' });

    const ai = getClient();
    const prompt = `You are an expert Google Merchant Center policy analyst. Analyze this website content and return JSON only.\n\nWebsite content:\n---\n${content}\n---`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.2
      }
    });

    return res.json(JSON.parse(response.text.trim()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'website analysis failed' });
  }
});

app.post('/api/analyze-feed', async (req, res) => {
  try {
    const feedContent = String(req.body?.feedContent || '').trim();
    if (!feedContent) return res.status(400).json({ error: 'feedContent is required' });

    const ai = getClient();
    const prompt = `You are a Google Merchant Center Product Data expert. Analyze this product feed and return JSON only.\n\nFeed:\n---\n${feedContent}\n---`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: productFeedSchema,
        temperature: 0.1
      }
    });

    return res.json(JSON.parse(response.text.trim()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'feed analysis failed' });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on :${port}`);
});
