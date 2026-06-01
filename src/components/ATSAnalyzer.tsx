"use client";

import { useCallback, useState } from "react";

interface AnalysisResult {
  score: number;
  sections: SectionResult[];
  tips: string[];
  expatTips: string[];
  keywords: { found: string[]; missing: string[] };
}

interface SectionResult {
  name: string;
  found: boolean;
  importance: "critical" | "important" | "nice";
}

const ATS_SECTIONS: { name: string; patterns: RegExp; importance: "critical" | "important" | "nice" }[] = [
  { name: "Contact Information", patterns: /(?:email|phone|mobile|linkedin|address)/i, importance: "critical" },
  { name: "Professional Summary", patterns: /(?:summary|objective|profile|about me)/i, importance: "critical" },
  { name: "Work Experience", patterns: /(?:experience|employment|work history|career)/i, importance: "critical" },
  { name: "Education", patterns: /(?:education|qualification|degree|university|college)/i, importance: "critical" },
  { name: "Skills", patterns: /(?:skills|competencies|technical skills|core skills)/i, importance: "important" },
  { name: "Certifications", patterns: /(?:certification|certificate|licensed|accredited)/i, importance: "important" },
  { name: "Languages", patterns: /(?:languages?|bilingual|multilingual)/i, importance: "nice" },
  { name: "Projects / Achievements", patterns: /(?:projects?|achievements?|accomplishments?|awards?)/i, importance: "nice" },
];

const MALAYSIA_KEYWORDS = [
  "Malaysia", "Kuala Lumpur", "Selangor", "Penang", "Johor",
  "MNC", "GBS", "SSC", "shared services",
  "Bahasa", "Malay", "English",
  "EPF", "SOCSO", "EIS",
  "Employment Pass", "expatriate", "work permit",
  "agile", "scrum", "leadership", "cross-functional",
  "KPI", "OKR", "stakeholder", "P&L",
  "digital transformation", "data-driven",
];

const EXPAT_TIPS = [
  "Include your visa/work permit status or willingness to relocate at the top of your CV",
  "Mention language proficiency (English, Bahasa Melayu, Mandarin are valued in MY)",
  "Highlight any prior Southeast Asian or APAC experience",
  "Malaysian employers value stability — show 2+ year tenures where possible",
  "Add a 'Right to Work' line: e.g. 'Eligible for Employment Pass Category II'",
  "Tailor your CV to Malaysian job titles (e.g. 'Executive' is entry-level in MY)",
  "Include expected salary range in MYR if the job posting requests it",
  "Reference Malaysian industry certifications if applicable (HRDF, Bank Negara, etc.)",
  "Avoid personal photos unless the job posting explicitly requests one",
  "Keep your CV to 2 pages max — Malaysian recruiters prefer concise formats",
];

const GENERAL_TIPS = [
  "Use a clean, single-column layout — multi-column designs confuse ATS parsers",
  "Avoid headers/footers for critical info — some ATS skip those areas entirely",
  "Use standard section headings (Experience, Education, Skills) — not creative alternatives",
  "Include exact keywords from the job description — ATS matches on exact phrases",
  "Use reverse chronological order for experience (most recent first)",
  "Quantify achievements with numbers: 'Increased revenue by 40%' > 'Increased revenue'",
  "Save as .docx or .pdf — avoid images-only PDFs (scanned documents)",
  "Don't use tables, text boxes, or graphics for layout — they break ATS parsing",
  "Include full dates (Month Year) not just years for employment periods",
  "Spell out acronyms at least once: 'Search Engine Optimization (SEO)'",
];

