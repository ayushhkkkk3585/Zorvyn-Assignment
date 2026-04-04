// "use client";

// import { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import styles from "./page.module.css";

// // ─── Types ───────────────────────────────────────────────────────────────────

// type Role = "viewer" | "admin";
// type TransactionType = "income" | "expense";
// type SortKey = "latest" | "oldest" | "high" | "low";

// interface Transaction {
//   id: string;
//   date: string;
//   description: string;
//   category: string;
//   type: TransactionType;
//   amount: number;
// }

// interface FormState {
//   description: string;
//   category: string;
//   amount: string;
//   type: TransactionType;
//   date: string;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PIE_COLORS = ["#2d2d2d", "#666", "#999", "#c0a040", "#5a8a5a", "#b05050"];

// const MOCK_TRANSACTIONS: Transaction[] = [
//   { id: "tx-1",  date: "2026-01-05", description: "Monthly Salary",    category: "Income",        type: "income",  amount: 6800 },
//   { id: "tx-2",  date: "2026-01-07", description: "Apartment Rent",    category: "Housing",       type: "expense", amount: 2100 },
//   { id: "tx-3",  date: "2026-01-09", description: "Supermarket",       category: "Groceries",     type: "expense", amount: 242  },
//   { id: "tx-4",  date: "2026-01-11", description: "Stock Dividend",    category: "Investments",   type: "income",  amount: 430  },
//   { id: "tx-5",  date: "2026-01-15", description: "Cloud Tools",       category: "Subscriptions", type: "expense", amount: 89   },
//   { id: "tx-6",  date: "2026-02-03", description: "Monthly Salary",    category: "Income",        type: "income",  amount: 6800 },
//   { id: "tx-7",  date: "2026-02-05", description: "Utilities",         category: "Housing",       type: "expense", amount: 310  },
//   { id: "tx-8",  date: "2026-02-08", description: "Weekend Trip",      category: "Travel",        type: "expense", amount: 720  },
//   { id: "tx-9",  date: "2026-02-13", description: "Client Bonus",      category: "Income",        type: "income",  amount: 1200 },
//   { id: "tx-10", date: "2026-02-18", description: "Pharmacy",          category: "Health",        type: "expense", amount: 146  },
//   { id: "tx-11", date: "2026-03-02", description: "Monthly Salary",    category: "Income",        type: "income",  amount: 6800 },
//   { id: "tx-12", date: "2026-03-04", description: "Restaurant Dinner", category: "Food",          type: "expense", amount: 176  },
//   { id: "tx-13", date: "2026-03-10", description: "Gym Membership",    category: "Health",        type: "expense", amount: 95   },
//   { id: "tx-14", date: "2026-03-15", description: "Freelance Payout",  category: "Income",        type: "income",  amount: 980  },
//   { id: "tx-15", date: "2026-03-19", description: "Metro Card",        category: "Transport",     type: "expense", amount: 120  },
// ];

