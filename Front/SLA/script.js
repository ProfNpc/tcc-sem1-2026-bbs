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

            list.innerHTML = html || `<div class="cart-empty">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1.2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p>Seu carrinho está vazio</p>
                <span>Adicione produtos para começar<br>a montar seu setup!</span>
                <button onclick="toggleCart()" class="cart-empty-cta">Explorar Produtos</button>
            </div>`;
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
            gpu:       ['Nvidia', 'AMD'],
            cpu:       ['Intel', 'AMD', 'Ryzen'],
            ram:       ['Kingston', 'Corsair', 'Crucial'],
            ssd:       ['Kingston', 'Samsung', 'WD'],
            fonte:     ['Corsair', 'Redragon', 'Thermaltake', 'Be Quiet!'],
            cooler:    ['Cooler Master', 'NZXT', 'Be Quiet!'],
            gabinete:  ['Corsair', 'NZXT', 'Lian Li'],
            monitor:   ['LG', 'Samsung', 'Acer', 'Asus'],
            mouse:     ['Logitech', 'Redragon', 'Razer'],
            teclado:   ['Logitech', 'HyperX', 'Redragon', 'Razer'],
            headset:   ['HyperX', 'Logitech', 'Razer'],
            mousepad:  ['Redragon', 'HyperX', 'SteelSeries'],
            periferico:['Logitech', 'Redragon', 'HyperX'],
        };

        let _filtroCat   = '';
        let _filtroMarca = '';

        function toggleFiltros() {
            const p = document.getElementById('painelFiltros');
            const aberto = p.classList.toggle('visible');
            const btn = document.querySelector('.btn-filtro-master');
            if (btn) btn.classList.toggle('active', aberto);
        }

        function selectCatChip(el, val) {
            _filtroCat   = val;
            _filtroMarca = '';
            document.querySelectorAll('#cat-chips .fchip').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            renderMarcaChips(val);
            filtrarProdutos();
        }

        function selectMarcaChip(el, val) {
            _filtroMarca = (_filtroMarca === val) ? '' : val; // toggle
            document.querySelectorAll('#marca-chips .fchip').forEach(c => c.classList.remove('active'));
            if (_filtroMarca) el.classList.add('active');
            filtrarProdutos();
        }

        function renderMarcaChips(tipo) {
            const wrap  = document.getElementById('marca-filter-wrap');
            const chips = document.getElementById('marca-chips');
            const marcas = marcasPorTipo[tipo];
            if (!tipo || !marcas) { wrap.style.display = 'none'; chips.innerHTML = ''; return; }
            wrap.style.display = 'block';
            chips.innerHTML = marcas.map(m =>
                `<button class="fchip" data-val="${m.toLowerCase()}" onclick="selectMarcaChip(this,'${m.toLowerCase()}')">
                    ${m}
                </button>`
            ).join('');
        }

        function filtrarProdutos() {
            const busca    = (document.getElementById('busca')?.value || '').toLowerCase();
            const precoMin = parseFloat(document.getElementById('fPrecoMin')?.value) || 0;
            const precoMax = parseFloat(document.getElementById('fPrecoMax')?.value) || Infinity;

            let totalVisiveis = 0;
            document.querySelectorAll('.produto').forEach(p => {
                const nome   = p.querySelector('h3').textContent.toLowerCase();
                const desc   = p.querySelector('p').textContent.toLowerCase();
                const pMarca = (p.dataset.marca || '').toLowerCase();
                const periSubtipos = ['monitor','mouse','teclado','mousepad','headset','webcam'];
                const tipoMatch = !_filtroCat
                    || p.dataset.tipo === _filtroCat
                    || p.dataset.subtipo === _filtroCat
                    || (_filtroCat === 'periferico' && p.dataset.tipo === 'periferico')
                    || (periSubtipos.includes(_filtroCat) && p.dataset.subtipo === _filtroCat);
                const marcaMatch = !_filtroMarca || pMarca === _filtroMarca || pMarca.includes(_filtroMarca);

                // preço
                const precoEl = p.querySelector('.preco');
                const precoNum = precoEl ? parseFloat(precoEl.textContent.replace(/[^\d,]/g,'').replace(',','.')) : 0;
                const precoMatch = precoNum >= precoMin && precoNum <= precoMax;

                const ok = (!busca || nome.includes(busca) || desc.includes(busca))
                    && tipoMatch && marcaMatch && precoMatch;
                p.style.display = ok ? 'flex' : 'none';
                if (ok) totalVisiveis++;
            });

            document.querySelectorAll('.categoria-secao').forEach(sec => {
                const visivel = [...sec.querySelectorAll('.produto')].some(p => p.style.display !== 'none');
                sec.style.display = visivel ? '' : 'none';
            });

            // atualizar badge de resultados
            const infoEl = document.getElementById('filter-active-info');
            const countEl = document.getElementById('filter-result-count');
            const filtroAtivo = _filtroCat || _filtroMarca || busca || precoMin || precoMax < Infinity;
            if (infoEl) infoEl.style.display = filtroAtivo ? 'flex' : 'none';
            if (countEl) countEl.textContent = `${totalVisiveis} produto(s) encontrado(s)`;
        }

        function limparFiltros() {
            _filtroCat = ''; _filtroMarca = '';
            document.querySelectorAll('#cat-chips .fchip').forEach((c,i) => c.classList.toggle('active', i===0));
            document.getElementById('marca-filter-wrap').style.display = 'none';
            document.getElementById('marca-chips').innerHTML = '';
            const busca = document.getElementById('busca');
            if (busca) busca.value = '';
            const min = document.getElementById('fPrecoMin');
            const max = document.getElementById('fPrecoMax');
            if (min) min.value = '';
            if (max) max.value = '';
            document.querySelectorAll('.categoria-secao').forEach(sec => sec.style.display = '');
            filtrarProdutos();
        }

        // compatibilidade legacy (atualizarSubFiltros era chamado pelo select antigo)
        function atualizarSubFiltros() { filtrarProdutos(); }
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
    // ───────────────────────────────────────────────────────────────
    // ViaCEP (API externa) - busca dados de endereço pelo CEP
    //
    // Fluxo:
    // 1) Lê o valor do input #end-cep e remove tudo que não for dígito
    //    (ex.: "12345-678" vira "12345678").
    // 2) Valida se o CEP tem exatamente 8 dígitos.
    // 3) Faz uma requisição HTTP GET para a API pública do ViaCEP:
    //      https://viacep.com.br/ws/{cep}/json/
    // 4) Converte a resposta para JSON (d) e verifica d.erro.
    // 5) Preenche os campos do formulário com os dados retornados:
    //    - logradouro -> #end-rua
    //    - bairro     -> #end-bairro
    //    - localidade -> #end-cidade
    //    - uf         -> #end-uf
    // 6) Foca no campo #end-num (para o usuário completar o número).
    // ───────────────────────────────────────────────────────────────

    const cep = document.getElementById('end-cep').value.replace(/\D/g,'');

    // ViaCEP espera CEP com 8 dígitos; se não tiver, já mostramos erro local.
    if (cep.length !== 8) return _ppAlert('pp-alert-end', 'CEP inválido.', 'error');

    try {
        // Chamada externa (rede): busca o endereço correspondente ao CEP.
        // `fetch` retorna uma Promise com a resposta HTTP.
        const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        // Converte a resposta HTTP em objeto JavaScript via JSON.
        const d = await r.json();

        // A API retorna { erro: true } quando não encontra o CEP.
        if (d.erro) return _ppAlert('pp-alert-end', 'CEP não encontrado.', 'error');

        // Preenche automaticamente os inputs do endereço com valores vindos da API.
        // Usamos `|| ''` para evitar que campos fiquem com `undefined`.
        document.getElementById('end-rua').value = d.logradouro || '';
        document.getElementById('end-bairro').value = d.bairro || '';
        document.getElementById('end-cidade').value = d.localidade || '';
        document.getElementById('end-uf').value = d.uf || '';

        // Após preencher, direciona o usuário para o campo de número.
        document.getElementById('end-num').focus();

        // Garante que a mensagem/alerta (pp-alert-end) esteja visível.
        document.getElementById('pp-alert-end').className = 'pp-alert';
    } catch(e) {
        // Qualquer erro de rede/parse cai aqui.
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

/* ════════════════════════════════════
   ANNOUNCEMENT BAR
════════════════════════════════════ */
let annIdx = 0;
const annMsgs = document.querySelectorAll?.('#ann-track span') || [];
function annSlide(dir) {
    const track = document.getElementById('ann-track');
    if (!track) return;
    const total = track.children.length;
    annIdx = (annIdx + dir + total) % total;
    track.style.transform = `translateX(-${annIdx * 100}%)`;
}
setInterval(() => annSlide(1), 4000);

/* ════════════════════════════════════
   HAMBURGER MENU
════════════════════════════════════ */
function toggleMobileMenu() {
    const nav = document.querySelector('header nav');
    const btn = document.getElementById('hamburger');
    nav?.classList.toggle('open');
    btn?.classList.toggle('open');
}
document.addEventListener('click', e => {
    const nav = document.querySelector('header nav');
    const btn = document.getElementById('hamburger');
    if (nav?.classList.contains('open') && !nav.contains(e.target) && !btn?.contains(e.target)) {
        nav.classList.remove('open');
        btn?.classList.remove('open');
    }
});

/* ════════════════════════════════════
   SEARCH AUTOCOMPLETE
════════════════════════════════════ */
function searchSuggest(query) {
    const box = document.getElementById('search-suggest');
    if (!box) return;
    const q = query.trim().toLowerCase();
    if (q.length < 2) { box.style.display = 'none'; return; }

    const produtos = [...document.querySelectorAll('.produto')];
    const matches = produtos.filter(p => {
        const nome = p.querySelector('h3')?.textContent.toLowerCase() || '';
        const marca = (p.dataset.marca || '').toLowerCase();
        return nome.includes(q) || marca.includes(q);
    }).slice(0, 6);

    if (!matches.length) {
        box.innerHTML = '<p class="suggest-empty">Nenhum produto encontrado</p>';
        box.style.display = 'block'; return;
    }

    box.innerHTML = matches.map(p => {
        const nome  = p.querySelector('h3').textContent;
        const preco = p.querySelector('.preco').textContent;
        const img   = p.querySelector('img')?.src || '';
        const tipo  = p.dataset.tipo || '';
        const id    = p.dataset.id;
        return `<div class="suggest-item" onclick="goToProduct(${id})">
            <img src="${img}" alt="${nome}" loading="lazy">
            <div class="suggest-item-info">
                <p class="suggest-item-cat">${tipo}</p>
                <p class="suggest-item-name">${nome}</p>
                <p class="suggest-item-price">${preco}</p>
            </div>
        </div>`;
    }).join('');
    box.style.display = 'block';
}

function goToProduct(id) {
    document.getElementById('search-suggest').style.display = 'none';
    document.getElementById('busca').value = '';
    filtrarProdutos();
    const el = document.querySelector(`.produto[data-id="${id}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = '2px solid #ff416c';
        el.style.outlineOffset = '4px';
        setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 1800);
    }
}

document.addEventListener('click', e => {
    if (!e.target.closest('#busca') && !e.target.closest('.search-suggest-box')) {
        document.getElementById('search-suggest')?.style && (document.getElementById('search-suggest').style.display = 'none');
    }
});

/* ════════════════════════════════════
   KEYBOARD SHORTCUTS
════════════════════════════════════ */
document.addEventListener('keydown', e => {
    // ESC fecha tudo
    if (e.key === 'Escape') {
        document.getElementById('modal')?.style && (document.getElementById('modal').style.display = 'none');
        document.getElementById('cart-sidebar')?.classList.remove('open');
        document.getElementById('perfil-sidebar')?.classList.remove('open');
        document.getElementById('perfil-overlay') && (document.getElementById('perfil-overlay').style.display = 'none');
        document.getElementById('search-suggest') && (document.getElementById('search-suggest').style.display = 'none');
        document.getElementById('compare-modal')?.classList.remove('open');
        document.body.style.overflow = '';
    }
    // / ou Ctrl+K foca na busca
    if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const busca = document.getElementById('busca');
        if (busca) { busca.focus(); busca.select(); busca.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
});

/* ════════════════════════════════════
   NEWSLETTER
════════════════════════════════════ */
function assinarNewsletter() {
    const email = document.getElementById('nl-email')?.value.trim();
    const msg   = document.getElementById('nl-msg');
    if (!msg) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = '⚠️ Informe um e-mail válido.';
        msg.style.color = '#ff8fa0';
        return;
    }
    const subs = JSON.parse(localStorage.getItem('bbs_newsletter') || '[]');
    if (subs.includes(email)) {
        msg.textContent = '✓ Este e-mail já está cadastrado!';
        msg.style.color = '#f5a623';
        return;
    }
    subs.push(email);
    localStorage.setItem('bbs_newsletter', JSON.stringify(subs));
    document.getElementById('nl-email').value = '';
    msg.textContent = '🎉 Cadastrado com sucesso! Boas ofertas chegando.';
    msg.style.color = '#00e07a';
    setTimeout(() => { msg.textContent = ''; }, 5000);
}

/* ════════════════════════════════════
   SHARE PRODUCT
════════════════════════════════════ */
function compartilharProduto() {
    const nome  = document.getElementById('modal-title')?.textContent;
    const preco = _modalCurrentPrice ? `R$ ${_modalCurrentPrice.toLocaleString('pt-BR')}` : '';
    const texto = `🖥️ Confira o ${nome} por ${preco} na Bits Bytes Store!\n${window.location.href}#produto-${_modalCurrentId}`;
    if (navigator.share) {
        navigator.share({ title: nome, text: texto, url: window.location.href });
    } else {
        navigator.clipboard.writeText(texto).then(() => {
            const btn = document.querySelector('.btn-modal-share');
            if (btn) {
                btn.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
                btn.style.color = '#00e07a';
                setTimeout(() => {
                    btn.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
                    btn.style.color = '';
                }, 2000);
            }
        });
    }
}

/* ── LIMPAR BUSCA ── */
function limparBusca() {
    const input = document.getElementById('busca');
    const clear = document.getElementById('busca-clear');
    const box   = document.getElementById('search-suggest');
    if (input) input.value = '';
    if (clear) clear.style.display = 'none';
    if (box)   box.style.display   = 'none';
    filtrarProdutos();
    input?.focus();
}

// Show/hide clear button as user types
const _origSearchSuggest = window.searchSuggest;
window.searchSuggest = function(query) {
    const clear = document.getElementById('busca-clear');
    if (clear) clear.style.display = query.length > 0 ? 'block' : 'none';
    if (_origSearchSuggest) _origSearchSuggest(query);
    else {
        // fallback inline
        const box = document.getElementById('search-suggest');
        if (!box) return;
        const q = query.trim().toLowerCase();
        if (q.length < 2) { box.style.display = 'none'; return; }
        const matches = [...document.querySelectorAll('.produto')].filter(p => {
            const nome = (p.querySelector('h3')?.textContent || '').toLowerCase();
            const marca = (p.dataset.marca || '').toLowerCase();
            return nome.includes(q) || marca.includes(q);
        }).slice(0, 6);
        if (!matches.length) {
            box.innerHTML = '<p class="suggest-empty">Nenhum produto encontrado</p>';
            box.style.display = 'block'; return;
        }
        box.innerHTML = matches.map(p => {
            const nome  = p.querySelector('h3').textContent;
            const preco = p.querySelector('.preco').textContent;
            const img   = p.querySelector('img')?.src || '';
            const tipo  = p.dataset.tipo || '';
            const id    = p.dataset.id;
            return `<div class="suggest-item" onclick="goToProduct(${id})">
                <img src="${img}" alt="${nome}" loading="lazy">
                <div class="suggest-item-info">
                    <p class="suggest-item-cat">${tipo}</p>
                    <p class="suggest-item-name">${nome}</p>
                    <p class="suggest-item-price">${preco}</p>
                </div>
            </div>`;
        }).join('');
        box.style.display = 'block';
    }
};
