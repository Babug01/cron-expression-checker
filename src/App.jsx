import { useState } from "react";
import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";
import Header from "./components/Header";

const REPO_URL = "https://github.com/Babug01/cron-expression-checker";

const EXAMPLES = [
  { expr: "* * * * *", label: "Every minute" },
  { expr: "*/15 * * * *", label: "Every 15 minutes" },
  { expr: "0 * * * *", label: "Every hour" },
  { expr: "0 9 * * *", label: "Every day at 9am" },
  { expr: "0 9 * * 1-5", label: "Weekdays at 9am" },
  { expr: "0 0 1 * *", label: "First of every month" },
  { expr: "0 0 * * 0", label: "Every Sunday at midnight" },
];

// The 6 real shortcuts, verified live against cron-parser before listing
// them as usable — @reboot is deliberately excluded from the clickable set:
// cron-parser throws on it ("cannot resolve alias") since it isn't a
// recurring schedule at all (it fires once at startup), so this page's
// whole "next run times" premise doesn't apply to it. Still listed in the
// reference table below, since it's a real, commonly-seen cron shortcut —
// just not one this checker can evaluate.
const SHORTCUTS = [
  { expr: "@yearly", equivalent: "0 0 1 1 *" },
  { expr: "@annually", equivalent: "0 0 1 1 *" },
  { expr: "@monthly", equivalent: "0 0 1 * *" },
  { expr: "@weekly", equivalent: "0 0 * * 0" },
  { expr: "@daily", equivalent: "0 0 * * *" },
  { expr: "@hourly", equivalent: "0 * * * *" },
];

const FIELDS = [
  { name: "minute", range: "0-59" },
  { name: "hour", range: "0-23" },
  { name: "day of month", range: "1-31" },
  { name: "month", range: "1-12" },
  { name: "day of week", range: "0-6 (Sunday = 0)" },
];

const SPECIAL_CHARS = [
  { char: "*", meaning: "any value" },
  { char: ",", meaning: "value list separator, e.g. 1,15" },
  { char: "-", meaning: "range of values, e.g. 9-17" },
  { char: "/", meaning: "step values, e.g. */15" },
];

const styles = {
  root: { minHeight: "100dvh", display: "flex", flexDirection: "column" },
  content: { fontFamily: "system-ui, sans-serif", padding: "24px 32px", maxWidth: 760, margin: "0 auto", color: "var(--text, #1a1a1a)", width: "100%", boxSizing: "border-box", background: "var(--bg-subtle, #f0efed)" },
  legendSection: { marginTop: 32 },
  legendGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 },
  legendTable: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  legendTh: { textAlign: "left", padding: "4px 8px 4px 0", opacity: 0.5, fontWeight: 600, textTransform: "uppercase", fontSize: 10 },
  legendTd: { padding: "4px 8px 4px 0", fontFamily: "'SFMono-Regular', Consolas, monospace" },
  legendTdClickable: { padding: "4px 8px 4px 0", fontFamily: "'SFMono-Regular', Consolas, monospace", cursor: "pointer", color: "var(--accent, #4f46e5)", fontWeight: 600 },
  legendNote: { fontSize: 11, opacity: 0.5, marginTop: 8 },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 13, opacity: 0.6, margin: "4px 0 20px" },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border, #e5e7eb)",
    background: "var(--input-bg, #f9fafb)", color: "var(--text, #1a1a1a)", fontSize: 16, boxSizing: "border-box",
    fontFamily: "'SFMono-Regular', Consolas, monospace", marginBottom: 8,
  },
  fieldHint: { display: "flex", gap: 16, fontSize: 11, opacity: 0.5, marginBottom: 16 },
  examples: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  exampleBtn: {
    padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border, #e5e7eb)", background: "transparent",
    color: "var(--text, #1a1a1a)", cursor: "pointer", fontSize: 12,
  },
  description: {
    padding: "16px 20px", borderRadius: 8, background: "var(--input-bg, #f9fafb)", border: "1px solid var(--border, #e5e7eb)",
    fontSize: 16, fontWeight: 600, marginBottom: 20,
  },
  errorBox: {
    padding: 16, borderRadius: 8, border: "1px solid #e05c5c", background: "rgba(224,92,92,0.08)",
    color: "#e05c5c", fontSize: 13, marginBottom: 20,
  },
  sectionTitle: { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", opacity: 0.6, marginBottom: 10 },
  runsList: { listStyle: "none", padding: 0, margin: 0, fontFamily: "'SFMono-Regular', Consolas, monospace", fontSize: 13 },
  runItem: { padding: "8px 12px", borderBottom: "1px solid var(--border, #e5e7eb)" },
};

