import { useState } from "react";
import { ADMIN_CREDS, SK, T } from "../utils/constants";

export default function Login({ onLogin }) {
  const [user, setUser]     = useState("");
  const [pass, setPass]     = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setErr("");
    if (!user.trim() || !pass) { setErr("Preencha usuário e senha."); return; }
    setLoading(true);
    setTimeout(() => {
      if (ADMIN_CREDS[user.trim()] && ADMIN_CREDS[user.trim()] === pass) {
        sessionStorage.setItem(SK.sess, JSON.stringify({ user: user.trim(), ts: Date.now() }));
        onLogin(user.trim());
      } else {
        setErr("Usuário ou senha incorretos.");
        setPass("");
        setLoading(false);
      }
    }, 700);
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", fontSize: 14,
    background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
    borderRadius: 12, color: T.text, fontFamily: "inherit", outline: "none",
    transition: "border-color .2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
      background: "radial-gradient(ellipse at 30% 30%, rgba(255,65,108,0.08), transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(255,75,43,0.05), transparent 50%)",
    }}>
      <div style={{
        background: "rgba(11,11,20,0.97)", border: `1px solid ${T.border}`,
        borderRadius: 24, padding: "48px 44px", width: "100%", maxWidth: 420,
        boxShadow: "0 60px 120px rgba(0,0,0,0.55)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            fontSize: 36, fontWeight: 800, letterSpacing: 5,
            background: "linear-gradient(135deg,#ff416c,#ff4b2b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 6,
          }}>BBS</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: T.muted, textTransform: "uppercase", marginBottom: 18 }}>
            Bits Bytes Store
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase",
            background: "rgba(255,65,108,0.1)", color: T.accent, border: "1px solid rgba(255,65,108,0.25)",
          }}>🔒 Área Administrativa</span>
        </div>

        {/* Error */}
        {err && (
          <div style={{
            background: "rgba(255,65,108,0.08)", border: "1px solid rgba(255,65,108,0.28)",
            borderRadius: 10, padding: "11px 15px", fontSize: 13, color: "#ff8fa0", marginBottom: 18,
          }}>{err}</div>
        )}

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Usuário</label>
            <input
              value={user} onChange={e => setUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="admin"
              onFocus={e => e.target.style.borderColor = "rgba(255,65,108,0.5)"}
              onBlur={e => e.target.style.borderColor = T.border}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Senha</label>
            <input
              type="password" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = "rgba(255,65,108,0.5)"}
              onBlur={e => e.target.style.borderColor = T.border}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", fontSize: 15, fontWeight: 700,
            background: loading ? "rgba(255,65,108,0.35)" : "linear-gradient(135deg,#ff416c,#ff4b2b)",
            border: "none", borderRadius: 12, color: "#fff",
            cursor: loading ? "wait" : "pointer",
            boxShadow: loading ? "none" : "0 8px 26px rgba(255,65,108,0.32)",
            transition: "all .2s", fontFamily: "inherit", letterSpacing: 0.5,
          }}
        >
          {loading ? "Verificando..." : "Entrar no Painel"}
        </button>

        <a href="index.html" style={{ display: "block", textAlign: "center", marginTop: 20, fontSize: 13, color: T.muted, textDecoration: "none", transition: "color .15s" }}
          onMouseEnter={e => e.target.style.color = T.text}
          onMouseLeave={e => e.target.style.color = T.muted}>
          ← Voltar para a loja
        </a>
      </div>
    </div>
  );
}
