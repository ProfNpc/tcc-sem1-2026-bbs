import { useState, useEffect, useRef } from "react";
import { useCart } from "../src/context/CartContext";

const BRINDES = [
  { min: 0,    nome: "Adesivo BBS",  sub: "Qualquer compra",          img: "/brinde-adesivo.png"   },
  { min: 500,  nome: "Chaveiro BBS", sub: "Compras acima de R$ 500",  img: "/brinde-chaveiro.png"  },
  { min: 1500, nome: "Mousepad BBS", sub: "Compras acima de R$ 1.500",img: "/brinde-mousepad.png"  },
  { min: 3000, nome: "Garrafa BBS",  sub: "Compras acima de R$ 3.000",img: "/brinde-garrafa.png"   },
  { min: 6000, nome: "Moletom BBS",  sub: "Compras acima de R$ 6.000",img: "/brinde-moletom.png"   },
];

const fmt = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function calcCRC(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4,"0");
}

function gerarPixCode(total) {
  const t = total.toFixed(2);
  const len = t.length;
  const base = `00020126580014BR.GOV.BCB.PIX0136bbs-loja-chave-pix@bits.com.br520400005303986540${len}${t}5802BR5913BitsBytes Store6009SAO PAULO62070503***6304`;
  return base + calcCRC(base);
}

function gerarBoletoCode() {
  const rand = () => Math.floor(Math.random() * 9000 + 1000);
  return `3419.${rand()} ${rand()}.${rand()}9 ${rand()}.${rand()}0 ${Math.floor(Math.random()*9)+1} ${Date.now().toString().slice(-14)}`;
}

