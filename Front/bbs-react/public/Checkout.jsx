// ============================================================
//  Checkout.jsx  —  Fluxo de finalização de compra (3 etapas)
//
//  Etapa 1 → Revisão dos itens + seleção de brindes por faixa de valor
//  Etapa 2 → Endereço de entrega (busca automática via ViaCEP) + tipo de frete
//  Etapa 3 → Pagamento (PIX com QR Code, Cartão de crédito/débito, Boleto)
//
//  Ao confirmar, limpa o carrinho e exibe tela de sucesso com código do pedido.
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useCart } from "../src/context/CartContext";

// Brindes progressivos: desbloqueados conforme o valor total da compra
const BRINDES = [
  { min: 0,    nome: "Adesivo BBS",  sub: "Qualquer compra",           img: "/brinde-adesivo.png"  },
  { min: 500,  nome: "Chaveiro BBS", sub: "Compras acima de R$ 500",   img: "/brinde-chaveiro.png" },
  { min: 1500, nome: "Mousepad BBS", sub: "Compras acima de R$ 1.500", img: "/brinde-mousepad.png" },
  { min: 3000, nome: "Garrafa BBS",  sub: "Compras acima de R$ 3.000", img: "/brinde-garrafa.png"  },
  { min: 6000, nome: "Moletom BBS",  sub: "Compras acima de R$ 6.000", img: "/brinde-moletom.png"  },
];

// Formata número para moeda pt-BR
const fmt = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ── calcCRC ─────────────────────────────────────────────────
// Calcula o CRC-16/CCITT-FALSE usado na validação do código PIX.
// É o algoritmo padrão definido pelo Banco Central do Brasil.
function calcCRC(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++)
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

// ── gerarPixCode ─────────────────────────────────────────────
// Gera o payload EMV do PIX (string que é convertida em QR Code).
// Segue o padrão do Banco Central: campos TLV (Tag-Length-Value).
function gerarPixCode(total) {
  const t    = total.toFixed(2);         // valor com 2 casas decimais
  const len  = t.length;                 // tamanho do valor (para montar o campo TLV)
  const base = `00020126580014BR.GOV.BCB.PIX0136bbs-loja-chave-pix@bits.com.br520400005303986540${len}${t}5802BR5913BitsBytes Store6009SAO PAULO62070503***6304`;
  return base + calcCRC(base);           // string completa com CRC no final
}

// ── gerarBoletoCode ──────────────────────────────────────────
// Gera um código de barras fictício no formato de boleto bancário
// apenas para fins de demonstração visual no TCC.
function gerarBoletoCode() {
  const rand = () => Math.floor(Math.random() * 9000 + 1000);
  return `3419.${rand()} ${rand()}.${rand()}9 ${rand()}.${rand()}0 ${Math.floor(Math.random() * 9) + 1} ${Date.now().toString().slice(-14)}`;
}

