/* ── CARROSSEL DE CATEGORIAS ── */
        function scrollCat(btn, dir) {
            const row = btn.parentElement.querySelector('.categoria-row');
            const dist = dir * (row.offsetWidth * 0.82);
            const start = row.scrollLeft;
            const end   = start + dist;
            const duration = 480;
            let startTime = null;

            function easeInOut(t) {
                return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
            }

            function step(ts) {
                if (!startTime) startTime = ts;
                const elapsed = ts - startTime;
                const progress = Math.min(elapsed / duration, 1);
                row.scrollLeft = start + dist * easeInOut(progress);
                if (progress < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        }

        /* ── CARROSSEL NO HOVER ── */
        const CAROUSEL_INTERVAL = 1500;

        document.querySelectorAll('.produto').forEach(card => {
            const container = card.querySelector('.img-container');
            const images = [...container.querySelectorAll('img')];
            const fill = container.querySelector('.carousel-progress-fill');
            const dotsWrap = container.querySelector('.carousel-dots');

            if (images.length < 2) return;

            images.forEach((_, i) => {
                const d = document.createElement('div');
                d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dotsWrap.appendChild(d);
            });
            const dots = [...dotsWrap.querySelectorAll('.carousel-dot')];

            let current = 0, timer = null;

            function goTo(idx) {
                images[current].classList.remove('active');
                dots[current].classList.remove('active');
                current = (idx + images.length) % images.length;
                images[current].classList.add('active');
                dots[current].classList.add('active');
                animFill();
            }

            function animFill() {
                fill.style.transition = 'none';
                fill.style.width = '0%';
                fill.getBoundingClientRect();
                fill.style.transition = `width ${CAROUSEL_INTERVAL}ms linear`;
                fill.style.width = '100%';
            }

            function start() { animFill(); timer = setInterval(() => goTo(current + 1), CAROUSEL_INTERVAL); }

            function stop() {
                clearInterval(timer); timer = null;
                images[current].classList.remove('active'); dots[current].classList.remove('active');
                current = 0;
                images[0].classList.add('active'); dots[0].classList.add('active');
                fill.style.transition = 'none'; fill.style.width = '0%';
            }

            card.addEventListener('mouseenter', start);
            card.addEventListener('mouseleave', stop);
        });

        /* ── CARRINHO ── */
        let cart = {};
        let cartOrder = []; // tracks insertion order

        function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('open'); }

        function addToCart(id, name, price, img) {
            if (cart[id]) {
                cart[id].qty++;
            } else {
                cart[id] = { name, price, img, qty: 1 };
                cartOrder.unshift(id); // novo item vai pro topo
            }
            renderCart();
            document.getElementById('cart-sidebar').classList.add('open');
        }

        function changeQty(id, delta) {
            cart[id].qty += delta;
            if (cart[id].qty <= 0) {
                delete cart[id];
                cartOrder = cartOrder.filter(i => i != id);
            }
            renderCart();
        }

        function renderCart() {
            const list  = document.getElementById('cart-items');
            const count = document.getElementById('cart-count');
            let html = '', totalVal = 0, totalQty = 0;

            cartOrder.forEach(id => {
                const item = cart[id];
                if (!item) return;
                totalVal += item.price * item.qty;
                totalQty += item.qty;
                html += `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.name}">
            <div style="flex:1;">
                <h4>${item.name}</h4>
                <p>R$ ${(item.price * item.qty).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQty(${id},-1)">−</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${id},1)">+</button>
                </div>
            </div>
        </div>`;
            });

            list.innerHTML = html || '<p style="color:var(--text-muted);text-align:center;margin-top:40px;">Seu carrinho está vazio.</p>';
            count.textContent = totalQty;

            if (totalQty === 0) valorFreteGlobal = 0;
            const total = totalVal + (typeof valorFreteGlobal !== 'undefined' ? valorFreteGlobal : 0);
            document.getElementById('cart-total').innerText = total.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
            const freteEl = document.getElementById('valor-frete-display');
            if (freteEl) freteEl.innerText = (typeof valorFreteGlobal !== 'undefined' ? valorFreteGlobal : 0)
                .toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
        }

        /* ── MODAL ── */
        function abrirModal(btn) {
            const card = btn.closest('.produto');
            const info = JSON.parse(card.dataset.info || '[]');
            const img = card.querySelector('.img-container img.active').src;
            const title = card.querySelector('h3').textContent;
            document.getElementById('modal-img').src = img;
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-specs').innerHTML = info.map(i => `<li>${i}</li>`).join('');
            document.getElementById('modal').style.display = 'flex';
        }

        function fecharModal() { document.getElementById('modal').style.display = 'none'; }

        /* ── FILTROS ── */
        const marcasPorTipo = {
            gpu:       ['nvidia', 'Amd'],
            cpu:       ['Intel', 'Amd'],
            ram:       ['Kingston', 'Corsair', 'Crucial'],
            ssd:       ['Kingston', 'Samsung', 'wd'],
            fonte:     ['Corsair','Redragon','Thermaltake', 'Be Quiet!'],
            cooler:    ['Cooler Master', 'NZXT', 'be quiet!'],
            gabinete:  ['Corsair', 'NZXT', 'Lian Li'],
            periferico:['Logitech', 'Redragon', 'HyperX'],
        };

        function toggleFiltros() {
            const p = document.getElementById('painelFiltros');
            p.style.display = p.style.display === 'grid' ? 'none' : 'grid';
        }

        function atualizarSubFiltros() {
            const tipo = document.getElementById('fTipo').value;
            const select = document.getElementById('fMarca');
            select.innerHTML = '<option value="">Todas</option>';
            if (tipo && marcasPorTipo[tipo]) {
                marcasPorTipo[tipo].forEach(m => {
                    select.innerHTML += `<option value="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</option>`;
                });
                select.disabled = false;
            } else { select.disabled = true; }
            filtrarProdutos();
        }

        function filtrarProdutos() {
            const busca = document.getElementById('busca').value.toLowerCase();
            const tipo  = document.getElementById('fTipo').value;
            const marca = document.getElementById('fMarca').value.toLowerCase();
            document.querySelectorAll('.produto').forEach(p => {
                const nome  = p.querySelector('h3').textContent.toLowerCase();
                const desc  = p.querySelector('p').textContent.toLowerCase();
                const pMarca = (p.dataset.marca || '').toLowerCase();
                const ok = (!busca || nome.includes(busca) || desc.includes(busca))
                    && (!tipo  || p.dataset.tipo === tipo)
                    && (!marca || pMarca === marca);
                p.style.display = ok ? 'flex' : 'none';
            });
            document.querySelectorAll('.categoria-secao').forEach(sec => {
                const visivel = [...sec.querySelectorAll('.produto')].some(p => p.style.display !== 'none');
                sec.style.display = visivel ? '' : 'none';
            });
        }

        function limparFiltros() {
            document.getElementById('busca').value = '';
            document.getElementById('fTipo').value = '';
            document.getElementById('fMarca').innerHTML = '<option value="">Selecione...</option>';
            document.getElementById('fMarca').disabled = true;
            document.querySelectorAll('.categoria-secao').forEach(sec => sec.style.display = '');
            filtrarProdutos();
        }

        /* ── AI CHAT ── */
        function toggleAIChat() {
            const win = document.getElementById('ai-chat-container');
            win.style.display = win.style.display === 'flex' ? 'none' : 'flex';
        }

        function sendAIMessage() {
            const input = document.getElementById('ai-user-input');
            const text = input.value.trim();
            if (!text) return;
            const msgs = document.getElementById('ai-messages');
            msgs.innerHTML += `<div class="msg user">${text}</div>`;
            input.value = '';
            setTimeout(() => {
                msgs.innerHTML += `<div class="msg bot">Obrigado pela sua pergunta! Nossa equipe técnica pode te ajudar melhor pelo chat ao vivo ou e-mail. 😊</div>`;
                msgs.scrollTop = msgs.scrollHeight;
            }, 800);
            msgs.scrollTop = msgs.scrollHeight;
        }

        function voltarTopo() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function recarregar() {
  location.reload();
}
/* ════════════════════════════════
   PAINEL DO CLIENTE
════════════════════════════════ */
const BBS_USERS_KEY = 'bbs_usuarios';
const BBS_SESSION_KEY = 'bbs_sessao';

function _getUsers() { return JSON.parse(localStorage.getItem(BBS_USERS_KEY) || '{}'); }
function _saveUsers(u) { localStorage.setItem(BBS_USERS_KEY, JSON.stringify(u)); }
function _getSession() { return JSON.parse(sessionStorage.getItem(BBS_SESSION_KEY) || 'null'); }
function _saveSession(s) { sessionStorage.setItem(BBS_SESSION_KEY, JSON.stringify(s)); }

function togglePerfilPanel() {
    const sidebar = document.getElementById('perfil-sidebar');
    const overlay = document.getElementById('perfil-overlay');
    const open = sidebar.classList.toggle('open');
    overlay.style.display = open ? 'block' : 'none';
    if (open) _renderPerfilState();
}

function _iniciais(nome) {
    return (nome || '?').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
}

function _renderPerfilState() {
    const sessao = _getSession();
    const authArea = document.getElementById('perfil-auth-area');
    const logadoArea = document.getElementById('perfil-logado-area');
    const navLabel = document.getElementById('nav-conta-label');

    if (sessao) {
        authArea.style.display = 'none';
        logadoArea.classList.add('show');
        navLabel.textContent = sessao.nome.split(' ')[0];
        document.getElementById('ph-avatar').textContent = _iniciais(sessao.nome);
        document.getElementById('ph-nome').textContent = sessao.nome;
        document.getElementById('ph-email').textContent = sessao.email;
        _preencherDados();
        _renderEnderecos();
    } else {
        authArea.style.display = 'flex';
        logadoArea.classList.remove('show');
        navLabel.textContent = 'Entrar';
        document.getElementById('ph-avatar').textContent = '?';
        document.getElementById('ph-nome').textContent = 'Visitante';
        document.getElementById('ph-email').textContent = '';
    }
}

function perfilSwitchTab(tab) {
    document.querySelectorAll('.perfil-tab').forEach((b, i) => {
        b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'cadastro' && i === 1));
    });
    document.getElementById('pp-login').classList.toggle('active', tab === 'login');
    document.getElementById('pp-cadastro').classList.toggle('active', tab === 'cadastro');
}

