import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
      return;
    }

    console.log("--- Available Models ---");
    data.models.forEach(m => {
      if (m.name.includes("2.5") || m.name.includes("image")) {
        console.log(`Model: ${m.name}`);
        console.log(`Display Name: ${m.displayName}`);
        console.log(`Methods: ${m.supportedGenerationMethods.join(", ")}`);
        console.log("---");
      }
    });
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

listModels();
