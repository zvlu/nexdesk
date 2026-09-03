import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  Gauge,
  Layers3,
  Menu,
  Moon,
  MoveUpRight,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UsersRound,
  X,
  Pencil,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type Timeframe = "7d" | "30d" | "90d";
type DashboardTab = "Overview" | "Revenue" | "Retention";
type CustomerStatus = "Healthy" | "At risk" | "Expansion";
type ActivityFilter = "all" | "usage" | "milestone" | "account";
type ActivitySort = "newest" | "oldest";

type ActivityEvent = { type: Exclude<ActivityFilter, "all">; title: string; detail: string; date: string; icon: "trend" | "check" | "file" };

type Customer = {
  name: string;
  initials: string;
  color: string;
  team: string;
  plan: string;
  mrr: string;
  health: number;
  status: CustomerStatus;
  trend: string;
};

const chartData: Record<Timeframe, { label: string; value: number }[]> = {
  "7d": [
    { label: "Mon", value: 42 },
    { label: "Tue", value: 48 },
    { label: "Wed", value: 45 },
    { label: "Thu", value: 56 },
    { label: "Fri", value: 62 },
    { label: "Sat", value: 58 },
    { label: "Sun", value: 68 },
  ],
  "30d": [
    { label: "Jun 1", value: 34 },
    { label: "Jun 5", value: 43 },
    { label: "Jun 9", value: 39 },
    { label: "Jun 13", value: 52 },
    { label: "Jun 17", value: 47 },
    { label: "Jun 21", value: 64 },
    { label: "Jun 25", value: 59 },
    { label: "Jun 30", value: 72 },
  ],
  "90d": [
    { label: "Apr", value: 28 },
    { label: "May", value: 35 },
    { label: "Jun", value: 43 },
    { label: "Jul", value: 46 },
    { label: "Aug", value: 61 },
    { label: "Sep", value: 72 },
  ],
};

const customers: Customer[] = [
  { name: "Arcade Labs", initials: "AL", color: "#ffb15c", team: "Product-led growth", plan: "Scale", mrr: "$18,420", health: 94, status: "Expansion", trend: "+24%" },
  { name: "Northstar Health", initials: "NH", color: "#99b8ff", team: "Sales-led", plan: "Growth", mrr: "$12,780", health: 86, status: "Healthy", trend: "+11%" },
  { name: "Cedar & Co.", initials: "CC", color: "#8fd5b8", team: "Product-led growth", plan: "Growth", mrr: "$9,340", health: 78, status: "Healthy", trend: "+8%" },
  { name: "Monument AI", initials: "MA", color: "#e7a6c9", team: "Enterprise", plan: "Scale", mrr: "$8,190", health: 61, status: "At risk", trend: "−6%" },
  { name: "Fieldwork", initials: "FW", color: "#b6a6ee", team: "Sales-led", plan: "Starter", mrr: "$4,860", health: 73, status: "Healthy", trend: "+3%" },
  { name: "Orchard Studio", initials: "OS", color: "#d9c38b", team: "Product-led growth", plan: "Starter", mrr: "$3,920", health: 47, status: "At risk", trend: "−12%" },
];

const activityEvents: ActivityEvent[] = [
  { type: "usage", title: "Usage momentum increased", detail: "Product adoption is up 18%", date: "2026-08-30", icon: "trend" },
  { type: "milestone", title: "Success milestone completed", detail: "Quarterly outcome review", date: "2026-08-26", icon: "check" },
  { type: "account", title: "Account plan updated", detail: "Expansion opportunity added", date: "2026-08-20", icon: "file" },
  { type: "usage", title: "Weekly active users synced", detail: "12 new users joined the workspace", date: "2026-08-14", icon: "trend" },
];

const planMix = [
  { label: "Growth", value: 48, color: "#5277ff" },
  { label: "Scale", value: 32, color: "#96aafc" },
  { label: "Starter", value: 20, color: "#dce3ff" },
];