// const EMPTY_FORM: FormState = {
//   description: "",
//   category: "",
//   amount: "",
//   type: "expense",
//   date: new Date().toISOString().split("T")[0],
// };

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function currency(n: number) {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     maximumFractionDigits: 0,
//   }).format(n);
// }

// function monthLabel(date: string) {
//   return new Date(date + "T12:00:00").toLocaleString("en-US", { month: "short" });
// }

// function uid() {
//   return "tx-" + Date.now();
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// /** Animated counter that counts up from 0 to `target` */
// function AnimatedValue({ target }: { target: number }) {
//   const [display, setDisplay] = useState(0);

//   useEffect(() => {
//     const dur = 800;
//     const t0 = performance.now();
//     const abs = Math.abs(target);
//     const sign = target < 0 ? -1 : 1;

//     function step(now: number) {
//       const p = Math.min((now - t0) / dur, 1);
//       const eased = 1 - Math.pow(1 - p, 3);
//       setDisplay(Math.round(abs * eased) * sign);
//       if (p < 1) requestAnimationFrame(step);
//       else setDisplay(target);
//     }

//     requestAnimationFrame(step);
//   }, [target]);

//   return <>{currency(display)}</>;
// }

// /** SVG area trend chart drawn with animated stroke */
// function TrendChart({ transactions }: { transactions: Transaction[] }) {
//   const svgRef = useRef<SVGSVGElement>(null);

//   const trendData = useMemo(() => {
//     const map = new Map<string, { month: string; income: number; expense: number }>();
//     for (const t of transactions) {
//       const key = t.date.slice(0, 7);
//       const entry = map.get(key) ?? { month: monthLabel(t.date), income: 0, expense: 0 };
//       if (t.type === "income") entry.income += t.amount;
//       else entry.expense += t.amount;
//       map.set(key, entry);
//     }
//     return Array.from(map.entries())
//       .sort((a, b) => a[0].localeCompare(b[0]))
//       .map(([, v]) => ({ ...v, balance: v.income - v.expense }));
//   }, [transactions]);

//   useEffect(() => {
//     const svg = svgRef.current;
//     if (!svg || !trendData.length) return;
//     svg.innerHTML = "";
//     const ns = "http://www.w3.org/2000/svg";
//     const W = 560, H = 200, pad = { l: 40, r: 16, t: 16, b: 30 };
//     const vals = trendData.map((d) => d.balance);
//     const mn = Math.min(0, ...vals);
//     const mx = Math.max(...vals);
//     const range = mx - mn || 1;
//     const xStep = (W - pad.l - pad.r) / (trendData.length - 1 || 1);
//     const px = (i: number) => pad.l + i * xStep;
//     const py = (v: number) => pad.t + (1 - (v - mn) / range) * (H - pad.t - pad.b);

//     // Dashed grid lines
//     [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
//       const y = pad.t + t * (H - pad.t - pad.b);
//       const line = document.createElementNS(ns, "line");
//       line.setAttribute("x1", String(pad.l));
//       line.setAttribute("x2", String(W - pad.r));
//       line.setAttribute("y1", String(y));
//       line.setAttribute("y2", String(y));
//       line.setAttribute("stroke", "#e5e0d8");
//       line.setAttribute("stroke-dasharray", "3 3");
//       line.setAttribute("stroke-width", "1");
//       svg.appendChild(line);
//     });

//     // Smooth curve path
//     let pathD = `M ${px(0)} ${py(vals[0])}`;
//     for (let i = 1; i < trendData.length; i++) {
//       const cx = (px(i - 1) + px(i)) / 2;
//       pathD += ` C ${cx} ${py(vals[i - 1])}, ${cx} ${py(vals[i])}, ${px(i)} ${py(vals[i])}`;
//     }

//     // Area fill
//     const fillD =
//       pathD + ` L ${px(trendData.length - 1)} ${H - pad.b} L ${pad.l} ${H - pad.b} Z`;
//     const area = document.createElementNS(ns, "path");
//     area.setAttribute("d", fillD);
//     area.setAttribute("fill", "rgba(45,45,45,0.12)");
//     svg.appendChild(area);

//     // Animated stroke
//     const stroke = document.createElementNS(ns, "path");
//     stroke.setAttribute("d", pathD);
//     stroke.setAttribute("fill", "none");
//     stroke.setAttribute("stroke", "#2d2d2d");
//     stroke.setAttribute("stroke-width", "2.5");
//     stroke.setAttribute("stroke-dasharray", "600");
//     stroke.setAttribute("stroke-dashoffset", "600");
//     stroke.style.animation = "drawLine 1.2s ease 0.5s forwards";
//     svg.appendChild(stroke);

//     // Dots + labels
//     trendData.forEach((d, i) => {
//       const circle = document.createElementNS(ns, "circle");
//       circle.setAttribute("cx", String(px(i)));
//       circle.setAttribute("cy", String(py(vals[i])));
//       circle.setAttribute("r", "5");
//       circle.setAttribute("fill", "white");
//       circle.setAttribute("stroke", "#2d2d2d");
//       circle.setAttribute("stroke-width", "2");
//       circle.style.animation = `popIn 0.3s ease ${0.5 + i * 0.12}s both`;
//       svg.appendChild(circle);

//       const monthTxt = document.createElementNS(ns, "text");
//       monthTxt.setAttribute("x", String(px(i)));
//       monthTxt.setAttribute("y", String(H - pad.b + 18));
//       monthTxt.setAttribute("text-anchor", "middle");
//       monthTxt.setAttribute("font-size", "12");
//       monthTxt.setAttribute("fill", "#888");
//       monthTxt.setAttribute("font-family", "Patrick Hand, cursive");
//       monthTxt.textContent = d.month;
//       svg.appendChild(monthTxt);

//       const valTxt = document.createElementNS(ns, "text");
//       valTxt.setAttribute("x", String(px(i)));
//       valTxt.setAttribute("y", String(py(vals[i]) - 10));
//       valTxt.setAttribute("text-anchor", "middle");
//       valTxt.setAttribute("font-size", "11");
//       valTxt.setAttribute("fill", "#555");
//       valTxt.setAttribute("font-family", "Patrick Hand, cursive");
//       valTxt.textContent = currency(vals[i]);
//       valTxt.style.animation = `fadeSlideIn 0.4s ease ${0.6 + i * 0.12}s both`;
//       valTxt.style.opacity = "0";
//       svg.appendChild(valTxt);
//     });
//   }, [trendData]);

//   if (!trendData.length) {
//     return <p className={styles.emptyState}>No trend data yet.</p>;
//   }

//   return (
//     <svg
//       ref={svgRef}
//       className={styles.trendSvg}
//       viewBox="0 0 560 220"
//       preserveAspectRatio="none"
//       style={{ height: 220 }}
//     />
//   );
// }

// /** Donut chart with animated segments */
// function DonutChart({ transactions }: { transactions: Transaction[] }) {
//   const svgRef = useRef<SVGSVGElement>(null);

//   const categoryData = useMemo(() => {
//     const map = new Map<string, number>();
//     for (const t of transactions)
//       if (t.type === "expense") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
//     return Array.from(map.entries())
//       .map(([name, value]) => ({ name, value }))
//       .sort((a, b) => b.value - a.value);
//   }, [transactions]);

//   useEffect(() => {
//     const svg = svgRef.current;
//     if (!svg) return;
//     svg.innerHTML = "";
//     const ns = "http://www.w3.org/2000/svg";
//     if (!categoryData.length) {
//       const txt = document.createElementNS(ns, "text");
//       txt.setAttribute("x", "65");
//       txt.setAttribute("y", "70");
//       txt.setAttribute("text-anchor", "middle");
//       txt.setAttribute("fill", "#ccc");
//       txt.setAttribute("font-size", "13");
//       txt.setAttribute("font-family", "Patrick Hand, cursive");
//       txt.textContent = "No expenses";
//       svg.appendChild(txt);
//       return;
//     }

//     const total = categoryData.reduce((s, c) => s + c.value, 0);
//     const cx = 65, cy = 65, R = 50, r = 28;
//     let angle = -Math.PI / 2;

//     categoryData.forEach((cat, i) => {
//       const slice = (cat.value / total) * 2 * Math.PI;
//       const x1 = cx + R * Math.cos(angle),  y1 = cy + R * Math.sin(angle);
//       const x2 = cx + R * Math.cos(angle + slice), y2 = cy + R * Math.sin(angle + slice);
//       const ix1 = cx + r * Math.cos(angle + slice), iy1 = cy + r * Math.sin(angle + slice);
//       const ix2 = cx + r * Math.cos(angle), iy2 = cy + r * Math.sin(angle);
//       const lg = slice > Math.PI ? 1 : 0;
//       const path = document.createElementNS(ns, "path");
//       path.setAttribute(
//         "d",
//         `M ${x1} ${y1} A ${R} ${R} 0 ${lg} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${lg} 0 ${ix2} ${iy2} Z`
//       );
//       path.setAttribute("fill", PIE_COLORS[i % PIE_COLORS.length]);
//       path.setAttribute("stroke", "white");
//       path.setAttribute("stroke-width", "2");
//       path.style.transformOrigin = `${cx}px ${cy}px`;
//       path.style.animation = `popIn 0.4s ease ${0.2 + i * 0.1}s both`;
//       path.style.opacity = "0";
//       path.style.cursor = "pointer";
//       path.addEventListener("mouseenter", () => path.setAttribute("opacity", "0.8"));
//       path.addEventListener("mouseleave", () => path.setAttribute("opacity", "1"));
//       svg.appendChild(path);
//       angle += slice;
//     });
//   }, [categoryData]);

//   return (
//     <div className={styles.donutWrap}>
//       <svg ref={svgRef} width={130} height={130} viewBox="0 0 130 130" className={styles.donutSvg} />
//       <div className={styles.donutLegend}>
//         {categoryData.map((cat, i) => (
//           <div key={cat.name} className={styles.legendItem}>
//             <div
//               className={styles.legendDot}
//               style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
//             />
//             <span>
//               {cat.name} <strong>{currency(cat.value)}</strong>
//             </span>
//           </div>
//         ))}
//         {!categoryData.length && (
//           <p style={{ color: "#aaa", fontSize: 13 }}>No expense data</p>
//         )}
//       </div>
//     </div>
//   );
// }

// /** Add / Edit modal */
// function TransactionModal({
//   open,
//   editingTx,
//   onClose,
//   onSave,
// }: {
//   open: boolean;
//   editingTx: Transaction | null;
//   onClose: () => void;
//   onSave: (form: FormState) => void;
// }) {
//   const [form, setForm] = useState<FormState>(EMPTY_FORM);

//   useEffect(() => {
//     if (open) {
//       setForm(
//         editingTx
//           ? {
//               description: editingTx.description,
//               category: editingTx.category,
//               amount: String(editingTx.amount),
//               type: editingTx.type,
//               date: editingTx.date,
//             }
//           : { ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] }
//       );
//     }
//   }, [open, editingTx]);

//   function set(field: keyof FormState) {
//     return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
//       setForm((f) => ({ ...f, [field]: e.target.value }));
//   }

//   function handleSave() {
//     onSave(form);
//   }

//   return (
//     <div
//       className={`${styles.modalOverlay} ${open ? styles.open : ""}`}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className={styles.modal}>
//         <button className={styles.modalClose} onClick={onClose}>
//           ✕
//         </button>
//         <div className={styles.modalTitle}>
//           {editingTx ? "Edit Transaction ✏️" : "New Transaction ✏️"}
//         </div>

//         {(
//           [
//             { id: "desc",   label: "Description", type: "text",   key: "description", ph: "e.g. Coffee shop" },
//             { id: "cat",    label: "Category",    type: "text",   key: "category",    ph: "e.g. Food"        },
//             { id: "amount", label: "Amount ($)",  type: "number", key: "amount",      ph: "0"                },
//           ] as const
//         ).map(({ id, label, type, key, ph }) => (
//           <div className={styles.field} key={id}>
//             <label>{label}</label>
//             <input
//               className={styles.sketchInput}
//               type={type}
//               placeholder={ph}
//               value={form[key]}
//               onChange={set(key)}
//               min={type === "number" ? 1 : undefined}
//             />
//           </div>
//         ))}

//         <div className={styles.field}>
//           <label>Type</label>
//           <select className={styles.sketchSelect} value={form.type} onChange={set("type")}>
//             <option value="expense">Expense</option>
//             <option value="income">Income</option>
//           </select>
//         </div>

//         <div className={styles.field}>
//           <label>Date</label>
//           <input className={styles.sketchInput} type="date" value={form.date} onChange={set("date")} />
//         </div>

//         <div className={styles.modalActions}>
//           <button className={styles.sketchBtn} onClick={handleSave}>
//             {editingTx ? "Save ✓" : "Add ✓"}
//           </button>
//           <button className={`${styles.sketchBtn} ${styles.sketchBtnSecondary}`} onClick={onClose}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /** Toast notification */
// function Toast({ message, type }: { message: string; type: string }) {
//   return (
//     <div className={`${styles.toast} ${message ? styles.toastShow : ""} ${type ? styles[`toast_${type}`] : ""}`}>
//       {message}
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function FinanceLedgerPage() {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading]           = useState(true);
//   const [role, setRoleState]            = useState<Role>("viewer");
//   const [query, setQuery]               = useState("");
//   const [typeFilter, setTypeFilter]     = useState<"all" | TransactionType>("all");
//   const [sortBy, setSortBy]             = useState<SortKey>("latest");
//   const [modalOpen, setModalOpen]       = useState(false);
//   const [editingTx, setEditingTx]       = useState<Transaction | null>(null);
//   const [toast, setToast]               = useState({ message: "", type: "" });
//   const [editionDate, setEditionDate]   = useState("");
//   const [footerDate, setFooterDate]     = useState("");

//   // Hydrate dates client-side to avoid SSR mismatch
//   useEffect(() => {
//     const now = new Date();
//     setEditionDate(
//       `Vol. 1 | ${now.toLocaleDateString("en-US", {
//         weekday: "short", month: "short", day: "numeric", year: "numeric",
//       })} | New York Edition`
//     );
//     setFooterDate(now.toLocaleDateString("en-US", { year: "numeric", month: "short" }));
//   }, []);

//   // Simulate data fetch
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setTransactions(MOCK_TRANSACTIONS);
//       setLoading(false);
//     }, 800);
//     return () => clearTimeout(timer);
//   }, []);

//   // Toast helper
//   const showToast = useCallback((message: string, type = "") => {
//     setToast({ message, type });
//     setTimeout(() => setToast({ message: "", type: "" }), 2800);
//   }, []);

//   // Role switch
//   function setRole(r: Role) {
//     setRoleState(r);
//     showToast(
//       r === "admin" ? "✏️ Admin mode enabled" : "👁 Switched to Viewer mode",
//       r === "admin" ? "success" : ""
//     );
//   }

//   // Derived: summary
//   const summary = useMemo(() => {
//     const income  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
//     const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
//     return { income, expense, balance: income - expense };
//   }, [transactions]);

//   // Derived: filtered + sorted
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return transactions
//       .filter((t) => {
//         if (typeFilter !== "all" && t.type !== typeFilter) return false;
//         if (!q) return true;
//         return (
//           t.description.toLowerCase().includes(q) ||
//           t.category.toLowerCase().includes(q) ||
//           t.date.includes(q)
//         );
//       })
//       .sort((a, b) => {
//         if (sortBy === "latest") return new Date(b.date).getTime() - new Date(a.date).getTime();
//         if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
//         if (sortBy === "high")   return b.amount - a.amount;
//         return a.amount - b.amount;
//       });
//   }, [transactions, query, typeFilter, sortBy]);

//   // Derived: insights
//   const insights = useMemo(() => {
//     const map = new Map<string, number>();
//     for (const t of transactions)
//       if (t.type === "expense") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
//     const cats = Array.from(map.entries())
//       .map(([name, value]) => ({ name, value }))
//       .sort((a, b) => b.value - a.value);

//     const trendMap = new Map<string, { month: string; income: number; expense: number }>();
//     for (const t of transactions) {
//       const key = t.date.slice(0, 7);
//       const e = trendMap.get(key) ?? { month: monthLabel(t.date), income: 0, expense: 0 };
//       if (t.type === "income") e.income += t.amount; else e.expense += t.amount;
//       trendMap.set(key, e);
//     }
//     const trend = Array.from(trendMap.entries())
//       .sort((a, b) => a[0].localeCompare(b[0]))
//       .map(([, v]) => ({ ...v, balance: v.income - v.expense }));

//     const prev = trend[trend.length - 2];
//     const curr = trend[trend.length - 1];
//     const diff = curr && prev ? curr.balance - prev.balance : null;
//     const spendRate = curr?.income ? Math.round((curr.expense / curr.income) * 100) : 0;

//     return { topCat: cats[0] ?? null, diff, prev, spendRate };
//   }, [transactions]);

//   // CRUD
//   function openAdd()               { setEditingTx(null); setModalOpen(true); }
//   function openEdit(tx: Transaction) { setEditingTx(tx);   setModalOpen(true); }
//   function closeModal()            { setModalOpen(false); setEditingTx(null); }

//   function saveTransaction(form: FormState) {
//     const amount = parseFloat(form.amount);
//     if (!form.description || !form.category || isNaN(amount) || amount <= 0 || !form.date) {
//       showToast("⚠️ Please fill all fields", "error");
//       return;
//     }
//     if (editingTx) {
//       setTransactions((prev) =>
//         prev.map((t) =>
//           t.id === editingTx.id
//             ? { ...t, description: form.description, category: form.category, amount, type: form.type, date: form.date }
//             : t
//         )
//       );
//       showToast("✅ Transaction updated!", "success");
//     } else {
//       setTransactions((prev) => [
//         { id: uid(), date: form.date, description: form.description, category: form.category, type: form.type, amount },
//         ...prev,
//       ]);
//       showToast("✅ Transaction added!", "success");
//     }
//     closeModal();
//   }

//   function deleteTx(id: string) {
//     if (!confirm("Delete this transaction?")) return;
//     setTransactions((prev) => prev.filter((t) => t.id !== id));
//     showToast("🗑 Transaction deleted");
//   }

//   const isAdmin = role === "admin";

//   return (
//     <>
//       {/* Global keyframe animations injected once */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&display=swap');
//         @keyframes bounceIn {
//           0%   { opacity:0; transform:scale(0.5) rotate(-5deg); }
//           60%  { opacity:1; transform:scale(1.08) rotate(1deg); }
//           80%  { transform:scale(0.97) rotate(-0.5deg); }
//           100% { transform:scale(1) rotate(0deg); }
//         }
//         @keyframes slideUp {
//           from { opacity:0; transform:translateY(30px) rotate(-1deg); }
//           to   { opacity:1; transform:translateY(0) rotate(0deg); }
//         }
//         @keyframes wiggle {
//           0%,100% { transform:rotate(-2deg); }
//           50%     { transform:rotate(2deg); }
//         }
//         @keyframes bounce {
//           0%,100% { transform:translateY(0); }
//           50%     { transform:translateY(-8px); }
//         }
//         @keyframes drawLine {
//           from { stroke-dashoffset:600; }
//           to   { stroke-dashoffset:0; }
//         }
//         @keyframes fadeSlideIn {
//           from { opacity:0; transform:translateX(-12px); }
//           to   { opacity:1; transform:translateX(0); }
//         }
//         @keyframes popIn {
//           0%   { transform:scale(0) rotate(-10deg); opacity:0; }
//           70%  { transform:scale(1.1) rotate(2deg); opacity:1; }
//           100% { transform:scale(1) rotate(0); opacity:1; }
//         }
//         @keyframes rowSlide {
//           from { opacity:0; transform:translateX(-20px); }
//           to   { opacity:1; transform:translateX(0); }
//         }
//         @keyframes float {
//           0%,100% { transform:translateY(0) rotate(-2deg); }
//           50%     { transform:translateY(-6px) rotate(2deg); }
//         }
//       `}</style>

//       <Toast message={toast.message} type={toast.type} />

//       <TransactionModal
//         open={modalOpen}
//         editingTx={editingTx}
//         onClose={closeModal}
//         onSave={saveTransaction}
//       />

//       {/* ── Header ───────────────────────────────── */}
//       <header className={styles.header}>
//         <div className={styles.headerInner}>
//           <div>
//             <div className={styles.mastheadLabel}>{editionDate || "Finance Ledger Daily"}</div>
//             <div className={styles.mastheadTitle}>Finance Ledger Daily</div>
//           </div>
//           <div className={styles.roleSwitcher}>
//             <span className={styles.roleLabel}>Role:</span>
//             <div className={styles.roleToggle}>
//               <button
//                 className={`${styles.roleBtn} ${role === "viewer" ? styles.roleBtnActive : ""}`}
//                 onClick={() => setRole("viewer")}
//               >
//                 👁 Viewer
//               </button>
//               <button
//                 className={`${styles.roleBtn} ${role === "admin" ? styles.roleBtnActive : ""}`}
//                 onClick={() => setRole("admin")}
//               >
//                 ✏️ Admin
//               </button>
//             </div>
//           </div>
//         </div>
//         {isAdmin && (
//           <div className={styles.adminBannerWrap}>
//             <div className={styles.adminBanner}>
//               <div className={styles.tack} />
//               <span>Admin mode active — you can add, edit, and delete transactions.</span>
//             </div>
//           </div>
//         )}
//       </header>

//       <main className={styles.main}>
//         {/* ── Hero ─────────────────────────────── */}
//         <section className={styles.hero}>
//           <div>
//             <div className={styles.heroEyebrow}>Breaking Analysis</div>
//             <h1 className={styles.heroTitle}>
//               Your quarterly
//               <br />
//               balance sheet, <em className={styles.heroTitleEm}>live.</em>
//             </h1>
//             <p className={styles.heroBody}>
//               <span className={styles.heroDropCap}>T</span>
//               rack your financial activity like front‑page reporting. See trendlines, inspect every
//               transaction, and surface critical spending behavior before it compounds.
//             </p>
//           </div>
//           <div className={styles.heroDeco}>$</div>
//         </section>

//         {/* ── Summary Cards ────────────────────── */}
//         <section className={styles.summaryGrid}>
//           {(
//             [
//               { id: "balance", label: "Total Balance", value: summary.balance, cls: "" },
//               { id: "income",  label: "Income",        value: summary.income,  cls: styles.valueIncome },
//               { id: "expense", label: "Expenses",      value: summary.expense, cls: styles.valueExpense },
//             ] as const
//           ).map(({ id, label, value, cls }) => (
//             <div key={id} className={styles.summaryCard}>
//               <div className={styles.cardTape} />
//               <div className={styles.cardLabel}>{label}</div>
//               <div className={`${styles.cardValue} ${cls}`}>
//                 {loading ? "—" : <AnimatedValue target={value} />}
//               </div>
//             </div>
//           ))}
//         </section>

//         {/* ── Charts ───────────────────────────── */}
//         <section className={styles.chartsGrid}>
//           <div className={styles.chartCard}>
//             <div className={styles.chartTitle}>Balance Trend — Monthly</div>
//             {loading ? (
//               <div className={styles.loadingState}>
//                 <div className={styles.dot} />
//                 <div className={styles.dot} />
//                 <div className={styles.dot} />
//               </div>
//             ) : (
//               <TrendChart transactions={transactions} />
//             )}
//           </div>
//           <div className={styles.chartCard}>
//             <div className={styles.chartTitle}>Spending Breakdown</div>
//             {loading ? (
//               <div className={styles.loadingState}>
//                 <div className={styles.dot} />
//                 <div className={styles.dot} />
//                 <div className={styles.dot} />
//               </div>
//             ) : (
//               <DonutChart transactions={transactions} />
//             )}
//           </div>
//         </section>

//         {/* ── Insights ─────────────────────────── */}
//         <section className={styles.insightsBar}>
//           <div className={styles.insightCard}>
//             <div className={styles.insightLabel}>Top Spending Category</div>
//             <div className={styles.insightVal}>
//               {insights.topCat ? insights.topCat.name : "—"}
//             </div>
//             <div className={styles.insightSub}>
//               {insights.topCat ? currency(insights.topCat.value) : "No expenses recorded"}
//             </div>
//           </div>
//           <div className={styles.insightCard}>
//             <div className={styles.insightLabel}>Monthly Comparison</div>
//             <div
//               className={styles.insightVal}
//               style={{
//                 fontSize: 18,
//                 color:
//                   insights.diff === null ? undefined : insights.diff >= 0 ? "#7ce0a0" : "#ff8080",
//               }}
//             >
//               {insights.diff === null
//                 ? "Not enough history"
//                 : insights.diff >= 0
//                 ? `+${currency(insights.diff)} vs ${insights.prev?.month}`
//                 : `${currency(insights.diff)} vs ${insights.prev?.month}`}
//             </div>
//             <div className={styles.insightSub}>
//               Spend rate: {insights.spendRate}% of income
//             </div>
//           </div>
//         </section>

//         {/* ── Transactions ─────────────────────── */}
//         <section className={styles.txSection}>
//           <div className={styles.txHeader}>
//             <div>
//               <div className={styles.txTitle}>Ledger Desk</div>
//               <div className={styles.txCountLabel}>
//                 {loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} shown`}
//               </div>
//             </div>
//             <div className={styles.controls}>
//               <input
//                 className={styles.sketchInput}
//                 placeholder="Search transactions…"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 style={{ minWidth: 180 }}
//               />
//               <select
//                 className={styles.sketchSelect}
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value as "all" | TransactionType)}
//               >
//                 <option value="all">All types</option>
//                 <option value="income">Income</option>
//                 <option value="expense">Expense</option>
//               </select>
//               <select
//                 className={styles.sketchSelect}
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value as SortKey)}
//               >
//                 <option value="latest">Latest first</option>
//                 <option value="oldest">Oldest first</option>
//                 <option value="high">Amount ↓</option>
//                 <option value="low">Amount ↑</option>
//               </select>
//               <button className={styles.sketchBtn} onClick={openAdd} disabled={!isAdmin}>
//                 + Add
//               </button>
//               {!isAdmin && <span className={styles.viewerLock}>🔒 Read-only</span>}
//             </div>
//           </div>

