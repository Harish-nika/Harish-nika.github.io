import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "public", "content");
const profilePath = path.join(contentDir, "profile-data.json");
const resumeMdPath = path.join(contentDir, "resume.md");
const resumePdfPath = path.join(contentDir, "Harish-Kumar-Resume.pdf");

const profile = JSON.parse(await fs.readFile(profilePath, "utf8"));

/** WinAnsi-safe text for PDF (Helvetica standard fonts). */
const pdfSafe = (text) =>
  String(text)
    .replace(/\u2192/g, "->")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/[^\x00-\xFF]/g, " ");

const lines = [];
lines.push(`# ${profile.basics.name}`);
lines.push(`${profile.basics.title}`);
lines.push(
  `${profile.basics.location} | ${profile.basics.email} | ${profile.basics.phone}`
);
lines.push(`${profile.basics.linkedin} | ${profile.basics.github}`);
lines.push(`${profile.basics.portfolio}`);
lines.push("");
lines.push("## Summary");
lines.push(profile.basics.summary);
if (profile.basics.highlights?.length) {
  for (const h of profile.basics.highlights) {
    lines.push(`- ${h}`);
  }
}
lines.push("");
if (profile.basics.keywords?.length) {
  lines.push("## Core Competencies");
  lines.push(profile.basics.keywords.join(" | "));
  lines.push("");
}

lines.push("## Experience");
for (const exp of profile.experience) {
  lines.push(`### ${exp.role} - ${exp.company}`);
  lines.push(`_${exp.period}_`);
  for (const point of exp.highlights) {
    lines.push(`- ${point}`);
  }
  lines.push("");
}

lines.push("## Education");
for (const edu of profile.education) {
  lines.push(`- **${edu.degree}**, ${edu.institution} (${edu.period}) - ${edu.score}`);
}
lines.push("");

lines.push("## Technical Skills");
lines.push(`- AI/ML: ${profile.skills.ai_ml.join(", ")}`);
lines.push(`- Engineering: ${profile.skills.engineering.join(", ")}`);
lines.push(`- DevOps/GitOps: ${profile.skills.devops_gitops.join(", ")}`);
lines.push("");

lines.push("## Key Projects");
for (const project of profile.projects) {
  const gh = project.github ? ` | ${project.github}` : "";
  lines.push(`- **${project.name}** (${project.context})`);
  lines.push(`  ${project.summary} [${project.stack.join(", ")}]`);
  lines.push(`  ${project.link}${gh}`);
}
lines.push("");

lines.push("## Certifications");
for (const cert of profile.certifications) {
  const name = typeof cert === "string" ? cert : cert.name;
  const link = typeof cert === "string" ? "" : cert.link;
  lines.push(link ? `- ${name}: ${link}` : `- ${name}`);
}

await fs.writeFile(resumeMdPath, `${lines.join("\n")}\n`, "utf8");

const pdfDoc = await PDFDocument.create();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

let page = pdfDoc.addPage([595, 842]);
let y = 810;
const left = 42;
const normalSize = 10;
const titleSize = 16;
const sectionSize = 11.5;
const bottomMargin = 42;
const pageWidth = 595;

const ensureSpace = (requiredHeight) => {
  if (y - requiredHeight >= bottomMargin) {
    return;
  }
  page = pdfDoc.addPage([595, 842]);
  y = 810;
};

const wrapText = (text, activeFont, size, maxWidth) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [""];
  }
  const linesOut = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (activeFont.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      linesOut.push(current);
      current = words[i];
    }
  }
  linesOut.push(current);
  return linesOut;
};

const drawLine = (text, opts = {}) => {
  const { bold = false, size = normalSize, color = rgb(0.1, 0.1, 0.1), indent = 0 } = opts;
  const activeFont = bold ? boldFont : font;
  const maxWidth = pageWidth - left - 42 - indent;
  const lineHeight = Math.max(12, size + 2.5);
  const wrappedLines = wrapText(pdfSafe(text), activeFont, size, maxWidth);
  ensureSpace(wrappedLines.length * lineHeight + 3);

  for (const wrappedLine of wrappedLines) {
    page.drawText(wrappedLine, {
      x: left + indent,
      y,
      size,
      font: activeFont,
      color,
    });
    y -= lineHeight;
  }
  y -= 3;
};

drawLine(profile.basics.name, { bold: true, size: titleSize, color: rgb(0.05, 0.2, 0.45) });
drawLine(profile.basics.title, { bold: true, size: 12 });
drawLine(`${profile.basics.email} | ${profile.basics.phone}`);
drawLine(profile.basics.location);
drawLine(profile.basics.linkedin);
drawLine(profile.basics.github);
drawLine(profile.basics.portfolio);
y -= 4;

drawLine("PROFESSIONAL SUMMARY", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
drawLine(profile.basics.summary);
for (const h of profile.basics.highlights || []) {
  drawLine(`- ${h}`, { indent: 6 });
}
y -= 2;

if (profile.basics.keywords?.length) {
  drawLine("CORE COMPETENCIES", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
  drawLine(profile.basics.keywords.join(" | "));
  y -= 2;
}

drawLine("EXPERIENCE", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const exp of profile.experience) {
  drawLine(`${exp.role}`, { bold: true });
  drawLine(`${exp.company} | ${exp.period}`, { color: rgb(0.3, 0.3, 0.3) });
  for (const point of exp.highlights) {
    drawLine(`- ${point}`, { indent: 8 });
  }
  y -= 2;
}

drawLine("EDUCATION", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const edu of profile.education) {
  drawLine(`${edu.degree}, ${edu.institution} (${edu.period}) - ${edu.score}`);
}
y -= 2;

drawLine("TECHNICAL SKILLS", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
drawLine(`AI/ML: ${profile.skills.ai_ml.join(", ")}`);
drawLine(`Engineering: ${profile.skills.engineering.join(", ")}`);
drawLine(`DevOps/GitOps: ${profile.skills.devops_gitops.join(", ")}`);
y -= 2;

drawLine("PROJECTS", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const project of profile.projects) {
  drawLine(`${project.name}`, { bold: true });
  drawLine(`Where: ${project.context}`, { indent: 6, color: rgb(0.3, 0.3, 0.3) });
  drawLine(project.summary, { indent: 6 });
  drawLine(`Tech: ${project.stack.join(", ")}`, { indent: 6, size: 9.5 });
  drawLine(project.link, { indent: 6, size: 9.5, color: rgb(0.25, 0.25, 0.25) });
  if (project.github) {
    drawLine(project.github, { indent: 6, size: 9.5, color: rgb(0.25, 0.25, 0.25) });
  }
  y -= 1;
}

drawLine("CERTIFICATIONS", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const cert of profile.certifications) {
  const name = typeof cert === "string" ? cert : cert.name;
  const link = typeof cert === "string" ? "" : cert.link;
  drawLine(link ? `- ${name}` : `- ${name}`);
  if (link) {
    drawLine(link, { indent: 10, size: 9.5, color: rgb(0.25, 0.25, 0.25) });
  }
}

const pdfBytes = await pdfDoc.save();
await fs.writeFile(resumePdfPath, pdfBytes);
console.log(`Generated ${resumeMdPath}`);
console.log(`Generated ${resumePdfPath}`);