export default function CronTool() {
  const [expr, setExpr] = useState("*/15 9-17 * * 1-5");
  const [description, setDescription] = useState("");
  const [nextRuns, setNextRuns] = useState([]);
  const [error, setError] = useState(null);

  function evaluate(value) {
    const e = value.trim();
    if (!e) {
      setDescription("");
      setNextRuns([]);
      setError(null);
      return;
    }
    try {
      const desc = cronstrue.toString(e);
      const interval = CronExpressionParser.parse(e);
      const runs = [];
      for (let i = 0; i < 10; i++) runs.push(interval.next().toDate());
      setDescription(desc);
      setNextRuns(runs);
      setError(null);
    } catch (err) {
      setDescription("");
      setNextRuns([]);
      setError(err.message);
    }
  }

  function handleChange(value) {
    setExpr(value);
    evaluate(value);
  }

  return (
    <div style={styles.root}>
      <Header repoUrl={REPO_URL} />
      <div style={styles.content}>
      <h1 style={styles.title}>Cron Expression Checker</h1>
      <p style={styles.subtitle}>Enter a 5-field cron expression to see what it means in plain English and its next 10 run times.</p>

      <input
        style={styles.input}
        value={expr}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="* * * * *"
        spellCheck={false}
        autoFocus
      />
      <div style={styles.fieldHint}>
        <span>minute</span><span>hour</span><span>day of month</span><span>month</span><span>day of week</span>
      </div>

      <div style={styles.examples}>
        {EXAMPLES.map((ex) => (
          <button key={ex.expr} style={styles.exampleBtn} onClick={() => handleChange(ex.expr)} title={ex.expr}>{ex.label}</button>
        ))}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {description && <div style={styles.description}>{description}</div>}

      {nextRuns.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Next 10 Run Times (your local time zone)</div>
          <ul style={styles.runsList}>
            {nextRuns.map((d, i) => (
              <li key={i} style={styles.runItem}>{d.toLocaleString()}</li>
            ))}
          </ul>
        </>
      )}

      <div style={styles.legendSection}>
        <div style={styles.sectionTitle}>What the 5 fields mean</div>
        <div style={styles.legendGrid}>
          <table style={styles.legendTable}>
            <thead><tr><th style={styles.legendTh}>Field</th><th style={styles.legendTh}>Allowed Values</th></tr></thead>
            <tbody>
              {FIELDS.map((f) => (
                <tr key={f.name}><td style={styles.legendTd}>{f.name}</td><td style={styles.legendTd}>{f.range}</td></tr>
              ))}
            </tbody>
          </table>
          <table style={styles.legendTable}>
            <thead><tr><th style={styles.legendTh}>Character</th><th style={styles.legendTh}>Meaning</th></tr></thead>
            <tbody>
              {SPECIAL_CHARS.map((s) => (
                <tr key={s.char}><td style={styles.legendTd}>{s.char}</td><td style={styles.legendTd}>{s.meaning}</td></tr>
              ))}
            </tbody>
          </table>
          <table style={styles.legendTable}>
            <thead><tr><th style={styles.legendTh}>Shortcut</th><th style={styles.legendTh}>Equivalent</th></tr></thead>
            <tbody>
              {SHORTCUTS.map((s) => (
                <tr key={s.expr}>
                  <td style={styles.legendTdClickable} onClick={() => handleChange(s.expr)} title={`Try ${s.expr}`}>{s.expr}</td>
                  <td style={styles.legendTd}>{s.equivalent}</td>
                </tr>
              ))}
              <tr><td style={styles.legendTd}>@reboot</td><td style={styles.legendTd}>runs once at startup — not a schedule</td></tr>
            </tbody>
          </table>
        </div>
        <div style={styles.legendNote}>@yearly/@monthly/@weekly/@daily/@hourly are non-standard but widely supported — click one to try it. @reboot isn't a time-based schedule, so this checker can't show "next run" for it.</div>
      </div>
      </div>
    </div>
  );
}
