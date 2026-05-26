import { Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Initialize Gemini client lazily to avoid startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY") || key.trim() === "") {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export async function suggestDepartment(req: AuthenticatedRequest, res: Response) {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim() === "") {
    return res.status(400).json({ error: "Symptoms description is a required parameter." });
  }

  const ai = getAiClient();

  if (!ai) {
    // Elegant fallback mock diagnostic handler if API key is not connected by the user yet
    // This allows instant testing in the sandbox, while indicating that Gemini is fully wired.
    console.warn("No active GEMINI_API_KEY found, running rule-based smart department fallback.");
    
    // Simulate standard clinical checks
    const prompt = symptoms.toLowerCase();
    let department = "General Medicine";
    let priority = "Medium";
    let reasoning = "Based on symptom analysis, we recommend seeing a General Practitioner for primary screening.";
    let care = [
      "Keep hydrated and monitor body temperature standard rates.",
      "Avoid strenuous physical workouts until screening is done.",
      "If symptoms worsen rapidly, please go to the nearest emergency room immediately."
    ];

    if (prompt.includes("chest") || prompt.includes("heart") || prompt.includes("palpitant") || prompt.includes("cardiac")) {
      department = "Cardiology";
      priority = "Critical";
      reasoning = "The chest pressure, potential cardiac palpitations or related cardiovascular anomalies mandate deep cardiologic mapping.";
      care = ["Avoid all caffeine, stimulants and strenuous physical exertion.", "Sit upright in a well-ventilated or air-conditioned room to ease breathing.", "Seek emergency medicine instantly if crushing central pressure or left arm numbness occurs."];
    } else if (prompt.includes("child") || prompt.includes("baby") || prompt.includes("kid") || prompt.includes("toddler") || prompt.includes("pediatric")) {
      department = "Pediatrics";
      priority = "Medium";
      reasoning = "Pediatric health states require targeted attention from pediatric physicians to ensure secure diagnostics.";
      care = ["Monitor body fluid consumption to bypass dehydration.", "Administer age-graded children's therapeutic solutions purely with medical alignment.", "Track fever limits every 4 hours."];
    } else if (prompt.includes("skin") || prompt.includes("rash") || prompt.includes("itch") || prompt.includes("eczema") || prompt.includes("dermatology")) {
      department = "Dermatology";
      priority = "Low";
      reasoning = "Integumentary alterations, rashes or eczema indications map to specialist dermatologic diagnostics.";
      care = ["Keep the affected epidermal workspace clean, cool and moderately hydrated.", "Do not scratch the rashes or use aggressive cosmetic formulations.", "Review recent topical exposures to identify potential contact allergens."];
    } else if (prompt.includes("brain") || prompt.includes("seizure") || prompt.includes("neurolog") || prompt.includes("numbness") || prompt.includes("dizzy") || prompt.includes("headache")) {
      department = "Neurology";
      priority = "High";
      reasoning = "Neurological states (migraines, dizziness episodes, nerve prickles) could indicate Central/Peripheral system issues.";
      care = ["Rest inside quiet, dimly lit surroundings to diminish neural stress.", "Refrain from operating motor vehicles or machinery during dizzy spells.", "Maintain regular sleep cycles and monitor for coordinate motor weaknesses."];
    }

    return res.json({
      department,
      priority,
      reasoning,
      careExplanation: "Simulated clinical match (Connect your GEMINI_API_KEY in Settings > Secrets to unlock the live Gemini deep reasoning analyzer!)",
      careInstructions: care
    });
  }

  try {
    const promptMessage = `
      You are a clinical smart router. Analyze the following patient symptoms description and generate a structured JSON recommendation report.
      
      Symptoms description: "${symptoms}"
      
      Formulate recommendations strictly mapping to one of these valid departments:
      - Cardiology
      - Neurology
      - Pediatrics
      - Dermatology
      - General Medicine
      - Oncology
      
      Generate recommendations with:
      1. department: The chosen department from the list above.
      2. priority: One of "Low", "Medium", "High", or "Critical".
      3. reasoning: A concise, highly professional 2-sentence medical reasoning of why this symptom correlates to that field.
      4. careExplanation: An overview statement of safety guidelines.
      5. careInstructions: An array of 3 actionable home-care precautions or indicators.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            department: { type: Type.STRING, description: "Cardiology, Neurology, Pediatrics, Dermatology, General Medicine, or Oncology" },
            priority: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
            reasoning: { type: Type.STRING, description: "Professional medical routing analysis detailing links between symptom and division" },
            careExplanation: { type: Type.STRING, description: "Care overview guidance summary" },
            careInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 actionable precautions to carry out instantly before consultation"
            }
          },
          required: ["department", "priority", "reasoning", "careExplanation", "careInstructions"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("Empty response returned from Gemini API");
    }

    const payload = JSON.parse(bodyText.trim());
    return res.json(payload);

  } catch (error: any) {
    console.error("Gemini suggestion router encountered an error:", error);
    return res.status(500).json({
      error: "Failed to query clinical router AI, falling back to basic matching.",
      details: error.message
    });
  }
}
