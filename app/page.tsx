"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "./page.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "viewer" | "admin";
type TransactionType = "income" | "expense";
type SortKey = "latest" | "oldest" | "high" | "low";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
}

interface FormState {
  description: string;
  category: string;
  amount: string;
  type: TransactionType;
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#2d2d2d", "#666", "#999", "#c0a040", "#5a8a5a", "#b05050"];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-1",  date: "2026-01-05", description: "Monthly Salary",    category: "Income",        type: "income",  amount: 6800 },
  { id: "tx-2",  date: "2026-01-07", description: "Apartment Rent",    category: "Housing",       type: "expense", amount: 2100 },
  { id: "tx-3",  date: "2026-01-09", description: "Supermarket",       category: "Groceries",     type: "expense", amount: 242  },
  { id: "tx-4",  date: "2026-01-11", description: "Stock Dividend",    category: "Investments",   type: "income",  amount: 430  },
  { id: "tx-5",  date: "2026-01-15", description: "Cloud Tools",       category: "Subscriptions", type: "expense", amount: 89   },
  { id: "tx-6",  date: "2026-02-03", description: "Monthly Salary",    category: "Income",        type: "income",  amount: 6800 },
  { id: "tx-7",  date: "2026-02-05", description: "Utilities",         category: "Housing",       type: "expense", amount: 310  },
  { id: "tx-8",  date: "2026-02-08", description: "Weekend Trip",      category: "Travel",        type: "expense", amount: 720  },
  { id: "tx-9",  date: "2026-02-13", description: "Client Bonus",      category: "Income",        type: "income",  amount: 1200 },
  { id: "tx-10", date: "2026-02-18", description: "Pharmacy",          category: "Health",        type: "expense", amount: 146  },
  { id: "tx-11", date: "2026-03-02", description: "Monthly Salary",    category: "Income",        type: "income",  amount: 6800 },
  { id: "tx-12", date: "2026-03-04", description: "Restaurant Dinner", category: "Food",          type: "expense", amount: 176  },
  { id: "tx-13", date: "2026-03-10", description: "Gym Membership",    category: "Health",        type: "expense", amount: 95   },
  { id: "tx-14", date: "2026-03-15", description: "Freelance Payout",  category: "Income",        type: "income",  amount: 980  },
  { id: "tx-15", date: "2026-03-19", description: "Metro Card",        category: "Transport",     type: "expense", amount: 120  },
];

const EMPTY_FORM: FormState = {
  description: "",
  category: "",
  amount: "",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function monthLabel(date: string) {
  return new Date(date + "T12:00:00").toLocaleString("en-US", { month: "short" });
}

function uid() {
  return "tx-" + Date.now();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated counter that counts up from 0 to `target` */
function AnimatedValue({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const dur = 800;
    const t0 = performance.now();
    const abs = Math.abs(target);
    const sign = target < 0 ? -1 : 1;

    function step(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(abs * eased) * sign);
      if (p < 1) requestAnimationFrame(step);
      else setDisplay(target);
    }

    requestAnimationFrame(step);
  }, [target]);

  return <>{currency(display)}</>;
}

