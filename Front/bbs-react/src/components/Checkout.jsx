import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";

const BRINDES = [
  { min: 0,    nome: "Adesivo BBS",   sub: "Qualquer compra",          img: "/brinde-adesivo.png"  },
  { min: 500,  nome: "Chaveiro BBS",  sub: "Compras acima de R$ 500",  img: "/brinde-chaveiro.png" },
  { min: 1500, nome: "Mousepad BBS",  sub: "Compras acima de R$ 1.500",img: "/brinde-mousepad.png" },
  { min: 3000, nome: "Garrafa BBS",   sub: "Compras acima de R$ 3.000",img: "/brinde-garrafa.png"  },
  { min: 6000, nome: "Moletom BBS",   sub: "Compras acima de R$ 6.000",img: "/brinde-moletom.png"  },
];

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Checkout({ fechar }) {
  // ✅ campos corrigidos: name, price, img (igual ao CartContext)
  const { cart, cartOrder, total, subtotal, freteGlobal, limparCarrinho } = useCart();
  const itens = cartOrder.map(id => cart[id]).filter(Boolean);

  const [step, setStep]           = useState(1);
  const [payMethod, setPayMethod] = useState("pix");
  const [freteMode, setFreteMode] = useState("normal");
  const [sucesso, setSucesso]     = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [timer, setTimer]         = useState(900);
  const [pixCopied, setPixCopied] = useState(false);
  const timerRef = useRef(null);

  const freteValor = freteMode === "expresso" ? 29.9 : 15.9;
  const descPct    = payMethod === "pix" ? 0.1 : payMethod === "boleto" ? 0.07 : payMethod === "debito" ? 0.05 : 0;
  const descVal    = subtotal * descPct;
  const totalFinal = subtotal + freteValor - descVal;

  const pixCode    = `00020126580014BR.GOV.BCB.PIX0136bbs-store-pix-key@bitsbytes.store5204000053039865802BR5913BBS Store6009Sao Paulo62070503***6304${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
  const boletoCode = `1234 5678 9012 3456 7890 1234 5678 9012 3456 7890 12`;

  // Endereço
  const [end, setEnd]         = useState({ cep: "", rua: "", num: "", comp: "", bairro: "", cidade: "", uf: "" });
  const [endError, setEndError] = useState("");

  // Cartão
  const [card, setCard]           = useState({ num: "", nome: "", val: "", cvv: "" });
  const [cardFlipped, setCardFlipped] = useState(false);
  const [parcelas, setParcelas]   = useState("1");

  useEffect(() => {
    if (step === 3 && payMethod === "pix") {
      setTimer(900);
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, payMethod]);

  async function buscarCEP() {
    const cepLimpo = end.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return setEndError("CEP inválido!");
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) return setEndError("CEP não encontrado!");
      setEnd(e => ({ ...e, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }));
      setEndError("");
    } catch { setEndError("Erro ao buscar CEP."); }
  }

  function validarEntrega() {
    if (!end.rua || !end.num || !end.cidade) return setEndError("Preencha os campos obrigatórios.");
    setEndError("");
    setStep(3);
  }

  function confirmarPagamento() {
    clearInterval(timerRef.current);
    const code = "BBS-" + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(code);
    limparCarrinho();
    setSucesso(true);
  }

  const timerMin = String(Math.floor(timer / 60)).padStart(2, "0");
  const timerSec = String(timer % 60).padStart(2, "0");

  // ── Carrinho vazio ──
  if (itens.length === 0 && !sucesso) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <button onClick={fechar} style={styles.closeBtn}>&times;</button>
          <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>Seu carrinho está vazio.</p>
        </div>
      </div>
    );
  }

  // ── Pedido confirmado ──
  if (sucesso) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={styles.successIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00e07a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>Pedido Confirmado!</h2>
            <p style={{ color: "#888", marginBottom: "24px", lineHeight: 1.7 }}>
              Seu pedido foi recebido e está sendo processado.<br />
              Você receberá um e-mail com todos os detalhes.
            </p>
            <div style={styles.orderCode}>{orderCode}</div>
            <p style={{ color: "#666", fontSize: ".82rem", marginBottom: "24px" }}>Guarde este código para acompanhar seu pedido</p>
            <button onClick={fechar} style={styles.btnNext}>Continuar Comprando</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* HEADER */}
        <div style={styles.header}>
          <span style={styles.logo}>BBS</span>
          <button onClick={fechar} style={styles.closeBtn}>&times;</button>
        </div>

        {/* PROGRESS */}
        <div style={styles.progressWrap}>
          {["Confirmar Pedido", "Entrega", "Pagamento"].map((label, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isDone   = step > n;
            return (
              <div key={n} style={styles.stepWrap}>
                <div style={{ ...styles.stepCircle, ...(isActive ? styles.stepActive : isDone ? styles.stepDone : {}) }}>
                  {isDone ? "✓" : n}
                </div>
                <span style={{ ...styles.stepLabel, color: isActive ? "#fff" : isDone ? "#00e07a" : "#666" }}>{label}</span>
                {n < 3 && <div style={{ ...styles.stepLine, background: isDone ? "linear-gradient(45deg,#ff416c,#ff4b2b)" : "rgba(255,255,255,0.07)" }} />}
              </div>
            );
          })}
        </div>

        <div style={styles.layout}>
          {/* ════ COLUNA ESQUERDA ════ */}
          <div style={{ flex: 1 }}>

            {/* ══ STEP 1: Confirmar Pedido ══ */}
            {step === 1 && (
              <div>
                <div style={styles.card}>
                  <p style={styles.cardTitle}>Itens do Pedido</p>
                  {itens.map((item, idx) => (
                    // ✅ usa item.name, item.price, item.img
                    <div key={idx} style={styles.orderItem}>
                      <img src={item.img} alt={item.name} style={styles.orderImg}
                        onError={e => e.target.style.display = "none"} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: ".88rem" }}>{item.name}</p>
                        <p style={{ margin: 0, color: "#666", fontSize: ".75rem" }}>Qtd: {item.qty}</p>
                      </div>
                      <p style={{ color: "#ff416c", fontWeight: 700 }}>{fmt(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                {/* BRINDES */}
                <div style={styles.card}>
                  <p style={styles.cardTitle}>🎁 Seus Brindes Exclusivos BBS</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: "12px" }}>
                    {BRINDES.map((b, i) => {
                      const ganhou  = subtotal >= b.min;
                      const prevMin = i > 0 ? BRINDES[i - 1].min : 0;
                      const pct     = ganhou ? 100 : Math.min(Math.round(((subtotal - prevMin) / (b.min - prevMin)) * 100), 99);
                      return (
                        <div key={i} style={{ ...styles.brindeCard, opacity: ganhou ? 1 : 0.5 }}>
                          <img src={b.img} alt={b.nome}
                            style={{ width: "100%", aspectRatio: "1", objectFit: "contain", borderRadius: "8px" }}
                            onError={e => e.target.style.display = "none"} />
                          <p style={{ margin: "8px 0 2px", fontSize: ".75rem", fontWeight: 700 }}>{b.nome}</p>
                          <p style={{ margin: 0, fontSize: ".65rem", color: ganhou ? "#00e07a" : "#888" }}>
                            {ganhou ? "✓ Desbloqueado!" : b.sub}
                          </p>
                          {!ganhou && subtotal > prevMin && b.min > prevMin && (
                            <div style={{ marginTop: "4px", height: "4px", borderRadius: "4px", background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#ff416c,#ff4b2b)", borderRadius: "4px" }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={styles.navBtns}>
                  <button style={styles.btnNext} onClick={() => setStep(2)}>Continuar para Entrega →</button>
                </div>
              </div>
            )}

            {/* ══ STEP 2: Entrega ══ */}
            {step === 2 && (
              <div>
                <div style={styles.card}>
                  <p style={styles.cardTitle}>Endereço de Entrega</p>
                  {endError && <div style={styles.alertErr}>{endError}</div>}

                  <div style={styles.field}>
                    <label style={styles.label}>CEP</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input style={styles.input} placeholder="00000-000" maxLength={9}
                        value={end.cep} onChange={e => setEnd(v => ({ ...v, cep: e.target.value }))} />
                      <button style={styles.btnCep} onClick={buscarCEP}>Buscar</button>
                    </div>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Rua / Logradouro</label>
                    <input style={styles.input} placeholder="Nome da rua" value={end.rua}
                      onChange={e => setEnd(v => ({ ...v, rua: e.target.value }))} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div style={styles.field}>
                      <label style={styles.label}>Número</label>
                      <input style={styles.input} placeholder="123" value={end.num}
                        onChange={e => setEnd(v => ({ ...v, num: e.target.value }))} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Complemento</label>
                      <input style={styles.input} placeholder="Apto, Bloco..." value={end.comp}
                        onChange={e => setEnd(v => ({ ...v, comp: e.target.value }))} />
                    </div>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Bairro</label>
                    <input style={styles.input} placeholder="Bairro" value={end.bairro}
                      onChange={e => setEnd(v => ({ ...v, bairro: e.target.value }))} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "14px" }}>
                    <div style={styles.field}>
                      <label style={styles.label}>Cidade</label>
                      <input style={styles.input} placeholder="Cidade" value={end.cidade}
                        onChange={e => setEnd(v => ({ ...v, cidade: e.target.value }))} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>UF</label>
                      <input style={styles.input} placeholder="SP" maxLength={2} value={end.uf}
                        onChange={e => setEnd(v => ({ ...v, uf: e.target.value.toUpperCase() }))} />
                    </div>
                  </div>

                  {/* Tipo de frete */}
                  <div style={{ marginTop: "8px" }}>
                    <label style={styles.label}>Tipo de Entrega</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
                      {[
                        { key: "normal",   label: "Padrão",   sub: "3–7 dias úteis", val: "R$ 15,90" },
                        { key: "expresso", label: "Expresso", sub: "1–2 dias úteis", val: "R$ 29,90", color: "#f5a623" }
                      ].map(f => (
                        <div key={f.key} onClick={() => setFreteMode(f.key)}
                          style={{ ...styles.freteCard, borderColor: freteMode === f.key ? "#ff416c" : "rgba(255,255,255,.07)", background: freteMode === f.key ? "rgba(255,65,108,.08)" : "transparent" }}>
                          <div style={{ ...styles.radioDot, borderColor: freteMode === f.key ? "#ff416c" : "#444" }}>
                            {freteMode === f.key && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff416c" }} />}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: f.color || "#ff416c" }}>{f.label}</p>
                            <p style={{ margin: 0, fontSize: ".84rem", color: "#ccc", lineHeight: 1.5 }}>{f.sub}<br /><strong style={{ color: "#fff" }}>{f.val}</strong></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={styles.navBtns}>
                  <button style={styles.btnPrev} onClick={() => setStep(1)}>← Voltar</button>
                  <button style={styles.btnNext} onClick={validarEntrega}>Continuar para Pagamento →</button>
                </div>
              </div>
            )}

            {/* ══ STEP 3: Pagamento ══ */}
            {step === 3 && (
              <div>
                {/* Métodos */}
                <div style={styles.card}>
                  <p style={styles.cardTitle}>Método de Pagamento</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { key: "pix",     icon: "💚", name: "PIX",              sub: "10% de desconto"      },
                      { key: "credito", icon: "💳", name: "Cartão de Crédito", sub: "Até 12x sem juros"    },
                      { key: "debito",  icon: "💳", name: "Cartão de Débito",  sub: "5% de desconto"       },
                      { key: "boleto",  icon: "🎫", name: "Boleto",            sub: "7% de desconto"       },
                    ].map(m => (
                      <div key={m.key} onClick={() => setPayMethod(m.key)}
                        style={{ ...styles.payCard, borderColor: payMethod === m.key ? "#ff416c" : "rgba(255,255,255,.07)", background: payMethod === m.key ? "rgba(255,65,108,.08)" : "transparent" }}>
                        <span style={{ fontSize: "1.3rem" }}>{m.icon}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: ".85rem", fontWeight: 600 }}>{m.name}</p>
                          <p style={{ margin: 0, fontSize: ".72rem", color: "#666" }}>{m.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PIX */}
                {payMethod === "pix" && (
                  <div style={styles.card}>
                    <p style={styles.cardTitle}>Pagar com PIX</p>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "2rem", fontWeight: 900, color: "#00bdae", margin: "0 0 6px" }}>PIX</p>
                      <p style={{ color: "#666", fontSize: ".8rem", marginBottom: "20px" }}>Escaneie o QR Code ou copie o código abaixo</p>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", fontSize: ".6rem", color: "#333", fontFamily: "monospace", maxWidth: "120px", wordBreak: "break-all" }}>
                          [QR Code]
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#f5a623", fontSize: ".82rem", marginBottom: "20px" }}>
                        ⏱ Expira em <strong>{timerMin}:{timerSec}</strong>
                      </div>
                      <p style={{ fontSize: ".72rem", color: "#666", marginBottom: "8px", textAlign: "left" }}>CÓDIGO PIX COPIA E COLA</p>
                      <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "10px", padding: "14px", marginBottom: "12px", fontSize: ".72rem", color: "#bbb", wordBreak: "break-all", textAlign: "left", fontFamily: "monospace" }}>
                        {pixCode}
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(pixCode); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000); }}
                        style={{ ...styles.btnCopy, ...(pixCopied ? { borderColor: "#00e07a", color: "#00e07a" } : {}) }}>
                        {pixCopied ? "✓ Copiado!" : "Copiar Código PIX"}
                      </button>
                    </div>
                    <div style={styles.navBtns}>
                      <button style={styles.btnPrev} onClick={() => setStep(2)}>← Voltar</button>
                      <button style={styles.btnNext} onClick={confirmarPagamento}>Confirmar Pagamento ✓</button>
                    </div>
                  </div>
                )}

                {/* CARTÃO (crédito / débito) */}
                {(payMethod === "credito" || payMethod === "debito") && (
                  <div style={styles.card}>
                    <p style={styles.cardTitle}>{payMethod === "credito" ? "Cartão de Crédito" : "Cartão de Débito"}</p>

                    {/* Visual do cartão 3D */}
                    <div style={{ perspective: "1000px", marginBottom: "28px", height: "185px" }}>
                      <div style={{ width: "100%", height: "185px", position: "relative", transformStyle: "preserve-3d", transition: "transform .6s", transform: cardFlipped ? "rotateY(180deg)" : "none" }}>
                        {/* Frente */}
                        <div style={{ position: "absolute", inset: 0, borderRadius: "16px", backfaceVisibility: "hidden", padding: "22px 26px", background: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", boxShadow: "0 20px 50px rgba(0,0,0,.6)", display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                            <div style={{ width: 40, height: 30, borderRadius: 5, background: "linear-gradient(135deg,#d4a017,#f5d675,#b8860b)" }} />
                            <span style={{ fontSize: "1.4rem", fontWeight: 900 }}>●●</span>
                          </div>
                          <div style={{ fontSize: "1.25rem", letterSpacing: "4px", fontWeight: 600, color: "rgba(255,255,255,.9)", marginBottom: "16px", fontFamily: "monospace" }}>
                            {card.num ? card.num.replace(/(.{4})/g, "$1 ").trim() : "●●●● ●●●● ●●●● ●●●●"}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                              <p style={{ fontSize: ".6rem", color: "rgba(255,255,255,.5)", textTransform: "uppercase", margin: "0 0 3px" }}>Titular</p>
                              <p style={{ fontSize: ".85rem", fontWeight: 600, color: "#fff", textTransform: "uppercase", margin: 0 }}>{card.nome || "NOME DO TITULAR"}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: ".6rem", color: "rgba(255,255,255,.5)", textTransform: "uppercase", margin: "0 0 3px" }}>Validade</p>
                              <p style={{ fontSize: ".85rem", fontWeight: 600, color: "#fff", margin: 0 }}>{card.val || "MM/AA"}</p>
                            </div>
                          </div>
                        </div>
                        {/* Verso */}
                        <div style={{ position: "absolute", inset: 0, borderRadius: "16px", backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg,#0f3460,#16213e,#1a1a2e)", padding: "22px 26px" }}>
                          <div style={{ height: 46, background: "#1a1a1a", margin: "0 -26px 16px" }} />
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <div style={{ background: "rgba(255,255,255,.9)", borderRadius: 5, padding: "7px 18px", fontSize: "1rem", fontWeight: 700, color: "#333", letterSpacing: 4, fontFamily: "monospace" }}>
                              {card.cvv || "●●●"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Número do Cartão</label>
                      <input style={styles.input} placeholder="0000 0000 0000 0000" maxLength={19}
                        value={card.num}
                        onChange={e => setCard(v => ({ ...v, num: e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19) }))} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Nome do Titular</label>
                      <input style={styles.input} placeholder="Como no cartão" value={card.nome}
                        onChange={e => setCard(v => ({ ...v, nome: e.target.value.toUpperCase() }))} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div style={styles.field}>
                        <label style={styles.label}>Validade</label>
                        <input style={styles.input} placeholder="MM/AA" maxLength={5} value={card.val}
                          onChange={e => setCard(v => ({ ...v, val: e.target.value }))} />
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>CVV</label>
                        <input style={styles.input} placeholder="●●●" maxLength={4} value={card.cvv}
                          onFocus={() => setCardFlipped(true)} onBlur={() => setCardFlipped(false)}
                          onChange={e => setCard(v => ({ ...v, cvv: e.target.value }))} />
                      </div>
                    </div>
                    {payMethod === "credito" && (
                      <div style={styles.field}>
                        <label style={styles.label}>Parcelas</label>
                        <select style={styles.input} value={parcelas} onChange={e => setParcelas(e.target.value)}>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                            <option key={n} value={n}>{n}x de {fmt(totalFinal / n)} {n === 1 ? "(à vista)" : "sem juros"}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div style={styles.navBtns}>
                      <button style={styles.btnPrev} onClick={() => setStep(2)}>← Voltar</button>
                      <button style={styles.btnNext} onClick={confirmarPagamento}>Confirmar Pagamento ✓</button>
                    </div>
                  </div>
                )}

                {/* BOLETO */}
                {payMethod === "boleto" && (
                  <div style={styles.card}>
                    <p style={styles.cardTitle}>Boleto Bancário</p>
                    <p style={{ color: "#888", fontSize: ".85rem", marginBottom: "16px" }}>
                      O boleto vence em <strong style={{ color: "#fff" }}>3 dias úteis</strong>. Após o pagamento, a confirmação leva até 2 dias.
                    </p>
                    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "10px", padding: "16px", marginBottom: "12px", fontFamily: "monospace", fontSize: ".82rem", color: "#bbb", letterSpacing: "2px" }}>
                      {boletoCode}
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(boletoCode)} style={styles.btnCopy}>
                      Copiar Código de Barras
                    </button>
                    <div style={styles.navBtns}>
                      <button style={styles.btnPrev} onClick={() => setStep(2)}>← Voltar</button>
                      <button style={styles.btnNext} onClick={confirmarPagamento}>Confirmar Pedido ✓</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ════ COLUNA DIREITA: RESUMO ════ */}
          <div style={{ width: "300px", flexShrink: 0 }}>
            <div style={{ ...styles.card, position: "sticky", top: "20px" }}>
              <p style={styles.cardTitle}>Resumo do Pedido</p>
              {/* ✅ usa item.name, item.price */}
              {itens.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", color: "#999", marginBottom: "7px" }}>
                  <span style={{ flex: 1, marginRight: "8px" }}>{item.name} x{item.qty}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
              <div style={{ marginTop: "16px" }}>
                <div style={styles.summaryRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div style={styles.summaryRow}><span>Frete</span><span>{fmt(freteValor)}</span></div>
                {descVal > 0 && (
                  <div style={{ ...styles.summaryRow, color: "#00e07a" }}>
                    <span>Desconto ({(descPct * 100).toFixed(0)}%)</span>
                    <span>-{fmt(descVal)}</span>
                  </div>
                )}
                <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: "1.1rem", color: "#fff", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,.07)", marginTop: "6px" }}>
                  <span>Total</span><span style={{ color: "#ff416c" }}>{fmt(totalFinal)}</span>
                </div>
              </div>
              {payMethod === "pix" && descVal > 0 && (
                <div style={{ marginTop: "16px", padding: "12px", background: "rgba(0,224,122,.06)", border: "1px solid rgba(0,224,122,.15)", borderRadius: "10px", fontSize: ".78rem", color: "#00e07a" }}>
                  💚 Pagando no PIX você economiza <strong>{fmt(descVal)}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════ STYLES ════
const styles = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 5000, overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "20px" },
  modal:        { background: "#060606", border: "1px solid rgba(255,255,255,.07)", borderRadius: "20px", width: "100%", maxWidth: "900px", color: "#fff", fontFamily: "'Poppins',sans-serif", position: "relative", overflow: "hidden" },
  header:       { padding: "16px 5%", background: "rgba(8,8,8,.9)", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:         { fontSize: "1.6rem", fontWeight: 700, letterSpacing: "4px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  closeBtn:     { background: "none", border: "none", color: "#888", fontSize: "2rem", cursor: "pointer", lineHeight: 1 },
  progressWrap: { display: "flex", alignItems: "center", padding: "28px 5%", maxWidth: "600px", margin: "0 auto" },
  stepWrap:     { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1, position: "relative" },
  stepCircle:   { width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", fontWeight: 700, color: "#666", position: "relative", background: "#060606", zIndex: 1 },
  stepActive:   { borderColor: "#ff416c", color: "#fff", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", boxShadow: "0 0 18px rgba(255,65,108,.4)" },
  stepDone:     { borderColor: "#00e07a", color: "#00e07a" },
  stepLabel:    { fontSize: ".7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", textAlign: "center" },
  stepLine:     { position: "absolute", top: 18, left: "50%", width: "100%", height: 2, zIndex: 0 },
  layout:       { display: "flex", gap: "24px", padding: "0 5% 40px", flexWrap: "wrap" },
  card:         { background: "rgba(16,16,16,.75)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "16px", backdropFilter: "blur(20px)", padding: "28px", marginBottom: "24px" },
  cardTitle:    { fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", color: "#666", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,.07)", margin: "0 0 20px" },
  orderItem:    { display: "flex", gap: "14px", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.07)", alignItems: "center" },
  orderImg:     { width: 56, height: 56, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,.04)", padding: 4, flexShrink: 0 },
  brindeCard:   { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "12px", padding: "12px", textAlign: "center" },
  field:        { marginBottom: "16px" },
  label:        { display: "block", fontSize: ".68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#666", marginBottom: "7px" },
  input:        { width: "100%", padding: "13px 15px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", outline: "none", boxSizing: "border-box" },
  btnCep:       { padding: "13px 18px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  freteCard:    { padding: "15px 18px", border: "2px solid", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: ".2s" },
  radioDot:     { width: 18, height: 18, borderRadius: "50%", border: "2px solid", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  payCard:      { padding: "16px", border: "2px solid", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: ".25s" },
  btnCopy:      { width: "100%", padding: "13px", background: "transparent", border: "1px solid rgba(0,189,174,.4)", borderRadius: "10px", color: "#00bdae", fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  navBtns:      { display: "flex", gap: "12px", marginTop: "24px" },
  btnNext:      { flex: 1, padding: "15px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", border: "none", borderRadius: "11px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".95rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", boxShadow: "0 6px 20px rgba(255,65,108,.28)" },
  btnPrev:      { padding: "15px 22px", background: "transparent", border: "1px solid rgba(255,255,255,.12)", borderRadius: "11px", color: "#888", fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", cursor: "pointer" },
  summaryRow:   { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".88rem", color: "#bbb", marginBottom: "10px" },
  alertErr:     { background: "rgba(255,65,108,.1)", border: "1px solid rgba(255,65,108,.3)", color: "#ff8fa0", padding: "11px 15px", borderRadius: "8px", fontSize: ".82rem", marginBottom: "16px" },
  successIcon:  { width: 80, height: 80, borderRadius: "50%", background: "rgba(0,224,122,.12)", border: "2px solid #00e07a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  orderCode:    { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "10px", padding: "16px", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "4px", color: "#ff416c", marginBottom: "30px" },
};