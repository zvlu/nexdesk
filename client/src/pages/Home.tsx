import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Filter,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  Ticket,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type Status = "Open" | "In Progress" | "Resolved";
type Priority = "Critical" | "High" | "Medium" | "Low";
type Category = "Hardware" | "Software" | "Network" | "Access Request" | "Other";

type ActivityItem = {
  id: string;
  text: string;
  at: string;
};

type TicketItem = {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  requester: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  activity: ActivityItem[];
};

const categories: Category[] = ["Hardware", "Software", "Network", "Access Request", "Other"];
const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];
const statuses: Status[] = ["Open", "In Progress", "Resolved"];

const ago = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const makeId = () => `NX-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const seededTickets: TicketItem[] = [
  {
    id: "NX-1042",
    title: "Laptop won't power on",
    description: "The MacBook assigned to the design team is not responding to power or charger input after an overnight update.",
    category: "Hardware",
    priority: "Critical",
    status: "Open",
    requester: "Maya Rodriguez",
    assignee: "Jordan Lee",
    createdAt: ago(2),
    updatedAt: ago(1.5),
    activity: [{ id: "a1", text: "Ticket created", at: ago(2) }],
  },
  {
    id: "NX-1041",
    title: "VPN access for new hire",
    description: "Provision secure VPN access for Priya Shah before her first day with the research team.",
    category: "Access Request",
    priority: "High",
    status: "In Progress",
    requester: "People Operations",
    assignee: "Alex Morgan",
    createdAt: ago(7),
    updatedAt: ago(3),
    activity: [
      { id: "a2", text: "Ticket created", at: ago(7) },
      { id: "a3", text: "Status changed to In Progress", at: ago(3) },
    ],
  },
  {
    id: "NX-1039",
    title: "Printer offline in Building 2",
    description: "The color printer on the second floor is showing offline for everyone on the Operations network.",
    category: "Network",
    priority: "Medium",
    status: "Open",
    requester: "Theo Barnes",
    createdAt: ago(23),
    updatedAt: ago(23),
    activity: [{ id: "a4", text: "Ticket created", at: ago(23) }],
  },
  {
    id: "NX-1038",
    title: "Install Figma desktop update",
    description: "Update Figma on the creative pod workstations to unblock the latest component library workflow.",
    category: "Software",
    priority: "Medium",
    status: "Resolved",
    requester: "Creative Studio",
    assignee: "Jordan Lee",
    createdAt: ago(31),
    updatedAt: ago(5),
    activity: [
      { id: "a5", text: "Ticket created", at: ago(31) },
      { id: "a6", text: "Status changed to In Progress", at: ago(24) },
      { id: "a7", text: "Status changed to Resolved", at: ago(5) },
    ],
  },
  {
    id: "NX-1035",
    title: "Shared drive permission request",
    description: "Grant the finance contractors read-only access to the Q3 planning folder in the shared drive.",
    category: "Access Request",
    priority: "Low",
    status: "Resolved",
    requester: "Elliot Chen",
    assignee: "Alex Morgan",
    createdAt: ago(46),
    updatedAt: ago(20),
    activity: [
      { id: "a8", text: "Ticket created", at: ago(46) },
      { id: "a9", text: "Status changed to Resolved", at: ago(20) },
    ],
  },
  {
    id: "NX-1034",
    title: "Slack notifications delayed",
    description: "Notifications for the #customer-ops channel are arriving several minutes late on desktop clients.",
    category: "Software",
    priority: "High",
    status: "Open",
    requester: "Noah Williams",
    createdAt: ago(52),
    updatedAt: ago(52),
    activity: [{ id: "a10", text: "Ticket created", at: ago(52) }],
  },
];

const formatAge = (date: string) => {
  const hours = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60)));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(date),
  );

const initials = (name = "Unassigned") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge priority-${priority.toLowerCase()}`}><span className="badge-dot" />{priority}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge status-${status.toLowerCase().replace(" ", "-")}`}><span className="status-icon">{status === "Resolved" ? <Check size={11} strokeWidth={3} /> : status === "In Progress" ? <span className="status-pulse" /> : <span className="status-ring" />}</span>{status}</span>;
}

function Avatar({ name, muted = false }: { name?: string; muted?: boolean }) {
  return <span className={`avatar ${muted ? "avatar-muted" : ""}`}>{name ? initials(name) : <UserRound size={14} />}</span>;
}

export default function Home() {
  const [tickets, setTickets] = useState<TicketItem[]>(() => {
    try {
      const saved = localStorage.getItem("nexdesk-tickets");
      return saved ? JSON.parse(saved) : seededTickets;
    } catch {
      return seededTickets;
    }
  });
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "status">("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [activePanel, setActivePanel] = useState<"Team" | "Knowledge base" | "Settings" | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("nexdesk-tickets", JSON.stringify(tickets));
  }, [tickets]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const openCount = tickets.filter((ticket) => ticket.status !== "Resolved").length;
  const criticalCount = tickets.filter((ticket) => ticket.priority === "Critical").length;
  const resolvedCount = tickets.filter((ticket) => ticket.status === "Resolved").length;

  const visibleTickets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const priorityRank: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const statusRank: Record<Status, number> = { Open: 0, "In Progress": 1, Resolved: 2 };
    return tickets
      .filter((ticket) => {
        const matchesQuery = !normalized || [ticket.id, ticket.title, ticket.requester, ticket.assignee, ticket.category].some((value) => value?.toLowerCase().includes(normalized));
        return matchesQuery && (statusFilter === "All" || ticket.status === statusFilter) && (categoryFilter === "All" || ticket.category === categoryFilter);
      })
      .sort((a, b) => {
        if (sortBy === "priority") return priorityRank[a.priority] - priorityRank[b.priority];
        if (sortBy === "status") return statusRank[a.status] - statusRank[b.status];
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tickets, query, statusFilter, categoryFilter, sortBy]);

  const updateTicket = (id: string, updates: Partial<TicketItem>) => {
    setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } : ticket));
  };

  const handleStatusChange = (ticket: TicketItem, status: Status) => {
    if (ticket.status === status) return;
    const item = { id: makeId(), text: `Status changed to ${status}`, at: new Date().toISOString() };
    setTickets((current) => current.map((entry) => entry.id === ticket.id ? { ...entry, status, updatedAt: item.at, activity: [...entry.activity, item] } : entry));
    toast.success(`Ticket moved to ${status}`, { description: ticket.id });
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    if (!title || !description) {
      toast.error("Add a title and description to create a ticket.");
      return;
    }
    const now = new Date().toISOString();
    const ticket: TicketItem = {
      id: makeId(),
      title,
      description,
      category: String(form.get("category")) as Category,
      priority: String(form.get("priority")) as Priority,
      status: "Open",
      requester: String(form.get("requester") || "You"),
      createdAt: now,
      updatedAt: now,
      activity: [{ id: makeId(), text: "Ticket created", at: now }],
    };
    setTickets((current) => [ticket, ...current]);
    setShowCreate(false);
    setSelectedId(ticket.id);
    toast.success("Ticket created", { description: `${ticket.id} is now open` });
  };

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, count: undefined },
    { label: "All tickets", icon: Inbox, count: tickets.length },
    { label: "My queue", icon: LifeBuoy, count: tickets.filter((ticket) => ticket.assignee === "Jordan Lee").length },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span /><span /><span /></div>
          <div><div className="brand-name">Nex<span>Desk</span></div><div className="brand-caption">SERVICE OPERATIONS</div></div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher"><div className="workspace-icon">N</div><div className="workspace-text"><strong>Northstar HQ</strong><span>IT Operations</span></div><ChevronDown size={15} /></div>
        <div className="nav-section-label">Workspace</div>
        <nav className="nav-list">
          {navItems.map(({ label, icon: Icon, count }) => <button key={label} className={`nav-item ${activeNav === label && !activePanel ? "active" : ""}`} onClick={() => { setActiveNav(label); setActivePanel(null); setMobileNav(false); }}><Icon size={17} /><span>{label}</span>{count !== undefined && <span className="nav-count">{count}</span>}</button>)}
        </nav>
        <div className="nav-section-label nav-section-spaced">Manage</div>
        <nav className="nav-list">
          {[{ label: "Team", icon: UsersRound }, { label: "Knowledge base", icon: BookOpen }, { label: "Settings", icon: Settings }].map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activePanel === label ? "active" : ""}`} onClick={() => { setActiveNav(label); setActivePanel(label as "Team" | "Knowledge base" | "Settings"); setMobileNav(false); }}><Icon size={17} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="capacity-card"><div className="capacity-heading"><span>Team capacity</span><span className="capacity-percent">68%</span></div><div className="capacity-bar"><span /></div><p>8 of 12 agents active</p></div>
          <div className="profile-row"><Avatar name="Jordan Lee" /><div><strong>Jordan Lee</strong><span>Service lead</span></div><MoreHorizontal size={17} className="muted-icon" /></div>
        </div>
      </aside>

      {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ArrowRight size={14} /><strong>{activeNav}</strong></div>
          <div className="topbar-actions"><button className="command-button" onClick={() => toast.info("Search is ready", { description: "Try searching by title, requester, or ticket ID." })}><Command size={14} /><span>Quick find</span><kbd>⌘ K</kbd></button><button className="icon-button notification-button" aria-label="Notifications" onClick={() => toast.info("You're all caught up", { description: "No new service alerts." })}><Bell size={18} /><span /></button><Avatar name="Jordan Lee" /></div>
        </header>

        <div className={`page-wrap ${activePanel ? "panel-wrap" : ""} ${compactMode ? "compact-queue" : ""}`}>
          {activePanel && <section className="management-panel"><div className="management-hero"><div><div className="eyebrow"><span className="eyebrow-dot" />NexDesk workspace</div><h1>{activePanel === "Team" ? "Your service team" : activePanel === "Knowledge base" ? "Knowledge base" : "Workspace settings"}</h1><p>{activePanel === "Team" ? "See who is on duty, what they own, and where capacity is available." : activePanel === "Knowledge base" ? "Give the team a shared starting point for repeatable support answers." : "Tune your workspace defaults and notification preferences."}</p></div><button className="primary-button" onClick={() => activePanel === "Team" ? toast.success("Invite flow ready", { description: "Connect a directory when authentication is enabled." }) : toast.success("Saved locally", { description: "Your workspace preference has been updated." })}>{activePanel === "Team" ? <><Plus size={16} />Invite teammate</> : <><Check size={16} />Save changes</>}</button></div>{activePanel === "Team" && <div className="management-grid"><div className="management-card team-summary"><div className="management-card-head"><div><span className="card-kicker">Live coverage</span><h3>Agents on duty</h3></div><span className="soft-status"><i />Healthy</span></div><div className="team-list">{[{ name: "Jordan Lee", role: "Service lead", workload: "6 tickets", tone: "navy" }, { name: "Alex Morgan", role: "Systems admin", workload: "4 tickets", tone: "amber" }, { name: "Taylor Kim", role: "Support specialist", workload: "3 tickets", tone: "green" }, { name: "Sam Rivera", role: "IT generalist", workload: "2 tickets", tone: "purple" }].map((member) => <div className="team-member" key={member.name}><Avatar name={member.name} /><div><strong>{member.name}</strong><span>{member.role}</span></div><span className="member-workload">{member.workload}</span><MoreHorizontal size={16} className="muted-icon" /></div>)}</div></div><div className="management-card"><div className="management-card-head"><div><span className="card-kicker">Capacity</span><h3>Workload by agent</h3></div><Activity size={18} className="muted-icon" /></div><div className="capacity-list">{[["Jordan Lee", 72, "#5c81bd"], ["Alex Morgan", 52, "#dca14c"], ["Taylor Kim", 38, "#64ad91"], ["Sam Rivera", 24, "#8d8ad0"]].map(([name, percent, color]) => <div className="capacity-row" key={String(name)}><div><span>{name}</span><b>{percent}%</b></div><div className="capacity-track"><i style={{ width: `${percent}%`, background: color as string }} /></div></div>)}</div><div className="management-callout"><Zap size={15} /><span>Rebalance <b>NX-1039</b> to Taylor to keep response times steady.</span></div></div></div>}{activePanel === "Knowledge base" && <div className="management-grid knowledge-grid"><div className="management-card knowledge-search"><div className="search-wrap"><Search size={17} /><input placeholder="Search articles, playbooks and runbooks..." /><kbd>/</kbd></div><div className="article-list">{[{ icon: "VPN", title: "VPN access for new hires", meta: "Access requests · 6 min read", tone: "blue" }, { icon: "MDM", title: "MacBook setup checklist", meta: "Hardware · 4 min read", tone: "amber" }, { icon: "NET", title: "Troubleshooting office Wi-Fi", meta: "Network · 8 min read", tone: "green" }, { icon: "APP", title: "Common Slack notification fixes", meta: "Software · 3 min read", tone: "purple" }].map((article) => <button className="article-row" key={article.title} onClick={() => toast.info("Article preview", { description: article.title })}><span className={`article-icon ${article.tone}`}>{article.icon}</span><span><strong>{article.title}</strong><small>{article.meta}</small></span><ArrowRight size={15} /></button>)}</div></div><div className="management-card"><div className="management-card-head"><div><span className="card-kicker">Quick starts</span><h3>Popular playbooks</h3></div><BookOpen size={18} className="muted-icon" /></div><div className="playbook-stat"><strong>18</strong><span>published articles</span></div><div className="playbook-stat"><strong>4.8 / 5</strong><span>helpfulness score</span></div><button className="secondary-button full-width-button" onClick={() => toast.info("Editor coming soon", { description: "The article library is ready for your content." })}>Manage articles <ArrowRight size={15} /></button></div></div>}{activePanel === "Settings" && <div className="management-grid settings-grid"><div className="management-card settings-card"><div className="management-card-head"><div><span className="card-kicker">Workspace profile</span><h3>Northstar HQ</h3></div><Settings size={18} className="muted-icon" /></div><label className="field-label">Workspace name<input defaultValue="Northstar HQ" /></label><label className="field-label">Default timezone<select defaultValue="America/New_York"><option value="America/New_York">Eastern Time (ET)</option><option value="America/Chicago">Central Time (CT)</option><option value="America/Los_Angeles">Pacific Time (PT)</option></select></label><label className="field-label">Default ticket priority<select defaultValue="Medium"><option>Low</option><option>Medium</option><option>High</option></select></label></div><div className="management-card settings-card"><div className="management-card-head"><div><span className="card-kicker">Preferences</span><h3>Notification rules</h3></div><Bell size={18} className="muted-icon" /></div><div className="setting-toggle"><div><strong>Ticket updates</strong><span>Notify me when a ticket changes status.</span></div><button className={`toggle ${notificationsOn ? "on" : ""}`} aria-label="Toggle ticket updates" onClick={() => setNotificationsOn(!notificationsOn)}><i /></button></div><div className="setting-toggle"><div><strong>Compact queue</strong><span>Fit more requests into the ticket table.</span></div><button className={`toggle ${compactMode ? "on" : ""}`} aria-label="Toggle compact queue" onClick={() => setCompactMode(!compactMode)}><i /></button></div><div className="setting-toggle"><div><strong>Weekly digest</strong><span>Receive a summary every Monday morning.</span></div><button className="toggle" aria-label="Toggle weekly digest" onClick={() => toast.info("Preference saved locally")}><i /></button></div></div></div>}</section>}
          <section className="page-header">
            <div><div className="eyebrow"><span className="eyebrow-dot" />Tuesday, September 1, 2026</div><h1>Good morning, Jordan <span className="wave">✦</span></h1><p>Here’s what’s happening across your service desk.</p></div>
            <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={17} />Create ticket</button>
          </section>

          <section className="metric-grid">
            <div className="metric-card metric-primary"><div className="metric-top"><span className="metric-label">Open tickets</span><span className="metric-icon"><Inbox size={16} /></span></div><div className="metric-value">{openCount}</div><div className="metric-foot"><span className="trend-up">↑ 12%</span><span>vs last week</span><span className="metric-foot-end">{criticalCount} critical</span></div></div>
            <div className="metric-card"><div className="metric-top"><span className="metric-label">In progress</span><span className="metric-icon indigo"><Activity size={16} /></span></div><div className="metric-value">{tickets.filter((ticket) => ticket.status === "In Progress").length}</div><div className="metric-foot"><span className="trend-neutral">Steady</span><span>this week</span><span className="metric-foot-end">2 assigned to you</span></div></div>
            <div className="metric-card"><div className="metric-top"><span className="metric-label">Resolved this week</span><span className="metric-icon green"><Check size={17} /></span></div><div className="metric-value">{resolvedCount}</div><div className="metric-foot"><span className="trend-up">↑ 8%</span><span>vs last week</span><span className="metric-foot-end">4.6h avg. time</span></div></div>
            <div className="metric-card accent-card"><div className="metric-top"><span className="metric-label">Service health</span><span className="pulse-dot" /></div><div className="health-value">Good</div><div className="health-line"><span className="health-bar"><i /><i /><i /><i /><i /></span><span>Last 30 days</span></div><div className="health-spark"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></div>
          </section>

          <section className="insight-banner"><div className="insight-icon"><Sparkles size={17} /></div><div className="insight-copy"><strong>Focus moment</strong><span>There are <b>{criticalCount} critical tickets</b> waiting for attention. Clear the queue before the afternoon handoff.</span></div><button className="insight-link" onClick={() => { setStatusFilter("All"); setQuery("Critical"); }}>View critical <ArrowRight size={15} /></button><button className="insight-dismiss" aria-label="Dismiss insight" onClick={(event) => event.currentTarget.parentElement?.remove()}><X size={15} /></button></section>

          <section className="tickets-section">
            <div className="section-heading"><div><h2>Ticket queue</h2><p>Stay on top of requests across the organization.</p></div><button className="secondary-button" onClick={() => toast.info("Export is coming soon", { description: "For now, use filters to create a focused queue view." })}>Export queue <ArrowDownUp size={15} /></button></div>
            <div className="queue-toolbar"><div className="search-wrap"><Search size={17} /><input aria-label="Search tickets" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, requester or ID..." /><kbd>/</kbd></div><div className="toolbar-select"><Filter size={15} /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | Status)}><option value="All">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><div className="toolbar-select"><select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as "All" | Category)}><option value="All">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="toolbar-select sort-select"><ArrowDownUp size={14} /><select aria-label="Sort tickets" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}><option value="newest">Newest first</option><option value="priority">Priority</option><option value="status">Status</option></select></div></div>
            <div className="table-frame"><div className="table-scroll"><table><thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>Status</th><th>Assignee</th><th>Age</th><th /></tr></thead><tbody>{visibleTickets.map((ticket, index) => <tr key={ticket.id} className="ticket-row" style={{ "--row-delay": `${index * 35}ms` } as React.CSSProperties} onClick={() => setSelectedId(ticket.id)}><td><div className="ticket-title-cell"><span className="ticket-id">{ticket.id}</span><strong>{ticket.title}</strong><small>{ticket.requester}</small></div></td><td><span className="category-label"><span className={`category-dot category-${ticket.category.toLowerCase().replace(" ", "-")}`} />{ticket.category}</span></td><td><PriorityBadge priority={ticket.priority} /></td><td><StatusBadge status={ticket.status} /></td><td><div className="assignee-cell">{ticket.assignee ? <><Avatar name={ticket.assignee} /><span>{ticket.assignee}</span></> : <><Avatar muted /><span className="unassigned">Unassigned</span></>}</div></td><td><span className="age-cell"><Clock3 size={13} />{formatAge(ticket.createdAt)}</span></td><td><button className="row-arrow" aria-label={`Open ${ticket.id}`} onClick={(event) => { event.stopPropagation(); setSelectedId(ticket.id); }}><ArrowRight size={16} /></button></td></tr>)}</tbody></table>{visibleTickets.length === 0 && <div className="empty-state"><Search size={26} /><strong>No tickets match that view</strong><span>Try clearing a filter or searching a different term.</span><button className="secondary-button" onClick={() => { setQuery(""); setStatusFilter("All"); setCategoryFilter("All"); }}>Clear filters</button></div>}</div><div className="table-footer"><span>Showing <strong>{visibleTickets.length}</strong> of <strong>{tickets.length}</strong> tickets</span><span className="live-indicator"><i /> Synced just now</span></div></div>
          </section>
        </div>
      </main>

      {selectedTicket && <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}><aside className="detail-drawer" role="dialog" aria-modal="true" aria-label="Ticket details"><div className="drawer-header"><div><span className="drawer-kicker">Ticket detail</span><strong>{selectedTicket.id}</strong></div><button className="icon-button" aria-label="Close ticket details" onClick={() => setSelectedId(null)}><X size={18} /></button></div><div className="drawer-content"><div className="drawer-title-row"><div><h2>{selectedTicket.title}</h2><p>Opened {formatDateTime(selectedTicket.createdAt)}</p></div><PriorityBadge priority={selectedTicket.priority} /></div><p className="drawer-description">{selectedTicket.description}</p><div className="detail-grid"><div><span>Requester</span><div className="detail-person"><Avatar name={selectedTicket.requester} /><strong>{selectedTicket.requester}</strong></div></div><div><span>Category</span><strong>{selectedTicket.category}</strong></div><div><span>Created</span><strong>{formatDateTime(selectedTicket.createdAt)}</strong></div><div><span>Last updated</span><strong>{formatDateTime(selectedTicket.updatedAt)}</strong></div></div><div className="drawer-divider" /><label className="field-label">Current status<select className="full-select" value={selectedTicket.status} onChange={(event) => handleStatusChange(selectedTicket, event.target.value as Status)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="field-label">Assignee<div className="assignee-input"><Avatar name={selectedTicket.assignee} muted={!selectedTicket.assignee} /><input value={selectedTicket.assignee || ""} placeholder="Assign to a teammate" onChange={(event) => updateTicket(selectedTicket.id, { assignee: event.target.value })} /></div></label><div className="activity-heading"><span>Activity</span><span>{selectedTicket.activity.length} updates</span></div><div className="activity-list">{[...selectedTicket.activity].reverse().map((item, index) => <div className="activity-item" key={item.id}><div className={`activity-marker ${index === 0 ? "current" : ""}`}>{index === 0 ? <Check size={11} /> : <span />}</div><div><strong>{item.text}</strong><span>{formatDateTime(item.at)}</span></div></div>)}</div></div><div className="drawer-footer"><button className="secondary-button" onClick={() => setSelectedId(null)}>Close</button><button className="primary-button" onClick={() => toast.success("Changes saved", { description: `${selectedTicket.id} is up to date.` })}>Save changes</button></div></aside></div>}

      {showCreate && <div className="modal-layer center-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}><div className="create-modal" role="dialog" aria-modal="true" aria-label="Create a ticket"><div className="create-header"><div className="create-icon"><Ticket size={19} /></div><div><h2>Create a new ticket</h2><p>Capture the details so the right person can take action.</p></div><button className="icon-button" aria-label="Close create ticket" onClick={() => setShowCreate(false)}><X size={18} /></button></div><form onSubmit={handleCreate}><div className="form-grid"><label className="field-label full-field">Title<input name="title" placeholder="e.g. Laptop won't power on" autoFocus /></label><label className="field-label full-field">Description<textarea name="description" placeholder="What is happening? Include any useful context or error messages." rows={4} /></label><label className="field-label">Category<select name="category" defaultValue="Hardware">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="field-label">Priority<select name="priority" defaultValue="Medium">{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label><label className="field-label full-field">Requester<input name="requester" placeholder="Name or team" defaultValue="Jordan Lee" /></label></div><div className="form-footer"><span><Zap size={14} /> New tickets start as Open</span><div><button type="button" className="secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} />Create ticket</button></div></div></form></div></div>}
    </div>
  );
}