/** SVG area trend chart drawn with animated stroke */
function TrendChart({ transactions }: { transactions: Transaction[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const trendData = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expense: number }>();
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const entry = map.get(key) ?? { month: monthLabel(t.date), income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({ ...v, balance: v.income - v.expense }));
  }, [transactions]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !trendData.length) return;
    svg.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    const W = 560, H = 200, pad = { l: 40, r: 16, t: 16, b: 30 };
    const vals = trendData.map((d) => d.balance);
    const mn = Math.min(0, ...vals);
    const mx = Math.max(...vals);
    const range = mx - mn || 1;
    const xStep = (W - pad.l - pad.r) / (trendData.length - 1 || 1);
    const px = (i: number) => pad.l + i * xStep;
    const py = (v: number) => pad.t + (1 - (v - mn) / range) * (H - pad.t - pad.b);

    // Dashed grid lines
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const y = pad.t + t * (H - pad.t - pad.b);
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", String(pad.l));
      line.setAttribute("x2", String(W - pad.r));
      line.setAttribute("y1", String(y));
      line.setAttribute("y2", String(y));
      line.setAttribute("stroke", "#e5e0d8");
      line.setAttribute("stroke-dasharray", "3 3");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    });

    // Smooth curve path
    let pathD = `M ${px(0)} ${py(vals[0])}`;
    for (let i = 1; i < trendData.length; i++) {
      const cx = (px(i - 1) + px(i)) / 2;
      pathD += ` C ${cx} ${py(vals[i - 1])}, ${cx} ${py(vals[i])}, ${px(i)} ${py(vals[i])}`;
    }

    // Area fill
    const fillD =
      pathD + ` L ${px(trendData.length - 1)} ${H - pad.b} L ${pad.l} ${H - pad.b} Z`;
    const area = document.createElementNS(ns, "path");
    area.setAttribute("d", fillD);
    area.setAttribute("fill", "rgba(45,45,45,0.12)");
    svg.appendChild(area);

    // Animated stroke
    const stroke = document.createElementNS(ns, "path");
    stroke.setAttribute("d", pathD);
    stroke.setAttribute("fill", "none");
    stroke.setAttribute("stroke", "#2d2d2d");
    stroke.setAttribute("stroke-width", "2.5");
    stroke.setAttribute("stroke-dasharray", "600");
    stroke.setAttribute("stroke-dashoffset", "600");
    stroke.style.animation = "drawLine 1.2s ease 0.5s forwards";
    svg.appendChild(stroke);

    // Dots + labels
    trendData.forEach((d, i) => {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", String(px(i)));
      circle.setAttribute("cy", String(py(vals[i])));
      circle.setAttribute("r", "5");
      circle.setAttribute("fill", "white");
      circle.setAttribute("stroke", "#2d2d2d");
      circle.setAttribute("stroke-width", "2");
      circle.style.animation = `popIn 0.3s ease ${0.5 + i * 0.12}s both`;
      svg.appendChild(circle);

      const monthTxt = document.createElementNS(ns, "text");
      monthTxt.setAttribute("x", String(px(i)));
      monthTxt.setAttribute("y", String(H - pad.b + 18));
      monthTxt.setAttribute("text-anchor", "middle");
      monthTxt.setAttribute("font-size", "12");
      monthTxt.setAttribute("fill", "#888");
      monthTxt.setAttribute("font-family", "Patrick Hand, cursive");
      monthTxt.textContent = d.month;
      svg.appendChild(monthTxt);

      const valTxt = document.createElementNS(ns, "text");
      valTxt.setAttribute("x", String(px(i)));
      valTxt.setAttribute("y", String(py(vals[i]) - 10));
      valTxt.setAttribute("text-anchor", "middle");
      valTxt.setAttribute("font-size", "11");
      valTxt.setAttribute("fill", "#555");
      valTxt.setAttribute("font-family", "Patrick Hand, cursive");
      valTxt.textContent = currency(vals[i]);
      valTxt.style.animation = `fadeSlideIn 0.4s ease ${0.6 + i * 0.12}s both`;
      valTxt.style.opacity = "0";
      svg.appendChild(valTxt);
    });
  }, [trendData]);

  if (!trendData.length) {
    return <p className={styles.emptyState}>No trend data yet.</p>;
  }

  return (
    <svg
      ref={svgRef}
      className={styles.trendSvg}
      viewBox="0 0 560 220"
      preserveAspectRatio="none"
      style={{ height: 220 }}
    />
  );
}

/** Donut chart with animated segments */
function DonutChart({ transactions }: { transactions: Transaction[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions)
      if (t.type === "expense") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    if (!categoryData.length) {
      const txt = document.createElementNS(ns, "text");
      txt.setAttribute("x", "65");
      txt.setAttribute("y", "70");
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("fill", "#ccc");
      txt.setAttribute("font-size", "13");
      txt.setAttribute("font-family", "Patrick Hand, cursive");
      txt.textContent = "No expenses";
      svg.appendChild(txt);
      return;
    }

    const total = categoryData.reduce((s, c) => s + c.value, 0);
    const cx = 65, cy = 65, R = 50, r = 28;
    let angle = -Math.PI / 2;

    categoryData.forEach((cat, i) => {
      const slice = (cat.value / total) * 2 * Math.PI;
      const x1 = cx + R * Math.cos(angle),  y1 = cy + R * Math.sin(angle);
      const x2 = cx + R * Math.cos(angle + slice), y2 = cy + R * Math.sin(angle + slice);
      const ix1 = cx + r * Math.cos(angle + slice), iy1 = cy + r * Math.sin(angle + slice);
      const ix2 = cx + r * Math.cos(angle), iy2 = cy + r * Math.sin(angle);
      const lg = slice > Math.PI ? 1 : 0;
      const path = document.createElementNS(ns, "path");
      path.setAttribute(
        "d",
        `M ${x1} ${y1} A ${R} ${R} 0 ${lg} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${lg} 0 ${ix2} ${iy2} Z`
      );
      path.setAttribute("fill", PIE_COLORS[i % PIE_COLORS.length]);
      path.setAttribute("stroke", "white");
      path.setAttribute("stroke-width", "2");
      path.style.transformOrigin = `${cx}px ${cy}px`;
      path.style.animation = `popIn 0.4s ease ${0.2 + i * 0.1}s both`;
      path.style.opacity = "0";
      path.style.cursor = "pointer";
      path.addEventListener("mouseenter", () => path.setAttribute("opacity", "0.8"));
      path.addEventListener("mouseleave", () => path.setAttribute("opacity", "1"));
      svg.appendChild(path);
      angle += slice;
    });
  }, [categoryData]);

  return (
    <div className={styles.donutWrap}>
      <svg ref={svgRef} width={130} height={130} viewBox="0 0 130 130" className={styles.donutSvg} />
      <div className={styles.donutLegend}>
        {categoryData.map((cat, i) => (
          <div key={cat.name} className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span>
              {cat.name} <strong>{currency(cat.value)}</strong>
            </span>
          </div>
        ))}
        {!categoryData.length && (
          <p style={{ color: "#aaa", fontSize: 13 }}>No expense data</p>
        )}
      </div>
    </div>
  );
}