export default function Checkout({ fechar }) {
  const { cart, cartOrder, subtotal, freteGlobal, limparCarrinho } = useCart();
  const itens = cartOrder.map(id => ({ ...cart[id], id })).filter(Boolean);

  const [step, setStep]           = useState(1);
  const [payMethod, setPayMethod] = useState("pix");
  const [freteMode, setFreteMode] = useState("normal");
  const [sucesso, setSucesso]     = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [timer, setTimer]         = useState(900);
  const [pixCopied, setPixCopied] = useState(false);
  const [boletoCopied, setBoletoCopied] = useState(false);
  const timerRef = useRef(null);
  const qrRef    = useRef(null);

  const freteValor = freteMode === "expresso" ? 29.90 : 15.90;
  const descPct    = payMethod === "pix" ? 0.10 : payMethod === "boleto" ? 0.07 : payMethod === "debito" ? 0.05 : 0;
  const descVal    = subtotal * descPct;
  const totalFinal = subtotal + freteValor - descVal;

  const pixCode    = gerarPixCode(totalFinal);
  const boletoCode = useRef(gerarBoletoCode()).current;

  const [end, setEnd]       = useState({ cep:"",rua:"",num:"",comp:"",bairro:"",cidade:"",uf:"" });
  const [endError, setEndError] = useState("");
  const [card, setCard]     = useState({ num:"",nome:"",val:"",cvv:"" });
  const [cardFlipped, setCardFlipped] = useState(false);
  const [parcelas, setParcelas] = useState("1");

  // Timer PIX
  useEffect(() => {
    if (step === 3 && payMethod === "pix") {
      setTimer(900);
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step, payMethod]);

  // QR Code
  useEffect(() => {
    if (step === 3 && payMethod === "pix" && qrRef.current) {
      qrRef.current.innerHTML = "";
      if (window.QRCode) {
        new window.QRCode(qrRef.current, {
          text: pixCode, width: 180, height: 180,
          colorDark: "#000000", colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.M
        });
      } else {
        qrRef.current.innerHTML = `<div style="width:180px;height:180px;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#333;font-size:.75rem;padding:12px;text-align:center;box-sizing:border-box">QR Code PIX</div>`;
      }
    }
  }, [step, payMethod, pixCode]);

  // Carregar lib QRCode
  useEffect(() => {
    if (!window.QRCode) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      document.head.appendChild(s);
    }
  }, []);

  async function buscarCEP() {
    const cepLimpo = end.cep.replace(/\D/g,"");
    if (cepLimpo.length !== 8) return setEndError("CEP deve ter 8 dígitos.");
    try {
      const d = await (await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)).json();
      if (d.erro) return setEndError("CEP não encontrado.");
      setEnd(v => ({ ...v, rua:d.logradouro||"", bairro:d.bairro||"", cidade:d.localidade||"", uf:d.uf||"" }));
      setEndError("");
    } catch { setEndError("Erro ao buscar CEP."); }
  }

  function validarEntrega() {
    if (!end.rua || !end.num || !end.cidade || !end.uf)
      return setEndError("Preencha rua, número, cidade e UF.");
    setEndError(""); setStep(3);
  }

  function confirmarPagamento() {
    clearInterval(timerRef.current);
    setOrderCode("BBS-" + Math.floor(100000 + Math.random() * 900000));
    limparCarrinho();
    setSucesso(true);
  }

  const timerMin = String(Math.floor(timer/60)).padStart(2,"0");
  const timerSec = String(timer%60).padStart(2,"0");

  // ── TELA SUCESSO ──
  if (sucesso) return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={S.successIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00e07a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{fontSize:"1.8rem",marginBottom:"12px",color:"#fff"}}>Pedido Confirmado!</h2>
          <p style={{color:"#888",marginBottom:"24px",lineHeight:1.7}}>
            Seu pedido foi recebido e está sendo processado.<br/>
            Você receberá um e-mail com todos os detalhes.
          </p>
          <div style={S.orderCode}>{orderCode}</div>
          <p style={{color:"#666",fontSize:".82rem",marginBottom:"28px"}}>Guarde este código para acompanhar seu pedido</p>
          <button onClick={fechar} style={S.btnNext}>Continuar Comprando</button>
        </div>
      </div>
    </div>
  );

  // ── CARRINHO VAZIO ──
  if (itens.length === 0) return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{display:"flex",justifyContent:"flex-end",padding:"16px"}}>
          <button onClick={fechar} style={S.closeBtn}>&times;</button>
        </div>
        <p style={{color:"#888",textAlign:"center",padding:"40px"}}>Seu carrinho está vazio.</p>
      </div>
    </div>
  );

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* HEADER */}
        <div style={S.header}>
          <span style={S.logo}>BBS</span>
          <button onClick={fechar} style={S.closeBtn}>&times;</button>
        </div>

        {/* PROGRESS */}
        <div style={S.progressWrap}>
          {[["Confirmar Pedido",1],["Entrega",2],["Pagamento",3]].map(([label,n]) => {
            const isActive = step===n, isDone = step>n;
            return (
              <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",flex:1,position:"relative"}}>
                <div style={{...S.stepCircle, ...(isActive?S.stepActive:isDone?S.stepDone:{})}}>{isDone?"✓":n}</div>
                <span style={{fontSize:".7rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:isActive?"#fff":isDone?"#00e07a":"#666",textAlign:"center"}}>{label}</span>
                {n<3 && <div style={{position:"absolute",top:18,left:"50%",width:"100%",height:2,zIndex:0,background:isDone?"linear-gradient(45deg,#ff416c,#ff4b2b)":"rgba(255,255,255,.07)"}}/>}
              </div>
            );
          })}
        </div>

        <div style={S.layout}>
          {/* ══ COLUNA ESQUERDA ══ */}
          <div style={{flex:1,minWidth:0}}>

            {/* STEP 1 — ITENS + BRINDES */}
            {step===1 && <>
              <div style={S.card}>
                <p style={S.cardTitle}>Itens do Pedido</p>
                {itens.map(item => (
                  <div key={item.id} style={S.orderItem}>
                    <img src={item.img} alt={item.name} style={S.orderImg}
                      onError={e=>e.target.src="https://placehold.co/56x56?text=?"}/>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontWeight:600,fontSize:".88rem",color:"#e8e8e8"}}>{item.name}</p>
                      <p style={{margin:0,color:"#666",fontSize:".75rem"}}>Qtd: {item.qty}</p>
                    </div>
                    <p style={{color:"#ff416c",fontWeight:700,whiteSpace:"nowrap"}}>{fmt(item.price*item.qty)}</p>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <p style={S.cardTitle}>🎁 Seus Brindes Exclusivos BBS</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:"12px"}}>
                  {BRINDES.map((b,i) => {
                    const ganhou = subtotal >= b.min;
                    const prevMin = i>0?BRINDES[i-1].min:0;
                    const pct = ganhou?100:b.min>prevMin?Math.min(Math.round(((subtotal-prevMin)/(b.min-prevMin))*100),99):0;
                    return (
                      <div key={i} style={{...S.brindeCard,opacity:ganhou?1:0.5,filter:ganhou?"none":"grayscale(0.6)"}}>
                        <img src={b.img} alt={b.nome} style={{width:"100%",aspectRatio:"1",objectFit:"contain",borderRadius:"8px"}}
                          onError={e=>e.target.style.display="none"}/>
                        {ganhou
                          ? <span style={{position:"absolute",top:8,right:8,background:"linear-gradient(45deg,#ff416c,#ff4b2b)",color:"#fff",fontSize:".62rem",fontWeight:700,padding:"2px 8px",borderRadius:"20px"}}>GRÁTIS</span>
                          : <span style={{position:"absolute",top:8,right:8,background:"rgba(30,30,30,.9)",color:"#888",fontSize:".62rem",fontWeight:700,padding:"2px 8px",borderRadius:"20px",border:"1px solid rgba(255,255,255,.1)"}}>🔒 {b.min>0?fmt(b.min):"Qualquer"}</span>
                        }
                        <p style={{margin:"8px 0 2px",fontSize:".72rem",fontWeight:700,color:"#e8e8e8"}}>{b.nome}</p>
                        <p style={{margin:0,fontSize:".62rem",color:ganhou?"#00e07a":"#888"}}>{ganhou?"✓ Desbloqueado!":b.sub}</p>
                        {!ganhou && pct>0 && (
                          <div style={{marginTop:"4px",height:"4px",borderRadius:"4px",background:"rgba(255,255,255,.08)",overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#ff416c,#ff4b2b)",borderRadius:"4px"}}/>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const proximo = BRINDES.find(b => subtotal < b.min);
                  if (!proximo) return <div style={{marginTop:"14px",padding:"12px 16px",background:"rgba(0,224,122,.07)",border:"1px solid rgba(0,224,122,.25)",borderRadius:"10px",fontSize:".8rem",color:"#00e07a"}}>🏆 <strong>Parabéns!</strong> Você desbloqueou todos os brindes BBS!</div>;
                  const diff = fmt(proximo.min - subtotal);
                  return <div style={{marginTop:"14px",padding:"12px 16px",background:"rgba(245,166,35,.07)",border:"1px solid rgba(245,166,35,.25)",borderRadius:"10px",fontSize:".8rem",color:"#f5a623"}}>🎯 Faltam apenas <strong>{diff}</strong> para ganhar: <strong>{proximo.nome}</strong></div>;
                })()}
              </div>

              <div style={S.navBtns}>
                <button style={S.btnNext} onClick={()=>setStep(2)}>Continuar para Entrega →</button>
              </div>
            </>}

            {/* STEP 2 — ENTREGA */}
            {step===2 && <>
              <div style={S.card}>
                <p style={S.cardTitle}>Endereço de Entrega</p>
                {endError && <div style={S.alertErr}>{endError}</div>}

                <div style={S.field}>
                  <label style={S.label}>CEP</label>
                  <div style={{display:"flex",gap:"10px"}}>
                    <input style={S.input} placeholder="00000-000" maxLength={9} value={end.cep}
                      onChange={e=>setEnd(v=>({...v,cep:e.target.value}))}/>
                    <button style={S.btnCep} onClick={buscarCEP}>Buscar</button>
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Rua / Logradouro</label>
                  <input style={S.input} placeholder="Nome da rua" value={end.rua}
                    onChange={e=>setEnd(v=>({...v,rua:e.target.value}))}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                  <div style={S.field}>
                    <label style={S.label}>Número</label>
                    <input style={S.input} placeholder="123" value={end.num}
                      onChange={e=>setEnd(v=>({...v,num:e.target.value}))}/>
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Complemento</label>
                    <input style={S.input} placeholder="Apto, Bloco..." value={end.comp}
                      onChange={e=>setEnd(v=>({...v,comp:e.target.value}))}/>
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Bairro</label>
                  <input style={S.input} placeholder="Bairro" value={end.bairro}
                    onChange={e=>setEnd(v=>({...v,bairro:e.target.value}))}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:"14px"}}>
                  <div style={S.field}>
                    <label style={S.label}>Cidade</label>
                    <input style={S.input} placeholder="Cidade" value={end.cidade}
                      onChange={e=>setEnd(v=>({...v,cidade:e.target.value}))}/>
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>UF</label>
                    <input style={{...S.input,textTransform:"uppercase"}} placeholder="SP" maxLength={2} value={end.uf}
                      onChange={e=>setEnd(v=>({...v,uf:e.target.value.toUpperCase()}))}/>
                  </div>
                </div>

                <div style={{marginTop:"8px"}}>
                  <label style={S.label}>Tipo de Entrega</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"8px"}}>
                    {[
                      {key:"normal",   label:"Padrão",   sub:"3–7 dias úteis", val:"R$ 15,90", color:"#ff416c"},
                      {key:"expresso", label:"Expresso", sub:"1–2 dias úteis", val:"R$ 29,90", color:"#f5a623"},
                    ].map(f => (
                      <div key={f.key} onClick={()=>setFreteMode(f.key)}
                        style={{...S.freteCard,borderColor:freteMode===f.key?"#ff416c":"rgba(255,255,255,.07)",background:freteMode===f.key?"rgba(255,65,108,.08)":"transparent"}}>
                        <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${freteMode===f.key?"#ff416c":"#444"}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {freteMode===f.key && <div style={{width:8,height:8,borderRadius:"50%",background:"#ff416c"}}/>}
                        </div>
                        <div>
                          <p style={{margin:0,fontSize:".68rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:f.color}}>{f.label}</p>
                          <p style={{margin:0,fontSize:".84rem",color:"#ccc",lineHeight:1.5}}>{f.sub}<br/><strong style={{color:"#fff"}}>{f.val}</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={S.navBtns}>
                <button style={S.btnPrev} onClick={()=>setStep(1)}>← Voltar</button>
                <button style={S.btnNext} onClick={validarEntrega}>Continuar para Pagamento →</button>
              </div>
            </>}

            {/* STEP 3 — PAGAMENTO */}
            {step===3 && <>
              <div style={S.card}>
                <p style={S.cardTitle}>Método de Pagamento</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                  {[
                    {key:"pix",     icon:"💚", name:"PIX",              sub:"10% de desconto"},
                    {key:"credito", icon:"💳", name:"Cartão de Crédito",sub:"Até 12x sem juros"},
                    {key:"debito",  icon:"💳", name:"Cartão de Débito", sub:"5% de desconto"},
                    {key:"boleto",  icon:"🎫", name:"Boleto",           sub:"7% de desconto"},
                  ].map(m => (
                    <div key={m.key} onClick={()=>setPayMethod(m.key)}
                      style={{...S.payCard,borderColor:payMethod===m.key?"#ff416c":"rgba(255,255,255,.07)",background:payMethod===m.key?"rgba(255,65,108,.08)":"transparent"}}>
                      <span style={{fontSize:"1.3rem"}}>{m.icon}</span>
                      <div>
                        <p style={{margin:0,fontSize:".85rem",fontWeight:600,color:"#fff"}}>{m.name}</p>
                        <p style={{margin:0,fontSize:".72rem",color:"#666"}}>{m.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIX */}
              {payMethod==="pix" && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Pagar com PIX</p>
                  <div style={{textAlign:"center"}}>
                    <p style={{fontSize:"2rem",fontWeight:900,color:"#00bdae",margin:"0 0 6px",letterSpacing:"-1px"}}>PIX</p>
                    <p style={{color:"#666",fontSize:".8rem",marginBottom:"20px"}}>Escaneie o QR Code ou copie o código abaixo</p>
                    <div ref={qrRef} style={{display:"flex",justifyContent:"center",marginBottom:"20px"}}/>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",color:"#f5a623",fontSize:".82rem",marginBottom:"20px"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Expira em <strong>{timerMin}:{timerSec}</strong>
                    </div>
                    <p style={{fontSize:".72rem",color:"#666",marginBottom:"8px",textAlign:"left",letterSpacing:".5px"}}>CÓDIGO PIX COPIA E COLA</p>
                    <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"10px",padding:"14px",marginBottom:"12px",fontSize:".72rem",color:"#bbb",wordBreak:"break-all",textAlign:"left",fontFamily:"monospace",lineHeight:1.6,maxHeight:"80px",overflow:"hidden"}}>
                      {pixCode}
                    </div>
                    <button onClick={()=>{navigator.clipboard.writeText(pixCode);setPixCopied(true);setTimeout(()=>setPixCopied(false),2500);}}
                      style={{...S.btnCopy,...(pixCopied?{borderColor:"#00e07a",color:"#00e07a"}:{})}}>
                      {pixCopied ? "✓ Copiado!" : "Copiar Código PIX"}
                    </button>
                    <p style={{fontSize:".75rem",color:"#666",marginTop:"14px"}}>Após o pagamento, a confirmação chega em até 1 minuto.</p>
                  </div>
                  <div style={S.navBtns}>
                    <button style={S.btnPrev} onClick={()=>setStep(2)}>← Voltar</button>
                    <button style={S.btnNext} onClick={confirmarPagamento}>Confirmar Pagamento ✓</button>
                  </div>
                </div>
              )}

              {/* CARTÃO */}
              {(payMethod==="credito"||payMethod==="debito") && (
                <div style={S.card}>
                  <p style={S.cardTitle}>{payMethod==="credito"?"Cartão de Crédito":"Cartão de Débito"}</p>
                  <div style={{perspective:"1000px",marginBottom:"28px",height:"185px"}}>
                    <div style={{width:"100%",height:"185px",position:"relative",transformStyle:"preserve-3d",transition:"transform .6s cubic-bezier(.4,0,.2,1)",transform:cardFlipped?"rotateY(180deg)":"none"}}>
                      {/* FRENTE */}
                      <div style={{position:"absolute",inset:0,borderRadius:"16px",backfaceVisibility:"hidden",padding:"22px 26px",background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",boxShadow:"0 20px 50px rgba(0,0,0,.6)",display:"flex",flexDirection:"column"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"24px"}}>
                          <div style={{width:40,height:30,borderRadius:5,background:"linear-gradient(135deg,#d4a017,#f5d675,#b8860b)"}}/>
                          <span style={{fontSize:"1.4rem",fontWeight:900,color:"#fff"}}>●●</span>
                        </div>
                        <div style={{fontSize:"1.2rem",letterSpacing:"4px",fontWeight:600,color:"rgba(255,255,255,.9)",marginBottom:"16px",fontFamily:"monospace"}}>
                          {card.num?card.num:"●●●● ●●●● ●●●● ●●●●"}
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <div>
                            <p style={{fontSize:".6rem",color:"rgba(255,255,255,.5)",textTransform:"uppercase",margin:"0 0 3px"}}>Titular</p>
                            <p style={{fontSize:".85rem",fontWeight:600,color:"#fff",textTransform:"uppercase",margin:0}}>{card.nome||"NOME DO TITULAR"}</p>
                          </div>
                          <div>
                            <p style={{fontSize:".6rem",color:"rgba(255,255,255,.5)",textTransform:"uppercase",margin:"0 0 3px"}}>Validade</p>
                            <p style={{fontSize:".85rem",fontWeight:600,color:"#fff",margin:0}}>{card.val||"MM/AA"}</p>
                          </div>
                        </div>
                      </div>
                      {/* VERSO */}
                      <div style={{position:"absolute",inset:0,borderRadius:"16px",backfaceVisibility:"hidden",transform:"rotateY(180deg)",background:"linear-gradient(135deg,#0f3460,#16213e,#1a1a2e)",padding:"22px 26px"}}>
                        <div style={{height:46,background:"#1a1a1a",margin:"0 -26px 16px"}}/>
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                          <div style={{background:"rgba(255,255,255,.9)",borderRadius:5,padding:"7px 18px",fontSize:"1rem",fontWeight:700,color:"#333",letterSpacing:4,fontFamily:"monospace"}}>
                            {card.cvv||"●●●"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={S.field}>
                    <label style={S.label}>Número do Cartão</label>
                    <input style={S.input} placeholder="0000 0000 0000 0000" maxLength={19} value={card.num}
                      onChange={e=>{
                        const v=e.target.value.replace(/\D/g,"").slice(0,16);
                        setCard(c=>({...c,num:v.replace(/(.{4})/g,"$1 ").trim()}));
                      }} onFocus={()=>setCardFlipped(false)}/>
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Nome do Titular</label>
                    <input style={S.input} placeholder="Como está no cartão" value={card.nome}
                      onChange={e=>setCard(c=>({...c,nome:e.target.value.toUpperCase()}))}
                      onFocus={()=>setCardFlipped(false)}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                    <div style={S.field}>
                      <label style={S.label}>Validade</label>
                      <input style={S.input} placeholder="MM/AA" maxLength={5} value={card.val}
                        onChange={e=>{
                          let v=e.target.value.replace(/\D/g,"").slice(0,4);
                          if(v.length>2) v=v.slice(0,2)+"/"+v.slice(2);
                          setCard(c=>({...c,val:v}));
                        }} onFocus={()=>setCardFlipped(false)}/>
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>CVV</label>
                      <input style={S.input} placeholder="●●●" maxLength={4} value={card.cvv}
                        onChange={e=>setCard(c=>({...c,cvv:e.target.value.replace(/\D/g,"")}))}
                        onFocus={()=>setCardFlipped(true)} onBlur={()=>setCardFlipped(false)}/>
                    </div>
                  </div>
                  {payMethod==="credito" && (
                    <div style={S.field}>
                      <label style={S.label}>Parcelar em</label>
                      <select style={{...S.input,cursor:"pointer"}} value={parcelas} onChange={e=>setParcelas(e.target.value)}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>(
                          <option key={n} value={n} style={{background:"#1a1a1a"}}>
                            {n}x de {fmt(totalFinal/n)} {n===1?"(à vista)":"sem juros"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div style={S.navBtns}>
                    <button style={S.btnPrev} onClick={()=>setStep(2)}>← Voltar</button>
                    <button style={S.btnNext} onClick={confirmarPagamento}>Confirmar Pagamento ✓</button>
                  </div>
                </div>
              )}

              {/* BOLETO */}
              {payMethod==="boleto" && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Boleto Bancário</p>
                  <div style={{textAlign:"center",padding:"10px 0"}}>
                    <div style={{fontSize:"3rem",marginBottom:"16px"}}>🧾</div>
                    <p style={{color:"#ccc",fontSize:".9rem",lineHeight:1.8,marginBottom:"20px"}}>
                      Seu boleto será gerado após a confirmação.<br/>
                      Você terá <strong>3 dias úteis</strong> para efetuar o pagamento.<br/>
                      O boleto será enviado para o seu e-mail.
                    </p>
                    <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"10px",padding:"14px",marginBottom:"16px"}}>
                      <p style={{fontSize:".72rem",color:"#666",marginBottom:"6px"}}>CÓDIGO DE BARRAS</p>
                      <p style={{fontFamily:"monospace",fontSize:".78rem",color:"#ccc",wordBreak:"break-all",lineHeight:1.8,margin:0}}>{boletoCode}</p>
                    </div>
                    <button onClick={()=>{navigator.clipboard.writeText(boletoCode.replace(/[.\s]/g,""));setBoletoCopied(true);setTimeout(()=>setBoletoCopied(false),2500);}}
                      style={{...S.btnCopy,...(boletoCopied?{borderColor:"#00e07a",color:"#00e07a"}:{})}}>
                      {boletoCopied ? "✓ Copiado!" : "Copiar Código de Barras"}
                    </button>
                  </div>
                  <div style={S.navBtns}>
                    <button style={S.btnPrev} onClick={()=>setStep(2)}>← Voltar</button>
                    <button style={S.btnNext} onClick={confirmarPagamento}>Confirmar Pedido ✓</button>
                  </div>
                </div>
              )}
            </>}
          </div>

          {/* ══ RESUMO LATERAL ══ */}
          <div style={{width:"300px",flexShrink:0}}>
            <div style={{...S.card,position:"sticky",top:"20px"}}>
              <p style={S.cardTitle}>Resumo do Pedido</p>
              {itens.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",fontSize:".8rem",color:"#999",marginBottom:"7px"}}>
                  <span style={{flex:1,marginRight:"8px"}}>{item.name} x{item.qty}</span>
                  <span style={{whiteSpace:"nowrap"}}>{fmt(item.price*item.qty)}</span>
                </div>
              ))}
              <div style={{marginTop:"16px"}}>
                <div style={S.summaryRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div style={S.summaryRow}><span>Frete</span><span>{fmt(freteValor)}</span></div>
                {descVal>0 && (
                  <div style={{...S.summaryRow,color:"#00e07a"}}>
                    <span>Desconto ({(descPct*100).toFixed(0)}%)</span>
                    <span>-{fmt(descVal)}</span>
                  </div>
                )}
                <div style={{...S.summaryRow,fontWeight:700,fontSize:"1.1rem",color:"#fff",paddingTop:"14px",borderTop:"1px solid rgba(255,255,255,.07)",marginTop:"6px"}}>
                  <span>Total</span><span style={{color:"#ff416c"}}>{fmt(totalFinal)}</span>
                </div>
              </div>
              {payMethod==="pix" && descVal>0 && (
                <div style={{marginTop:"16px",padding:"12px",background:"rgba(0,224,122,.06)",border:"1px solid rgba(0,224,122,.15)",borderRadius:"10px",fontSize:".78rem",color:"#00e07a"}}>
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

const S = {
  // ✅ CORRIGIDO: fundo preto sólido, sem padding, tela cheia
  overlay: {
    position: "fixed", inset: 0,
    background: "#000",
    zIndex: 5000, overflowY: "auto",
    display: "flex", justifyContent: "center",
    alignItems: "flex-start",
    padding: "0",
    fontFamily: "'Poppins', sans-serif",
  },
  // ✅ CORRIGIDO: sem borda, sem border-radius, largura 100%, altura mínima 100vh
  modal: {
    background: "#060606",
    border: "none",
    borderRadius: "0",
    width: "100%",
    maxWidth: "100%",
    minHeight: "100vh",
    color: "#fff",
    position: "relative",
    backgroundImage: "radial-gradient(circle at 10% 30%,rgba(255,65,108,.07),transparent 40%),radial-gradient(circle at 90% 70%,rgba(255,75,43,.06),transparent 40%)",
  },
  // ✅ CORRIGIDO: sem border-radius no header
  header: {
    padding: "16px 5%",
    background: "rgba(8,8,8,.9)",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "0",
  },
  logo:        {fontSize:"1.6rem",fontWeight:700,letterSpacing:"4px",background:"linear-gradient(45deg,#ff416c,#ff4b2b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  closeBtn:    {background:"none",border:"none",color:"#888",fontSize:"2rem",cursor:"pointer",lineHeight:1,padding:0},
  progressWrap:{display:"flex",alignItems:"center",padding:"28px 5%",maxWidth:"600px",margin:"0 auto"},
  stepCircle:  {width:36,height:36,borderRadius:"50%",border:"2px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".8rem",fontWeight:700,color:"#666",position:"relative",background:"#060606",zIndex:1},
  stepActive:  {borderColor:"#ff416c",color:"#fff",background:"linear-gradient(45deg,#ff416c,#ff4b2b)",boxShadow:"0 0 18px rgba(255,65,108,.4)"},
  stepDone:    {borderColor:"#00e07a",color:"#00e07a"},
  layout:      {display:"flex",gap:"24px",padding:"0 5% 40px",flexWrap:"wrap"},
  card:        {background:"rgba(16,16,16,.75)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"16px",backdropFilter:"blur(20px)",padding:"28px",marginBottom:"24px"},
  cardTitle:   {fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"3px",color:"#666",marginBottom:"20px",paddingBottom:"16px",borderBottom:"1px solid rgba(255,255,255,.07)",margin:"0 0 20px"},
  orderItem:   {display:"flex",gap:"14px",padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.07)",alignItems:"center"},
  orderImg:    {width:56,height:56,objectFit:"contain",borderRadius:8,background:"rgba(255,255,255,.04)",padding:4,flexShrink:0},
  brindeCard:  {background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"12px",padding:"12px",textAlign:"center",position:"relative"},
  field:       {marginBottom:"16px"},
  label:       {display:"block",fontSize:".68rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:"#666",marginBottom:"7px"},
  input:       {width:"100%",padding:"13px 15px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:"10px",color:"#fff",fontFamily:"'Poppins',sans-serif",fontSize:".9rem",outline:"none",boxSizing:"border-box"},
  btnCep:      {padding:"13px 18px",background:"linear-gradient(45deg,#ff416c,#ff4b2b)",border:"none",borderRadius:"10px",color:"#fff",fontFamily:"'Poppins',sans-serif",fontSize:".82rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"},
  freteCard:   {padding:"15px 18px",border:"2px solid",borderRadius:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"14px",transition:".2s"},
  payCard:     {padding:"16px",border:"2px solid",borderRadius:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",transition:".25s"},
  btnCopy:     {width:"100%",padding:"13px",background:"transparent",border:"1px solid rgba(0,189,174,.4)",borderRadius:"10px",color:"#00bdae",fontFamily:"'Poppins',sans-serif",fontSize:".88rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:".25s"},
  navBtns:     {display:"flex",gap:"12px",marginTop:"24px"},
  btnNext:     {flex:1,padding:"15px",background:"linear-gradient(45deg,#ff416c,#ff4b2b)",border:"none",borderRadius:"11px",color:"#fff",fontFamily:"'Poppins',sans-serif",fontSize:".95rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",cursor:"pointer",boxShadow:"0 6px 20px rgba(255,65,108,.28)"},
  btnPrev:     {padding:"15px 22px",background:"transparent",border:"1px solid rgba(255,255,255,.12)",borderRadius:"11px",color:"#888",fontFamily:"'Poppins',sans-serif",fontSize:".88rem",cursor:"pointer"},
  summaryRow:  {display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:".88rem",color:"#bbb",marginBottom:"10px"},
  alertErr:    {background:"rgba(255,65,108,.1)",border:"1px solid rgba(255,65,108,.3)",color:"#ff8fa0",padding:"11px 15px",borderRadius:"8px",fontSize:".82rem",marginBottom:"16px"},
  successIcon: {width:80,height:80,borderRadius:"50%",background:"rgba(0,224,122,.12)",border:"2px solid #00e07a",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"},
  orderCode:   {background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"10px",padding:"16px",fontSize:"1.1rem",fontWeight:700,letterSpacing:"4px",color:"#ff416c",marginBottom:"30px"},
};
