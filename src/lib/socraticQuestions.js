// src/lib/socraticQuestions.js
// Static prompt text banks from syllabus for mock display

export const SOCRATIC_PROMPTS = {
  empathize: [
    "What did you observe that surprised you most during your user interactions?",
    "How might we look at the problem from the perspective of a user who is completely unfamiliar with this system?",
    "What are the emotional pain points your users expressed that go beyond just functional needs?",
    "If you could only solve one frustration for your user, which one would it be and why?"
  ],
  define: [
    "Why does the user feel this way? What are the underlying insights behind their primary needs?",
    "Is your POV statement too broad or too narrow? How can we refine it to focus on a single key insight?",
    "What assumptions are you making about the user's root cause, and how can we challenge them?",
    "How does your problem statement inspire new brainstorming directions?"
  ],
  ideate: [
    "How can we push this solution to the absolute extreme? What would a wild, budget-free version look like?",
    "What would the opposite of your current idea be, and is there any value in that reversed perspective?",
    "How could you combine two of your digital sticky notes to form a hybrid, stronger solution?",
    "What is the simplest, most elegant version of this idea that could be built in one afternoon?"
  ],
  prototype: [
    "What is the single most critical assumption this low-fidelity prototype needs to test first?",
    "How can we make this mockup even simpler so that users focus entirely on the core interaction?",
    "What materials or low-fi wires best represent the user flow without getting bogged down in visual details?",
    "How does this interactive mockup address the emotional needs identified in your Define phase?"
  ],
  test: [
    "What did the user do during testing that was completely different from what you expected?",
    "Based on the negative feedback, what is the most important structural adjustment we should make next?",
    "What questions did your test user raise that you didn't have answers for?",
    "How did the user's behavior validate or invalidate your initial POV statement?"
  ]
};

export const getRandomPrompt = (phase) => {
  const prompts = SOCRATIC_PROMPTS[phase] || SOCRATIC_PROMPTS['empathize'];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};
