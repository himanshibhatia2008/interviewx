// Builds a clean, printable PDF report with jsPDF (loaded on demand).
import { rankFor } from "./constants.js";

export async function downloadReport(result) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  const ensure = (h) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (str, { size = 10.5, color = [40, 42, 60], bold = false, indent = 0, gap = 4 } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(str), W - M * 2 - indent);
    lines.forEach((ln) => {
      ensure(size + 4);
      doc.text(ln, M + indent, y);
      y += size + 4;
    });
    y += gap;
  };
  const heading = (str) => {
    y += 8;
    ensure(30);
    text(str, { size: 13, bold: true, color: [124, 92, 255], gap: 6 });
  };

  // Header band
  doc.setFillColor(10, 11, 20);
  doc.rect(0, 0, W, 110, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 184, 77);
  doc.text("InterviewX", M, 52);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 222, 240);
  doc.text("AI Interview Performance Report", M, 74);
  doc.text(new Date(result.date).toLocaleString(), M, 92);
  y = 150;

  const avg = result.overall;
  const rank = rankFor(avg).label;
  text(`${result.config.role}  ·  ${result.config.difficulty}  ·  ${result.config.type}`, { size: 12, bold: true });
  text(`Overall score: ${avg.toFixed(1)} / 10   —   ${rank}`, { size: 16, bold: true, color: [20, 150, 100], gap: 10 });
  if (result.summary?.summary) text(result.summary.summary);

  heading("Skill ratings");
  const skills = result.summary?.skills || {};
  [["Communication", skills.communication], ["Relevance", skills.relevance], ["Confidence", skills.confidence], ["Technical Knowledge", skills.technical]].forEach(([k, v]) => {
    ensure(20);
    doc.setFontSize(10.5);
    doc.setTextColor(40, 42, 60);
    doc.text(k, M, y);
    doc.setFillColor(230, 230, 240);
    doc.roundedRect(M + 140, y - 8, 240, 9, 4, 4, "F");
    doc.setFillColor(124, 92, 255);
    doc.roundedRect(M + 140, y - 8, Math.max(6, (240 * (v || 0)) / 10), 9, 4, 4, "F");
    doc.text(`${v ?? "-"}/10`, M + 395, y);
    y += 20;
  });

  heading("Top strengths");
  (result.summary?.top_strengths || []).forEach((s) => text(`•  ${s}`, { indent: 4 }));
  heading("Top improvement tips");
  (result.summary?.top_improvements || []).forEach((s) => text(`•  ${s}`, { indent: 4 }));

  heading("Question-by-question breakdown");
  result.items.forEach((it, i) => {
    ensure(60);
    text(`Q${i + 1}. ${it.question}`, { bold: true, gap: 2 });
    text(`Score: ${it.score}/10${it.skipped ? " (skipped)" : ""}`, { color: [110, 110, 130], gap: 2 });
    if (!it.skipped) text(`Your answer: ${it.answer || "—"}`, { color: [80, 82, 100], gap: 2 });
    if (it.feedback?.improvements?.length) text(`Improve: ${it.feedback.improvements.join(" ")}`, { color: [80, 82, 100] });
    y += 4;
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 165);
    doc.text(`InterviewX · page ${p} of ${pages}`, W - M, H - 24, { align: "right" });
  }
  doc.save(`InterviewX-Report-${result.config.role.replace(/\W+/g, "-")}-${new Date(result.date).toISOString().slice(0, 10)}.pdf`);
}
