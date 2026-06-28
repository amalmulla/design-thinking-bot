// src/lib/socraticQuestions.js
// Static prompt text banks from syllabus for mock display

export const SOCRATIC_PROMPTS = {
  empathize: [
    "This persona lacks socioeconomic context. What is this user's financial situation? Do they work while studying?",
    "What technology do they already use daily? How does their cultural background influence their conduct?",
    "Have we missed any key stakeholder groups in this empathy map? What data do we have to support these user needs?"
  ],
  define: [
    "You’ve identified multiple values here. Let’s map these: Which stakeholder values which outcome most?",
    "If users had to choose between privacy and social connection, what would they prioritize, according to your data?",
    "You are stating a solution rather than a problem. How can we ground this problem definition strictly in the research?"
  ],
  ideate: [
    "That’s an interesting start. Let’s build on this: What if we also added a completely wild, budget-free variation?",
    "Thinking completely differently, what if instead of the obvious solution, we explored the exact opposite? Your turn—take any of these in a new direction.",
    "Let's play ping-pong with ideas! I'll suggest a crazy feature, and you build on it without criticizing it."
  ],
  prototype: [
    "Let's map these ideas on two axes: innovation potential (low/medium/high) and implementation complexity (low/medium/high).",
    "I’m simulating a busy parent encountering your 5-step onboarding—likely drop-off at step 3. How do we fix this?",
    "Simulating your IT stakeholder: There are GDPR compliance concerns for storing images here. Should we explore alternative methods?"
  ],
  test: [
    "Let’s dig deeper. I’ll facilitate: 'Can you walk me through using this for your actual workflow? Where would you access this during your day?'",
    "If a stakeholder gave vague feedback like 'It's fine', what open-ended question would you ask to draw out a vivid story?",
    "What would make the user choose this over their current solution? Let's analyze the pros and cons based on the feedback."
  ]
};

export const getRandomPrompt = (phase) => {
  const prompts = SOCRATIC_PROMPTS[phase] || SOCRATIC_PROMPTS['empathize'];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};
