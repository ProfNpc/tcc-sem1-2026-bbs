/* ── CARROSSEL DE CATEGORIAS ── */
        function scrollCat(btn, dir) {
            const row = btn.parentElement.querySelector('.categoria-row');
            row.scrollBy({ left: dir * 640, behavior: 'smooth' });
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

        function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('open'); }

        function addToCart(id, name, price, img) {
            if (cart[id]) { cart[id].qty++; } else { cart[id] = { name, price, img, qty: 1 }; }
            renderCart();
            document.getElementById('cart-sidebar').classList.add('open');
        }

        function changeQty(id, delta) {
            cart[id].qty += delta;
            if (cart[id].qty <= 0) delete cart[id];
            renderCart();
        }

        function renderCart() {
            const list = document.getElementById('cart-items');
            const count = document.getElementById('cart-count');
            const total = document.getElementById('cart-total');
            let html = '', totalVal = 0, totalQty = 0;

            Object.entries(cart).forEach(([id, item]) => {
                totalVal += item.price * item.qty;
                totalQty += item.qty;
                html += `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.name}">
            <div style="flex:1;">
                <h4>${item.name}</h4>
                <p>R$ ${(item.price * item.qty).toLocaleString('pt-BR')}</p>
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
            total.textContent = 'R$ ' + totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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
            gpu: ['nvidia', 'Amd'], cpu: ['Intel', 'Amd'],
            ram: ['Kingston', 'Corsair', 'Crucial'], ssd: ['Kingston', 'Samsung', 'wd']       ,       fonte: ['Corsair','Redragon','Thermaltake', 'Be Quiet!']

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
            const tipo = document.getElementById('fTipo').value;
            const marca = document.getElementById('fMarca').value;
            document.querySelectorAll('.produto').forEach(p => {
                const nome = p.querySelector('h3').textContent.toLowerCase();
                const desc = p.querySelector('p').textContent.toLowerCase();
                const ok = (!busca || nome.includes(busca) || desc.includes(busca))
                    && (!tipo || p.dataset.tipo === tipo)
                    && (!marca || p.dataset.marca === marca);
                p.style.display = ok ? 'flex' : 'none';
            });
            // Esconder seções sem produtos visíveis
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