//           {/* Table body */}
//           {loading ? (
//             <div className={styles.loadingState}>
//               <div className={styles.dot} />
//               <div className={styles.dot} />
//               <div className={styles.dot} />
//             </div>
//           ) : filtered.length === 0 ? (
//             <div className={styles.emptyState}>📭 No matching records found.</div>
//           ) : (
//             <div className={styles.txTableWrap}>
//               <table className={styles.table}>
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Description</th>
//                     <th>Category</th>
//                     <th>Type</th>
//                     <th>Amount</th>
//                     {isAdmin && <th>Actions</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((t, i) => (
//                     <tr key={t.id} style={{ animationDelay: `${i * 0.04}s` }} className={styles.txRow}>
//                       <td className={styles.tdDate}>{t.date}</td>
//                       <td>{t.description}</td>
//                       <td className={styles.tdMuted}>{t.category}</td>
//                       <td>
//                         <span className={`${styles.badge} ${t.type === "income" ? styles.badgeIncome : styles.badgeExpense}`}>
//                           {t.type}
//                         </span>
//                       </td>
//                       <td className={t.type === "income" ? styles.amountIncome : styles.amountExpense}>
//                         {currency(t.amount)}
//                       </td>
//                       {isAdmin && (
//                         <td>
//                           <div className={styles.actionBtns}>
//                             <button
//                               className={styles.iconBtn}
//                               title="Edit"
//                               onClick={() => openEdit(t)}
//                             >
//                               ✏️
//                             </button>
//                             <button
//                               className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
//                               title="Delete"
//                               onClick={() => deleteTx(t.id)}
//                             >
//                               🗑
//                             </button>
//                           </div>
//                         </td>
//                       )}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </section>
//       </main>