/** Add / Edit modal */
function TransactionModal({
  open,
  editingTx,
  onClose,
  onSave,
}: {
  open: boolean;
  editingTx: Transaction | null;
  onClose: () => void;
  onSave: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(
        editingTx
          ? {
              description: editingTx.description,
              category: editingTx.category,
              amount: String(editingTx.amount),
              type: editingTx.type,
              date: editingTx.date,
            }
          : { ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] }
      );
    }
  }, [open, editingTx]);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSave() {
    onSave(form);
  }

  return (
    <div
      className={`${styles.modalOverlay} ${open ? styles.open : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={onClose}>
          ✕
        </button>
        <div className={styles.modalTitle}>
          {editingTx ? "Edit Transaction ✏️" : "New Transaction ✏️"}
        </div>

        {(
          [
            { id: "desc",   label: "Description", type: "text",   key: "description", ph: "e.g. Coffee shop" },
            { id: "cat",    label: "Category",    type: "text",   key: "category",    ph: "e.g. Food"        },
            { id: "amount", label: "Amount ($)",  type: "number", key: "amount",      ph: "0"                },
          ] as const
        ).map(({ id, label, type, key, ph }) => (
          <div className={styles.field} key={id}>
            <label>{label}</label>
            <input
              className={styles.sketchInput}
              type={type}
              placeholder={ph}
              value={form[key]}
              onChange={set(key)}
              min={type === "number" ? 1 : undefined}
            />
          </div>
        ))}

        <div className={styles.field}>
          <label>Type</label>
          <select className={styles.sketchSelect} value={form.type} onChange={set("type")}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Date</label>
          <input className={styles.sketchInput} type="date" value={form.date} onChange={set("date")} />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.sketchBtn} onClick={handleSave}>
            {editingTx ? "Save ✓" : "Add ✓"}
          </button>
          <button className={`${styles.sketchBtn} ${styles.sketchBtnSecondary}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/** Toast notification */
function Toast({ message, type }: { message: string; type: string }) {
  return (
    <div className={`${styles.toast} ${message ? styles.toastShow : ""} ${type ? styles[`toast_${type}`] : ""}`}>
      {message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceLedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [role, setRoleState]            = useState<Role>("viewer");
  const [query, setQuery]               = useState("");
  const [typeFilter, setTypeFilter]     = useState<"all" | TransactionType>("all");
  const [sortBy, setSortBy]             = useState<SortKey>("latest");
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingTx, setEditingTx]       = useState<Transaction | null>(null);
  const [toast, setToast]               = useState({ message: "", type: "" });
  const [editionDate, setEditionDate]   = useState("");
  const [footerDate, setFooterDate]     = useState("");

  // Hydrate dates client-side to avoid SSR mismatch
  useEffect(() => {
    const now = new Date();
    setEditionDate(
      `Vol. 1 | ${now.toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      })} | New York Edition`
    );
    setFooterDate(now.toLocaleDateString("en-US", { year: "numeric", month: "short" }));
  }, []);

  // Simulate data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Toast helper
  const showToast = useCallback((message: string, type = "") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2800);
  }, []);

  // Role switch
  function setRole(r: Role) {
    setRoleState(r);
    showToast(
      r === "admin" ? "✏️ Admin mode enabled" : "👁 Switched to Viewer mode",
      r === "admin" ? "success" : ""
    );
  }

  // Derived: summary
  const summary = useMemo(() => {
    const income  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Derived: filtered + sorted
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (!q) return true;
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.date.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "latest") return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === "high")   return b.amount - a.amount;
        return a.amount - b.amount;
      });
  }, [transactions, query, typeFilter, sortBy]);

  // Derived: insights
  const insights = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions)
      if (t.type === "expense") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    const cats = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const trendMap = new Map<string, { month: string; income: number; expense: number }>();
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const e = trendMap.get(key) ?? { month: monthLabel(t.date), income: 0, expense: 0 };
      if (t.type === "income") e.income += t.amount; else e.expense += t.amount;
      trendMap.set(key, e);
    }
    const trend = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({ ...v, balance: v.income - v.expense }));

    const prev = trend[trend.length - 2];
    const curr = trend[trend.length - 1];
    const diff = curr && prev ? curr.balance - prev.balance : null;
    const spendRate = curr?.income ? Math.round((curr.expense / curr.income) * 100) : 0;

    return { topCat: cats[0] ?? null, diff, prev, spendRate };
  }, [transactions]);

  // CRUD
  function openAdd()               { setEditingTx(null); setModalOpen(true); }
  function openEdit(tx: Transaction) { setEditingTx(tx);   setModalOpen(true); }
  function closeModal()            { setModalOpen(false); setEditingTx(null); }

  function saveTransaction(form: FormState) {
    const amount = parseFloat(form.amount);
    if (!form.description || !form.category || isNaN(amount) || amount <= 0 || !form.date) {
      showToast("⚠️ Please fill all fields", "error");
      return;
    }
    if (editingTx) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTx.id
            ? { ...t, description: form.description, category: form.category, amount, type: form.type, date: form.date }
            : t
        )
      );
      showToast("✅ Transaction updated!", "success");
    } else {
      setTransactions((prev) => [
        { id: uid(), date: form.date, description: form.description, category: form.category, type: form.type, amount },
        ...prev,
      ]);
      showToast("✅ Transaction added!", "success");
    }
    closeModal();
  }

  function deleteTx(id: string) {
    if (!confirm("Delete this transaction?")) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast("🗑 Transaction deleted");
  }

  const isAdmin = role === "admin";

  return (
    <>
      {/* Global keyframe animations injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&display=swap');
        @keyframes bounceIn {
          0%   { opacity:0; transform:scale(0.5) rotate(-5deg); }
          60%  { opacity:1; transform:scale(1.08) rotate(1deg); }
          80%  { transform:scale(0.97) rotate(-0.5deg); }
          100% { transform:scale(1) rotate(0deg); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(30px) rotate(-1deg); }
          to   { opacity:1; transform:translateY(0) rotate(0deg); }
        }
        @keyframes wiggle {
          0%,100% { transform:rotate(-2deg); }
          50%     { transform:rotate(2deg); }
        }
        @keyframes bounce {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset:600; }
          to   { stroke-dashoffset:0; }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateX(-12px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes popIn {
          0%   { transform:scale(0) rotate(-10deg); opacity:0; }
          70%  { transform:scale(1.1) rotate(2deg); opacity:1; }
          100% { transform:scale(1) rotate(0); opacity:1; }
        }
        @keyframes rowSlide {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes float {
          0%,100% { transform:translateY(0) rotate(-2deg); }
          50%     { transform:translateY(-6px) rotate(2deg); }
        }
      `}</style>

      <Toast message={toast.message} type={toast.type} />

      <TransactionModal
        open={modalOpen}
        editingTx={editingTx}
        onClose={closeModal}
        onSave={saveTransaction}
      />

      {/* ── Header ───────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <div className={styles.mastheadLabel}>{editionDate || "Finance Ledger Daily"}</div>
            <div className={styles.mastheadTitle}>Finance Ledger Daily</div>
          </div>
          <div className={styles.roleSwitcher}>
            <span className={styles.roleLabel}>Role:</span>
            <div className={styles.roleToggle}>
              <button
                className={`${styles.roleBtn} ${role === "viewer" ? styles.roleBtnActive : ""}`}
                onClick={() => setRole("viewer")}
              >
                👁 Viewer
              </button>
              <button
                className={`${styles.roleBtn} ${role === "admin" ? styles.roleBtnActive : ""}`}
                onClick={() => setRole("admin")}
              >
                ✏️ Admin
              </button>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className={styles.adminBannerWrap}>
            <div className={styles.adminBanner}>
              <div className={styles.tack} />
              <span>Admin mode active — you can add, edit, and delete transactions.</span>
            </div>
          </div>
        )}
      </header>

      <main className={styles.main}>
        {/* ── Hero ─────────────────────────────── */}
        <section className={styles.hero}>
          <div>
            <div className={styles.heroEyebrow}>Breaking Analysis</div>
            <h1 className={styles.heroTitle}>
              Your quarterly
              <br />
              balance sheet, <em className={styles.heroTitleEm}>live.</em>
            </h1>
            <p className={styles.heroBody}>
              <span className={styles.heroDropCap}>T</span>
              rack your financial activity like front‑page reporting. See trendlines, inspect every
              transaction, and surface critical spending behavior before it compounds.
            </p>
          </div>
          <div className={styles.heroDeco}>$</div>
        </section>

        {/* ── Summary Cards ────────────────────── */}
        <section className={styles.summaryGrid}>
          {(
            [
              { id: "balance", label: "Total Balance", value: summary.balance, cls: "" },
              { id: "income",  label: "Income",        value: summary.income,  cls: styles.valueIncome },
              { id: "expense", label: "Expenses",      value: summary.expense, cls: styles.valueExpense },
            ] as const
          ).map(({ id, label, value, cls }) => (
            <div key={id} className={styles.summaryCard}>
              <div className={styles.cardTape} />
              <div className={styles.cardLabel}>{label}</div>
              <div className={`${styles.cardValue} ${cls}`}>
                {loading ? "—" : <AnimatedValue target={value} />}
              </div>
            </div>
          ))}
        </section>

        {/* ── Charts ───────────────────────────── */}
        <section className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Balance Trend — Monthly</div>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            ) : (
              <TrendChart transactions={transactions} />
            )}
          </div>
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Spending Breakdown</div>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            ) : (
              <DonutChart transactions={transactions} />
            )}
          </div>
        </section>

        {/* ── Insights ─────────────────────────── */}
        <section className={styles.insightsBar}>
          <div className={styles.insightCard}>
            <div className={styles.insightLabel}>Top Spending Category</div>
            <div className={styles.insightVal}>
              {insights.topCat ? insights.topCat.name : "—"}
            </div>
            <div className={styles.insightSub}>
              {insights.topCat ? currency(insights.topCat.value) : "No expenses recorded"}
            </div>
          </div>
          <div className={styles.insightCard}>
            <div className={styles.insightLabel}>Monthly Comparison</div>
            <div
              className={styles.insightVal}
              style={{
                fontSize: 18,
                color:
                  insights.diff === null ? undefined : insights.diff >= 0 ? "#7ce0a0" : "#ff8080",
              }}
            >
              {insights.diff === null
                ? "Not enough history"
                : insights.diff >= 0
                ? `+${currency(insights.diff)} vs ${insights.prev?.month}`
                : `${currency(insights.diff)} vs ${insights.prev?.month}`}
            </div>
            <div className={styles.insightSub}>
              Spend rate: {insights.spendRate}% of income
            </div>
          </div>
        </section>

        {/* ── Transactions ─────────────────────── */}
        <section className={styles.txSection}>
          <div className={styles.txHeader}>
            <div>
              <div className={styles.txTitle}>Ledger Desk</div>
              <div className={styles.txCountLabel}>
                {loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} shown`}
              </div>
            </div>
            <div className={styles.controls}>
              <input
                className={styles.sketchInput}
                placeholder="Search transactions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ minWidth: 180 }}
              />
              <select
                className={styles.sketchSelect}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | TransactionType)}
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                className={styles.sketchSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
                <option value="high">Amount ↓</option>
                <option value="low">Amount ↑</option>
              </select>
              <button className={styles.sketchBtn} onClick={openAdd} disabled={!isAdmin}>
                + Add
              </button>
              {!isAdmin && <span className={styles.viewerLock}>🔒 Read-only</span>}
            </div>
          </div>

          {/* Table body */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>📭 No matching records found.</div>
          ) : (
            <div className={styles.txTableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} style={{ animationDelay: `${i * 0.04}s` }} className={styles.txRow}>
                      <td className={styles.tdDate}>{t.date}</td>
                      <td>{t.description}</td>
                      <td className={styles.tdMuted}>{t.category}</td>
                      <td>
                        <span className={`${styles.badge} ${t.type === "income" ? styles.badgeIncome : styles.badgeExpense}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={t.type === "income" ? styles.amountIncome : styles.amountExpense}>
                        {currency(t.amount)}
                      </td>
                      {isAdmin && (
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.iconBtn}
                              title="Edit"
                              onClick={() => openEdit(t)}
                            >
                              ✏️
                            </button>
                            <button
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              title="Delete"
                              onClick={() => deleteTx(t.id)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTitle}>Finance Ledger Daily</div>
        <div className={styles.footerNote}>Edition: Vol 1.0 · NYC · {footerDate}</div>
      </footer>
    </>
  );
}
