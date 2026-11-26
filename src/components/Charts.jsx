// Theme-aware Chart.js wrappers: per-question bars, skills radar, progress line.
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement,
  RadialLinearScale, Filler, Tooltip,
} from "chart.js";
import { Bar, Radar, Line } from "react-chartjs-2";
import { useApp } from "../AppContext.jsx";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip);

function useTheme() {
  const { settings } = useApp();
  const dark = settings.theme === "dark";
  return {
    text: dark ? "#a3a7c2" : "#4d5170",
    grid: dark ? "rgba(255,255,255,0.07)" : "rgba(20,20,60,0.08)",
    violet: dark ? "#9b7bff" : "#6d3df0",
    blue: dark ? "#6fa8ff" : "#2563eb",
    green: dark ? "#3DDC97" : "#12a86a",
    amber: dark ? "#FFB84D" : "#c77800",
    coral: dark ? "#FF6B6B" : "#e04848",
    tooltipBg: dark ? "#1a1c2e" : "#ffffff",
    tooltipText: dark ? "#eceefb" : "#16172b",
    dark,
  };
}

const font = { family: "Inter, system-ui, sans-serif", size: 12 };

function tooltip(t) {
  return {
    backgroundColor: t.tooltipBg,
    titleColor: t.tooltipText,
    bodyColor: t.tooltipText,
    borderColor: t.grid,
    borderWidth: 1,
    padding: 10,
    cornerRadius: 10,
    displayColors: false,
    titleFont: { ...font, weight: "600" },
    bodyFont: font,
  };
}

export function QuestionBarChart({ items }) {
  const t = useTheme();
  const colorFor = (s) => (s >= 8 ? t.green : s >= 5 ? t.amber : t.coral);
  return (
    <Bar
      data={{
        labels: items.map((_, i) => `Q${i + 1}`),
        datasets: [{
          data: items.map((it) => it.score),
          backgroundColor: items.map((it) => colorFor(it.score)),
          borderRadius: { topLeft: 4, topRight: 4 },
          borderSkipped: "bottom",
          maxBarThickness: 34,
          categoryPercentage: 0.7,
        }],
      }}
      options={{
        maintainAspectRatio: false,
        animation: { duration: 1100, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip(t),
            callbacks: {
              title: (ctx) => items[ctx[0].dataIndex].question.slice(0, 70) + (items[ctx[0].dataIndex].question.length > 70 ? "…" : ""),
              label: (ctx) => `Score: ${ctx.raw}/10${items[ctx.dataIndex].skipped ? " (skipped)" : ""}`,
            },
          },
        },
        scales: {
          y: { min: 0, max: 10, ticks: { stepSize: 2, color: t.text, font }, grid: { color: t.grid }, border: { display: false } },
          x: { ticks: { color: t.text, font }, grid: { display: false }, border: { color: t.grid } },
        },
      }}
    />
  );
}

/** Generic single-series bar chart (e.g. quiz scores per attempt). */
export function SimpleBarChart({ labels, values, max = 100, suffix = "%", titles = [] }) {
  const t = useTheme();
  const colorFor = (v) => (v / max >= 0.8 ? t.green : v / max >= 0.5 ? t.amber : t.coral);
  return (
    <Bar
      data={{
        labels,
        datasets: [{
          data: values,
          backgroundColor: values.map(colorFor),
          borderRadius: { topLeft: 4, topRight: 4 },
          borderSkipped: "bottom",
          maxBarThickness: 30,
          categoryPercentage: 0.7,
        }],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...tooltip(t), callbacks: { title: (c) => titles[c[0].dataIndex] || c[0].label, label: (c) => `${c.raw}${suffix}` } },
        },
        scales: {
          y: { min: 0, max, ticks: { color: t.text, font, stepSize: max / 5 }, grid: { color: t.grid }, border: { display: false } },
          x: { ticks: { color: t.text, font, maxRotation: 0, autoSkip: true }, grid: { display: false }, border: { color: t.grid } },
        },
      }}
    />
  );
}

export function SkillsRadar({ skills }) {
  const t = useTheme();
  const labels = ["Communication", "Relevance", "Confidence", "Technical Knowledge"];
  const values = [skills.communication, skills.relevance, skills.confidence, skills.technical];
  return (
    <Radar
      data={{
        labels,
        datasets: [{
          data: values,
          backgroundColor: t.dark ? "rgba(139,92,246,0.22)" : "rgba(109,61,240,0.14)",
          borderColor: t.violet,
          borderWidth: 2,
          pointBackgroundColor: t.blue,
          pointBorderColor: t.tooltipBg,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      }}
      options={{
        maintainAspectRatio: false,
        animation: { duration: 1200 },
        plugins: { legend: { display: false }, tooltip: { ...tooltip(t), callbacks: { label: (c) => `${c.label}: ${c.raw}/10` } } },
        scales: {
          r: {
            min: 0, max: 10,
            ticks: { stepSize: 2, display: false },
            grid: { color: t.grid },
            angleLines: { color: t.grid },
            pointLabels: { color: t.text, font: { ...font, size: 12, weight: "500" } },
          },
        },
      }}
    />
  );
}

export function ProgressLine({ entries }) {
  const t = useTheme();
  return (
    <Line
      data={{
        labels: entries.map((e) => new Date(e.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })),
        datasets: [{
          data: entries.map((e) => Number(e.overall.toFixed(1))),
          borderColor: t.violet,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          backgroundColor: (ctx) => {
            const { chartArea, ctx: c } = ctx.chart;
            if (!chartArea) return "transparent";
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, t.dark ? "rgba(139,92,246,0.35)" : "rgba(109,61,240,0.2)");
            g.addColorStop(1, "rgba(124,92,255,0)");
            return g;
          },
          pointBackgroundColor: t.blue,
          pointBorderColor: t.tooltipBg,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      }}
      options={{
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip(t),
            callbacks: {
              title: (c) => `${entries[c[0].dataIndex].config.role} · ${c[0].label}`,
              label: (c) => `Score: ${c.raw}/10`,
            },
          },
        },
        scales: {
          y: { min: 0, max: 10, ticks: { stepSize: 2, color: t.text, font }, grid: { color: t.grid }, border: { display: false } },
          x: { ticks: { color: t.text, font, maxRotation: 0, autoSkip: true }, grid: { display: false }, border: { color: t.grid } },
        },
      }}
    />
  );
}
