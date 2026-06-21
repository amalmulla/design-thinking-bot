// chatExport.js
// Builds a Markdown transcript of a project's Socratic chat conversation and
// triggers a client-side download. Used by teachers to export student chats.

/**
 * Turns a project's chat messages into a readable Markdown transcript.
 *
 * @param {Object} project - The active project ({ title, currentPhase, studentId, lastUpdated, messages })
 * @returns {string} Markdown document text
 */
export function buildChatMarkdown(project = {}) {
  const title = project.title || project.name || "Untitled Project";
  const phase = project.currentPhase
    ? project.currentPhase.charAt(0).toUpperCase() + project.currentPhase.slice(1)
    : "Unknown";
  const studentId = project.studentId || "Unknown";
  const exportedOn = new Date().toLocaleString();
  const messages = Array.isArray(project.messages) ? project.messages : [];

  const header = [
    `# Chat Conversation Export`,
    ``,
    `**Project:** ${title}`,
    `**Phase:** ${phase}`,
    `**Student ID:** ${studentId}`,
    `**Messages:** ${messages.length}`,
    `**Exported:** ${exportedOn}`,
    ``,
    `---`,
    ``,
  ].join("\n");

  if (messages.length === 0) {
    return header + "_This project has no chat conversation yet._\n";
  }

  const body = messages
    .map((msg) => {
      const speaker = msg.role === "ai" ? "Design AI" : "Student";
      const time = msg.timestamp ? ` — ${msg.timestamp}` : "";
      return `### ${speaker}${time}\n\n${msg.content || ""}\n`;
    })
    .join("\n");

  return header + body;
}

/**
 * Builds and downloads a project's chat conversation as a .md file.
 *
 * @param {Object} project - The active project to export
 */
export function exportChatAsMarkdown(project = {}) {
  const markdown = buildChatMarkdown(project);

  // Build a safe, descriptive filename: chat-<slugified-title>-<YYYY-MM-DD>.md
  const slug = (project.title || project.name || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "project";
  const date = new Date().toISOString().slice(0, 10);
  const filename = `chat-${slug}-${date}.md`;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