function _ppAlert(id, msg, tipo) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = 'pp-alert ' + tipo;
    if (tipo === 'success') setTimeout(() => el.className = 'pp-alert', 3000);
}

/* LOGIN */
function ppLogin() {
    const email = document.getElementById('pp-login-email').value.trim();
    const senha = document.getElementById('pp-login-senha').value;
    const users = _getUsers();
    if (!email || !senha) return _ppAlert('pp-alert-login', 'Preencha todos os campos.', 'error');
    if (!users[email] || users[email].senha !== senha) return _ppAlert('pp-alert-login', 'E-mail ou senha incorretos.', 'error');
    _saveSession({ email, nome: users[email].nome });
    document.getElementById('pp-login-email').value = '';
    document.getElementById('pp-login-senha').value = '';
    _renderPerfilState();
}

/* CADASTRO */
function ppCadastrar() {
    const nome = document.getElementById('pp-cad-nome').value.trim();
    const email = document.getElementById('pp-cad-email').value.trim();
    const senha = document.getElementById('pp-cad-senha').value;
    const senha2 = document.getElementById('pp-cad-senha2').value;
    const users = _getUsers();
    if (!nome || !email || !senha) return _ppAlert('pp-alert-cad', 'Preencha todos os campos.', 'error');
    if (senha.length < 6) return _ppAlert('pp-alert-cad', 'Senha deve ter ao menos 6 caracteres.', 'error');
    if (senha !== senha2) return _ppAlert('pp-alert-cad', 'As senhas não coincidem.', 'error');
    if (users[email]) return _ppAlert('pp-alert-cad', 'E-mail já cadastrado.', 'error');
    users[email] = { nome, senha, telefone: '', cpf: '', enderecos: [] };
    _saveUsers(users);
    _saveSession({ email, nome });
    _renderPerfilState();
}

