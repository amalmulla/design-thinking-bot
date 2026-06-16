import { SOCRATIC_PROMPTS, getRandomPrompt } from "./socraticQuestions";

/**
 * Gets Socratic chat completions from Cerebras API, tailored to the current design phase.
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

    // Format chat history for OpenAI-compatible Cerebras API
    // Cerebras/OpenAI format expects: { role: 'user' | 'assistant' | 'system', content: string }
    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];

    // Map previous turns
    for (const msg of messages) {
      formattedMessages.push({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content
      });
    }

    // Call the local Vite proxy to bypass CORS
    const response = await fetch("/api-cerebras/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-oss-120b",
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Cerebras API returned status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Invalid response format from Cerebras API");
    }
  } catch (error) {
    console.error("[Socratic AI] Live Cerebras API communication failed:", error);
    console.warn("[Socratic AI] Gracefully falling back to simulated Socratic response.");

    // Fall back to high-quality simulated prompts to ensure a premium, crash-free student experience
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate short processing delay
    return getRandomPrompt(phase);
  }
}