function analyzeCV(text: string): AnalysisResult {
  const normalizedText = text.toLowerCase();
  let score = 0;
  const maxScore = 100;

  // Section detection (40 points max)
  const sections: SectionResult[] = ATS_SECTIONS.map((section) => {
    const found = section.patterns.test(text);
    return { name: section.name, found, importance: section.importance };
  });

  const criticalFound = sections.filter((s) => s.importance === "critical" && s.found).length;
  const criticalTotal = sections.filter((s) => s.importance === "critical").length;
  const importantFound = sections.filter((s) => s.importance === "important" && s.found).length;
  const niceFound = sections.filter((s) => s.importance === "nice" && s.found).length;

  score += Math.round((criticalFound / criticalTotal) * 25);
  score += importantFound * 5;
  score += niceFound * 2.5;

  // Keyword matching (30 points max)
  const found: string[] = [];
  const missing: string[] = [];
  for (const keyword of MALAYSIA_KEYWORDS) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }
  const keywordScore = Math.min(30, Math.round((found.length / 8) * 30));
  score += keywordScore;

  // Length & formatting checks (30 points max)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 200 && wordCount <= 1200) score += 10;
  else if (wordCount >= 100) score += 5;

  // Has numbers (quantified achievements)
  const numberMatches = text.match(/\d+%|\d+\+|RM\s?\d|USD\s?\d|\$\d/g);
  if (numberMatches && numberMatches.length >= 3) score += 10;
  else if (numberMatches && numberMatches.length >= 1) score += 5;

  // Has email
  if (/[\w.-]+@[\w.-]+\.\w{2,}/.test(text)) score += 5;

  // Has phone
  if (/[\+]?[\d\s\-()]{8,}/.test(text)) score += 5;

  score = Math.min(maxScore, Math.round(score));

  // Build tips
  const tips: string[] = [];
  const missingSections = sections.filter((s) => !s.found);
  for (const s of missingSections) {
    if (s.importance === "critical") {
      tips.push(`Missing critical section: "${s.name}" — add this immediately`);
    } else if (s.importance === "important") {
      tips.push(`Consider adding a "${s.name}" section to strengthen your CV`);
    }
  }

  if (wordCount < 200) tips.push("Your CV seems too short. Aim for 400-800 words for best results.");
  if (wordCount > 1200) tips.push("Your CV may be too long. Try to condense to 2 pages (600-800 words).");
  if (!numberMatches || numberMatches.length < 2) {
    tips.push("Add more quantified achievements (numbers, percentages, metrics)");
  }

  // Add 3 random general tips that aren't already covered
  const shuffled = [...GENERAL_TIPS].sort(() => Math.random() - 0.5);
  tips.push(...shuffled.slice(0, 3));

  // Expat tips (show 4-5 relevant ones)
  const expatTips = [...EXPAT_TIPS].sort(() => Math.random() - 0.5).slice(0, 5);

  return {
    score,
    sections,
    tips,
    expatTips,
    keywords: { found, missing: missing.slice(0, 10) },
  };
}

