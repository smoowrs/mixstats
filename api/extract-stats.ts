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
        You are a professional CS2 (Counter-Strike 2) scoreboard data extractor.
        Analyze the provided screenshot of a CS2 match scoreboard and extract statistics for ALL players visible.

        The scoreboard typically shows two teams (CT side and T side) with columns for:
        - Player nickname/name
        - Kills (K)
        - Assists (A)
        - Deaths (D)
        - MVP stars (★ or * symbols next to the player name or in a separate column)
        - Sometimes: HS%, ADR, Rating

        Return ONLY a raw JSON array (no markdown, no code blocks, no explanation) with this exact schema:
        [
          {
            "name": "ExactNickname",
            "kills": 20,
            "deaths": 15,
            "assists": 3,
            "mvp": 2,
            "wins": 1,
            "games": 1
          }
        ]

        Critical rules:
        1. Extract the player nickname EXACTLY as shown (preserve capitalization and special characters).
        2. "kills", "deaths", "assists", "mvp" must be integers (numbers, not strings).
        3. "mvp" = count of MVP stars shown next to or attributed to the player. If not visible, use 0.
        4. "wins": set to 1 for players on the WINNING team, 0 for the LOSING team. Determine the winner from the scoreboard header (e.g. "16-10" — the team with the higher score wins). If scores are equal or undetermined, use 0.
        5. "games": always 1 (this is one match).
        6. Include ALL players from BOTH teams (usually 5v5 = 10 players total).
        7. Return ONLY the raw JSON array string. No markdown, no \`\`\`json, no explanation text whatsoever.
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
