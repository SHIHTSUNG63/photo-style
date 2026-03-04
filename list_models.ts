import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const listResult = await ai.models.list();
    console.log("Available Models:");
    // The SDK returns a Pager object, but it's iterable or has a collection
    for (const model of listResult.models) {
      console.log(`- ID: ${model.name}`);
      console.log(`  Name: ${model.displayName}`);
      console.log(`  Supported: ${model.supportedGenerationMethods.join(", ")}`);
    }
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
