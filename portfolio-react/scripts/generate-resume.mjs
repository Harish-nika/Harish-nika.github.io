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

const lines = [];
lines.push(`# ${profile.basics.name}`);
lines.push(`${profile.basics.title}`);
lines.push(
  `${profile.basics.location} | ${profile.basics.email} | ${profile.basics.phone}`
);
lines.push(`${profile.basics.linkedin} | ${profile.basics.github}`);
lines.push("");
lines.push("## Summary");
lines.push(profile.basics.summary);
lines.push("");

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

lines.push("## Skills");
lines.push(`- AI/ML: ${profile.skills.ai_ml.join(", ")}`);
lines.push(`- Engineering: ${profile.skills.engineering.join(", ")}`);
lines.push(`- DevOps/GitOps: ${profile.skills.devops_gitops.join(", ")}`);
lines.push("");

lines.push("## Key Projects");
for (const project of profile.projects) {
  lines.push(`- **${project.name}** - ${project.stack.join(", ")} (${project.link})`);
}
lines.push("");

lines.push("## Certifications");
for (const cert of profile.certifications) {
  lines.push(`- ${cert}`);
}

await fs.writeFile(resumeMdPath, `${lines.join("\n")}\n`, "utf8");

const pdfDoc = await PDFDocument.create();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

let page = pdfDoc.addPage([595, 842]); // A4
let y = 810;
const left = 40;
const normalSize = 10.5;
const titleSize = 18;
const sectionSize = 12;
const bottomMargin = 40;
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
  const maxWidth = pageWidth - left - 40 - indent;
  const lineHeight = Math.max(13, size + 3);
  const wrappedLines = wrapText(text, activeFont, size, maxWidth);
  ensureSpace(wrappedLines.length * lineHeight + 4);

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
  y -= 4;
};

drawLine(profile.basics.name, { bold: true, size: titleSize, color: rgb(0.05, 0.2, 0.45) });
drawLine(profile.basics.title, { bold: true, size: 12 });
drawLine(`${profile.basics.location} | ${profile.basics.email} | ${profile.basics.phone}`);
drawLine(`${profile.basics.linkedin} | ${profile.basics.github}`);
y -= 6;

drawLine("Summary", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
drawLine(profile.basics.summary);
y -= 4;

drawLine("Experience", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const exp of profile.experience) {
  drawLine(`${exp.role} - ${exp.company}`, { bold: true });
  drawLine(exp.period, { color: rgb(0.35, 0.35, 0.35) });
  for (const point of exp.highlights) {
    drawLine(`- ${point}`, { indent: 8 });
  }
  y -= 3;
}

drawLine("Education", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const edu of profile.education) {
  drawLine(`- ${edu.degree}, ${edu.institution} (${edu.period}) - ${edu.score}`);
}
y -= 3;

drawLine("Skills", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
drawLine(`AI/ML: ${profile.skills.ai_ml.join(", ")}`);
drawLine(`Engineering: ${profile.skills.engineering.join(", ")}`);
drawLine(`DevOps/GitOps: ${profile.skills.devops_gitops.join(", ")}`);
y -= 3;

drawLine("Projects", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const project of profile.projects) {
  drawLine(`- ${project.name} (${project.stack.join(", ")})`);
}
y -= 3;

drawLine("Certifications", { bold: true, size: sectionSize, color: rgb(0.05, 0.2, 0.45) });
for (const cert of profile.certifications) {
  drawLine(`- ${cert}`);
}

const pdfBytes = await pdfDoc.save();
await fs.writeFile(resumePdfPath, pdfBytes);
console.log(`Generated ${resumeMdPath}`);
console.log(`Generated ${resumePdfPath}`);
