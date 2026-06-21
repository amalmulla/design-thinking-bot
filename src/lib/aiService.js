import { SOCRATIC_PROMPTS, getRandomPrompt } from "../components/ChatBot/socraticQuestions";

// Ordered Design Thinking phases, used to tell the AI which phase comes next.
const PHASE_ORDER = ["empathize", "define", "ideate", "prototype", "test"];

/**
 * Returns the phase that follows the given one, or null if it's the last phase.
 * @param {string} phase - Current Design Thinking phase
 * @returns {string|null}
 */
function getNextPhase(phase) {
  const idx = PHASE_ORDER.indexOf(phase);
  if (idx === -1 || idx === PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[idx + 1];
}

/**
 * Serializes the student's filled-in canvas for the active phase into readable plain text,
 * so the AI can ground its Socratic questions in what the student has actually written.
 *
 * @param {string} phase - Active Design Thinking phase
 * @param {Object} canvasData - The project's full canvasData object (keyed by phase)
 * @returns {string} Human-readable summary of the current phase's entries (empty string if none)
 */
function summarizeCanvasForPhase(phase, canvasData = {}) {
  const data = canvasData?.[phase];
  if (!data) return "";

  const bulletList = (arr) =>
    Array.isArray(arr) && arr.length
      ? arr.map((item) => `    - ${item}`).join("\n")
      : "    (empty)";

  switch (phase) {
    case "empathize":
      return [
        "Empathy Map:",
        `  SAYS:\n${bulletList(data.says)}`,
        `  THINKS:\n${bulletList(data.thinks)}`,
        `  DOES:\n${bulletList(data.does)}`,
        `  FEELS:\n${bulletList(data.feels)}`,
      ].join("\n");

    case "define":
      return [
        "Point-of-View statement:",
        `  User: ${data.user || "(empty)"}`,
        `  Needs: ${data.needs || "(empty)"}`,
        `  Insight: ${data.insight || "(empty)"}`,
      ].join("\n");

    case "ideate": {
      const notes = Array.isArray(data) ? data : [];
      if (!notes.length) return "Ideation board:\n  (no idea notes yet)";
      return [
        "Ideation board (sticky notes):",
        ...notes.map((n, i) => `  ${i + 1}. ${typeof n === "string" ? n : n.text || ""}`),
      ].join("\n");
    }

    case "prototype": {
      const list = Array.isArray(data) ? data : [];
      if (!list.length) return "Prototype artifacts:\n  (none added yet)";
      return [
        "Prototype artifacts:",
        ...list.map((p, i) => `  ${i + 1}. ${p.name || "Untitled"}${p.url && p.url !== "#" ? ` (${p.url})` : ""}`),
      ].join("\n");
    }

    case "test":
      return [
        "Test feedback grid:",
        `  What worked: ${data.worked || "(empty)"}`,
        `  What to improve: ${data.improved || "(empty)"}`,
        `  Open questions: ${data.questions || "(empty)"}`,
        `  New ideas: ${data.ideas || "(empty)"}`,
      ].join("\n");

    default:
      return "";
  }
}

/**
 * Gets Socratic chat completions from Cerebras API, tailored to the current design phase.
 * If VITE_API_KEY is not configured, automatically runs a simulated local Socratic prompt response.
 *
 * @param {Array<Object>} messages - Full chat conversation history
 * @param {string} phase - Active student Design Thinking phase ('empathize', 'define', 'ideate', 'prototype', 'test')
 * @param {Object} [canvasData] - The project's canvasData so the AI can read what the student filled in
 * @returns {Promise<string>} Socratic markdown output text
 */
export async function getSocraticChatCompletion(messages, phase, canvasData = {}) {
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

    // Read what the student has actually filled into the canvas for this phase
    const canvasSummary = summarizeCanvasForPhase(phase, canvasData);

    const systemPrompt = `You are a supportive, insightful educational AI acting as a Socratic Design Thinking facilitator.
Your current objective is to guide the student through the "${phase.toUpperCase()}" phase of the Design Thinking process.

CRITICAL INSTRUCTIONS:
1. Never directly provide solutions, answers, or fill out deliverables for the student.
2. Respond exclusively with thought-provoking, Socratic questions that guide them to find their own insights, challenge assumptions, and explore alternative perspectives.
3. Ground your questions in the student's actual canvas content, which is given to you in the most recent "LIVE CANVAS STATE" message. Reference specific things they wrote, probe gaps and contradictions in their real entries, and challenge the assumptions behind them. Do not ask generic questions when their canvas gives you concrete material to work with.
4. Be concise, engaging, and conversational. Keep replies under 3-4 paragraphs.
5. Draw inspiration from these sample Socratic prompts for this phase:
${samplePrompts.map(p => `- ${p}`).join("\n")}

Format your response using clean Markdown (e.g., bullet points, bold emphasis, headings) to make it easy to read. Keep the tone warm, academic, and encouraging.`;

    // Build a fresh, authoritative snapshot of the canvas as it stands RIGHT NOW.
    // This is injected at the END of the conversation (just before the latest question) so the
    // model weights it over its own earlier turns, which may describe an older, emptier canvas.
    const nextPhase = getNextPhase(phase);
    const advanceText = nextPhase
      ? `Continuously assess whether this canvas now looks reasonably complete and thought-through (key sections filled with meaningful, specific content — not empty or one-word placeholders).
- If it does NOT yet look complete, keep guiding them within this phase and do NOT suggest moving on.
- If it DOES look reasonably complete, briefly acknowledge their progress and gently invite them to consider moving on to the next phase, "${nextPhase.toUpperCase()}", explaining in one sentence why they seem ready. Frame it as an invitation, not a command, and still end with a Socratic question that bridges into that next phase.`
      : `This is the final phase. If the work looks reasonably complete, acknowledge it and help them reflect on what they learned across the whole Design Thinking process — do not suggest a next phase.`;

    const liveStateMessage = {
      role: "system",
      content: `LIVE CANVAS STATE — this is the student's "${phase.toUpperCase()}" canvas EXACTLY as it stands right now. It is the single source of truth and OVERRIDES anything said earlier in this conversation about which sections are empty or filled (the canvas has been edited since then). Read it carefully before replying:

${canvasSummary || `The "${phase.toUpperCase()}" canvas is still completely empty. Gently encourage them to make a first entry.`}

${advanceText}`
    };

    // Format chat history for OpenAI-compatible Cerebras API
    // Cerebras/OpenAI format expects: { role: 'user' | 'assistant' | 'system', content: string }
    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];

    // Map previous turns
    const history = messages.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content
    }));

    // Insert the live canvas snapshot right before the student's latest message so it is the
    // freshest context the model sees; fall back to appending it if history is empty.
    if (history.length > 0 && history[history.length - 1].role === "user") {
      history.splice(history.length - 1, 0, liveStateMessage);
    } else {
      history.push(liveStateMessage);
    }
    formattedMessages.push(...history);

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