export function ATSAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    setResult(null);

    try {
      let extracted = "";

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        extracted = await file.text();
      } else {
        // For PDF/DOCX we read as text — this is a best-effort client-side approach.
        // Real production would use pdf.js or mammoth.js, but for simplicity:
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Try to extract readable text from the binary
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const rawText = decoder.decode(bytes);

        // Filter to printable characters and common whitespace
        extracted = rawText
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .replace(/\s{3,}/g, " ")
          .trim();

        // If we got very little text, it might be a scanned PDF
        if (extracted.length < 50) {
          extracted = "";
        }
      }

      if (!extracted && !text) {
        setText("");
        setLoading(false);
        return;
      }

      const cvText = extracted || text;
      if (extracted) setText(extracted);

      // Small delay for UX
      await new Promise((r) => setTimeout(r, 800));
      const analysis = analyzeCV(cvText);
      setResult(analysis);
    } catch {
      // If file reading fails, let user paste manually
    }

    setLoading(false);
  }, [text]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleManualAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setFileName("Pasted text");
    setTimeout(() => {
      const analysis = analyzeCV(text);
      setResult(analysis);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragActive
            ? "border-brand-500 bg-brand-500/10"
            : "border-line bg-surface-2/30 hover:border-brand-300"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10">
          <svg className="h-7 w-7 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="12" y2="12" />
            <line x1="15" y1="15" x2="12" y2="12" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">
          Drag & drop your CV here
        </p>
        <p className="mt-1 text-xs text-muted-2">
          PDF, DOCX, or TXT (max 5MB)
        </p>
        <label className="mt-4 inline-block cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          Choose file
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
        </label>
        {fileName && (
          <p className="mt-3 text-xs text-muted">
            Loaded: <span className="font-medium text-foreground">{fileName}</span>
          </p>
        )}
      </div>

      {/* Or paste text */}
      <div>
        <label className="block text-sm font-medium text-foreground">
          Or paste your CV text below
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste the content of your CV here..."
          className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
        <button
          type="button"
          onClick={handleManualAnalyze}
          disabled={!text.trim() || loading}
          className="mt-3 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze CV"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm text-muted">Scanning your CV for ATS compatibility...</span>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-up">
          {/* Score */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
            <div className="flex flex-col items-center sm:flex-row sm:gap-8">
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--line))" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={result.score >= 70 ? "#2e9456" : result.score >= 40 ? "#d97706" : "#dc2626"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.score / 100) * 327} 327`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{result.score}</span>
                  <span className="text-xs text-muted-2">/ 100</span>
                </div>
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold text-foreground">
                  {result.score >= 70 ? "Good ATS Score!" : result.score >= 40 ? "Needs Improvement" : "Low ATS Score"}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {result.score >= 70
                    ? "Your CV is well-structured for ATS systems. Focus on tailoring keywords to specific job postings."
                    : result.score >= 40
                    ? "Your CV has a decent structure but is missing some key elements that ATS systems look for."
                    : "Your CV needs significant improvements to pass ATS screening. Follow the recommendations below."}
                </p>
              </div>
            </div>
          </div>

          {/* Sections found */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <h4 className="text-sm font-semibold text-foreground">Section Detection</h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {result.sections.map((section) => (
                <div
                  key={section.name}
                  className="flex items-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2"
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    section.found
                      ? "bg-brand-500/20 text-brand-600 dark:text-brand-400"
                      : "bg-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                    {section.found ? "✓" : "✗"}
                  </span>
                  <span className="text-sm text-foreground">{section.name}</span>
                  <span className={`ml-auto text-[10px] font-medium uppercase ${
                    section.importance === "critical" ? "text-red-500" : section.importance === "important" ? "text-amber-500" : "text-muted-2"
                  }`}>
                    {section.importance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <h4 className="text-sm font-semibold text-foreground">Malaysia Market Keywords</h4>
            <p className="mt-1 text-xs text-muted-2">
              Keywords that Malaysian ATS systems and recruiters look for
            </p>
            {result.keywords.found.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-brand-600 dark:text-brand-400">Found in your CV:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {result.keywords.found.map((kw) => (
                    <span key={kw} className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.keywords.missing.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Consider adding:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {result.keywords.missing.map((kw) => (
                    <span key={kw} className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Improvement tips */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <h4 className="text-sm font-semibold text-foreground">Recommendations</h4>
            <ul className="mt-3 space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Expat-specific tips */}
          <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-surface p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="text-lg">🌏</span> Tips to Get Hired in Malaysia as an Expat
            </h4>
            <ul className="mt-3 space-y-2">
              {result.expatTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 shrink-0 text-brand-500">→</span>
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-surface-2/50 p-3">
              <p className="text-xs font-medium text-foreground">Quick Malaysia hiring facts (2026):</p>
              <ul className="mt-1.5 space-y-1 text-xs text-muted">
                <li>• Employment Pass minimum: Cat I RM20K, Cat II RM10K, Cat III RM5K/month</li>
                <li>• Top hiring sectors: tech, shared services (GBS/SSC), oil & gas, finance</li>
                <li>• Key job portals: JobStreet, LinkedIn, WOBB, Hiredly</li>
                <li>• Average hiring timeline: 4-8 weeks (longer for EP processing)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty state info */}
      {!result && !loading && !text && (
        <div className="rounded-xl border border-dashed border-line bg-surface-2/30 p-6 text-center">
          <p className="text-sm text-muted">
            Upload your CV or paste the text to get an instant ATS compatibility score,
            keyword analysis, and Malaysia-specific hiring tips for expats.
          </p>
          <div className="mt-4 grid gap-3 text-left sm:grid-cols-3">
            {[
              { icon: "📊", title: "ATS Score", desc: "How well your CV passes automated screening" },
              { icon: "🔑", title: "Keyword Match", desc: "Malaysia market keywords detected in your CV" },
              { icon: "💡", title: "Expat Tips", desc: "Specific advice for landing jobs in Malaysia" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg bg-surface p-3 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-1 text-xs font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
