import { useEffect, useMemo, useState } from "react";
import "./App.css";

const KEY = "moto-log-records";
const OIL_KM = 3000;
const OIL_MONTHS = 3;
const peso = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

const emptyForm = () => ({
  date: today(),
  type: "Oil Change",
  bike: "",
  description: "",
  cost: "",
  odo: "",
});

export default function App() {
  const [records, setRecords] = useState(load);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(records));
    } catch {
      /* storage full or blocked */
    }
  }, [records]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = (e) => {
    e.preventDefault();
    if (!form.bike.trim() || form.cost === "") return;
    const rec = {
      ...form,
      bike: form.bike.trim(),
      description: form.description.trim(),
      cost: Number(form.cost),
      odo: form.odo === "" ? null : Number(form.odo),
      id: Date.now(),
    };
    setRecords([rec, ...records]);
    setForm({ ...emptyForm(), bike: rec.bike });
  };

  const remove = (id) => {
    if (window.confirm("Delete this record?"))
      setRecords(records.filter((r) => r.id !== id));
  };

  const bikes = useMemo(
    () => [...new Set(records.map((r) => r.bike))],
    [records]
  );

  const sorted = useMemo(
    () =>
      [...records]
        .filter((r) => filter === "All" || r.bike === filter)
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [records, filter]
  );

  const totals = useMemo(() => {
    const now = new Date();
    const ym = now.toISOString().slice(0, 7);
    const y = String(now.getFullYear());
    let month = 0,
      year = 0;
    sorted.forEach((r) => {
      if (r.date.startsWith(ym)) month += r.cost;
      if (r.date.startsWith(y)) year += r.cost;
    });
    return { month, year };
  }, [sorted]);

  // Next oil change reminder per motorcycle
  const reminders = useMemo(() => {
    return bikes.map((bike) => {
      const all = records.filter((r) => r.bike === bike);
      const lastOil = all
        .filter((r) => r.type === "Oil Change")
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      const maxOdo = Math.max(0, ...all.map((r) => r.odo || 0));
      if (!lastOil) return { bike, status: "none" };
      const dueDate = new Date(lastOil.date);
      dueDate.setMonth(dueDate.getMonth() + OIL_MONTHS);
      const dueKm = lastOil.odo != null ? lastOil.odo + OIL_KM : null;
      const kmLeft = dueKm != null ? dueKm - maxOdo : null;
      const daysLeft = Math.round((dueDate - new Date()) / 86400000);
      const due = daysLeft <= 0 || (kmLeft != null && kmLeft <= 0);
      const soon = daysLeft <= 14 || (kmLeft != null && kmLeft <= 300);
      return {
        bike,
        status: due ? "due" : soon ? "soon" : "ok",
        dueKm,
        kmLeft,
        daysLeft,
        dueDate: dueDate.toISOString().slice(0, 10),
      };
    });
  }, [records, bikes]);

  return (
    <main className="wrap">
      <header className="top">
        <h1>Moto Log</h1>
        <p>Oil changes and repairs, with costs.</p>
      </header>

      {reminders.length > 0 && (
        <section className="reminders" aria-label="Next oil change">
          {reminders.map((r) => (
            <div key={r.bike} className={"reminder " + r.status}>
              <strong>{r.bike}</strong>
              {r.status === "none" && <span>No oil change record yet.</span>}
              {r.status !== "none" && (
                <span>
                  {r.status === "due" ? "Time for an oil change. " : "Next oil change: "}
                  {r.dueKm != null && `${r.dueKm.toLocaleString()} km`}
                  {r.dueKm != null && " o "}
                  {r.dueDate}
                  {r.status !== "due" &&
                    ` (${r.daysLeft} days${r.kmLeft != null ? `, ${Math.max(r.kmLeft, 0)} km` : ""} left)`}
                </span>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="totals">
        <div>
          <span>This month</span>
          <b>{peso(totals.month)}</b>
        </div>
        <div>
          <span>This year</span>
          <b>{peso(totals.year)}</b>
        </div>
      </section>

      <form className="card" onSubmit={add}>
        <h2>Add a record</h2>
        <div className="grid">
          <label>
            Date
            <input type="date" value={form.date} onChange={set("date")} required />
          </label>
          <label>
            Type
            <select value={form.type} onChange={set("type")}>
              <option>Oil Change</option>
              <option>Repair</option>
            </select>
          </label>
          <label>
            Motorcycle
            <input
              list="bikes"
              placeholder="e.g. Honda Click 125"
              value={form.bike}
              onChange={set("bike")}
              required
            />
            <datalist id="bikes">
              {bikes.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>
          <label>
            Odometer (km)
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={form.odo}
              onChange={set("odo")}
            />
          </label>
          <label>
            Cost (₱)
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.cost}
              onChange={set("cost")}
              required
            />
          </label>
          <label className="wide">
            Description
            <input
              placeholder="e.g. Fully synthetic 10W-40, new brake pads"
              value={form.description}
              onChange={set("description")}
            />
          </label>
        </div>
        <button type="submit">Save record</button>
      </form>

      <section>
        <div className="listhead">
          <h2>Records</h2>
          {bikes.length > 1 && (
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              {bikes.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          )}
        </div>

        {sorted.length === 0 && (
          <p className="empty">No records yet. Add your first oil change or repair above.</p>
        )}

        <ul className="list">
          {sorted.map((r) => (
            <li key={r.id} className={r.type === "Oil Change" ? "oil" : "repair"}>
              <div className="main">
                <div className="row1">
                  <span className="tag">{r.type}</span>
                  <span className="cost">{peso(r.cost)}</span>
                </div>
                <div className="desc">{r.description || "No description"}</div>
                <div className="meta">
                  {r.date} · {r.bike}
                  {r.odo != null && ` · ${r.odo.toLocaleString()} km`}
                </div>
              </div>
              <button className="del" onClick={() => remove(r.id)} aria-label="Delete">
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
