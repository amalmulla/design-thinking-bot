import { GoogleGenerativeAI } from "@google/generative-ai";
import { SOCRATIC_PROMPTS, getRandomPrompt } from "./socraticQuestions";

/**
 * Gets Socratic chat completions from Google's Gemini API, tailored to the current design phase.
 * If VITE_API_KEY is not configured, automatically runs a simulated local Socratic prompt response.
 * 
 * @param {Array<Object>} messages - Full chat conversation history
 * @param {string} phase - Active student Design Thinking phase ('empathize', 'define', 'ideate', 'prototype', 'test')
 * @returns {Promise<string>} Socratic markdown output text
 */
export async function getSocraticChatCompletion(messages, phase) {
  const apiKey = import.meta.env.VITE_API_KEY ? import.meta.env.VITE_API_KEY.trim() : "";
  // Check if the key is not empty, is not one of the placeholder strings, and has a reasonable length
  const isKeyValid = apiKey &&
    apiKey !== "just test for now" &&
    apiKey !== "put api key here" &&
    !apiKey.toLowerCase().includes("placeholder") &&
    !apiKey.toLowerCase().includes("put api key") &&
    apiKey.length > 10;

  if (!isKeyValid) {
    console.warn("[Socratic AI] VITE_API_KEY is unconfigured, placeholder, or invalid. Running in simulated fallback mode.");
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return getRandomPrompt(phase);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Retrieve custom Socratic prompts based on stage
    const samplePrompts = SOCRATIC_PROMPTS[phase] || SOCRATIC_PROMPTS["empathize"];
    const systemPrompt = `You are a supportive, insightful educational AI acting as a Socratic Design Thinking facilitator.
Your current objective is to guide the student through the "${phase.toUpperCase()}" phase of the Design Thinking process.

CRITICAL INSTRUCTIONS:
1. Never directly provide solutions, answers, or fill out deliverables for the student.
2. Respond exclusively with thought-provoking, Socratic questions that guide them to find their own insights, challenge assumptions, and explore alternative perspectives.
3. Be concise, engaging, and conversational. Keep replies under 3-4 paragraphs.
4. Draw inspiration from these sample Socratic prompts for this phase:
${samplePrompts.map(p => `- ${p}`).join("\n")}

Format your response using clean Markdown (e.g., bullet points, bold emphasis, headings) to make it easy to read. Keep the tone warm, academic, and encouraging.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // Format chat history for Gemini API
    // Gemini chat history expects: { role: 'user' | 'model', parts: [{ text: string }] }
    // Our state uses: { role: 'user' | 'ai', content: string }
    const history = [];

    // Map previous turns (excluding the very last prompt, which is passed in sendMessage)
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      history.push({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage ? lastMessage.content : "";

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(userText);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("[Socratic AI] Live API communication failed:", error);
    console.warn("[Socratic AI] Gracefully falling back to simulated Socratic response.");

    // Fall back to high-quality simulated prompts to ensure a premium, crash-free student experience
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate short processing delay
    return getRandomPrompt(phase);
  }
}