export default function Checkout({ fechar }) {
  // Pega os dados do carrinho do contexto global
  const { cart, cartOrder, subtotal, freteGlobal, limparCarrinho } = useCart();

  // Monta a lista de itens a partir dos IDs em cartOrder
  const itens = cartOrder.map(id => ({ ...cart[id], id })).filter(Boolean);

  // ── Estados do fluxo ──────────────────────────────────────
  const [step, setStep]           = useState(1);       // etapa atual: 1, 2 ou 3
  const [payMethod, setPayMethod] = useState("pix");   // método de pagamento selecionado
  const [freteMode, setFreteMode] = useState("normal");// tipo de entrega
  const [sucesso, setSucesso]     = useState(false);   // exibe tela de sucesso
  const [orderCode, setOrderCode] = useState("");      // código do pedido gerado
  const [timer, setTimer]         = useState(900);     // contador de 15min para PIX (em segundos)
  const [pixCopied, setPixCopied]       = useState(false); // feedback visual do botão copiar PIX
  const [boletoCopied, setBoletoCopied] = useState(false); // feedback visual do botão copiar boleto

  const timerRef = useRef(null); // referência do intervalo do contador PIX
  const qrRef    = useRef(null); // referência do div onde o QR Code é renderizado

  // ── Cálculos de preço ─────────────────────────────────────
  // Frete: normal = R$15,90 / expresso = R$29,90
  const freteValor = freteMode === "expresso" ? 29.90 : 15.90;

  // Desconto por método de pagamento
  const descPct = payMethod === "pix"    ? 0.10  // 10% de desconto no PIX
               : payMethod === "boleto"  ? 0.07  // 7% no boleto
               : payMethod === "debito"  ? 0.05  // 5% no débito
               : 0;                              // sem desconto no crédito

  const descVal    = subtotal * descPct;
  const totalFinal = subtotal + freteValor - descVal;

  const pixCode    = gerarPixCode(totalFinal);               // código PIX calculado
  const boletoCode = useRef(gerarBoletoCode()).current;       // código boleto (gerado 1x)

  // ── Estado do endereço e do cartão ───────────────────────
  const [end, setEnd]           = useState({ cep: "", rua: "", num: "", comp: "", bairro: "", cidade: "", uf: "" });
  const [endError, setEndError] = useState("");
  const [card, setCard]         = useState({ num: "", nome: "", val: "", cvv: "" });
  const [cardFlipped, setCardFlipped] = useState(false); // anima o cartão ao digitar CVV
  const [parcelas, setParcelas]       = useState("1");

  // ── useEffect: Timer do PIX ──────────────────────────────
  // Inicia um intervalo de 1 segundo quando entra na etapa 3 com PIX.
  // Limpa o intervalo ao sair da etapa ou trocar de método.
  useEffect(() => {
    if (step === 3 && payMethod === "pix") {
      setTimer(900); // reinicia o contador em 15 minutos
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current); // limpa ao desmontar
  }, [step, payMethod]);

  // ── useEffect: Geração do QR Code ───────────────────────
  // Quando o usuário chega na etapa 3 com PIX selecionado,
  // instancia a biblioteca QRCode.js no div referenciado por qrRef.
  useEffect(() => {
    if (step === 3 && payMethod === "pix" && qrRef.current) {
      qrRef.current.innerHTML = ""; // limpa QR Code anterior
      if (window.QRCode) {
        new window.QRCode(qrRef.current, {
          text:         pixCode,
          width:        180,
          height:       180,
          colorDark:    "#000000",
          colorLight:   "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.M,
        });
      } else {
        // Fallback caso a biblioteca não tenha carregado ainda
        qrRef.current.innerHTML = `<div style="width:180px;height:180px;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#333;font-size:.75rem;padding:12px;text-align:center;box-sizing:border-box">QR Code PIX</div>`;
      }
    }
  }, [step, payMethod, pixCode]);

  // ── useEffect: Carrega biblioteca QRCode.js ──────────────
  // Injeta dinamicamente o script externo no <head> se ainda não estiver carregado.
  useEffect(() => {
    if (!window.QRCode) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      document.head.appendChild(s);
    }
  }, []);

  // ── buscarCEP ────────────────────────────────────────────
  // Consulta a API ViaCEP e preenche automaticamente os campos de endereço.
  async function buscarCEP() {
    const cepLimpo = end.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return setEndError("CEP deve ter 8 dígitos.");
    try {
      const d = await (await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)).json();
      if (d.erro) return setEndError("CEP não encontrado.");
      // Preenche rua, bairro, cidade e UF automaticamente
      setEnd(v => ({ ...v, rua: d.logradouro || "", bairro: d.bairro || "", cidade: d.localidade || "", uf: d.uf || "" }));
      setEndError("");
    } catch { setEndError("Erro ao buscar CEP."); }
  }

  // ── validarEntrega ───────────────────────────────────────
  // Verifica se os campos obrigatórios do endereço foram preenchidos
  // antes de avançar para a etapa de pagamento.
  function validarEntrega() {
    if (!end.rua || !end.num || !end.cidade || !end.uf)
      return setEndError("Preencha rua, número, cidade e UF.");
    setEndError("");
    setStep(3); // avança para a etapa de pagamento
  }

  // ── confirmarPagamento ───────────────────────────────────
  // Gera um código de pedido aleatório, limpa o carrinho no contexto
  // e exibe a tela de sucesso.
  function confirmarPagamento() {
    clearInterval(timerRef.current); // para o timer do PIX
    setOrderCode("BBS-" + Math.floor(100000 + Math.random() * 900000));
    limparCarrinho(); // zera o CartContext
    setSucesso(true); // exibe tela de confirmação
  }

  // Formata o timer em mm:ss para exibição (ex: "14:59")
  const timerMin = String(Math.floor(timer / 60)).padStart(2, "0");
  const timerSec = String(timer % 60).padStart(2, "0");

  // ── TELA DE SUCESSO ──────────────────────────────────────
  // Renderizada no lugar do checkout após confirmarPagamento()
  if (sucesso) return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          {/* Ícone de check verde animado */}
          <div style={S.successIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00e07a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "12px", color: "#fff" }}>Pedido Confirmado!</h2>
          <p style={{ color: "#888", marginBottom: "24px", lineHeight: 1.7 }}>
            Seu pedido foi recebido e está sendo processado.<br />
            Você receberá um e-mail com todos os detalhes.
          </p>
          {/* Código do pedido em destaque */}
          <div style={S.orderCode}>{orderCode}</div>
          {/* Botão para voltar à loja */}
          <button
            onClick={fechar}
            style={{
              ...S.btnNext,
              background: "linear-gradient(45deg,#00c853,#00e07a)",
              maxWidth: 280, margin: "0 auto",
            }}
          >
            Voltar à Loja
          </button>
        </div>
      </div>
    </div>
  );

  // ── LAYOUT PRINCIPAL DO CHECKOUT ─────────────────────────
  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* ── Header com logo e botão fechar ─────────────── */}
        <div style={S.header}>
          <span style={S.logo}>BBS</span>
          <button style={S.closeBtn} onClick={fechar}>×</button>
        </div>

        {/* ── Barra de progresso (Steps 1, 2, 3) ──────────
            Cada círculo muda de cor conforme a etapa atual:
            - azul/vermelho → etapa ativa
            - verde → etapa concluída
            - cinza → etapa futura */}
        <div style={S.progressWrap}>
          {[
            { n: 1, label: "Revisão"  },
            { n: 2, label: "Entrega"  },
            { n: 3, label: "Pagamento" },
          ].map(({ n, label }, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
              {/* Círculo numerado */}
              <div style={{
                ...S.stepCircle,
                ...(step === n ? S.stepActive : {}),
                ...(step > n  ? S.stepDone  : {}),
              }}>
                {step > n ? "✓" : n}
              </div>
              {/* Label do step abaixo do círculo */}
              <span style={{ fontSize: ".7rem", color: step >= n ? "#fff" : "#555", marginLeft: 8, whiteSpace: "nowrap" }}>
                {label}
              </span>
              {/* Linha conectora entre os steps */}
              {i < 2 && (
                <div style={{
                  flex: 1, height: 1, marginLeft: 12,
                  background: step > n ? "#00e07a" : "rgba(255,255,255,.08)",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Conteúdo principal + resumo lateral ────────── */}
        <div style={S.layout}>

          {/* Área central (varia conforme o step) */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ══════ ETAPA 1: REVISÃO DOS ITENS ══════ */}
            {step === 1 && (
              <>
                <div style={S.card}>
                  <p style={S.cardTitle}>Itens do Pedido</p>
                  {itens.map(item => (
                    <div key={item.id} style={S.orderItem}>
                      {/* Imagem do produto com fundo translúcido */}
                      <img src={item.img} alt={item.name} style={S.orderImg} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: ".9rem" }}>{item.name}</p>
                        <p style={{ margin: 0, color: "#888", fontSize: ".8rem" }}>
                          {item.qty}x {fmt(item.price)}
                        </p>
                      </div>
                      {/* Preço total do item (qty × price) */}
                      <p style={{ margin: 0, fontWeight: 700, color: "#ff416c" }}>
                        {fmt(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Card de brindes progressivos */}
                <div style={S.card}>
                  <p style={S.cardTitle}>Seus Brindes</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 12 }}>
                    {BRINDES.map(b => {
                      const desbloqueado = totalFinal >= b.min; // compara o total com o mínimo do brinde
                      return (
                        <div key={b.nome} style={{
                          ...S.brindeCard,
                          // Borda verde para brinde desbloqueado, cinza para bloqueado
                          border: desbloqueado
                            ? "1px solid rgba(0,224,122,.3)"
                            : "1px solid rgba(255,255,255,.07)",
                          opacity: desbloqueado ? 1 : 0.45, // brinde bloqueado fica apagado
                        }}>
                          <div style={{ fontSize: "2rem", marginBottom: 6 }}>🎁</div>
                          <p style={{ margin: "0 0 2px", fontSize: ".75rem", fontWeight: 700, color: desbloqueado ? "#00e07a" : "#666" }}>
                            {b.nome}
                          </p>
                          <p style={{ margin: 0, fontSize: ".65rem", color: "#555" }}>{b.sub}</p>
                          {/* Selo "Desbloqueado!" para brindes ganhos */}
                          {desbloqueado && (
                            <div style={{ marginTop: 6, fontSize: ".6rem", color: "#00e07a", fontWeight: 700 }}>
                              ✓ Desbloqueado!
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botão avançar para Etapa 2 */}
                <div style={S.navBtns}>
                  <button style={S.btnNext} onClick={() => setStep(2)}>
                    Continuar para Entrega →
                  </button>
                </div>
              </>
            )}

            {/* ══════ ETAPA 2: ENDEREÇO DE ENTREGA ══════ */}
            {step === 2 && (
              <>
                <div style={S.card}>
                  <p style={S.cardTitle}>Endereço de Entrega</p>

                  {endError && <div style={S.alertErr}>{endError}</div>}

                  {/* Campo CEP com botão de busca automática */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <div style={{ ...S.field, flex: 1, marginBottom: 0 }}>
                      <label style={S.label}>CEP</label>
                      <input
                        style={S.input}
                        placeholder="00000-000"
                        maxLength={9}
                        value={end.cep}
                        onChange={e => setEnd(v => ({ ...v, cep: e.target.value }))}
                      />
                    </div>
                    {/* Botão que chama buscarCEP() e preenche os demais campos */}
                    <button style={{ ...S.btnCep, alignSelf: "flex-end" }} onClick={buscarCEP}>
                      Buscar CEP
                    </button>
                  </div>

                  {/* Grid 2 colunas: Rua + Número */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0 12px" }}>
                    <div style={S.field}>
                      <label style={S.label}>Rua / Logradouro</label>
                      <input style={S.input} value={end.rua} onChange={e => setEnd(v => ({ ...v, rua: e.target.value }))} placeholder="Nome da rua" />
                    </div>
                    <div style={{ ...S.field, width: 100 }}>
                      <label style={S.label}>Número</label>
                      <input style={S.input} value={end.num} onChange={e => setEnd(v => ({ ...v, num: e.target.value }))} placeholder="Nº" />
                    </div>
                  </div>

                  {/* Campos de complemento, bairro, cidade e UF */}
                  <div style={S.field}>
                    <label style={S.label}>Complemento (opcional)</label>
                    <input style={S.input} value={end.comp} onChange={e => setEnd(v => ({ ...v, comp: e.target.value }))} placeholder="Apto, Bloco..." />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0 12px" }}>
                    <div style={S.field}>
                      <label style={S.label}>Bairro</label>
                      <input style={S.input} value={end.bairro} onChange={e => setEnd(v => ({ ...v, bairro: e.target.value }))} placeholder="Bairro" />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Cidade</label>
                      <input style={S.input} value={end.cidade} onChange={e => setEnd(v => ({ ...v, cidade: e.target.value }))} placeholder="Cidade" />
                    </div>
                    <div style={{ ...S.field, width: 70 }}>
                      <label style={S.label}>UF</label>
                      <input style={S.input} value={end.uf} onChange={e => setEnd(v => ({ ...v, uf: e.target.value }))} placeholder="SP" maxLength={2} />
                    </div>
                  </div>
                </div>

                {/* Seleção do tipo de frete: Normal ou Expresso */}
                <div style={S.card}>
                  <p style={S.cardTitle}>Tipo de Entrega</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { id: "normal",   label: "Entrega Normal",   sub: "5-8 dias úteis",   valor: 15.90 },
                      { id: "expresso", label: "Entrega Expresso",  sub: "1-2 dias úteis",   valor: 29.90 },
                    ].map(f => (
                      // Card de frete clicável: borda colorida quando selecionado
                      <div
                        key={f.id}
                        style={{
                          ...S.freteCard,
                          borderColor: freteMode === f.id ? "#ff416c" : "rgba(255,255,255,.07)",
                          background:  freteMode === f.id ? "rgba(255,65,108,.06)" : "transparent",
                        }}
                        onClick={() => setFreteMode(f.id)}
                      >
                        {/* Radio button visual */}
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: `2px solid ${freteMode === f.id ? "#ff416c" : "#444"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {freteMode === f.id && (
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff416c" }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: "#fff", fontSize: ".9rem" }}>{f.label}</p>
                          <p style={{ margin: 0, color: "#666", fontSize: ".78rem" }}>{f.sub}</p>
                        </div>
                        <span style={{ color: "#ff416c", fontWeight: 700 }}>{fmt(f.valor)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navegação: Voltar (step 1) e Continuar (step 3 com validação) */}
                <div style={S.navBtns}>
                  <button style={S.btnPrev} onClick={() => setStep(1)}>← Voltar</button>
                  <button style={S.btnNext} onClick={validarEntrega}>Continuar para Pagamento →</button>
                </div>
              </>
            )}

            {/* ══════ ETAPA 3: PAGAMENTO ══════ */}
            {step === 3 && <>
              {/* Seleção do método de pagamento */}
              <div style={S.card}>
                <p style={S.cardTitle}>Método de Pagamento</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 0 }}>
                  {[
                    { id: "pix",    icon: "🔑", label: "PIX",       sub: "10% de desconto" },
                    { id: "credito",icon: "💳", label: "Crédito",   sub: "Até 12x sem juros" },
                    { id: "debito", icon: "💳", label: "Débito",    sub: "5% de desconto" },
                    { id: "boleto", icon: "🧾", label: "Boleto",    sub: "7% de desconto" },
                  ].map(m => (
                    // Card de método: destaque vermelho quando selecionado
                    <div
                      key={m.id}
                      style={{
                        ...S.payCard,
                        borderColor: payMethod === m.id ? "#ff416c" : "rgba(255,255,255,.07)",
                        background:  payMethod === m.id ? "rgba(255,65,108,.08)" : "transparent",
                      }}
                      onClick={() => setPayMethod(m.id)}
                    >
                      <span style={{ fontSize: "1.4rem" }}>{m.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "#fff", fontSize: ".88rem" }}>{m.label}</p>
                        <p style={{ margin: 0, color: "#666", fontSize: ".72rem" }}>{m.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── PIX ───────────────────────────────────────
                  Exibe QR Code gerado pela lib QRCode.js e o código copiável.
                  Timer regressivo de 15 minutos. */}
              {payMethod === "pix" && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Pagar com PIX</p>
                  <div style={{ textAlign: "center" }}>
                    {/* Container do QR Code (preenchido pelo useEffect) */}
                    <div ref={qrRef} style={{
                      display: "inline-block", padding: 12,
                      background: "#fff", borderRadius: 12, marginBottom: 16,
                    }} />
                    {/* Timer regressivo */}
                    <p style={{ color: "#888", fontSize: ".8rem", marginBottom: 20 }}>
                      Pix válido por <strong style={{ color: "#ff416c" }}>{timerMin}:{timerSec}</strong>
                    </p>
                    {/* Campo com o código PIX para copiar manualmente */}
                    <div style={{
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                    }}>
                      <p style={{ fontSize: ".68rem", color: "#555", marginBottom: 6 }}>CÓDIGO PIX COPIA E COLA</p>
                      <p style={{ fontFamily: "monospace", fontSize: ".7rem", color: "#aaa", wordBreak: "break-all", margin: 0, lineHeight: 1.8 }}>
                        {pixCode}
                      </p>
                    </div>
                    {/* Botão copiar: muda para "✓ Copiado!" por 2,5 segundos */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pixCode);
                        setPixCopied(true);
                        setTimeout(() => setPixCopied(false), 2500);
                      }}
                      style={{ ...S.btnCopy, ...(pixCopied ? { borderColor: "#00e07a", color: "#00e07a" } : {}) }}
                    >
                      {pixCopied ? "✓ Copiado!" : "📋 Copiar Código PIX"}
                    </button>
                  </div>
                  <div style={S.navBtns}>
                    <button style={S.btnPrev} onClick={() => setStep(2)}>← Voltar</button>
                    <button style={S.btnNext} onClick={confirmarPagamento}>Confirmar Pagamento ✓</button>
                  </div>
                </div>
              )}

              {/* ── CARTÃO (crédito e débito) ─────────────────
                  Exibe visualização animada do cartão e campos de preenchimento. */}
              {(payMethod === "credito" || payMethod === "debito") && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Dados do Cartão</p>

                  {/* Cartão visual 3D com flip ao focar no CVV */}
                  <div style={{ perspective: 1000, marginBottom: 28 }}>
                    <div style={{
                      width: "100%", maxWidth: 340, height: 190, margin: "0 auto",
                      position: "relative", transformStyle: "preserve-3d",
                      transition: "transform 0.6s",
                      transform: cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}>
                      {/* Frente do cartão */}
                      <div style={{
                        position: "absolute", inset: 0, backfaceVisibility: "hidden",
                        background: "linear-gradient(135deg,#1a1a3e,#16213e)",
                        borderRadius: 16, padding: 24,
                        border: "1px solid rgba(255,255,255,.1)",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "1.6rem", letterSpacing: 4, fontWeight: 700, color: "#ff416c" }}>BBS</span>
                          <span style={{ fontSize: "1.8rem" }}>💳</span>
                        </div>
                        {/* Número do cartão exibido em grupos de 4 */}
                        <p style={{ fontFamily: "monospace", fontSize: "1.15rem", letterSpacing: 3, color: "#fff", margin: 0 }}>
                          {card.num.replace(/(.{4})/g, "$1 ").trim() || "•••• •••• •••• ••••"}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: ".6rem", color: "#666" }}>TITULAR</p>
                            <p style={{ margin: 0, color: "#fff", fontSize: ".85rem", fontWeight: 600 }}>
                              {card.nome || "NOME DO TITULAR"}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: ".6rem", color: "#666" }}>VALIDADE</p>
                            <p style={{ margin: 0, color: "#fff", fontSize: ".85rem" }}>{card.val || "MM/AA"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Verso do cartão (aparece ao flipar) */}
                      <div style={{
                        position: "absolute", inset: 0, backfaceVisibility: "hidden",
                        background: "linear-gradient(135deg,#1a1a3e,#16213e)",
                        borderRadius: 16, transform: "rotateY(180deg)",
                        border: "1px solid rgba(255,255,255,.1)",
                        display: "flex", flexDirection: "column", justifyContent: "center", gap: 16,
                      }}>
                        {/* Tarja magnética */}
                        <div style={{ background: "#000", height: 44, margin: "0 -24px" }} />
                        <div style={{ padding: "0 24px" }}>
                          <div style={{
                            background: "#fff", borderRadius: 6, padding: "8px 14px",
                            display: "flex", justifyContent: "flex-end",
                          }}>
                            {/* CVV exibido ou pontos */}
                            <span style={{ fontFamily: "monospace", fontSize: "1rem", color: "#333", letterSpacing: 4 }}>
                              {card.cvv || "•••"}
                            </span>
                          </div>
                          <p style={{ fontSize: ".65rem", color: "#666", marginTop: 8, marginBottom: 0 }}>CVV</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campos do formulário do cartão */}
                  <div style={S.field}>
                    <label style={S.label}>Número do Cartão</label>
                    <input
                      style={S.input}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={card.num}
                      // Formata automaticamente em grupos de 4 dígitos
                      onChange={e => setCard(c => ({ ...c, num: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() }))}
                    />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Nome do Titular</label>
                    <input
                      style={S.input}
                      placeholder="Como está no cartão"
                      value={card.nome}
                      onChange={e => setCard(c => ({ ...c, nome: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <div style={S.field}>
                      <label style={S.label}>Validade</label>
                      <input
                        style={S.input}
                        placeholder="MM/AA"
                        maxLength={5}
                        value={card.val}
                        onChange={e => setCard(c => ({ ...c, val: e.target.value }))}
                      />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>CVV</label>
                      <input
                        style={S.input}
                        placeholder="•••"
                        maxLength={4}
                        value={card.cvv}
                        // Foca no campo CVV → vira o cartão para mostrar o verso
                        onFocus={() => setCardFlipped(true)}
                        onBlur={() => setCardFlipped(false)}
                        onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>
                  </div>

                  {/* Parcelamento (só no crédito) */}
                  {payMethod === "credito" && (
                    <div style={S.field}>
                      <label style={S.label}>Parcelar em</label>
                      <select
                        style={{ ...S.input, cursor: "pointer" }}
                        value={parcelas}
                        onChange={e => setParcelas(e.target.value)}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                          <option key={n} value={n} style={{ background: "#1a1a1a" }}>
                            {n}x de {fmt(totalFinal / n)} {n === 1 ? "(à vista)" : "sem juros"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={S.navBtns}>
                    <button style={S.btnPrev} onClick={() => setStep(2)}>← Voltar</button>
                    <button style={S.btnNext} onClick={confirmarPagamento}>Confirmar Pagamento ✓</button>
                  </div>
                </div>
              )}

              {/* ── BOLETO ────────────────────────────────────
                  Exibe código de barras fictício com botão copiar. */}
              {payMethod === "boleto" && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Boleto Bancário</p>
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🧾</div>
                    <p style={{ color: "#ccc", fontSize: ".9rem", lineHeight: 1.8, marginBottom: "20px" }}>
                      Seu boleto será gerado após a confirmação.<br />
                      Você terá <strong>3 dias úteis</strong> para efetuar o pagamento.<br />
                      O boleto será enviado para o seu e-mail.
                    </p>
                    {/* Código de barras fictício */}
                    <div style={{
                      background: "rgba(255,255,255,.04)",
                      border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: "10px", padding: "14px", marginBottom: "16px",
                    }}>
                      <p style={{ fontSize: ".72rem", color: "#666", marginBottom: "6px" }}>CÓDIGO DE BARRAS</p>
                      <p style={{ fontFamily: "monospace", fontSize: ".78rem", color: "#ccc", wordBreak: "break-all", lineHeight: 1.8, margin: 0 }}>
                        {boletoCode}
                      </p>
                    </div>
                    {/* Botão copiar código de barras */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(boletoCode.replace(/[.\s]/g, ""));
                        setBoletoCopied(true);
                        setTimeout(() => setBoletoCopied(false), 2500);
                      }}
                      style={{ ...S.btnCopy, ...(boletoCopied ? { borderColor: "#00e07a", color: "#00e07a" } : {}) }}
                    >
                      {boletoCopied ? "✓ Copiado!" : "Copiar Código de Barras"}
                    </button>
                  </div>
                  <div style={S.navBtns}>
                    <button style={S.btnPrev} onClick={() => setStep(2)}>← Voltar</button>
                    <button style={S.btnNext} onClick={confirmarPagamento}>Confirmar Pedido ✓</button>
                  </div>
                </div>
              )}
            </>}
          </div>

          {/* ── RESUMO LATERAL (sticky) ──────────────────────
              Permanece visível enquanto o usuário rola a página.
              position: sticky + top: 20px garante isso. */}
          <div style={{ width: "300px", flexShrink: 0 }}>
            <div style={{ ...S.card, position: "sticky", top: "20px" }}>
              <p style={S.cardTitle}>Resumo do Pedido</p>

              {/* Lista compacta de itens */}
              {itens.map(item => (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: ".8rem", color: "#999", marginBottom: "7px",
                }}>
                  <span style={{ flex: 1, marginRight: "8px" }}>{item.name} x{item.qty}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}

              {/* Totalizadores */}
              <div style={{ marginTop: "16px" }}>
                <div style={S.summaryRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div style={S.summaryRow}><span>Frete</span><span>{fmt(freteValor)}</span></div>
                {/* Linha de desconto só aparece se houver desconto */}
                {descVal > 0 && (
                  <div style={{ ...S.summaryRow, color: "#00e07a" }}>
                    <span>Desconto ({(descPct * 100).toFixed(0)}%)</span>
                    <span>-{fmt(descVal)}</span>
                  </div>
                )}
                {/* Total final em destaque */}
                <div style={{
                  ...S.summaryRow, fontWeight: 700, fontSize: "1.1rem",
                  color: "#fff", paddingTop: "14px",
                  borderTop: "1px solid rgba(255,255,255,.07)", marginTop: "6px",
                }}>
                  <span>Total</span>
                  <span style={{ color: "#ff416c" }}>{fmt(totalFinal)}</span>
                </div>
              </div>

              {/* Dica de economia no PIX */}
              {payMethod === "pix" && descVal > 0 && (
                <div style={{
                  marginTop: "16px", padding: "12px",
                  background: "rgba(0,224,122,.06)",
                  border: "1px solid rgba(0,224,122,.15)",
                  borderRadius: "10px", fontSize: ".78rem", color: "#00e07a",
                }}>
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

// ── ESTILOS ────────────────────────────────────────────────────
const S = {
  // Cobre toda a tela com fundo preto sólido (zIndex 5000, acima do carrinho)
  overlay: {
    position: "fixed", inset: 0,
    background: "#000",
    zIndex: 5000, overflowY: "auto",
    display: "flex", justifyContent: "center", alignItems: "flex-start",
    padding: "0",
    fontFamily: "'Poppins', sans-serif",
  },
  // Área branca/escura do conteúdo do checkout, ocupa 100% da largura
  modal: {
    background: "#060606",
    border: "none", borderRadius: "0",
    width: "100%", maxWidth: "100%", minHeight: "100vh",
    color: "#fff", position: "relative",
    // Gradientes sutis de fundo para criar profundidade
    backgroundImage: "radial-gradient(circle at 10% 30%,rgba(255,65,108,.07),transparent 40%),radial-gradient(circle at 90% 70%,rgba(255,75,43,.06),transparent 40%)",
  },
  header:      { padding: "16px 5%", background: "rgba(8,8,8,.9)", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "0" },
  // Logo BBS com texto em gradiente vermelho
  logo:        { fontSize: "1.6rem", fontWeight: 700, letterSpacing: "4px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  closeBtn:    { background: "none", border: "none", color: "#888", fontSize: "2rem", cursor: "pointer", lineHeight: 1, padding: 0 },
  progressWrap:{ display: "flex", alignItems: "center", padding: "28px 5%", maxWidth: "600px", margin: "0 auto" },
  stepCircle:  { width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", fontWeight: 700, color: "#666", position: "relative", background: "#060606", zIndex: 1 },
  // Step ativo: fundo vermelho com glow
  stepActive:  { borderColor: "#ff416c", color: "#fff", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", boxShadow: "0 0 18px rgba(255,65,108,.4)" },
  // Step concluído: borda verde
  stepDone:    { borderColor: "#00e07a", color: "#00e07a" },
  layout:      { display: "flex", gap: "24px", padding: "0 5% 40px", flexWrap: "wrap" },
  // Card com efeito glass: fundo escuro translúcido + blur
  card:        { background: "rgba(16,16,16,.75)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "16px", backdropFilter: "blur(20px)", padding: "28px", marginBottom: "24px" },
  cardTitle:   { fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", color: "#666", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,.07)", margin: "0 0 20px" },
  orderItem:   { display: "flex", gap: "14px", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.07)", alignItems: "center" },
  orderImg:    { width: 56, height: 56, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,.04)", padding: 4, flexShrink: 0 },
  brindeCard:  { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "12px", padding: "12px", textAlign: "center", position: "relative" },
  field:       { marginBottom: "16px" },
  label:       { display: "block", fontSize: ".68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#666", marginBottom: "7px" },
  input:       { width: "100%", padding: "13px 15px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", outline: "none", boxSizing: "border-box" },
  btnCep:      { padding: "13px 18px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  freteCard:   { padding: "15px 18px", border: "2px solid", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: ".2s" },
  payCard:     { padding: "16px", border: "2px solid", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: ".25s" },
  // Botão copiar: cor teal, vira verde ao ser ativado
  btnCopy:     { width: "100%", padding: "13px", background: "transparent", border: "1px solid rgba(0,189,174,.4)", borderRadius: "10px", color: "#00bdae", fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: ".25s" },
  navBtns:     { display: "flex", gap: "12px", marginTop: "24px" },
  // Botão avançar: gradiente vermelho com sombra
  btnNext:     { flex: 1, padding: "15px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", border: "none", borderRadius: "11px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".95rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", boxShadow: "0 6px 20px rgba(255,65,108,.28)" },
  // Botão voltar: transparente com borda sutil
  btnPrev:     { padding: "15px 22px", background: "transparent", border: "1px solid rgba(255,255,255,.12)", borderRadius: "11px", color: "#888", fontFamily: "'Poppins',sans-serif", fontSize: ".88rem", cursor: "pointer" },
  summaryRow:  { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".88rem", color: "#bbb", marginBottom: "10px" },
  alertErr:    { background: "rgba(255,65,108,.1)", border: "1px solid rgba(255,65,108,.3)", color: "#ff8fa0", padding: "11px 15px", borderRadius: "8px", fontSize: ".82rem", marginBottom: "16px" },
  // Círculo verde de sucesso
  successIcon: { width: 80, height: 80, borderRadius: "50%", background: "rgba(0,224,122,.12)", border: "2px solid #00e07a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  // Código do pedido em caixa cinza com letras vermelhas espaçadas
  orderCode:   { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "10px", padding: "16px", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "4px", color: "#ff416c", marginBottom: "30px" },
};
