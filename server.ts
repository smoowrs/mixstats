import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OCR Endpoint
  app.post("/api/extract-stats", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const prompt = `
        You are an expert at extracting data from video game scoreboards.
        Analyze the provided image (a match scoreboard) and extract the statistics for each player.
        
        Return a JSON array of objects, where each object represents a player with the following schema:
        [
          {
            "name": "player_name", // String
            "kills": 0, // Number
            "deaths": 0, // Number
            "assists": 0, // Number
            "mvp": 0, // Number, usually indicated by stars or a specific column
            "wins": 1, // Number: 1 if the player's team won, 0 if they lost or it's a tie
            "games": 1 // Number: always 1 per extracted match
          }
        ]
        
        Important instructions:
        1. Only return valid JSON data. No markdown formatting, no code blocks like \`\`\`json. Just the raw JSON string.
        2. Make sure you extract kills, deaths, assists, and MVPs if visible.
        3. If there are 2 teams, try to infer which team won based on the team score (usually at the top). Give "wins": 1 to players on the winning team, and "wins": 0 to the losing team. If it's a draw or you can't tell, use 0.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]
      });

      const text = response.text || "[]";
      
      // Clean up markdown block if model ignored instructions
      const cleanedText = text.replace(/```json\n?|```\n?/g, "").trim();

      const data = JSON.parse(cleanedText);
      res.json(data);
    } catch (error: any) {
      console.error("OCR Extraction Error:", error);
      res.status(500).json({ error: "Failed to extract stats from image: " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
