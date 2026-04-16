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

    function start() {
        animFill();
        timer = setInterval(() => goTo(current + 1), CAROUSEL_INTERVAL);
    }

    function stop() {
        clearInterval(timer);
        timer = null;
        images[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = 0;
        images[0].classList.add('active');
        dots[0].classList.add('active');
        fill.style.transition = 'none';
        fill.style.width = '0%';
    }

    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);
});


/* ── CARRINHO ── */
let cart = {};

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

function addToCart(id, name, price, img) {
    if (cart[id]) {
        cart[id].qty++;
    } else {
        cart[id] = { name, price, img, qty: 1 };
    }
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
            <img src="${item.img}">
            <div>
                <h4>${item.name}</h4>
                <p>R$ ${(item.price * item.qty).toLocaleString('pt-BR')}</p>
                <button onclick="changeQty(${id},-1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${id},1)">+</button>
            </div>
        </div>`;
    });

    list.innerHTML = html;
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

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}


/* ── FILTROS ── */
const marcasPorTipo = {
    gpu: ['nvidia', 'amd'],
    cpu: ['intel', 'amd'],
    ram: ['kingston', 'corsair'],
    ssd: ['kingston', 'samsung']
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
            select.innerHTML += `<option value="${m}">${m}</option>`;
        });
        select.disabled = false;
    } else {
        select.disabled = true;
    }

    filtrarProdutos();
}

function filtrarProdutos() {
    const busca = document.getElementById('busca').value.toLowerCase();

    document.querySelectorAll('.produto').forEach(p => {
        const nome = p.querySelector('h3').textContent.toLowerCase();
        p.style.display = nome.includes(busca) ? 'flex' : 'none';
    });
}

function limparFiltros() {
    document.getElementById('busca').value = '';
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
    msgs.innerHTML += `<div>${text}</div>`;
    input.value = '';
}


/* ── SCROLL TOPO ── */
function voltarTopo() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}