/* LOGOUT */
function ppLogout() {
    sessionStorage.removeItem(BBS_SESSION_KEY);
    _renderPerfilState();
}

/* NAVEGAÇÃO ENTRE SEÇÕES */
function perfilNavTo(secao) {
    document.querySelectorAll('.pnav').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.perfil-secao').forEach(s => s.classList.remove('active'));
    document.querySelector(`.pnav[onclick="perfilNavTo('${secao}')"]`).classList.add('active');
    document.getElementById('ps-' + secao).classList.add('active');
}

/* DADOS PESSOAIS */
function _preencherDados() {
    const sessao = _getSession();
    if (!sessao) return;
    const users = _getUsers();
    const u = users[sessao.email] || {};
    document.getElementById('ed-nome').value = u.nome || '';
    document.getElementById('ed-email').value = sessao.email;
    document.getElementById('ed-telefone').value = u.telefone || '';
    document.getElementById('ed-cpf').value = u.cpf || '';
}

function salvarDados() {
    const sessao = _getSession();
    if (!sessao) return;
    const users = _getUsers();
    const novoEmail = document.getElementById('ed-email').value.trim();
    const novoNome = document.getElementById('ed-nome').value.trim();
    if (!novoNome || !novoEmail) return _ppAlert('pp-alert-dados', 'Nome e e-mail são obrigatórios.', 'error');

    const dados = users[sessao.email];
    if (novoEmail !== sessao.email) {
        if (users[novoEmail]) return _ppAlert('pp-alert-dados', 'Este e-mail já está em uso.', 'error');
        users[novoEmail] = { ...dados, nome: novoNome };
        delete users[sessao.email];
        _saveSession({ email: novoEmail, nome: novoNome });
    } else {
        users[sessao.email].nome = novoNome;
    }
    users[novoEmail || sessao.email].telefone = document.getElementById('ed-telefone').value.trim();
    users[novoEmail || sessao.email].cpf = document.getElementById('ed-cpf').value.trim();
    _saveUsers(users);
    _renderPerfilState();
    _ppAlert('pp-alert-dados', 'Dados salvos com sucesso!', 'success');
}

