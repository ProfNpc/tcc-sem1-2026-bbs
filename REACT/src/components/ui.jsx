import { useRef } from "react";
import { T } from "../utils/constants";

// ─── BADGE ────────────────────────────────────────────
export function Badge({ children, color = T.accent, dot = false }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: dot ? "3px 10px 3px 7px" : "3px 11px",
      borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
      background: color + "18", color, border: `1px solid ${color}28`,
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />}
      {children}
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", size = "md", style: s = {}, disabled = false, full = false }) {
  const sizes = { sm: "6px 14px", md: "10px 20px", lg: "13px 28px" };
  const fonts = { sm: 12, md: 13, lg: 15 };
  const vars = {
    primary: { background: T.grad, color: "#fff", border: "none", boxShadow: "0 4px 18px rgba(255,65,108,0.28)" },
    ghost:   { background: "transparent", color: T.subtext, border: `1px solid ${T.border}` },
    danger:  { background: "rgba(255,65,108,0.1)", color: T.accent, border: "1px solid rgba(255,65,108,0.25)" },
    success: { background: "rgba(0,224,122,0.1)", color: T.ok, border: "1px solid rgba(0,224,122,0.25)" },
    subtle:  { background: "rgba(255,255,255,0.04)", color: T.subtext, border: `1px solid ${T.border}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: sizes[size], fontSize: fonts[size], fontWeight: 600,
        borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1, transition: "all .18s",
        letterSpacing: 0.3, fontFamily: "inherit",
        width: full ? "100%" : undefined,
        ...vars[variant], ...s,
      }}
    >
      {children}
    </button>
  );
}

// ─── INPUT ────────────────────────────────────────────
export function Field({ label, required, children, span }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: span ? "1/-1" : undefined }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5 }}>
          {label}{required && <span style={{ color: T.accent }}> *</span>}
        </label>
      )}
      {children}
    </div>
  );
}

const inputBase = {
  width: "100%", padding: "11px 14px", fontSize: 14, outline: "none",
  background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`,
  borderRadius: 10, color: T.text, fontFamily: "inherit", transition: "border-color .2s",
};

export function TextInput({ value, onChange, placeholder, type = "text", onEnter }) {
  return (
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={e => e.key === "Enter" && onEnter?.()}
      onFocus={e => e.target.style.borderColor = "rgba(255,65,108,0.5)"}
      onBlur={e => e.target.style.borderColor = T.border}
      style={inputBase}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      onFocus={e => e.target.style.borderColor = "rgba(255,65,108,0.5)"}
      onBlur={e => e.target.style.borderColor = T.border}
      style={{ ...inputBase, resize: "vertical" }} />
  );
}

export function SelectInput({ value, onChange, options = [], placeholder = "Selecione..." }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      onFocus={e => e.target.style.borderColor = "rgba(255,65,108,0.5)"}
      onBlur={e => e.target.style.borderColor = T.border}
      style={{ ...inputBase, cursor: "pointer", appearance: "none" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

export function FileInput({ onFile, accept = "image/*", label = "Clique para fazer upload" }) {
  const ref = useRef();
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onFile(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <>
      <input ref={ref} type="file" accept={accept} onChange={handleChange} style={{ display: "none" }} />
      <div onClick={() => ref.current?.click()}
        onFocus={e => e.currentTarget.style.borderColor = "rgba(255,65,108,0.5)"}
        onBlur={e => e.currentTarget.style.borderColor = T.border}
        style={{ ...inputBase, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderStyle: "dashed", color: T.subtext }}>
        <span style={{ fontSize: 18 }}>📁</span>
        <span style={{ fontSize: 13 }}>{label}</span>
      </div>
    </>
  );
}

// ─── CARD ─────────────────────────────────────────────
export function Card({ children, style: s = {}, pad = 24 }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 16, backdropFilter: "blur(20px)",
      padding: pad, ...s,
    }}>{children}</div>
  );
}

export function CardHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: T.muted, marginBottom: sub ? 4 : 0 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: T.subtext }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(6px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0c0c18", border: `1px solid ${T.border}`, borderRadius: 20,
        width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 48px 96px rgba(0,0,0,0.6)",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0c0c18", zIndex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title = "Confirmar", message, confirmLabel = "Confirmar", danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={380}>
      <p style={{ color: T.subtext, fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={onConfirm} variant={danger ? "danger" : "primary"} full>{confirmLabel}</Btn>
        <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
      </div>
    </Modal>
  );
}

// ─── TOAST ────────────────────────────────────────────
export function Toast({ msg, type = "ok" }) {
  if (!msg) return null;
  const colors = { ok: [T.ok, "rgba(0,224,122,0.12)", "rgba(0,224,122,0.3)"], err: [T.accent, "rgba(255,65,108,0.1)", "rgba(255,65,108,0.35)"] };
  const [c, bg, border] = colors[type] || colors.ok;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
      background: bg, border: `1px solid ${border}`, color: c,
      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      animation: "bbsFadeUp .3s ease both",
    }}>{msg}</div>
  );
}

// ─── STAT CARD ────────────────────────────────────────
export function StatCard({ label, value, color = T.accent, sub, icon }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: T.muted, marginBottom: 12 }}>{label}</div>
          <div style={{ fontSize: typeof value === "string" && value.length > 8 ? 20 : 28, fontWeight: 800, color, marginBottom: 4, letterSpacing: -0.5 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize: 26, opacity: 0.5 }}>{icon}</span>}
      </div>
    </Card>
  );
}

// ─── SEARCH BAR ───────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 15, pointerEvents: "none" }}>⌕</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={e => e.target.style.borderColor = "rgba(255,65,108,0.4)"}
        onBlur={e => e.target.style.borderColor = T.border}
        style={{ ...inputBase, paddingLeft: 38 }} />
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────
export function EmptyState({ icon = "◌", title, sub, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 10, textAlign: "center" }}>
      <span style={{ fontSize: 48, opacity: 0.2 }}>{icon}</span>
      <p style={{ fontSize: 16, fontWeight: 700, color: T.subtext }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: T.muted }}>{sub}</p>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>{title}</h1>
        {sub && <p style={{ fontSize: 14, color: T.subtext }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────
export function Avatar({ name = "", size = 36 }) {
  const ini = name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#ff416c,#ff4b2b)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 800, color: "#fff", flexShrink: 0,
    }}>{ini}</div>
  );
}
