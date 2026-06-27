import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to parse form data: ' + err.message });
    }

    const fileArr = files.image;
    const file = Array.isArray(fileArr) ? fileArr[0] : fileArr;

    if (!file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    try {
      const buffer = fs.readFileSync(file.filepath);
      const base64Data = buffer.toString('base64');
      const mimeType = file.mimetype || 'image/png';

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
        1. Only return valid JSON data. No markdown formatting, no code blocks like \`\`\`json. Just the raw JSON string.
        2. Make sure you extract kills, deaths, assists, and MVPs if visible.
        3. If there are 2 teams, try to infer which team won based on the team score (usually at the top). Give "wins": 1 to players on the winning team, and "wins": 0 to the losing team. If it's a draw or you can't tell, use 0.
        4. The MVP column is usually indicated by stars (*) or a shield icon next to a player name.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType,
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
  });
}