/* ALTERAR SENHA */
function alterarSenha() {
    const sessao = _getSession();
    if (!sessao) return;
    const users = _getUsers();
    const atual = document.getElementById('senha-atual').value;
    const nova = document.getElementById('senha-nova').value;
    const nova2 = document.getElementById('senha-nova2').value;
    if (!atual || !nova) return _ppAlert('pp-alert-senha', 'Preencha todos os campos.', 'error');
    if (users[sessao.email].senha !== atual) return _ppAlert('pp-alert-senha', 'Senha atual incorreta.', 'error');
    if (nova.length < 6) return _ppAlert('pp-alert-senha', 'Nova senha deve ter ao menos 6 caracteres.', 'error');
    if (nova !== nova2) return _ppAlert('pp-alert-senha', 'As senhas não coincidem.', 'error');
    users[sessao.email].senha = nova;
    _saveUsers(users);
    document.getElementById('senha-atual').value = '';
    document.getElementById('senha-nova').value = '';
    document.getElementById('senha-nova2').value = '';
    _ppAlert('pp-alert-senha', 'Senha alterada com sucesso!', 'success');
}

/* ENDEREÇOS */
let editandoEndIdx = null;

function _renderEnderecos() {
    const sessao = _getSession();
    if (!sessao) return;
    const users = _getUsers();
    const ends = (users[sessao.email] || {}).enderecos || [];
    const lista = document.getElementById('lista-enderecos');
    if (!lista) return;
    if (ends.length === 0) {
        lista.innerHTML = '<p style="color:#666;font-size:0.85rem;margin-bottom:16px;">Nenhum endereço cadastrado.</p>';
        return;
    }
    lista.innerHTML = ends.map((e, i) => `
        <div class="end-card">
            <button class="end-card-del" onclick="deletarEndereco(${i})" title="Remover">✕</button>
            <p class="end-card-apelido">${e.apelido || 'Endereço ' + (i+1)}</p>
            <p class="end-card-texto">
                ${e.rua}, ${e.num}${e.comp ? ' – ' + e.comp : ''}<br>
                ${e.bairro} · ${e.cidade}/${e.uf}<br>
                CEP: ${e.cep}
            </p>
        </div>
    `).join('');
}

