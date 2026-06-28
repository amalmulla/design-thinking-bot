import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to format date
const formatDate = () => new Date().toISOString().slice(0, 10);

// Helper to get slug
const getSlug = (name) => (name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

// Helper to clean basic Markdown for PDF export
const cleanMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1')     // italic
    .replace(/__(.*?)__/g, '$1')     // bold
    .replace(/_(.*?)_/g, '$1')       // italic
    .replace(/#{1,6}\s?/g, '')       // headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/`(.*?)`/g, '$1')       // inline code
    .replace(/\n\s*-\s/g, '\n- ')    // list dashes (use hyphen, not bullet, to avoid jsPDF spacing glitches)
    // Sanitize for jsPDF standard fonts to prevent width calculation glitches
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D]/g, '"') // curly double quotes
    .replace(/[\u2013\u2014]/g, '-') // dashes
    .replace(/[\u2022]/g, '-')       // bullets
    .replace(/[^\x00-\x7F\n\r]/g, '') // remove all other non-ASCII
    .replace(/  +/g, ' ')            // remove consecutive spaces which can also glitch wrapping
    .trim();
};

export function exportProjectJSON(project) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, `project-${getSlug(project.title)}-${formatDate()}.json`);
}

export function exportProjectMarkdown(project, includeChat, includeCanvases) {
  let md = `# Project Export: ${project.title || 'Untitled'}\n\n`;
  md += `**Phase:** ${project.currentPhase || 'Unknown'}\n`;
  md += `**Student Name:** ${project.studentName || project.studentId || 'Unknown'}\n`;
  md += `**Exported On:** ${new Date().toLocaleString()}\n\n`;
  md += `---\n\n`;

  if (includeCanvases && project.canvasData) {
    md += `## Canvases\n\n`;
    for (const [phase, data] of Object.entries(project.canvasData)) {
      const displayPhase = phase === 'prototypeData' ? 'PROTOTYPE' : phase.toUpperCase();
      md += `### Phase: ${displayPhase}\n\n`;
      if (Array.isArray(data)) {
        data.forEach(item => {
          let text = item.text || item.name || item;
          if (typeof text === 'string') text = text.replace(/<br\s*\/?>/gi, '\n  ');
          let desc = item.description ? `\n  *Description:* ${item.description}` : '';
          let link = item.url && item.url !== '#' ? ` (${item.url})` : '';
          md += `- ${text}${link}${desc}\n`;
        });
        md += `\n`;
      } else if (typeof data === 'object') {
        for (const [key, val] of Object.entries(data)) {
          md += `#### ${key.toUpperCase()}\n`;
          if (Array.isArray(val)) {
            val.forEach(item => {
              let text = item.text || item.name || item;
              if (typeof text === 'string') text = text.replace(/<br\s*\/?>/gi, '\n  ');
              md += `- ${text}\n`;
            });
          } else if (typeof val === 'string') {
            md += `${val.replace(/<br\s*\/?>/gi, '\n  ')}\n`;
          } else {
            md += `${JSON.stringify(val)}\n`;
          }
          md += `\n`;
        }
      }
    }
    md += `---\n\n`;
  }

  if (includeChat && project.messages) {
    md += `## Chat Conversation\n\n`;
    if (project.messages.length === 0) {
      md += `_No chat conversation yet._\n\n`;
    } else {
      project.messages.forEach(msg => {
        const speaker = msg.role === 'ai' ? 'Design AI' : 'Student';
        const time = msg.timestamp ? ` — ${msg.timestamp}` : '';
        md += `**${speaker}${time}**\n\n${msg.content}\n\n`;
        if (msg.unlockedPhase) {
          md += `> 🏆 **Achievement Unlocked:** The student successfully unlocked the **${msg.unlockedPhase.toUpperCase()}** phase!\n\n`;
        }
      });
    }
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `project-${getSlug(project.title)}-${formatDate()}.md`);
}

export function exportProjectPDF(project, includeChat, includeCanvases) {
  const doc = new jsPDF();
  let yPos = 20;
  
  doc.setFontSize(18);
  doc.text(`Project Export: ${project.title || 'Untitled'}`, 14, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.text(`Phase: ${project.currentPhase || 'Unknown'}`, 14, yPos);
  yPos += 8;
  doc.text(`Student Name: ${project.studentName || project.studentId || 'Unknown'}`, 14, yPos);
  yPos += 8;
  doc.text(`Exported On: ${new Date().toLocaleString()}`, 14, yPos);
  yPos += 15;

  if (includeCanvases && project.canvasData) {
    doc.setFontSize(16);
    doc.text('Canvases', 14, yPos);
    yPos += 10;
    
    for (const [phase, data] of Object.entries(project.canvasData)) {
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      
      const displayPhase = phase === 'prototypeData' ? 'PROTOTYPE' : phase.toUpperCase();
      doc.setFontSize(14);
      doc.text(`Phase: ${displayPhase}`, 14, yPos);
      yPos += 8;
      
      if (Array.isArray(data)) {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        
        let tableData = data.map(item => {
          let text = item.text || item.name || item;
          if (typeof text === 'string') text = text.replace(/<br\s*\/?>/gi, '\n');
          let desc = item.description ? `\nDescription: ${item.description}` : '';
          let link = item.url && item.url !== '#' ? `\nURL: ${item.url}` : '';
          return [text + desc + link];
        });
        
        if (tableData.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [[displayPhase + ' ITEMS']],
            body: tableData,
            theme: 'grid',
            styles: { overflow: 'linebreak' },
            headStyles: { fillColor: [79, 70, 229] },
            margin: { left: 14, right: 14 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
      } else if (typeof data === 'object') {
        for (const [key, val] of Object.entries(data)) {
          if (yPos > 270) { doc.addPage(); yPos = 20; }
          
          let tableData = [];
          if (Array.isArray(val)) {
            tableData = val.map(item => {
              let text = item.text || item.name || item;
              if (typeof text === 'string') text = text.replace(/<br\s*\/?>/gi, '\n');
              return [text];
            });
          } else if (typeof val === 'string') {
            tableData = [[val.replace(/<br\s*\/?>/gi, '\n')]];
          } else {
            tableData = [[JSON.stringify(val)]];
          }
          
          if (tableData.length > 0) {
            autoTable(doc, {
              startY: yPos,
              head: [[key.toUpperCase()]],
              body: tableData,
              theme: 'grid',
              styles: { overflow: 'linebreak' },
              headStyles: { fillColor: [79, 70, 229] },
              margin: { left: 14, right: 14 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
          }
        }
      }
    }
  }

  if (includeChat && project.messages && project.messages.length > 0) {
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFontSize(16);
    doc.text('Chat Conversation', 14, yPos);
    yPos += 10;
    
    const chatData = project.messages.map(msg => {
      const speaker = msg.role === 'ai' ? 'Design AI' : 'Student';
      let cleanContent = cleanMarkdown(msg.content);
      if (msg.unlockedPhase) {
        cleanContent += `\n\n[🏆 UNLOCKED PHASE: ${msg.unlockedPhase.toUpperCase()}]`;
      }
      return [`${speaker}\n${msg.timestamp || ''}`, cleanContent];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Speaker', 'Message']],
      body: chatData,
      theme: 'striped',
      styles: { overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 35 } },
      headStyles: { fillColor: [50, 50, 50] },
      margin: { left: 14, right: 14 }
    });
  }

  doc.save(`project-${getSlug(project.title)}-${formatDate()}.pdf`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
