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

const featuredProjects = (profile.projects || []).slice(0, 6);

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
for (const project of featuredProjects) {
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

const pageWidth = 595;
const pageHeight = 842;
const left = 40;
const right = 40;
const contentWidth = pageWidth - left - right;
const bottomMargin = 36;
const ink = rgb(0.12, 0.14, 0.18);
const muted = rgb(0.35, 0.38, 0.42);
const accent = rgb(0.08, 0.28, 0.52);
const rule = rgb(0.78, 0.82, 0.88);

let page = pdfDoc.addPage([pageWidth, pageHeight]);
let y = 812;

const ensureSpace = (requiredHeight) => {
  if (y - requiredHeight >= bottomMargin) return;
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  y = 812;
};

const wrapText = (text, activeFont, size, maxWidth) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const out = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (activeFont.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      out.push(current);
      current = words[i];
    }
  }
  out.push(current);
  return out;
};

const drawText = (text, opts = {}) => {
  const {
    bold = false,
    size = 9.5,
    color = ink,
    indent = 0,
    gapAfter = 1.5,
  } = opts;
  const activeFont = bold ? boldFont : font;
  const maxWidth = contentWidth - indent;
  const lineHeight = size + 2.2;
  const wrapped = wrapText(pdfSafe(text), activeFont, size, maxWidth);
  ensureSpace(wrapped.length * lineHeight + gapAfter + 2);

  for (const line of wrapped) {
    page.drawText(line, {
      x: left + indent,
      y,
      size,
      font: activeFont,
      color,
    });
    y -= lineHeight;
  }
  y -= gapAfter;
};

const drawSection = (title) => {
  ensureSpace(22);
  y -= 4;
  drawText(title, { bold: true, size: 10.5, color: accent, gapAfter: 2 });
  page.drawLine({
    start: { x: left, y: y + 2 },
    end: { x: pageWidth - right, y: y + 2 },
    thickness: 0.8,
    color: rule,
  });
  y -= 6;
};

// Header
drawText(profile.basics.name, { bold: true, size: 18, color: accent, gapAfter: 2 });
drawText(profile.basics.title, { bold: true, size: 11, color: ink, gapAfter: 3 });
drawText(
  `${profile.basics.email}  |  ${profile.basics.phone}  |  ${profile.basics.location}`,
  { size: 8.5, color: muted, gapAfter: 1.5 }
);
drawText(
  `${profile.basics.portfolio}  |  ${profile.basics.linkedin}  |  ${profile.basics.github}`,
  { size: 8.5, color: muted, gapAfter: 2 }
);

drawSection("PROFESSIONAL SUMMARY");
drawText(profile.basics.summary, { size: 9, gapAfter: 2 });
for (const h of (profile.basics.highlights || []).slice(0, 5)) {
  drawText(`• ${h}`, { size: 8.8, indent: 4, gapAfter: 1 });
}

if (profile.basics.keywords?.length) {
  drawSection("CORE COMPETENCIES");
  drawText(profile.basics.keywords.join("  •  "), { size: 8.5, color: muted, gapAfter: 2 });
}

drawSection("EXPERIENCE");
for (const exp of profile.experience) {
  ensureSpace(40);
  drawText(exp.role, { bold: true, size: 10, gapAfter: 1 });
  drawText(`${exp.company}  |  ${exp.period}`, { size: 8.7, color: muted, gapAfter: 2 });
  for (const point of exp.highlights) {
    drawText(`• ${point}`, { size: 8.8, indent: 6, gapAfter: 1 });
  }
  y -= 3;
}

drawSection("EDUCATION");
for (const edu of profile.education) {
  drawText(
    `${edu.degree}  |  ${edu.institution}  |  ${edu.period}  |  ${edu.score}`,
    { size: 8.8, gapAfter: 1.5 }
  );
}

drawSection("TECHNICAL SKILLS");
drawText(`AI/ML: ${profile.skills.ai_ml.join(", ")}`, { size: 8.5, gapAfter: 1.5 });
drawText(`Engineering: ${profile.skills.engineering.join(", ")}`, { size: 8.5, gapAfter: 1.5 });
drawText(`DevOps/GitOps: ${profile.skills.devops_gitops.join(", ")}`, { size: 8.5, gapAfter: 2 });

drawSection("KEY PROJECTS");
for (const project of featuredProjects) {
  ensureSpace(28);
  drawText(project.name, { bold: true, size: 9.2, gapAfter: 1 });
  drawText(
    `${project.context}  |  ${project.stack.join(", ")}`,
    { size: 8.2, color: muted, indent: 4, gapAfter: 1 }
  );
  drawText(project.summary, { size: 8.5, indent: 4, gapAfter: 2 });
}

drawSection("CERTIFICATIONS");
for (const cert of profile.certifications) {
  const name = typeof cert === "string" ? cert : cert.name;
  drawText(`• ${name}`, { size: 8.6, gapAfter: 1.2 });
}

const pdfBytes = await pdfDoc.save();
await fs.writeFile(resumePdfPath, pdfBytes);
console.log(`Generated ${resumeMdPath}`);
console.log(`Generated ${resumePdfPath}`);