function toggleFormEndereco() {
    const f = document.getElementById('form-endereco');
    const visible = f.style.display !== 'none';
    f.style.display = visible ? 'none' : 'block';
    if (!visible) {
        ['end-cep','end-rua','end-num','end-comp','end-bairro','end-cidade','end-uf','end-apelido'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }
}

async function buscarCEP() {
    const cep = document.getElementById('end-cep').value.replace(/\D/g,'');
    if (cep.length !== 8) return _ppAlert('pp-alert-end', 'CEP inválido.', 'error');
    try {
        const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const d = await r.json();
        if (d.erro) return _ppAlert('pp-alert-end', 'CEP não encontrado.', 'error');
        document.getElementById('end-rua').value = d.logradouro || '';
        document.getElementById('end-bairro').value = d.bairro || '';
        document.getElementById('end-cidade').value = d.localidade || '';
        document.getElementById('end-uf').value = d.uf || '';
        document.getElementById('end-num').focus();
        document.getElementById('pp-alert-end').className = 'pp-alert';
    } catch(e) {
        _ppAlert('pp-alert-end', 'Erro ao buscar CEP.', 'error');
    }
}

function salvarEndereco() {
    const sessao = _getSession();
    if (!sessao) return;
    const cep = document.getElementById('end-cep').value.trim();
    const rua = document.getElementById('end-rua').value.trim();
    const num = document.getElementById('end-num').value.trim();
    const cidade = document.getElementById('end-cidade').value.trim();
    const uf = document.getElementById('end-uf').value.trim();
    if (!rua || !num || !cidade || !uf) return _ppAlert('pp-alert-end', 'Preencha os campos obrigatórios.', 'error');
    const users = _getUsers();
    if (!users[sessao.email].enderecos) users[sessao.email].enderecos = [];
    users[sessao.email].enderecos.push({
        cep, rua, num,
        comp: document.getElementById('end-comp').value.trim(),
        bairro: document.getElementById('end-bairro').value.trim(),
        cidade, uf,
        apelido: document.getElementById('end-apelido').value.trim() || 'Endereço'
    });
    _saveUsers(users);
    toggleFormEndereco();
    _renderEnderecos();
    _ppAlert('pp-alert-end', 'Endereço salvo!', 'success');
}

function deletarEndereco(idx) {
    const sessao = _getSession();
    if (!sessao) return;
    const users = _getUsers();
    users[sessao.email].enderecos.splice(idx, 1);
    _saveUsers(users);
    _renderEnderecos();
}

/* INIT */
window.addEventListener('DOMContentLoaded', () => {
    const sessao = _getSession();
    if (sessao) {
        const navLabel = document.getElementById('nav-conta-label');
        if (navLabel) navLabel.textContent = sessao.nome.split(' ')[0];
    }
});
        function irParaCheckout() {
            if (!cartOrder || cartOrder.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            localStorage.setItem('bbs_cart', JSON.stringify(cart));
            localStorage.setItem('bbs_cart_order', JSON.stringify(cartOrder));
            localStorage.setItem('bbs_frete', JSON.stringify(valorFreteGlobal || 0));
            const cep = document.getElementById('cep-cart')?.value || '';
            const freteInfo = document.getElementById('resultado-frete')?.innerText || '';
            localStorage.setItem('bbs_cep', cep);
            localStorage.setItem('bbs_frete_info', freteInfo);
            window.location.href = 'checkout.html';
        }

/* ════════════════════════════════════════
   SISTEMA DE BRINDES
════════════════════════════════════════ */
const BRINDES_TIERS = [
    { min: 0,    max: 299,   label: 'Adesivo BBS',                         id: 0 },
    { min: 299,  max: 799,   label: 'Adesivo + Chaveiro BBS',               id: 1 },
    { min: 799,  max: 1499,  label: 'Adesivo + Chaveiro + Mousepad',        id: 2 },
    { min: 1499, max: 2999,  label: 'Kit + Garrafa Térmica BBS 🍶',         id: 3 },
    { min: 2999, max: 99999, label: 'Kit Completo + Camiseta BBS 🎁',       id: 4 },
];

function calcSubtotalBrindes() {
    return (typeof cartOrder !== 'undefined' ? cartOrder : []).reduce((s, id) => {
        const item = (typeof cart !== 'undefined' ? cart : {})[id];
        return item ? s + item.price * item.qty : s;
    }, 0);
}

function atualizarBrindes() {
    const total = calcSubtotalBrindes();

    // ── Atualizar banner da página ──
    BRINDES_TIERS.forEach((tier, i) => {
        const el = document.getElementById(`btier-${i}`);
        const bl = document.getElementById(`bl-${i}`);
        const falta = document.getElementById(`falta-${i}`);
        if (!el) return;

        el.classList.remove('ativo', 'proximo');

        if (total >= tier.min) {
            el.classList.add('ativo');
            if (bl) bl.textContent = '✓ Brinde desbloqueado!';
        } else {
            const diff = tier.min - total;
            if (falta) falta.textContent = `R$ ${diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            if (i === BRINDES_TIERS.findIndex(t => total < t.min)) {
                el.classList.add('proximo');
            }
        }
    });

    // ── Atualizar bloco no carrinho ──
    const bcLabel  = document.getElementById('bc-label');
    const bcBar    = document.getElementById('bc-bar');
    const bcNext   = document.getElementById('bc-next');
    const bcGanhou = document.getElementById('bc-ganhou');
    const bcGTxt   = document.getElementById('bc-ganhou-txt');
    if (!bcLabel) return;

    // Tier atual e próximo
    let currentTier = null;
    let nextTier    = null;
    for (let i = BRINDES_TIERS.length - 1; i >= 0; i--) {
        if (total >= BRINDES_TIERS[i].min) { currentTier = BRINDES_TIERS[i]; break; }
    }
    for (let i = 0; i < BRINDES_TIERS.length; i++) {
        if (total < BRINDES_TIERS[i].min) { nextTier = BRINDES_TIERS[i]; break; }
    }

    if (total === 0) {
        bcLabel.textContent = 'Adicione produtos para ganhar brindes';
        if (bcBar) bcBar.style.width = '0%';
        if (bcNext) bcNext.innerHTML = '';
        if (bcGanhou) bcGanhou.style.display = 'none';
        return;
    }

    if (currentTier) {
        bcLabel.innerHTML = `Você ganhou: <strong>${currentTier.label}</strong>`;
        if (bcGanhou) { bcGanhou.style.display = 'flex'; if (bcGTxt) bcGTxt.textContent = currentTier.label; }
    }

    if (nextTier) {
        const diff     = nextTier.min - total;
        const rangeMin = currentTier ? currentTier.min : 0;
        const pct      = Math.min(((total - rangeMin) / (nextTier.min - rangeMin)) * 100, 100);
        if (bcBar) bcBar.style.width = pct + '%';
        if (bcNext) bcNext.innerHTML = `Faltam <strong>R$ ${diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> para ganhar: ${nextTier.label}`;
        if (bcGanhou) bcGanhou.style.display = currentTier ? 'flex' : 'none';
    } else {
        if (bcBar) bcBar.style.width = '100%';
        if (bcNext) bcNext.innerHTML = '🏆 Nível máximo de brindes desbloqueado!';
    }
}

// Hook no renderCart para atualizar brindes junto
const __origRenderCart = typeof renderCart === 'function' ? renderCart : null;
if (__origRenderCart) {
    renderCart = function() {
        __origRenderCart();
        atualizarBrindes();
    };
}

window.addEventListener('DOMContentLoaded', () => {
    atualizarBrindes();
});
