// ─── THEME ────────────────────────────────────────────
export const T = {
  bg:       "#07070d",
  surface:  "rgba(13,13,22,0.95)",
  surfaceHover: "rgba(20,20,32,0.98)",
  border:   "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,65,108,0.3)",
  accent:   "#ff416c",
  accent2:  "#ff4b2b",
  grad:     "linear-gradient(135deg,#ff416c,#ff4b2b)",
  gradSoft: "linear-gradient(135deg,rgba(255,65,108,0.15),rgba(255,75,43,0.08))",
  muted:    "#4a4a5e",
  subtext:  "#7a7a92",
  text:     "#e2e2ee",
  ok:       "#00e07a",
  warn:     "#f5a623",
  info:     "#4fc3f7",
  purple:   "#a78bfa",
};

// ─── STORAGE KEYS ─────────────────────────────────────
export const SK = {
  prods:  "bbs_admin_produtos",
  users:  "bbs_usuarios",
  orders: "bbs_pedidos",
  sess:   "bbs_admin_sessao",
};

// ─── ADMIN CREDENTIALS ────────────────────────────────
export const ADMIN_CREDS = {
  admin: "bbs@admin2025",
  bbs:   "admin123",
};

// ─── CATEGORIES ───────────────────────────────────────
export const CATS = [
  { v: "gpu",       l: "Placa de Vídeo" },
  { v: "cpu",       l: "Processador" },
  { v: "ram",       l: "Memória RAM" },
  { v: "ssd",       l: "SSD / HDD" },
  { v: "mae",       l: "Placa Mãe" },
  { v: "fonte",     l: "Fonte" },
  { v: "cooler",    l: "Cooler" },
  { v: "gabinete",  l: "Gabinete" },
  { v: "monitor",   l: "Monitor" },
  { v: "mouse",     l: "Mouse" },
  { v: "teclado",   l: "Teclado" },
  { v: "headset",   l: "Headset" },
  { v: "mousepad",  l: "Mousepad" },
  { v: "periferico","l": "Outro Periférico" },
];

// ─── ORDER STATUSES ───────────────────────────────────
export const ORDER_STATUSES = {
  "Aguardando Pagamento": T.warn,
  "Pago":                 T.ok,
  "Em Separação":         T.info,
  "Enviado":              T.purple,
  "Entregue":             T.ok,
  "Cancelado":            T.accent,
};

// ─── HELPERS ──────────────────────────────────────────
export const fmt   = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
export const nowDt = () => new Date().toLocaleString("pt-BR");
export const initials = (name = "") =>
  name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

export const ls = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ─── SEED DATA ────────────────────────────────────────
export function seedDemo() {
  if (!ls.get(SK.orders)) {
    ls.set(SK.orders, [
      { id: uid(), cliente: "João Silva",    email: "joao@email.com",   total: 4899.98, status: "Enviado",              itens: 2, data: "15/05/2025 10:22" },
      { id: uid(), cliente: "Maria Santos",  email: "maria@email.com",  total: 1499.99, status: "Entregue",             itens: 1, data: "14/05/2025 15:40" },
      { id: uid(), cliente: "Carlos Melo",   email: "carlos@email.com", total:  849.97, status: "Aguardando Pagamento", itens: 3, data: "15/05/2025 08:55" },
      { id: uid(), cliente: "Ana Costa",     email: "ana@email.com",    total: 11999.99,status: "Pago",                 itens: 1, data: "13/05/2025 20:10" },
    ]);
  }
  if (!ls.get(SK.users)) {
    ls.set(SK.users, {
      "joao@email.com":   { nome: "João Silva",   telefone: "(11) 99999-1111", enderecos: [{ rua: "Av. Paulista", numero: "1000", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP", cep: "01310-100" }] },
      "maria@email.com":  { nome: "Maria Santos", telefone: "(11) 88888-2222", enderecos: [] },
    });
  }
  if (!ls.get(SK.prods)) {
    ls.set(SK.prods, [
      { id: uid(), nome: "RTX 4070 SUPER 12GB", desc: "NVIDIA GeForce GDDR6X", preco: 4499.99, marca: "NVIDIA",   tipo: "gpu",    estoque: 8,  specs: ["12GB GDDR6X","DLSS 3.5","192-bit"], imgs: ["https://m.media-amazon.com/images/I/81nM9S2I7pL._AC_SX679_.jpg"] },
      { id: uid(), nome: "Ryzen 7 7700X",        desc: "AMD AM5 8-Core 4.5GHz", preco: 1799.99, marca: "AMD",    tipo: "cpu",    estoque: 14, specs: ["8 Cores/16 Threads","4.5GHz Base","Boost 5.4GHz"], imgs: ["https://m.media-amazon.com/images/I/51DnFwFv9fL._AC_SX679_.jpg"] },
      { id: uid(), nome: "Kingston Fury 32GB DDR5", desc: "DDR5 6000MHz CL36", preco: 699.99,  marca: "Kingston",tipo: "ram",    estoque: 22, specs: ["32GB Kit (2x16GB)","DDR5 6000MHz","XMP 3.0"], imgs: ["https://m.media-amazon.com/images/I/71a99pNFbhL._AC_SX679_.jpg"] },
    ]);
  }
}
