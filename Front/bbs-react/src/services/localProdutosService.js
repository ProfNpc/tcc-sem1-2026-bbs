// ============================================================
//  localProdutosService.js
//  Coloque em: src/services/localProdutosService.js
//
//  Substitui produtosService.js — usa localStorage no lugar
//  do Spring Boot. CRUD completo funciona offline.
// ============================================================

const CHAVE = "bbs_produtos";

// Produtos originais do projeto — usados como seed na 1ª vez
const PRODUTOS_SEED = [
  {
    id: 1, tipo: "gpu", nome: "RTX 3060",
    descricao: "Nvidia PCYES",
    preco: 2199,
    estoque: 10,
    imgUrl: "https://m.media-amazon.com/images/I/61B8S-xnakL._AC_SY450_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 2, tipo: "gpu", nome: "RTX 4070 SUPER",
    descricao: "NVIDIA GeForce 12GB GDDR6X",
    preco: 4499.99,
    estoque: 8,
    imgUrl: "https://img.terabyteshop.com.br/produto/g/placa-de-video-gigabyte-nvidia-geforce-rtx-4070-super-windforce-oc-12gb-gddr6x-dlss-ray-tracing-gv-n407swf3oc-12gd_186122.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 3, tipo: "gpu", nome: "NVIDIA RTX 4090",
    descricao: "GPU 24GB GDDR6X para jogos em 4K",
    preco: 11999.99,
    estoque: 5,
    imgUrl: "https://cdn.custompc.com/wp-content/sites/custompc/2023/03/nvidia-geforce-rtx-4090-review-01.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 4, tipo: "cpu", nome: "Core i3 14100F",
    descricao: "Intel",
    preco: 699.99,
    estoque: 15,
    imgUrl: "https://media.pichau.com.br/media/catalog/product/cache/2f958555330323e505eba7ce930bdf27/b/x/bx8071514100f.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 5, tipo: "cpu", nome: "AMD Ryzen 5 5600",
    descricao: "Processador 6-Core AM4",
    preco: 929.99,
    estoque: 12,
    imgUrl: "https://media.pichau.com.br/media/catalog/product/cache/2f958555330323e505eba7ce930bdf27/1/0/100-100000927box_1.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 6, tipo: "ram", nome: "HyperX 16GB",
    descricao: "Kingston DDR4 3200MHz",
    preco: 1099.99,
    estoque: 20,
    imgUrl: "https://m.media-amazon.com/images/I/614ZZYefLjL._AC_SX679_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 7, tipo: "ssd", nome: "SSD NV2 1TB",
    descricao: "Kingston NVMe M.2",
    preco: 750,
    estoque: 18,
    imgUrl: "https://m.media-amazon.com/images/I/71NfMZKkpQL._AC_SX679_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 8, tipo: "ssd", nome: "SSD NV3 1TB",
    descricao: "Kingston NVMe M.2",
    preco: 900,
    estoque: 14,
    imgUrl: "https://m.media-amazon.com/images/I/71c5uuoM1bL._AC_SX522_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 9, tipo: "mae", nome: "B550M Gaming X",
    descricao: "Gigabyte",
    preco: 1700,
    estoque: 7,
    imgUrl: "https://www.gigabyte.com/FileUpload/Global/KeyFeature/3935/innergigabyte/images/product/summary.png",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 10, tipo: "fonte", nome: "Corsair CV550",
    descricao: "Fonte 550W 80 Plus Bronze",
    preco: 499.99,
    estoque: 25,
    imgUrl: "https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Power-Supply-Units/CP-9020210-BR/Gallery/CV550_PSU_13.webp",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 11, tipo: "cooler", nome: "Hyper 212 Black",
    descricao: "Cooler Master Air Tower 120mm",
    preco: 279.99,
    estoque: 30,
    imgUrl: "https://m.media-amazon.com/images/I/81fmLqNqa3L._AC_SY450_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 12, tipo: "gabinete", nome: "Corsair 4000D RGB",
    descricao: "Mid Tower ATX Vidro Temperado",
    preco: 799.99,
    estoque: 9,
    imgUrl: "https://images5.kabum.com.br/produtos/fotos/657435/gabinete-gamer-corsair-4000d-rs-argb-mid-tower-lateral-em-vidro-com-3x-fans-rs-argb-preto-cc-9011296-ww_1738086483_gg.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 13, tipo: "monitor", nome: 'Monitor LG 27" 144Hz',
    descricao: "LG UltraGear IPS Full HD",
    preco: 1499.99,
    estoque: 11,
    imgUrl: "https://m.media-amazon.com/images/I/51Z9x1zdkGL._AC_SY355_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 14, tipo: "mouse", nome: "Logitech G502 Hero",
    descricao: "Mouse Gamer 25.600 DPI",
    preco: 399.99,
    estoque: 22,
    imgUrl: "https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SX679_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 15, tipo: "teclado", nome: "Redragon Kumara K552",
    descricao: "Teclado Mecânico TKL RGB",
    preco: 249.99,
    estoque: 17,
    imgUrl: "https://m.media-amazon.com/images/I/71CkbBHCYFL._AC_SX679_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 16, tipo: "mousepad", nome: "Redragon Flick XL",
    descricao: "Mousepad Extended 80x30cm",
    preco: 129.99,
    estoque: 35,
    imgUrl: "https://m.media-amazon.com/images/I/71vOT7BPQUL._AC_SX679_.jpg",
    dataCriacao: new Date().toISOString(),
  },
  {
    id: 17, tipo: "headset", nome: "HyperX Cloud II",
    descricao: "Headset Gamer 7.1 Surround",
    preco: 549.99,
    estoque: 13,
    imgUrl: "https://m.media-amazon.com/images/I/71Kxk3yLaaL._AC_SX679_.jpg",
    dataCriacao: new Date().toISOString(),
  },
];

// ── Helpers internos ──────────────────────────────────────────

function lerTodos() {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Primeira vez: salva o seed e retorna
  localStorage.setItem(CHAVE, JSON.stringify(PRODUTOS_SEED));
  return PRODUTOS_SEED;
}

function salvarTodos(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

function proximoId(lista) {
  if (lista.length === 0) return 1;
  return Math.max(...lista.map(p => p.id)) + 1;
}

// ── API pública (mesma interface do produtosService.js) ───────

export function listarProdutos() {
  return Promise.resolve(lerTodos());
}

export function buscarProduto(id) {
  const prod = lerTodos().find(p => p.id === Number(id));
  if (!prod) return Promise.reject(new Error("Produto não encontrado"));
  return Promise.resolve(prod);
}

export function criarProduto(produto) {
  const lista = lerTodos();
  const novo = {
    ...produto,
    id: proximoId(lista),
    dataCriacao: new Date().toISOString(),
  };
  salvarTodos([...lista, novo]);
  return Promise.resolve(novo);
}

export function atualizarProduto(id, produto) {
  const lista = lerTodos();
  const idx = lista.findIndex(p => p.id === Number(id));
  if (idx === -1) return Promise.reject(new Error("Produto não encontrado"));
  const atualizado = { ...lista[idx], ...produto, id: Number(id) };
  lista[idx] = atualizado;
  salvarTodos(lista);
  return Promise.resolve(atualizado);
}

export function deletarProduto(id) {
  const lista = lerTodos().filter(p => p.id !== Number(id));
  salvarTodos(lista);
  return Promise.resolve();
}
