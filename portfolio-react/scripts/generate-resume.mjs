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
const { basics } = profile;
const resumeProjects = profile.projects.filter((p) => p.resume);
const resumeCertifications = [...new Set(profile.certifications.map((c) => c.resumeLabel || c.name))];
const stripScheme = (url) => String(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
const formatPeriod = (period) => String(period).replace(/\s-\s/g, " – ");

/** Keep only characters Helvetica's WinAnsi encoding can render. */
const pdfSafe = (text) =>
  String(text)
    .replace(/\u2192/g, "->")
    .replace(/[^\x00-\xFF\u2022\u2013\u2014\u2018\u2019\u201c\u201d]/g, " ");

// ---------- Markdown ----------
const md = [];
md.push(`# ${basics.name}`);
md.push(`**${basics.title}** | ${basics.headline}`);
md.push(`${basics.location} | ${basics.phone} | ${basics.email}`);
md.push(`${basics.portfolio} | ${basics.linkedin} | ${basics.github}`);
md.push("");
md.push("## Summary");
md.push(basics.summary);
md.push("");
md.push("## Experience");
for (const exp of profile.experience) {
  md.push(`### ${exp.role} — ${exp.company}`);
  md.push(`_${formatPeriod(exp.period)}_`);
  for (const point of exp.highlights) md.push(`- ${point}`);
  md.push("");
}
md.push("## Projects");
for (const p of resumeProjects) {
  md.push(`- **${p.name}** (${p.stack.join(", ")}): ${p.summary}`);
  md.push(`  ${p.link}${p.github ? ` | ${p.github}` : ""}`);
}
md.push("");
md.push("## Skills");
for (const group of profile.skills) md.push(`- **${group.label}:** ${group.items.join(", ")}`);
md.push("");
md.push("## Education");
for (const edu of profile.education) {
  md.push(`- **${edu.degree}**, ${edu.institution} (${formatPeriod(edu.period)}) — ${edu.score}`);
}
md.push("");
md.push("## Certifications");
for (const cert of profile.certifications) md.push(`- [${cert.name}](${cert.link})`);
await fs.writeFile(resumeMdPath, `${md.join("\n")}\n`, "utf8");

// ---------- PDF ----------
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_X = 38;
const MARGIN_TOP = 32;
const MARGIN_BOTTOM = 28;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const INK = rgb(0.11, 0.13, 0.17);
const MUTED = rgb(0.36, 0.39, 0.44);
const ACCENT = rgb(0.07, 0.27, 0.5);
const RULE = rgb(0.76, 0.8, 0.86);

async function renderPdf(density) {
  const doc = await PDFDocument.create();
  doc.setTitle(`${basics.name} — Resume`);
  doc.setAuthor(basics.name);
  doc.setSubject(`${basics.title} | ${basics.headline}`);
  doc.setKeywords(profile.skills.flatMap((g) => g.items));

  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };

  const body = 9.4 * density;
  const small = 8.6 * density;
  const lead = 1.27;

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;

  const newPageIfNeeded = (height) => {
    if (y - height < MARGIN_BOTTOM) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN_TOP;
    }
  };

  /**
   * Draw mixed-style text that wraps across lines.
   * segments: [{ text, font, size, color }]; continuation lines start at `hang`.
   */
  const drawRich = (segments, { indent = 0, hang = indent, gapAfter = 0 } = {}) => {
    const words = [];
    for (const seg of segments) {
      const font = fonts[seg.font || "regular"];
      const size = seg.size || body;
      const color = seg.color || INK;
      const parts = pdfSafe(seg.text).split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          if (words.length) words[words.length - 1].spaceAfter = true;
          continue;
        }
        words.push({ text: part, font, size, color, spaceAfter: false });
      }
    }

    const lines = [];
    let line = [];
    let lineW = 0;
    let maxW = CONTENT_W - indent;
    for (const w of words) {
      const wW = w.font.widthOfTextAtSize(w.text, w.size);
      const prev = line[line.length - 1];
      const spaceW = prev && prev.spaceAfter ? prev.font.widthOfTextAtSize(" ", prev.size) : 0;
      if (line.length && lineW + spaceW + wW > maxW) {
        lines.push(line);
        line = [];
        lineW = 0;
        maxW = CONTENT_W - hang;
      }
      const leading = line.length && line[line.length - 1].spaceAfter
        ? line[line.length - 1].font.widthOfTextAtSize(" ", line[line.length - 1].size)
        : 0;
      line.push(w);
      lineW += leading + wW;
    }
    if (line.length) lines.push(line);

    lines.forEach((ln, idx) => {
      const lineSize = Math.max(...ln.map((w) => w.size));
      const lineH = lineSize * lead;
      newPageIfNeeded(lineH);
      let x = MARGIN_X + (idx === 0 ? indent : hang);
      let run = null;
      const flush = () => {
        if (!run) return;
        page.drawText(run.text, { x: run.x, y, size: run.size, font: run.font, color: run.color });
        run = null;
      };
      ln.forEach((w, i) => {
        const text = w.text + (w.spaceAfter && i < ln.length - 1 ? " " : "");
        if (run && run.font === w.font && run.size === w.size && run.color === w.color) {
          run.text += text;
        } else {
          flush();
          run = { text, x, font: w.font, size: w.size, color: w.color };
        }
        x += w.font.widthOfTextAtSize(text, w.size);
      });
      flush();
      y -= lineH;
    });
    y -= gapAfter;
  };

  const drawRightAligned = (text, { size = small, color = MUTED, font = "regular" } = {}) => {
    const f = fonts[font];
    const safe = pdfSafe(text);
    const w = f.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: PAGE_W - MARGIN_X - w, y, size, font: f, color });
  };

  const drawSection = (title) => {
    newPageIfNeeded(26 * density);
    y -= 7 * density;
    drawRich([{ text: title.toUpperCase(), font: "bold", size: 10.4 * density, color: ACCENT }]);
    page.drawLine({
      start: { x: MARGIN_X, y: y + 8.5 * density },
      end: { x: PAGE_W - MARGIN_X, y: y + 8.5 * density },
      thickness: 0.7,
      color: RULE,
    });
    y -= 2.5 * density;
  };

  const drawBullet = (text) => {
    newPageIfNeeded(body * lead);
    page.drawText("•", { x: MARGIN_X + 3, y, size: body, font: fonts.regular, color: ACCENT });
    drawRich([{ text, size: body }], { indent: 12, hang: 12, gapAfter: 1.2 * density });
  };

  /** Bold title on the left with a muted date on the right (first line). */
  const drawRow = (leftSegments, rightText) => {
    newPageIfNeeded(body * lead * 2);
    if (rightText) drawRightAligned(rightText);
    drawRich(leftSegments);
  };

  // Header
  drawRich([{ text: basics.name, font: "bold", size: 20 * density, color: ACCENT }], { gapAfter: 2 * density });
  drawRich(
    [
      { text: basics.title, font: "bold", size: 10.8 * density },
      { text: `  |  ${basics.headline}`, size: 10.2 * density, color: MUTED },
    ],
    { gapAfter: 2.5 * density }
  );
  drawRich([{ text: `${basics.location}  |  ${basics.phone}  |  ${basics.email}`, size: small, color: MUTED }]);
  drawRich([
    {
      text: [basics.portfolio, basics.linkedin, basics.github].map(stripScheme).join("  |  "),
      size: small,
      color: MUTED,
    },
  ]);

  drawSection("Summary");
  drawRich([{ text: basics.summary, size: body }]);

  drawSection("Experience");
  profile.experience.forEach((exp, idx) => {
    if (idx) y -= 3.5 * density;
    drawRow([{ text: exp.role, font: "bold", size: 10 * density }], formatPeriod(exp.period));
    drawRich([{ text: exp.company, font: "italic", size: small, color: MUTED }], { gapAfter: 1.5 * density });
    exp.highlights.forEach(drawBullet);
  });

  drawSection("Projects");
  resumeProjects.forEach((p, idx) => {
    if (idx) y -= 2.5 * density;
    drawRich(
      [
        { text: p.name, font: "bold", size: 9.6 * density },
        { text: `  |  ${p.stack.join(", ")}`, size: small, color: MUTED },
      ],
      { gapAfter: 0.8 * density }
    );
    drawRich([{ text: p.summary, size: body }], { indent: 12, hang: 12 });
  });

  drawSection("Skills");
  profile.skills.forEach((group) => {
    drawRich(
      [
        { text: `${group.label}: `, font: "bold", size: body },
        { text: group.items.join(", "), size: body },
      ],
      { hang: 12, gapAfter: 1.2 * density }
    );
  });

  drawSection("Education");
  const [degree, ...school] = profile.education;
  drawRow([{ text: degree.degree, font: "bold", size: 9.8 * density }], formatPeriod(degree.period));
  drawRich([{ text: `${degree.institution}  |  ${degree.score}`, font: "italic", size: small, color: MUTED }], {
    gapAfter: 1.5 * density,
  });
  drawRich(
    [
      {
        text: school.map((s) => `${s.degree}: ${s.score}, ${s.institution} (${s.period})`).join("   |   "),
        size: small,
        color: MUTED,
      },
    ],
    { hang: 0 }
  );

  drawSection("Certifications");
  drawRich([{ text: resumeCertifications.join("  •  "), size: body }]);

  return doc;
}

let pdfDoc;
for (const density of [1, 0.97, 0.94, 0.91]) {
  pdfDoc = await renderPdf(density);
  if (pdfDoc.getPageCount() === 1) break;
}

await fs.writeFile(resumePdfPath, await pdfDoc.save());
console.log(`Generated ${resumeMdPath}`);
console.log(`Generated ${resumePdfPath} (${pdfDoc.getPageCount()} page${pdfDoc.getPageCount() > 1 ? "s" : ""})`);
