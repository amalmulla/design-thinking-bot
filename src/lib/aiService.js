import { SOCRATIC_PROMPTS, getRandomPrompt } from "../components/ChatBot/socraticQuestions";

// Base URL of the backend API; the AI request is proxied through it so the Cerebras
// key stays server-side and is never exposed to the browser.
const API_URL = import.meta.env.VITE_API_URL;

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
 * Gets Socratic chat completions via the backend AI proxy, tailored to the current design phase.
 * If the server has no Cerebras key (or the request fails), it falls back to a simulated local prompt.
 *
 * @param {Array<Object>} messages - Full chat conversation history
 * @param {string} phase - Active student Design Thinking phase ('empathize', 'define', 'ideate', 'prototype', 'test')
 * @param {Object} [canvasData] - The project's canvasData so the AI can read what the student filled in
 * @returns {Promise<string>} Socratic markdown output text
 */
export async function getSocraticChatCompletion(messages, phase, canvasData = {}) {
  try {
    // Retrieve custom Socratic prompts based on stage
    const samplePrompts = SOCRATIC_PROMPTS[phase] || SOCRATIC_PROMPTS["empathize"];

    // Read what the student has actually filled into the canvas for this phase
    const canvasSummary = summarizeCanvasForPhase(phase, canvasData);

    const systemPrompt = `You are an educational AI acting as a "Cognitive Forcing Companion" for the "${phase.toUpperCase()}" phase of the Design Thinking process.

CRITICAL INSTRUCTIONS:
1. DO NOT ACT LIKE A FORM-CHECKER. Do not explicitly ask the student to "fill out" or "deepen" specific quadrants (like SAYS, THINKS, DOES, FEELS) or specific text boxes. 
2. Act as a collaborative partner to challenge their assumptions and push critical thinking using "Cognitive Forcing".
3. Use the following role depending on the current phase:
   - EMPATHIZE: Act as an "Inquiry Facilitator" and "Breadth/Depth Validator". Challenge them on missing stakeholder groups, socioeconomic context, and real-world groundings.
   - DEFINE: Act as a "Value Mapper". Force them to prioritize values and ground their problem statement strictly in research, not jumping to solutions.
   - IDEATE: Act as a "Creative Brainstorming Partner". Play 'ping-pong' with ideas. Propose a wild variation and ask them to build on it without criticism.
   - PROTOTYPE: Act as a "Technical Facilitator". Simulate constraints and stakeholder reactions (e.g., "I'm simulating a busy parent...").
   - TEST: Act as an "Interactive Validator". Roleplay as a stakeholder giving vague feedback and ask the student how they would dig deeper.
4. Ground your questions in the student's actual canvas content provided in the "LIVE CANVAS STATE". 
5. Be concise and conversational. Keep replies under 2-3 paragraphs.
6. Draw inspiration from these cognitive forcing examples for this phase:
${samplePrompts.map(p => `- ${p}`).join("\n")}

Format your response using clean Markdown to make it easy to read. Keep the tone challenging but highly collaborative.`;

    // Build a fresh, authoritative snapshot of the canvas as it stands RIGHT NOW.
    const nextPhase = getNextPhase(phase);
    
    // Count how many messages the user has sent total
    const userMessageCount = messages.filter(m => m.role === 'user').length;

    const advanceText = nextPhase
      ? `PHASE UNLOCKING LOGIC:
You are the gatekeeper for the next phase ("${nextPhase.toUpperCase()}"). 
The user has sent ${userMessageCount} messages so far in this project.
To unlock the next phase, the user MUST meet BOTH of these criteria:
1. They must have interacted with you (sent at least 3 messages total).
2. Their "${phase.toUpperCase()}" canvas must look reasonably complete and thought-through (key sections filled with meaningful, specific content — not empty or one-word placeholders).

- If they do NOT meet both criteria, keep guiding them within this phase. Do not mention unlocking.
- If they DO meet both criteria, you MUST include the exact exact text \`[UNLOCK_NEXT_PHASE]\` at the very end of your response. When you do this, briefly acknowledge their progress and gently invite them to click the next phase in the top bar to move on.`
      : `This is the final phase. If the work looks reasonably complete, acknowledge it and help them reflect on what they learned across the whole Design Thinking process — do not suggest a next phase.`;

    const liveStateText = `\n\n[SYSTEM OVERRIDE]: LIVE CANVAS STATE — this is the student's "${phase.toUpperCase()}" canvas EXACTLY as it stands right now. It is the single source of truth and OVERRIDES anything said earlier in this conversation about which sections are empty or filled (the canvas has been edited since then). Read it carefully before replying:\n\n${canvasSummary || `The "${phase.toUpperCase()}" canvas is still completely empty. Gently encourage them to make a first entry.`}\n\n${advanceText}`;

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

    // Append the live canvas snapshot directly to the end of the student's latest message 
    // so it is the freshest context without breaking role alternation (LLaMA 3 requirement).
    if (history.length > 0 && history[history.length - 1].role === "user") {
      history[history.length - 1].content += liveStateText;
    } else {
      history.push({ role: "user", content: liveStateText });
    }
    formattedMessages.push(...history);

    // Call the backend AI proxy, which adds the Cerebras key server-side and forwards the request.
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        model: "gpt-oss-120b",
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`AI proxy returned status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    if (data.content) {
      return data.content;
    } else {
      throw new Error("Invalid response format from AI proxy");
    }
  } catch (error) {
    console.error("[Socratic AI] Live AI request failed:", error);
    console.warn("[Socratic AI] Gracefully falling back to simulated Socratic response.");

    // Fall back to high-quality simulated prompts to ensure a premium, crash-free student experience
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate short processing delay
    return getRandomPrompt(phase);
  }
}