//       <footer className={styles.footer}>
//         <div className={styles.footerTitle}>Finance Ledger Daily</div>
//         <div className={styles.footerNote}>Edition: Vol 1.0 · NYC · {footerDate}</div>
//       </footer>
//     </>
//   );
// }

"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

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

// ─── Design tokens ────────────────────────────────────────────────────────────

const R = {
  wobbly: "255px 15px 225px 15px / 15px 225px 15px 255px",
  wobblyMd: "15px 225px 15px 255px / 225px 15px 255px 15px",
  wobblySm: "8px 80px 8px 80px / 80px 8px 80px 8px",
} as const;

const SH = {
  sm: "2px 2px 0px 0px #2d2d2d",
  md: "4px 4px 0px 0px #2d2d2d",
  lg: "8px 8px 0px 0px #2d2d2d",
} as const;

// ─── Constants ────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#2d2d2d", "#666", "#999", "#c0a040", "#5a8a5a", "#b05050"];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", date: "2026-01-05", description: "Monthly Salary", category: "Income", type: "income", amount: 6800 },
  { id: "tx-2", date: "2026-01-07", description: "Apartment Rent", category: "Housing", type: "expense", amount: 2100 },
  { id: "tx-3", date: "2026-01-09", description: "Supermarket", category: "Groceries", type: "expense", amount: 242 },
  { id: "tx-4", date: "2026-01-11", description: "Stock Dividend", category: "Investments", type: "income", amount: 430 },
  { id: "tx-5", date: "2026-01-15", description: "Cloud Tools", category: "Subscriptions", type: "expense", amount: 89 },
  { id: "tx-6", date: "2026-02-03", description: "Monthly Salary", category: "Income", type: "income", amount: 6800 },
  { id: "tx-7", date: "2026-02-05", description: "Utilities", category: "Housing", type: "expense", amount: 310 },
  { id: "tx-8", date: "2026-02-08", description: "Weekend Trip", category: "Travel", type: "expense", amount: 720 },
  { id: "tx-9", date: "2026-02-13", description: "Client Bonus", category: "Income", type: "income", amount: 1200 },
  { id: "tx-10", date: "2026-02-18", description: "Pharmacy", category: "Health", type: "expense", amount: 146 },
  { id: "tx-11", date: "2026-03-02", description: "Monthly Salary", category: "Income", type: "income", amount: 6800 },
  { id: "tx-12", date: "2026-03-04", description: "Restaurant Dinner", category: "Food", type: "expense", amount: 176 },
  { id: "tx-13", date: "2026-03-10", description: "Gym Membership", category: "Health", type: "expense", amount: 95 },
  { id: "tx-14", date: "2026-03-15", description: "Freelance Payout", category: "Income", type: "income", amount: 980 },
  { id: "tx-15", date: "2026-03-19", description: "Metro Card", category: "Transport", type: "expense", amount: 120 },
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
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function monthLabel(date: string) {
  return new Date(date + "T12:00:00").toLocaleString("en-US", { month: "short" });
}
function uid() { return "tx-" + Date.now(); }

