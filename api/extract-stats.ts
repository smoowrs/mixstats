import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { base64, mimeType } = req.body;

    if (!base64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert at extracting data from video game scoreboards.
      Analyze the provided image (a match scoreboard) and extract the statistics for each player.
      
      Return a JSON array of objects, where each object represents a player with the following schema:
      [
        {
          "name": "player_name",
          "kills": 0,
          "deaths": 0,
          "assists": 0,
          "mvp": 0,
          "wins": 1,
          "games": 1
        }
      ]
      
      Important instructions:
      1. Only return valid JSON data. No markdown formatting, no code blocks. Just the raw JSON string.
      2. Extract kills, deaths, assists, and MVPs if visible.
      3. If there are 2 teams, infer which team won from the score. Give "wins": 1 to the winning team, "wins": 0 to the losing team.
      4. The MVP column is usually indicated by stars (*) or a shield icon next to a player name.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: mimeType || 'image/png',
          },
        },
      ],
    });

    const text = response.text || '[]';
    const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
    const data = JSON.parse(cleanedText);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('OCR Extraction Error:', error);
    return res.status(500).json({ error: 'Failed to extract stats: ' + error.message });
  }
}