function LineChart({ data, compact = false }: { data: { label: string; value: number }[]; compact?: boolean }) {
  const width = compact ? 480 : 700;
  const height = compact ? 160 : 245;
  const padX = compact ? 12 : 24;
  const padY = compact ? 14 : 22;
  const max = Math.max(...data.map((point) => point.value)) + 8;
  const min = Math.min(...data.map((point) => point.value)) - 8;
  const points = data.map((point, index) => {
    const x = padX + (index / Math.max(data.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - ((point.value - min) / (max - min)) * (height - padY * 2);
    return { ...point, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;

  return (
    <svg className={`line-chart ${compact ? "line-chart-compact" : ""}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue trend chart">
      {!compact && [0, 1, 2, 3].map((lineIndex) => {
        const y = padY + (lineIndex / 3) * (height - padY * 2);
        return <line key={lineIndex} x1={padX} x2={width - padX} y1={y} y2={y} className="chart-gridline" />;
      })}
      {!compact && <polygon points={area} className="chart-area" />}
      <polyline points={line} className="chart-line" />
      {points.map((point, index) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r={compact ? 0 : 4} className="chart-point" />
          {!compact && <text x={point.x} y={height - 3} textAnchor="middle" className="chart-label">{point.label}</text>}
          {index === points.length - 1 && <g className="chart-tooltip"><rect x={point.x - 24} y={point.y - 35} width="48" height="22" rx="6" /><text x={point.x} y={point.y - 20} textAnchor="middle">${point.value}k</text></g>}
        </g>
      ))}
    </svg>
  );
}

function Sparkline({ rising = true }: { rising?: boolean }) {
  return (
    <svg className="sparkline" viewBox="0 0 86 28" aria-hidden="true">
      <polyline points={rising ? "1,22 12,20 23,22 35,14 46,17 58,10 69,12 85,3" : "1,5 12,9 23,7 35,14 46,12 58,19 69,16 85,24"} />
    </svg>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const normalized = query.trim();
  if (!normalized) return <>{text}</>;
  const parts = text.split(new RegExp(`(${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return <>{parts.map((part, index) => part.toLowerCase() === normalized.toLowerCase() ? <mark className="search-highlight" key={`${part}-${index}`}>{part}</mark> : part)}</>;
}

function Avatar({ customer }: { customer: Customer }) {
  return <span className="customer-avatar" style={{ backgroundColor: customer.color }}>{customer.initials}</span>;
}

function MetricCard({ icon: Icon, label, value, delta, detail, tone = "blue", rising = true }: { icon: typeof Gauge; label: string; value: string; delta: string; detail: string; tone?: string; rising?: boolean }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-card-top"><span className="metric-icon"><Icon size={16} /></span><span className="metric-detail">{detail}</span></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className={`metric-delta ${rising ? "positive" : "negative"}`}><span>{delta}</span> <span>vs last month</span></div>
      <Sparkline rising={rising} />
    </article>
  );
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(timeframe: Timeframe, startDate: string, endDate: string) {
  const rows = [
    ["NexDesk dashboard export", `Revenue momentum · ${timeframe}`, `Range: ${startDate || "All time"} to ${endDate || "All time"}`],
    [],
    ["Date", "Revenue (k)"],
    ...chartData[timeframe].map((point) => [point.label, point.value]),
    [],
    ["Customer", "Plan", "MRR", "Health score", "Status", "Trend"],
    ...customers.map((customer) => [customer.name, customer.plan, customer.mrr, customer.health, customer.status, customer.trend]),
  ];
  const csv = rows.map((row) => row.map((cell) => csvCell(cell ?? "")).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nexdesk-dashboard-${timeframe}-${startDate || "all"}-to-${endDate || "time"}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function pdfText(text: string, x: number, y: number, size = 10, bold = false) {
  const safe = String(text).replace(/[^\x20-\x7E]/g, "-").replace(/[\\()]/g, (char) => `\\${char}`);
  return `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${safe}) Tj ET`;
}

function downloadPdf(timeframe: Timeframe, startDate: string, endDate: string) {
  const commands: string[] = ["0.12 0.17 0.28 rg", pdfText("NexDesk Dashboard Report", 52, 748, 22, true), pdfText("Revenue intelligence export", 52, 728, 10), "0.32 0.47 1 RG 1.5 w"];
  commands.push(pdfText(`Range: ${startDate || "All time"} to ${endDate || "All time"}  |  View: ${timeframe}`, 52, 700, 10));
  commands.push("0.88 0.91 0.97 RG 0.7 w", "52 520 m 542 520 l S", "52 570 m 542 570 l S", "52 620 m 542 620 l S", "52 670 m 542 670 l S");
  const points = chartData[timeframe].map((point, index) => ({ x: 62 + (index / Math.max(chartData[timeframe].length - 1, 1)) * 470, y: 520 + (point.value / 90) * 150 }));
  commands.push("0.32 0.47 1 RG 2 w", `${points.map((point, index) => `${index === 0 ? `${point.x} ${point.y} m` : `${point.x} ${point.y} l`}`).join(" ")} S`);
  commands.push(pdfText("Revenue momentum", 52, 684, 11, true));
  chartData[timeframe].forEach((point, index) => commands.push(pdfText(point.label, 55 + index * (465 / Math.max(chartData[timeframe].length - 1, 1)), 505, 7)));
  commands.push(pdfText("Customer signals", 52, 480, 14, true), pdfText("Customer", 52, 458, 9, true), pdfText("Plan", 205, 458, 9, true), pdfText("MRR", 285, 458, 9, true), pdfText("Health", 365, 458, 9, true), pdfText("Signal", 435, 458, 9, true), "0.88 0.91 0.97 RG 0.7 w", "52 450 m 542 450 l S");
  customers.forEach((customer, index) => { const y = 428 - index * 38; commands.push(pdfText(customer.name, 52, y, 9, true), pdfText(customer.plan, 205, y, 9), pdfText(customer.mrr, 285, y, 9), pdfText(String(customer.health), 365, y, 9), pdfText(customer.status, 435, y, 9), "0.92 0.93 0.96 RG 0.5 w", `${52} ${y - 10} m 542 ${y - 10} l S`); });
  commands.push(pdfText("Generated by NexDesk · Confidential workspace report", 52, 46, 8));
  const stream = commands.join("\n");
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 594 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>", `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nexdesk-dashboard-${timeframe}-${startDate || "all"}-to-${endDate || "time"}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [mobileNav, setMobileNav] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("Overview");
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [sortMode, setSortMode] = useState("health");
  const [annual, setAnnual] = useState(true);
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [darkMode, setDarkMode] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("nexdesk-theme") === "dark");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [editingNote, setEditingNote] = useState<{ customer: string; index: number } | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<{ customer: string; index: number } | null>(null);
  const [customerNotes, setCustomerNotes] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(window.localStorage.getItem("nexdesk-customer-notes") || "{}"); } catch { return {}; }
  });
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [activitySort, setActivitySort] = useState<ActivitySort>("newest");
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");

  useEffect(() => {
    window.localStorage.setItem("nexdesk-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem("nexdesk-customer-notes", JSON.stringify(customerNotes));
  }, [customerNotes]);

  const visibleCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers
      .filter((customer) => {
        const matchesQuery = !normalized || `${customer.name} ${customer.team} ${customer.plan}`.toLowerCase().includes(normalized);
        return matchesQuery && (planFilter === "All plans" || customer.plan === planFilter);
      })
      .sort((a, b) => {
        if (sortMode === "mrr") return Number(b.mrr.replace(/[$,]/g, "")) - Number(a.mrr.replace(/[$,]/g, ""));
        if (sortMode === "trend") return Number(b.trend.replace(/[+%]/g, "")) - Number(a.trend.replace(/[+%]/g, ""));
        return b.health - a.health;
      });
  }, [query, planFilter, sortMode]);

  const currentChart = chartData[timeframe];
  const visibleActivity = useMemo(() => activityEvents.filter((event) => activityFilter === "all" || event.type === activityFilter).sort((a, b) => activitySort === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), [activityFilter, activitySort]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNav(false);
  };

  const startTrial = () => {
    toast.success("Your workspace is ready to explore", { description: "No credit card required for the 14-day trial." });
    scrollTo("product");
  };

  const exportCsv = () => {
    if (exportStart && exportEnd && exportStart > exportEnd) {
      toast.error("Check the export range", { description: "The start date must be before the end date." });
      return;
    }
    downloadCsv(timeframe, exportStart, exportEnd);
    toast.success("CSV export downloaded", { description: `Revenue chart and ${customers.length} customer records included for the selected range.` });
  };

  const exportPdf = () => {
    if (exportStart && exportEnd && exportStart > exportEnd) {
      toast.error("Check the export range", { description: "The start date must be before the end date." });
      return;
    }
    downloadPdf(timeframe, exportStart, exportEnd);
    toast.success("PDF export downloaded", { description: "A formatted dashboard report is ready." });
  };

  return (
    <div className={`landing-shell ${darkMode ? "theme-dark" : ""}`}>
      <div className="announcement-bar"><span className="announcement-dot" /> NexDesk Signals is now live <button onClick={() => scrollTo("product")}>See what’s new <ArrowRight size={13} /></button></div>

      <header className="landing-nav">
        <a className="brand" href="#top" aria-label="NexDesk home"><span className="brand-symbol"><i /><i /><i /></span><span>Nex<span className="brand-accent">Desk</span></span></a>
        <nav className={`nav-links ${mobileNav ? "nav-links-open" : ""}`}>
          <button onClick={() => scrollTo("product")}>Product <ChevronDown size={14} /></button>
          <button onClick={() => scrollTo("use-cases")}>Use cases</button>
          <button onClick={() => scrollTo("customers")}>Customers</button>
          <button onClick={() => scrollTo("pricing")}>Pricing</button>
          <button className="mobile-nav-cta" onClick={startTrial}>Start free trial <ArrowRight size={15} /></button>
        </nav>
        <div className="nav-actions"><button className="theme-toggle" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>{darkMode ? <Sun size={15} /> : <Moon size={15} />}<span>{darkMode ? "Light" : "Dark"}</span></button><button className="login-button" onClick={() => toast.info("Welcome back", { description: "Login will be available when auth is connected." })}>Log in</button><button className="nav-cta" onClick={startTrial}>Start free trial <ArrowRight size={15} /></button></div>
        <button className="mobile-menu" onClick={() => setMobileNav((open) => !open)} aria-label={mobileNav ? "Close navigation" : "Open navigation"}>{mobileNav ? <X size={22} /> : <Menu size={22} />}</button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow-pill"><span className="eyebrow-spark"><Sparkles size={12} /></span> Revenue intelligence for modern SaaS</div>
            <h1>See the <span className="highlight-word">signal</span> before it becomes a problem.</h1>
            <p className="hero-lede">NexDesk brings your customer health, revenue, and team focus into one beautifully clear command center.</p>
            <div className="hero-actions"><button className="hero-primary" onClick={startTrial}>Start your free trial <ArrowRight size={17} /></button><button className="hero-secondary" onClick={() => scrollTo("product")}><span className="play-icon"><Play size={11} fill="currentColor" /></span> Watch 2-min overview</button></div>
            <div className="hero-proof"><div className="proof-avatars"><span>JD</span><span>MK</span><span>AL</span><span>+</span></div><div><strong>Loved by 2,000+ operators</strong><span>Built for teams that move with intent.</span></div></div>
          </div>
          <div className="hero-visual" aria-label="NexDesk product preview">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="product-window">
              <div className="window-chrome"><div className="window-dots"><i /><i /><i /></div><span>app.nexdesk.co / overview</span><div className="window-status"><span /> Live</div></div>
              <div className="preview-body">
                <aside className="preview-sidebar"><div className="preview-logo"><span className="brand-symbol"><i /><i /><i /></span><b>nexdesk</b></div><div className="preview-workspace"><span>NS</span><div><b>Northstar</b><small>Workspace</small></div><ChevronDown size={11} /></div><small className="preview-label">Workspace</small><div className="preview-nav active"><BarChart3 size={14} /> Overview</div><div className="preview-nav"><UsersRound size={14} /> Customers <em>24</em></div><div className="preview-nav"><Target size={14} /> Signals <em className="signal-count">7</em></div><div className="preview-nav"><Layers3 size={14} /> Playbooks</div><div className="preview-bottom"><div className="preview-nav"><ShieldCheck size={14} /> Settings</div><div className="preview-user"><span>JD</span><div><b>Jamie Davis</b><small>Admin</small></div><ChevronRight size={12} /></div></div></aside>
                <div className="preview-main"><div className="preview-heading"><div><small>Tuesday, September 1, 2026</small><h3>Good morning, Jamie <span>✦</span></h3></div><button onClick={() => toast.success("Signal captured", { description: "A new playbook has been queued." })}>+ Create playbook</button></div><div className="preview-metrics"><div><span>Net revenue retention</span><b>118.4%</b><small className="preview-up">↗ 4.8%</small></div><div><span>Expansion pipeline</span><b>$84.2k</b><small className="preview-up">↗ 12.6%</small></div><div><span>Accounts at risk</span><b>07</b><small className="preview-down">↘ 3 this week</small></div></div><div className="preview-chart-card"><div className="preview-card-head"><div><span>Revenue momentum</span><b>$72.4k <small>+18.2%</small></b></div><div className="preview-legend"><span /><small>Actual</small><i /><small>Target</small></div></div><LineChart data={chartData["30d"]} compact /></div><div className="preview-table"><div className="preview-table-head"><span>Priority accounts</span><button onClick={() => scrollTo("customers")}>View all <ArrowRight size={11} /></button></div>{customers.slice(0, 3).map((customer) => <div className="preview-row" key={customer.name}><Avatar customer={customer} /><span>{customer.name}</span><div className={`mini-health health-${customer.status.toLowerCase().replace(" ", "-")}`}><i /><i /><i /><i /><i /></div><b>{customer.mrr}</b><ChevronRight size={12} /></div>)}</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="logo-strip" aria-label="Customers"><span>Trusted by teams building the next category</span><div className="logo-list"><b>Linear</b><b className="logo-serif">vercel</b><b className="logo-spaced">arcade</b><b className="logo-serif">ramp</b><b>watershed</b></div></section>

        <section className="product-section" id="product">
          <div className="section-intro"><div><span className="section-kicker">The clear view</span><h2>Everything important.<br /><em>Nothing noisy.</em></h2></div><p>One calm place to see where revenue is growing, where customers need attention, and what your team should do next.</p></div>
          <div className="dashboard-card">
            <div className="dashboard-topbar"><div className="dashboard-brand"><span className="brand-symbol"><i /><i /><i /></span><strong>Signals overview</strong></div><div className="dashboard-tabs">{(["Overview", "Revenue", "Retention"] as DashboardTab[]).map((tab) => <button className={dashboardTab === tab ? "selected" : ""} key={tab} onClick={() => setDashboardTab(tab)}>{tab}</button>)}</div><div className="dashboard-user"><span className="live-chip"><i /> Live data</span><span className="dash-avatar">JD</span><ChevronDown size={15} /></div></div>
            <div className="dashboard-content"><div className="dashboard-heading"><div><span className="section-kicker">{dashboardTab === "Overview" ? "Your operating picture" : `${dashboardTab} intelligence`}</span><h3>{dashboardTab === "Overview" ? "Good morning, Jamie" : `${dashboardTab} at a glance`}</h3><p>Updated a few seconds ago · Tuesday, September 1, 2026</p></div><div className="dashboard-heading-actions"><div className="export-range"><label>From<input type="date" value={exportStart} onChange={(event) => setExportStart(event.target.value)} aria-label="Export start date" /></label><span>→</span><label>To<input type="date" value={exportEnd} onChange={(event) => setExportEnd(event.target.value)} aria-label="Export end date" /></label></div><button className="export-button" onClick={exportCsv}><Download size={13} /> CSV</button><button className="export-button" onClick={exportPdf}><FileText size={13} /> PDF</button><button className="dashboard-action" onClick={() => toast.info("Date range saved", { description: `Showing the last ${timeframe === "7d" ? "7 days" : timeframe === "30d" ? "30 days" : "90 days"}.` })}>This month <ChevronDown size={14} /></button></div></div>
              <div className="metric-grid"><MetricCard icon={Gauge} label="Net revenue retention" value="118.4%" delta="+4.8%" detail="vs. 114.2% target" tone="blue" /><MetricCard icon={Zap} label="Expansion pipeline" value="$84.2k" delta="+12.6%" detail="17 opportunities" tone="violet" /><MetricCard icon={ShieldCheck} label="Healthy accounts" value="82.6%" delta="+6.2%" detail="20 of 24 customers" tone="mint" /><MetricCard icon={Clock3} label="Time to signal" value="2.4h" delta="−38%" detail="faster than last month" tone="peach" rising={false} /></div>
              <div className="analytics-grid"><article className="chart-card"><div className="card-header"><div><span className="card-kicker">Revenue momentum</span><h4>$72.4k <small>+18.2%</small></h4></div><div className="timeframe-switcher">{(["7d", "30d", "90d"] as Timeframe[]).map((range) => <button key={range} className={timeframe === range ? "selected" : ""} onClick={() => setTimeframe(range)}>{range}</button>)}</div></div><div className="chart-axis"><span>$80k</span><span>$60k</span><span>$40k</span><span>$20k</span></div><LineChart data={currentChart} /><div className="chart-footer"><span><i className="legend-dot actual" /> Actual</span><span><i className="legend-dot target" /> Target</span><b>Target attainment <strong>91%</strong></b></div></article><article className="breakdown-card"><div className="card-header"><div><span className="card-kicker">Plan mix</span><h4>24 <small>active customers</small></h4></div><button className="more-button" aria-label="More plan mix options" onClick={() => toast.info("Plan mix options", { description: "Breakdown controls are ready for your data." })}>•••</button></div><div className="donut-wrap"><div className="donut"><div><strong>$53.8k</strong><span>total MRR</span></div></div><div className="mix-legend">{planMix.map((plan) => <div key={plan.label}><span style={{ backgroundColor: plan.color }} /> <span>{plan.label}</span><b>{plan.value}%</b></div>)}</div></div><div className="breakdown-note"><span><MoveUpRight size={13} /> 14.2%</span><p>Expansion revenue is pacing ahead of plan.</p></div></article></div>
              <article className="customer-card" id="customers"><div className="table-header"><div><span className="card-kicker">Customer signals</span><h4>Accounts that deserve a closer look</h4></div><button className="view-all-button" onClick={() => setShowAllCustomers((visible) => !visible)}>{showAllCustomers ? "Show less" : "View all accounts"} <ArrowRight size={14} /></button></div><div className="table-toolbar"><div className="table-search"><Search size={15} /><span className="table-search-label">Quick search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers..." aria-label="Search customers" /></div><label className="filter-select"><Filter size={14} /><select value={planFilter} onChange={(event) => setPlanFilter(event.target.value)} aria-label="Filter by plan"><option>All plans</option><option>Starter</option><option>Growth</option><option>Scale</option></select><ChevronDown size={13} /></label><label className="filter-select sort-filter"><ArrowDownUp size={14} /><select value={sortMode} onChange={(event) => setSortMode(event.target.value)} aria-label="Sort customers"><option value="health">Sort: Health</option><option value="mrr">Sort: MRR</option><option value="trend">Sort: Trend</option></select><ChevronDown size={13} /></label></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Plan</th><th>MRR</th><th>Health score</th><th>Signal</th><th>Trend</th><th /></tr></thead><tbody>{visibleCustomers.slice(0, showAllCustomers ? visibleCustomers.length : 4).map((customer, index) => <tr key={customer.name} style={{ "--row-delay": `${index * 45}ms` } as CSSProperties} onClick={() => setSelectedCustomer(customer)}><td><div className="customer-cell"><Avatar customer={customer} /><div><strong><HighlightedText text={customer.name} query={query} /></strong><span><HighlightedText text={customer.team} query={query} /></span></div></div></td><td><span className="plan-tag"><HighlightedText text={customer.plan} query={query} /></span></td><td><b className="mrr-value">{customer.mrr}</b></td><td><div className="health-cell"><div className="health-track"><span style={{ width: `${customer.health}%` }} /></div><b>{customer.health}</b></div></td><td><span className={`status-tag status-${customer.status.toLowerCase().replace(" ", "-")}`}><i />{customer.status}</span></td><td><span className={customer.trend.startsWith("−") ? "trend-negative" : "trend-positive"}>{customer.trend}</span></td><td><button className="table-arrow" onClick={(event) => { event.stopPropagation(); setSelectedCustomer(customer); }} aria-label={`Open ${customer.name}`}><ChevronRight size={15} /></button></td></tr>)}</tbody></table>{visibleCustomers.length === 0 && <div className="no-results"><Search size={20} /><strong>No accounts match that view</strong><span>Try another search or clear the filters.</span></div>}</div></article>
            </div>
          </div>
        </section>

        <section className="use-cases-section" id="use-cases"><div className="section-intro compact-intro"><div><span className="section-kicker">Built for momentum</span><h2>A better rhythm for<br /><em>every team.</em></h2></div><p>From first signal to final follow-through, NexDesk makes the important work feel obvious.</p></div><div className="use-case-grid"><article><span className="use-case-number">01</span><div className="use-case-icon icon-blue"><Target size={20} /></div><h3>Focus your team</h3><p>Turn a sea of customer data into the few actions that will move the quarter forward.</p><button onClick={() => scrollTo("product")}>Explore workflows <ArrowRight size={14} /></button></article><article><span className="use-case-number">02</span><div className="use-case-icon icon-orange"><UsersRound size={20} /></div><h3>Keep customers close</h3><p>Make every account feel known with a shared, living view of customer momentum.</p><button onClick={() => scrollTo("customers")}>See customer signals <ArrowRight size={14} /></button></article><article><span className="use-case-number">03</span><div className="use-case-icon icon-violet"><BarChart3 size={20} /></div><h3>Grow with confidence</h3><p>Connect the dots between health, retention, and revenue without another spreadsheet.</p><button onClick={() => scrollTo("product")}>View the dashboard <ArrowRight size={14} /></button></article></div></section>

        <section className="pricing-section" id="pricing"><div className="pricing-copy"><span className="section-kicker">Simple by design</span><h2>The clarity you need<br /><em>at every stage.</em></h2><p>Start with the essentials. Add power as your team grows. Every plan includes a 14-day free trial.</p><div className="billing-toggle"><span className={!annual ? "active" : ""}>Monthly</span><button className={annual ? "on" : ""} onClick={() => setAnnual((value) => !value)} aria-label="Toggle annual billing"><i /></button><span className={annual ? "active" : ""}>Yearly <b>Save 20%</b></span></div></div><div className="pricing-tiers"><article className="pricing-card pricing-card-starter"><div className="pricing-card-top"><div><span>Starter</span><h3>${annual ? "29" : "39"}<small>/ seat / mo</small></h3></div></div><p>For lean teams building a reliable customer rhythm.</p><button onClick={startTrial}>Start free trial <ArrowRight size={16} /></button><ul><li><Check size={15} /> Up to 10 customer signals</li><li><Check size={15} /> Core health dashboard</li><li><Check size={15} /> Shared account notes</li><li><Check size={15} /> Email support</li></ul></article><article className="pricing-card pricing-card-growth"><div className="pricing-card-top"><div><span>Growth</span><h3>${annual ? "79" : "99"}<small>/ seat / mo</small></h3></div><span className="popular-tag">Most popular</span></div><p>For teams turning customer insight into a repeatable growth motion.</p><button onClick={startTrial}>Start free trial <ArrowRight size={16} /></button><ul><li><Check size={15} /> Unlimited customer signals</li><li><Check size={15} /> Revenue & retention dashboards</li><li><Check size={15} /> Shared playbooks & alerts</li><li><Check size={15} /> Timeline filters and exports</li></ul></article><article className="pricing-card pricing-card-scale"><div className="pricing-card-top"><div><span>Scale</span><h3>${annual ? "149" : "189"}<small>/ seat / mo</small></h3></div></div><p>For revenue teams that need intelligence across every account.</p><button onClick={startTrial}>Talk to sales <ArrowRight size={16} /></button><ul><li><Check size={15} /> Everything in Growth</li><li><Check size={15} /> Advanced team permissions</li><li><Check size={15} /> Custom health scoring</li><li><Check size={15} /> Priority success support</li></ul></article></div></section>

        <section className="final-cta"><div className="cta-orb orb-left" /><div className="cta-orb orb-right" /><div className="cta-content"><span className="section-kicker light-kicker"><Sparkles size={13} /> Make the next move obvious</span><h2>Less noise.<br /><em>More momentum.</em></h2><p>See what your team can do with a clearer view of the work that matters.</p><button onClick={startTrial}>Start your free trial <ArrowRight size={17} /></button><small>14 days free · No credit card required</small></div></section>
      </main>

      <footer className="landing-footer"><a className="brand" href="#top"><span className="brand-symbol"><i /><i /><i /></span><span>Nex<span className="brand-accent">Desk</span></span></a><span>Revenue intelligence for teams with somewhere to go.</span><div><button onClick={() => toast.info("Status", { description: "All systems operational." })}>Status</button><button onClick={() => toast.info("Privacy", { description: "Privacy details will be added here." })}>Privacy</button><button onClick={() => toast.info("Contact", { description: "hello@nexdesk.co" })}>Contact</button></div></footer>
      {noteToDelete && <div className="confirm-overlay" role="presentation"><div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-note-title"><div className="confirm-icon"><Trash2 size={17} /></div><h3 id="delete-note-title">Delete this note?</h3><p>This note will be removed from the customer profile. This action cannot be undone.</p><div className="confirm-actions"><button className="confirm-cancel" onClick={() => setNoteToDelete(null)}>Keep note</button><button className="confirm-delete" onClick={() => { if (!noteToDelete) return; setCustomerNotes((current) => ({ ...current, [noteToDelete.customer]: (current[noteToDelete.customer] || []).filter((_, itemIndex) => itemIndex !== noteToDelete.index) })); setNoteToDelete(null); toast.success("Note deleted"); }}>Delete note</button></div></div></div>}
      {selectedCustomer && <div className="profile-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCustomer(null); }}><aside className="profile-modal" role="dialog" aria-modal="true" aria-label={`${selectedCustomer.name} customer profile`}><div className="profile-modal-header"><div><span className="card-kicker">Customer profile</span><strong>{selectedCustomer.name}</strong></div><button className="profile-close" onClick={() => setSelectedCustomer(null)} aria-label="Close customer profile"><X size={18} /></button></div><div className="profile-modal-content"><div className="profile-identity"><Avatar customer={selectedCustomer} /><div><h3>{selectedCustomer.name}</h3><p>{selectedCustomer.team} · {selectedCustomer.plan} plan</p></div><span className={`status-tag status-${selectedCustomer.status.toLowerCase().replace(" ", "-")}`}><i />{selectedCustomer.status}</span></div><div className="profile-health"><div className="profile-score"><span>Health score</span><strong>{selectedCustomer.health}</strong><small>out of 100</small></div><div className="profile-health-copy"><div className="profile-health-track"><span style={{ width: `${selectedCustomer.health}%` }} /></div><b>{selectedCustomer.health >= 80 ? "Strong account momentum" : selectedCustomer.health >= 65 ? "Worth a closer look" : "Needs attention this week"}</b><p>Based on product usage, support activity, and recent commercial signals.</p></div></div><div className="profile-stats"><div><span>Current MRR</span><strong>{selectedCustomer.mrr}</strong><small>↗ 12.4% this quarter</small></div><div><span>Renewal date</span><strong>Oct 18, 2026</strong><small>47 days away</small></div><div><span>Last touch</span><strong>Yesterday</strong><small>Product review call</small></div><div><span>Owner</span><strong>Jamie Davis</strong><small>Customer success</small></div></div><div className="profile-insight"><span><Sparkles size={14} /> Recommended next move</span><p>{selectedCustomer.status === "At risk" ? "Schedule an executive check-in and review the onboarding milestones before the renewal window." : selectedCustomer.status === "Expansion" ? "Share the expansion brief with sales while the account is actively adding seats." : "Invite the champion to a roadmap preview and capture the next success milestone."}</p><button onClick={() => toast.success("Playbook queued", { description: `A next-step playbook was queued for ${selectedCustomer.name}.` })}>Create playbook <ArrowRight size={14} /></button></div><div className="profile-activity"><div className="profile-activity-head"><span>Activity timeline</span><button onClick={() => toast.info("Activity history", { description: "Full activity history is ready for your workspace data." })}>View history <ArrowRight size={13} /></button></div><div className="timeline-filters"><select value={activityFilter} onChange={(event) => setActivityFilter(event.target.value as ActivityFilter)} aria-label="Filter activity type"><option value="all">All activity</option><option value="usage">Usage</option><option value="milestone">Milestones</option><option value="account">Account changes</option></select><select value={activitySort} onChange={(event) => setActivitySort(event.target.value as ActivitySort)} aria-label="Sort activity date"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div><div className="timeline">{visibleActivity.map((event) => <div className="timeline-item" key={`${event.date}-${event.title}`}><span className={`activity-marker ${event.icon === "trend" ? "blue" : event.icon === "check" ? "mint" : "violet"}`}>{event.icon === "trend" ? <TrendingUp size={11} /> : event.icon === "check" ? <Check size={11} /> : <FileText size={11} />}</span><div><strong>{event.title}</strong><small>{event.detail} · {event.date}</small></div></div>)}{visibleActivity.length === 0 && <div className="timeline-empty">No activity matches this filter.</div>}</div><div className="profile-notes"><div className="profile-activity-head"><span>Notes</span><span>{(customerNotes[selectedCustomer.name] || []).length} saved</span></div>{(customerNotes[selectedCustomer.name] || []).map((note, index) => <div className="saved-note-row" key={`${note}-${index}`}>{editingNote?.customer === selectedCustomer.name && editingNote.index === index ? <div className="note-edit-form"><textarea value={editingDraft} onChange={(event) => setEditingDraft(event.target.value)} aria-label={`Edit note ${index + 1}`} rows={3} /><div><button className="note-link-button" onClick={() => { const edited = editingDraft.trim(); if (!edited) { toast.error("Note cannot be empty"); return; } setCustomerNotes((current) => ({ ...current, [selectedCustomer.name]: (current[selectedCustomer.name] || []).map((item, itemIndex) => itemIndex === index ? edited : item) })); setEditingNote(null); setEditingDraft(""); toast.success("Note updated"); }}>Save changes</button><button className="note-cancel-button" onClick={() => setEditingNote(null)}>Cancel</button></div></div> : <><p className="saved-note">{note}</p><div className="note-actions"><button onClick={() => { setEditingNote({ customer: selectedCustomer.name, index }); setEditingDraft(note); }} aria-label={`Edit note ${index + 1}`}><Pencil size={12} /></button><button onClick={() => { setNoteToDelete({ customer: selectedCustomer.name, index }); }} aria-label={`Delete note ${index + 1}`}><Trash2 size={12} /></button></div></>}</div>)}<textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Add a note for your team..." aria-label="Add customer note" rows={3} /><button className="note-button" onClick={() => { const note = noteDraft.trim(); if (!note) { toast.error("Write a note first"); return; } setCustomerNotes((current) => ({ ...current, [selectedCustomer.name]: [...(current[selectedCustomer.name] || []), note] })); setNoteDraft(""); toast.success("Note saved", { description: `Added to ${selectedCustomer.name}.` }); }}>Save note <Check size={13} /></button></div></div></div><div className="profile-modal-footer"><button className="profile-secondary" onClick={() => setSelectedCustomer(null)}>Close</button><button className="profile-primary" onClick={() => toast.success("Profile shared", { description: `${selectedCustomer.name} profile link copied.` })}>Share profile <ArrowRight size={14} /></button></div></aside></div>}
    </div>
  );
}