// ─── Global Styles ────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    html, body {
      overflow-x: hidden;
      max-width: 100vw;
    }

    body {
      font-family: 'Patrick Hand', cursive !important;
      background-color: #fdfbf7;
      background-image: radial-gradient(#e5e0d8 1px, transparent 1px);
      background-size: 24px 24px;
      color: #2d2d2d;
      min-height: 100vh;
      margin: 0;
    }

    .sum-card {
      max-width: 100%;
      overflow: hidden;
    }

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
    @keyframes bounceDot {
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
    @keyframes toastSlideUp {
      from { transform:translateY(80px); opacity:0; }
      to   { transform:translateY(0); opacity:1; }
    }

    .su0 { animation: slideUp 0.6s ease both; }
    .su1 { animation: slideUp 0.5s ease 0.10s both; }
    .su2 { animation: slideUp 0.5s ease 0.20s both; }
    .su3 { animation: slideUp 0.5s ease 0.30s both; }
    .su4 { animation: slideUp 0.5s ease 0.40s both; }
    .su5 { animation: slideUp 0.6s ease 0.40s both; }
    .su6 { animation: slideUp 0.6s ease 0.50s both; }
    .su7 { animation: slideUp 0.6s ease 0.60s both; }
    .su8 { animation: slideUp 0.5s ease 0.80s both; }
    .bounce-in  { animation: bounceIn 0.5s ease both; }
    .do-wiggle  { animation: wiggle 3s ease-in-out infinite; }
    .do-float   { animation: float  4s ease-in-out infinite; }
    .do-rowslide{ animation: rowSlide 0.35s ease both; }
    .dot1 { animation: bounceDot 0.8s ease 0.00s infinite; }
    .dot2 { animation: bounceDot 0.8s ease 0.15s infinite; }
    .dot3 { animation: bounceDot 0.8s ease 0.30s infinite; }

    .kalam   { font-family: 'Kalam', cursive !important; }
    .patrick { font-family: 'Patrick Hand', cursive !important; }

    /* Masthead red underline */
    .masthead-ul::after {
      content:''; display:block; height:3px;
      background:#ff4d4d; margin-top:3px; border-radius:2px;
    }

    /* Hero top dashed stripe */
    .hero-stripe::before {
      content:''; position:absolute; top:0; left:0; right:0; height:6px;
      background: repeating-linear-gradient(90deg,#2d2d2d 0 18px,transparent 18px 28px);
    }

    /* Card sticky-tape */
    .card-tape::before {
      content:''; position:absolute;
      top:-10px; left:50%; transform:translateX(-50%) rotate(-1.5deg);
      width:60px; height:22px;
      background:rgba(200,190,170,0.45); border:1px solid rgba(0,0,0,0.15); border-radius:2px;
    }

    /* Interactive states — all via CSS, no Tailwind conflicts */
    .sum-card { cursor:default; transition: transform 0.15s, box-shadow 0.15s; }
    .sum-card:hover  { transform:rotate(0deg) scale(1.03) !important; box-shadow:8px 8px 0 #2d2d2d !important; }
    .sum-card:active { transform:translate(2px,2px) !important; box-shadow:none !important; }

    .sketch-btn { transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s; }
    .sketch-btn:hover  { background:#ff4d4d !important; border-color:#ff4d4d !important; box-shadow:4px 4px 0 #2d2d2d !important; }
    .sketch-btn:active { transform:translate(2px,2px); box-shadow:none !important; }
    .sketch-btn:disabled { opacity:0.4; cursor:not-allowed; pointer-events:none; }

    .btn-secondary        { background:transparent !important; color:#2d2d2d !important; }
    .btn-secondary:hover  { background:#e5e0d8 !important; border-color:#2d2d2d !important; }

    .sketch-input { transition: box-shadow 0.15s, border-color 0.15s, transform 0.1s; }
    .sketch-input:focus   { border-color:#2d5da1 !important; box-shadow:2px 2px 0 #2d5da1 !important; transform:rotate(-0.5deg); outline:none; }

    .role-wrap  { transition: box-shadow 0.15s; }
    .role-wrap:hover { box-shadow:4px 4px 0 #2d2d2d; }
    .role-btn   { transition: background 0.2s, color 0.2s, transform 0.1s; }
    .role-btn:not(.role-on):hover { background:#e5e0d8; }
    .role-btn:active { transform:scale(0.96); }
    .role-on    { animation: popIn 0.3s ease; }

    .icon-btn         { transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
    .icon-btn:hover   { background:#e5e0d8 !important; transform:rotate(-3deg); box-shadow:4px 4px 0 #2d2d2d !important; }
    .icon-btn:active  { transform:translate(2px,2px); box-shadow:none !important; }
    .icon-danger:hover { background:#ffe0e0 !important; }

    .tx-row { transition: background 0.15s, transform 0.1s; }
    .tx-row:hover { background:#fdfbf7; transform:translateX(4px); }

    .leg-item { cursor:default; }
    .leg-dot  { transition: transform 0.2s; }
    .leg-item:hover .leg-dot { transform:scale(1.4); }

    .modal-x { transition: color 0.15s, transform 0.15s; }
    .modal-x:hover { color:#ff4d4d !important; transform:rotate(90deg); }

    .toast-in  { animation: toastSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .toast-out { opacity:0; transform:translateY(80px); }

    /* Responsive */
    @media (max-width: 800px) {
      .grid-cards  { grid-template-columns: 1fr !important; }
      .grid-charts { grid-template-columns: 1fr !important; }
      .grid-insights { grid-template-columns: 1fr !important; gap:16px !important; padding:20px !important; }
      .hero-grid   { grid-template-columns: 1fr !important; padding:24px !important; }
      .hero-deco   { display:none !important; }
      .header-inner { flex-direction:column; align-items:flex-start; }
      .role-full   { width:100%; justify-content:space-between; }
      .tx-section  { padding:16px !important; }
    }
    @media (max-width: 480px) {
      .main-wrap   { padding:10px 8px 30px !important; }
      .hero-grid   { padding: 20px !important; }
      .tx-section  { padding: 16px !important; }
      .controls-wrap { flex-direction:column !important; align-items:stretch !important; }
      .controls-wrap > * { width:100% !important; }
      .sum-card    { transform: none !important; }
      .footer-wrap { flex-direction:column; align-items:flex-start; }
    }
  `}</style>
);

// ─── AnimatedValue ────────────────────────────────────────────────────────────

function AnimatedValue({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const dur = 800, t0 = performance.now();
    const abs = Math.abs(target), sign = target < 0 ? -1 : 1;
    function step(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      setDisplay(Math.round(abs * (1 - Math.pow(1 - p, 3))) * sign);
      if (p < 1) requestAnimationFrame(step); else setDisplay(target);
    }
    requestAnimationFrame(step);
  }, [target]);
  return <>{currency(display)}</>;
}

// ─── TrendChart ───────────────────────────────────────────────────────────────

function TrendChart({ transactions }: { transactions: Transaction[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const trendData = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expense: number }>();
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const e = map.get(key) ?? { month: monthLabel(t.date), income: 0, expense: 0 };
      t.type === "income" ? (e.income += t.amount) : (e.expense += t.amount);
      map.set(key, e);
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
    const mn = Math.min(0, ...vals), mx = Math.max(...vals), range = mx - mn || 1;
    const xStep = (W - pad.l - pad.r) / (trendData.length - 1 || 1);
    const px = (i: number) => pad.l + i * xStep;
    const py = (v: number) => pad.t + (1 - (v - mn) / range) * (H - pad.t - pad.b);

    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const y = pad.t + t * (H - pad.t - pad.b);
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", String(pad.l)); line.setAttribute("x2", String(W - pad.r));
      line.setAttribute("y1", String(y)); line.setAttribute("y2", String(y));
      line.setAttribute("stroke", "#e5e0d8"); line.setAttribute("stroke-dasharray", "3 3"); line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    });

    let pathD = `M ${px(0)} ${py(vals[0])}`;
    for (let i = 1; i < trendData.length; i++) {
      const cx = (px(i - 1) + px(i)) / 2;
      pathD += ` C ${cx} ${py(vals[i - 1])}, ${cx} ${py(vals[i])}, ${px(i)} ${py(vals[i])}`;
    }

    const area = document.createElementNS(ns, "path");
    area.setAttribute("d", pathD + ` L ${px(trendData.length - 1)} ${H - pad.b} L ${pad.l} ${H - pad.b} Z`);
    area.setAttribute("fill", "rgba(45,45,45,0.12)");
    svg.appendChild(area);

    const stroke = document.createElementNS(ns, "path");
    stroke.setAttribute("d", pathD); stroke.setAttribute("fill", "none");
    stroke.setAttribute("stroke", "#2d2d2d"); stroke.setAttribute("stroke-width", "2.5");
    stroke.setAttribute("stroke-dasharray", "600"); stroke.setAttribute("stroke-dashoffset", "600");
    stroke.style.animation = "drawLine 1.2s ease 0.5s forwards";
    svg.appendChild(stroke);

    trendData.forEach((d, i) => {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", String(px(i))); circle.setAttribute("cy", String(py(vals[i])));
      circle.setAttribute("r", "5"); circle.setAttribute("fill", "white");
      circle.setAttribute("stroke", "#2d2d2d"); circle.setAttribute("stroke-width", "2");
      circle.style.animation = `popIn 0.3s ease ${0.5 + i * 0.12}s both`;
      svg.appendChild(circle);

      const mTxt = document.createElementNS(ns, "text");
      mTxt.setAttribute("x", String(px(i))); mTxt.setAttribute("y", String(H - pad.b + 18));
      mTxt.setAttribute("text-anchor", "middle"); mTxt.setAttribute("font-size", "12");
      mTxt.setAttribute("fill", "#888"); mTxt.setAttribute("font-family", "Patrick Hand, cursive");
      mTxt.textContent = d.month;
      svg.appendChild(mTxt);

      const vTxt = document.createElementNS(ns, "text");
      vTxt.setAttribute("x", String(px(i))); vTxt.setAttribute("y", String(py(vals[i]) - 10));
      vTxt.setAttribute("text-anchor", "middle"); vTxt.setAttribute("font-size", "11");
      vTxt.setAttribute("fill", "#555"); vTxt.setAttribute("font-family", "Patrick Hand, cursive");
      vTxt.textContent = currency(vals[i]);
      vTxt.style.animation = `fadeSlideIn 0.4s ease ${0.6 + i * 0.12}s both`;
      vTxt.style.opacity = "0";
      svg.appendChild(vTxt);
    });
  }, [trendData]);

  if (!trendData.length)
    return <p className="kalam" style={{ textAlign: "center", color: "#aaa", padding: "48px 0", fontSize: 22 }}>No trend data yet.</p>;

  return (
    <svg ref={svgRef} viewBox="0 0 560 220" preserveAspectRatio="none" style={{ width: "100%", height: 220, overflow: "visible" }} />
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

function DonutChart({ transactions }: { transactions: Transaction[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions)
      if (t.type === "expense") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    if (!categoryData.length) {
      const txt = document.createElementNS(ns, "text");
      txt.setAttribute("x", "65"); txt.setAttribute("y", "70");
      txt.setAttribute("text-anchor", "middle"); txt.setAttribute("fill", "#ccc");
      txt.setAttribute("font-size", "13"); txt.setAttribute("font-family", "Patrick Hand, cursive");
      txt.textContent = "No expenses";
      svg.appendChild(txt);
      return;
    }
    const total = categoryData.reduce((s, c) => s + c.value, 0);
    const cx = 65, cy = 65, Ro = 50, ri = 28;
    let angle = -Math.PI / 2;
    categoryData.forEach((cat, i) => {
      const slice = (cat.value / total) * 2 * Math.PI;
      const x1 = cx + Ro * Math.cos(angle), y1 = cy + Ro * Math.sin(angle);
      const x2 = cx + Ro * Math.cos(angle + slice), y2 = cy + Ro * Math.sin(angle + slice);
      const ix1 = cx + ri * Math.cos(angle + slice), iy1 = cy + ri * Math.sin(angle + slice);
      const ix2 = cx + ri * Math.cos(angle), iy2 = cy + ri * Math.sin(angle);
      const lg = slice > Math.PI ? 1 : 0;
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", `M ${x1} ${y1} A ${Ro} ${Ro} 0 ${lg} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${lg} 0 ${ix2} ${iy2} Z`);
      path.setAttribute("fill", PIE_COLORS[i % PIE_COLORS.length]);
      path.setAttribute("stroke", "white"); path.setAttribute("stroke-width", "2");
      path.style.transformOrigin = `${cx}px ${cy}px`;
      path.style.animation = `popIn 0.4s ease ${0.2 + i * 0.1}s both`;
      path.style.opacity = "0"; path.style.cursor = "pointer";
      path.addEventListener("mouseenter", () => path.setAttribute("opacity", "0.8"));
      path.addEventListener("mouseleave", () => path.setAttribute("opacity", "1"));
      svg.appendChild(path);
      angle += slice;
    });
  }, [categoryData]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <svg ref={svgRef} width={130} height={130} viewBox="0 0 130 130" style={{ flexShrink: 0 }} />
      <div style={{ fontSize: 13 }}>
        {categoryData.map((cat, i) => (
          <div key={cat.name} className="leg-item" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div className="leg-dot" style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #2d2d2d", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
            <span className="patrick">{cat.name} <strong>{currency(cat.value)}</strong></span>
          </div>
        ))}
        {!categoryData.length && <p className="patrick" style={{ color: "#aaa", fontSize: 13 }}>No expense data</p>}
      </div>
    </div>
  );
}

// ─── TransactionModal ─────────────────────────────────────────────────────────

function TransactionModal({ open, editingTx, onClose, onSave }: {
  open: boolean; editingTx: Transaction | null; onClose: () => void; onSave: (f: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  useEffect(() => {
    if (open) setForm(editingTx
      ? { description: editingTx.description, category: editingTx.category, amount: String(editingTx.amount), type: editingTx.type, date: editingTx.date }
      : { ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
  }, [open, editingTx]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const inputSt: React.CSSProperties = {
    fontFamily: "'Patrick Hand', cursive", fontSize: 14,
    padding: "10px 14px", border: "2px solid #2d2d2d", borderRadius: R.wobblySm,
    background: "#fdfbf7", color: "#2d2d2d", boxShadow: SH.sm, width: "100%",
    transition: "box-shadow 0.15s, border-color 0.15s, transform 0.1s",
  };
  const labelSt: React.CSSProperties = {
    display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", marginBottom: 6,
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(45,45,45,0.55)", backdropFilter: "blur(2px)",
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transition: "opacity 0.2s",
      }}
    >
      <div style={{
        background: "white", border: "3px solid #2d2d2d", borderRadius: R.wobblyMd,
        padding: 36, width: "90%", maxWidth: 460, boxShadow: SH.lg, position: "relative",
        transform: open ? "scale(1) rotate(0deg)" : "scale(0.85) rotate(-2deg)",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <button
          className="modal-x"
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#aaa" }}
        >✕</button>

        <div className="kalam" style={{ fontSize: 26, fontWeight: 700, marginBottom: 22 }}>
          {editingTx ? "Edit Transaction ✏️" : "New Transaction ✏️"}
        </div>

        {[
          { label: "Description", type: "text", key: "description" as const, ph: "e.g. Coffee shop" },
          { label: "Category", type: "text", key: "category" as const, ph: "e.g. Food" },
          { label: "Amount ($)", type: "number", key: "amount" as const, ph: "0" },
        ].map(({ label, type, key, ph }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label className="patrick" style={labelSt}>{label}</label>
            <input className="sketch-input patrick" type={type} placeholder={ph} value={form[key]} onChange={set(key)} style={inputSt} min={type === "number" ? 1 : undefined} />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label className="patrick" style={labelSt}>Type</label>
          <select className="sketch-input patrick" value={form.type} onChange={set("type")} style={inputSt}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="patrick" style={labelSt}>Date</label>
          <input className="sketch-input patrick" type="date" value={form.date} onChange={set("date")} style={inputSt} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            className="sketch-btn patrick"
            onClick={() => onSave(form)}
            style={{ fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 20px", border: "2px solid #2d2d2d", borderRadius: R.wobblySm, cursor: "pointer", background: "#2d2d2d", color: "#fdfbf7", boxShadow: SH.sm }}
          >{editingTx ? "Save ✓" : "Add ✓"}</button>
          <button
            className="sketch-btn btn-secondary patrick"
            onClick={onClose}
            style={{ fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 20px", border: "2px solid #2d2d2d", borderRadius: R.wobblySm, cursor: "pointer", background: "transparent", color: "#2d2d2d", boxShadow: SH.sm }}
          >Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: string }) {
  const bg = type === "success" ? "#1a6b3c" : type === "error" ? "#ff4d4d" : "#2d2d2d";
  return (
    <div className={`patrick ${message ? "toast-in" : "toast-out"}`} style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 500,
      background: bg, color: "#fdfbf7", borderRadius: R.wobblySm,
      padding: "14px 22px", fontSize: 15, boxShadow: SH.lg, pointerEvents: "none",
    }}>{message}</div>
  );
}

// ─── LoadingDots ──────────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
      {(["dot1", "dot2", "dot3"] as const).map((cls) => (
        <div key={cls} className={cls} style={{ width: 12, height: 12, borderRadius: "50%", background: "#2d2d2d" }} />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceLedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<Role>("viewer");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [editionDate, setEditionDate] = useState("");
  const [footerDate, setFooterDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setEditionDate(`Vol. 1 | ${now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} | New York Edition`);
    setFooterDate(now.toLocaleDateString("en-US", { year: "numeric", month: "short" }));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setTransactions(MOCK_TRANSACTIONS); setLoading(false); }, 800);
    return () => clearTimeout(t);
  }, []);

  const showToast = useCallback((message: string, type = "") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2800);
  }, []);

  function setRole(r: Role) {
    setRoleState(r);
    showToast(r === "admin" ? "✏️ Admin mode enabled" : "👁 Switched to Viewer mode", r === "admin" ? "success" : "");
  }

  const summary = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (!q) return true;
        return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.date.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "latest") return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === "high") return b.amount - a.amount;
        return a.amount - b.amount;
      });
  }, [transactions, query, typeFilter, sortBy]);

  const insights = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) if (t.type === "expense") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    const cats = Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const tMap = new Map<string, { month: string; income: number; expense: number }>();
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const e = tMap.get(key) ?? { month: monthLabel(t.date), income: 0, expense: 0 };
      t.type === "income" ? (e.income += t.amount) : (e.expense += t.amount);
      tMap.set(key, e);
    }
    const trend = Array.from(tMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => ({ ...v, balance: v.income - v.expense }));
    const prev = trend[trend.length - 2], curr = trend[trend.length - 1];
    return {
      topCat: cats[0] ?? null,
      diff: curr && prev ? curr.balance - prev.balance : null,
      prev, spendRate: curr?.income ? Math.round((curr.expense / curr.income) * 100) : 0,
    };
  }, [transactions]);

  function openAdd() { setEditingTx(null); setModalOpen(true); }
  function openEdit(tx: Transaction) { setEditingTx(tx); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingTx(null); }

  function saveTransaction(form: FormState) {
    const amount = parseFloat(form.amount);
    if (!form.description || !form.category || isNaN(amount) || amount <= 0 || !form.date) {
      showToast("⚠️ Please fill all fields", "error"); return;
    }
    if (editingTx) {
      setTransactions((prev) => prev.map((t) => t.id === editingTx.id ? { ...t, ...form, amount } : t));
      showToast("✅ Transaction updated!", "success");
    } else {
      setTransactions((prev) => [{ id: uid(), date: form.date, description: form.description, category: form.category, type: form.type, amount }, ...prev]);
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

  const inputSt: React.CSSProperties = {
    fontFamily: "'Patrick Hand', cursive", fontSize: 14,
    padding: "10px 14px", border: "2px solid #2d2d2d", borderRadius: R.wobblySm,
    background: "#fdfbf7", color: "#2d2d2d", boxShadow: SH.sm, outline: "none",
    transition: "box-shadow 0.15s, border-color 0.15s, transform 0.1s",
  };

  const summaryItems = [
    { id: "balance", label: "Total Balance", value: summary.balance, color: "#2d2d2d", rot: "-1deg", cls: "su2" },
    { id: "income", label: "Income", value: summary.income, color: "#1a8c4a", rot: "0.5deg", cls: "su3" },
    { id: "expense", label: "Expenses", value: summary.expense, color: "#ff4d4d", rot: "-0.5deg", cls: "su4" },
  ] as const;

  return (
    <>
      <GlobalStyles />
      <Toast message={toast.message} type={toast.type} />
      <TransactionModal open={modalOpen} editingTx={editingTx} onClose={closeModal} onSave={saveTransaction} />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="su0" style={{ background: "#fdfbf7", borderBottom: "3px solid #2d2d2d", position: "sticky", top: 0, zIndex: 100, width:"100%", overflow:"hidden" }}>
        <div className="header-inner" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="patrick" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>
              {editionDate || "Finance Ledger Daily"}
            </div>
            <div className="kalam masthead-ul" style={{ fontSize: "clamp(22px,5vw,36px)", fontWeight: 700, lineHeight: 1, display: "inline-block" }}>
              Finance Ledger Daily
            </div>
          </div>
          <div className="role-full" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="patrick" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", color: "#888" }}>Role:</span>
            <div className="role-wrap" style={{ display: "flex", border: "2px solid #2d2d2d", borderRadius: R.wobblySm, overflow: "hidden", boxShadow: SH.sm, flex: 1 }}>
              {(["viewer", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  className={`role-btn patrick ${role === r ? "role-on" : ""}`}
                  onClick={() => setRole(r)}
                  style={{
                    fontFamily: "'Patrick Hand', cursive", fontSize: 13, letterSpacing: "0.1em",
                    textTransform: "uppercase", padding: "8px 18px", border: "none", cursor: "pointer", flex: 1,
                    background: role === r ? "#2d2d2d" : "transparent",
                    color: role === r ? "#fdfbf7" : "#2d2d2d",
                  }}
                >{r === "viewer" ? "Viewer" : "Admin"}</button>
              ))}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 12px" }}>
            <div className="bounce-in patrick" style={{
              background: "#fff9c4", border: "2px dashed #2d2d2d", borderRadius: R.wobblySm,
              padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, boxShadow: SH.sm,
            }}>
              <div style={{ width: 14, height: 14, background: "#ff4d4d", borderRadius: "50%", border: "2px solid #2d2d2d", flexShrink: 0 }} />
              Admin mode active — you can add, edit, and delete transactions.
            </div>
          </div>
        )}
      </header>

      <main className="main-wrap" style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* ── Hero ──────────────────────────────────────── */}
        <section
          className="su1 hero-stripe hero-grid"
          style={{
            display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center",
            border: "3px solid #2d2d2d", borderRadius: R.wobblyMd, padding: "36px 40px",
            background: "white", boxShadow: SH.lg, marginBottom: 28, position: "relative", overflow: "hidden",
          }}
        >
          <div>
            <div className="patrick" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em", color: "#ff4d4d", marginBottom: 12 }}>Breaking Analysis</div>
            <h1 className="kalam" style={{ fontWeight: 700, fontSize: "clamp(30px,6vw,62px)", lineHeight: 0.9, marginBottom: 18, wordBreak: "break-word" }}>
              Your quarterly<br />balance sheet,{" "}
              <em className="do-wiggle" style={{ color: "#ff4d4d", fontStyle: "normal", display: "inline-block" }}>live.</em>
            </h1>
            <p className="patrick" style={{ fontSize: 16, lineHeight: 1.7, color: "#555", maxWidth: 480 }}>
              <span className="kalam" style={{ fontSize: 64, lineHeight: 0.75, float: "left", marginRight: 8, color: "#ff4d4d" }}>T</span>
              rack your financial activity like front‑page reporting. See trendlines, inspect every transaction, and surface critical spending behavior before it compounds.
            </p>
          </div>
          <div className="kalam do-float hero-deco" style={{ fontSize: "clamp(64px,12vw,110px)", fontWeight: 700, color: "#e5e0d8", userSelect: "none", lineHeight: 1 }}>$</div>
        </section>

        {/* ── Summary Cards ─────────────────────────────── */}
        <section className="grid-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
          {summaryItems.map(({ id, label, value, color, rot, cls }) => (
            <div
              key={id}
              className={`sum-card card-tape ${cls}`}
              style={{
                position: "relative", background: "white",
                border: "3px solid #2d2d2d", borderRadius: R.wobbly,
                padding: "24px 20px", boxShadow: SH.md,
                transform: `rotate(${rot})`,
              }}
            >
              <div className="patrick" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em", color: "#888", marginBottom: 10 }}>{label}</div>
              <div className="kalam" style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 700, color }}>
                {loading ? "—" : <AnimatedValue target={value} />}
              </div>
            </div>
          ))}
        </section>

        {/* ── Charts ────────────────────────────────────── */}
        <section className="grid-charts su5" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, marginBottom: 28 }}>
          {[
            { title: "Balance Trend — Monthly", child: loading ? <LoadingDots /> : <TrendChart transactions={transactions} /> },
            { title: "Spending Breakdown", child: loading ? <LoadingDots /> : <DonutChart transactions={transactions} /> },
          ].map(({ title, child }) => (
            <div key={title} style={{ background: "white", border: "3px solid #2d2d2d", borderRadius: R.wobblyMd, padding: "24px 20px", boxShadow: SH.md }}>
              <div className="patrick" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em", color: "#888", marginBottom: 16 }}>{title}</div>
              {child}
            </div>
          ))}
        </section>

        {/* ── Insights ──────────────────────────────────── */}
        <section className="grid-insights su6" style={{
          background: "#2d2d2d", color: "#fdfbf7",
          borderRadius: R.wobblyMd, padding: "28px 32px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
          marginBottom: 28, boxShadow: SH.lg,
        }}>
          {[
            {
              label: "Top Spending Category",
              val: insights.topCat?.name ?? "—",
              valColor: "#fff9c4",
              sub: insights.topCat ? currency(insights.topCat.value) : "No expenses recorded",
              valSize: 28,
            },
            {
              label: "Monthly Comparison",
              val: insights.diff === null
                ? "Not enough history"
                : `${insights.diff >= 0 ? "+" : ""}${currency(insights.diff)} vs ${insights.prev?.month}`,
              valColor: insights.diff === null ? "#fff9c4" : insights.diff >= 0 ? "#7ce0a0" : "#ff8080",
              sub: `Spend rate: ${insights.spendRate}% of income`,
              valSize: 18,
            },
          ].map(({ label, val, valColor, sub, valSize }) => (
            <div key={label} style={{ border: "1px dashed rgba(255,255,255,0.2)", padding: 16, borderRadius: 8 }}>
              <div className="patrick" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "#aaa", marginBottom: 8 }}>{label}</div>
              <div className="kalam" style={{ fontSize: valSize, color: valColor, marginBottom: 6 }}>{val}</div>
              <div className="patrick" style={{ fontSize: 14, color: "#ccc" }}>{sub}</div>
            </div>
          ))}
        </section>

        {/* ── Transactions ──────────────────────────────── */}
        <section className="tx-section su7" style={{ background: "white", border: "3px solid #2d2d2d", borderRadius: R.wobblyMd, padding: 28, boxShadow: SH.md }}>
          {/* Controls row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <div className="kalam" style={{ fontSize: 28, fontWeight: 700 }}>Ledger Desk</div>
              <div className="patrick" style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                {loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} shown`}
              </div>
            </div>
            <div className="controls-wrap" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input className="sketch-input patrick" placeholder="Search transactions…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...inputSt, minWidth: 180 }} />
              <select className="sketch-input patrick" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} style={inputSt}>
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select className="sketch-input patrick" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} style={inputSt}>
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
                <option value="high">Amount ↓</option>
                <option value="low">Amount ↑</option>
              </select>
              <button
                className="sketch-btn patrick"
                onClick={openAdd}
                disabled={!isAdmin}
                style={{ fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 20px", border: "2px solid #2d2d2d", borderRadius: R.wobblySm, cursor: "pointer", background: "#2d2d2d", color: "#fdfbf7", boxShadow: SH.sm }}
              >+ Add</button>
              {!isAdmin && (
                <span className="patrick" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.12em", background: "#e5e0d8", padding: "4px 12px", borderRadius: R.wobblySm, border: "1.5px dashed #bbb" }}>
                  🔒 Read-only
                </span>
              )}
            </div>
          </div>

          {/* Table body */}
          {loading ? <LoadingDots /> : filtered.length === 0 ? (
            <div className="kalam" style={{ textAlign: "center", padding: "48px 24px", fontSize: 22, color: "#aaa" }}>📭 No matching records found.</div>
          ) : (
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as unknown as undefined }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Date", "Description", "Category", "Type", "Amount", ...(isAdmin ? ["Actions"] : [])].map((h) => (
                      <th key={h} className="patrick" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", textAlign: "left", padding: "10px 12px", background: "#fdfbf7", borderBottom: "2px solid #2d2d2d", color: "#888" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} className="tx-row do-rowslide" style={{ animationDelay: `${i * 0.04}s` }}>
                      <td className="patrick" style={{ padding: 12, borderBottom: "1px dashed #e5e0d8", fontSize: 13, color: "#888", verticalAlign: "middle" }}>{t.date}</td>
                      <td className="patrick" style={{ padding: 12, borderBottom: "1px dashed #e5e0d8", fontSize: 15, verticalAlign: "middle" }}>{t.description}</td>
                      <td className="patrick" style={{ padding: 12, borderBottom: "1px dashed #e5e0d8", fontSize: 15, color: "#888", verticalAlign: "middle" }}>{t.category}</td>
                      <td style={{ padding: 12, borderBottom: "1px dashed #e5e0d8", verticalAlign: "middle" }}>
                        <span className="patrick" style={{
                          display: "inline-block", padding: "3px 10px", fontSize: 12,
                          border: `2px solid ${t.type === "income" ? "#1a6b3c" : "#ff4d4d"}`,
                          borderRadius: R.wobblySm, textTransform: "uppercase", letterSpacing: "0.12em",
                          background: t.type === "income" ? "#d4f7e4" : "#ffe0e0",
                          color: t.type === "income" ? "#1a6b3c" : "#ff4d4d",
                        }}>{t.type}</span>
                      </td>
                      <td className="kalam" style={{ padding: 12, borderBottom: "1px dashed #e5e0d8", fontSize: 16, verticalAlign: "middle", color: t.type === "income" ? "#1a8c4a" : "#ff4d4d" }}>
                        {currency(t.amount)}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: 12, borderBottom: "1px dashed #e5e0d8", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="icon-btn"
                              title="Edit"
                              onClick={() => openEdit(t)}
                              style={{ width: 32, height: 32, border: "2px solid #2d2d2d", borderRadius: R.wobblySm, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "white", fontSize: 14, boxShadow: SH.sm }}
                            >✏️</button>
                            <button
                              className="icon-btn icon-danger"
                              title="Delete"
                              onClick={() => deleteTx(t.id)}
                              style={{ width: 32, height: 32, border: "2px solid #2d2d2d", borderRadius: R.wobblySm, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "white", fontSize: 14, boxShadow: SH.sm }}
                            >🗑</button>
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

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="footer-wrap su8" style={{ borderTop: "3px solid #2d2d2d", padding: "24px 20px", maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="kalam" style={{ fontSize: 22, fontWeight: 700 }}>Finance Ledger Daily</div>
        <div className="patrick" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#aaa" }}>
          Edition: Vol 1.0 · NYC · {footerDate}
        </div>
      </footer>
    </>
  );
}