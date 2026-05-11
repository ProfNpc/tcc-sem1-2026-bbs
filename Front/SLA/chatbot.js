// ── BBS CHATBOT ──
const menuPrincipal = ["🎮 Produtos", "💳 Pagamento", "🚚 Entrega e Frete", "🔧 Suporte Técnico", "📦 Meu Pedido"];

const respostas = {

    "🎮 Produtos": {
        texto: "Qual categoria você quer conhecer?",
        opcoes: ["Placas de Vídeo", "Processadores", "Memória e SSD", "Periféricos", "← Voltar"]
    },
    "Placas de Vídeo": {
        texto: "Temos GPUs para todos os bolsos:\n\n• RTX 3060 – R$ 2.199 (1080p perfeito)\n• RTX 4060 – R$ 1.899 (custo-benefício)\n• RTX 4070 SUPER – R$ 4.499 (1440p top)\n• RTX 4090 – R$ 11.999 (4K sem limites)\n• RX 7600 – R$ 1.699 (AMD excelente)\n\nQuer uma recomendação pelo seu budget?",
        opcoes: ["Budget até R$2.000", "Budget até R$5.000", "Melhor da linha", "← Voltar"]
    },
    "Processadores": {
        texto: "Nossa linha de CPUs:\n\n• i3-14100F – R$ 699 (entrada Intel)\n• Ryzen 5 5600 – R$ 699 (custo-benefício AMD)\n• i5-12600K – R$ 1.199 (mid-range Intel)\n• Ryzen 7 7700X – R$ 1.799 (AM5 top)\n• i7-13700K – R$ 2.499 (high-end Intel)\n\nPosso ajudar a montar um PC completo!",
        opcoes: ["Montar PC Gamer", "← Voltar"]
    },
    "Memória e SSD": {
        texto: "Storage e RAM disponíveis:\n\n🧠 RAM DDR4:\n• Kingston Fury 16GB – R$ 279\n• Corsair Vengeance 16GB – R$ 299\n• Crucial Pro 32GB – R$ 399\n\n🧠 RAM DDR5:\n• Kingston Fury 32GB DDR5 – R$ 699\n\n💾 SSDs NVMe:\n• Kingston NV2 1TB – R$ 289\n• Kingston NV3 1TB – R$ 329\n• Samsung 970 EVO Plus 1TB – R$ 399\n• WD Black SN850X 1TB – R$ 499",
        opcoes: ["← Voltar"]
    },
    "Periféricos": {
        texto: "Temos toda a setup completa:\n\n🖥️ Monitores: de R$ 799 a R$ 2.499\n🖱️ Mouses: de R$ 199 a R$ 499\n⌨️ Teclados: de R$ 249 a R$ 999\n🎧 Headsets: de R$ 399 a R$ 799\n🎯 Mousepads: de R$ 129 a R$ 249",
        opcoes: ["← Voltar"]
    },
    "Budget até R$2.000": {
        texto: "Para até R$2.000, recomendo:\n\n🏆 RTX 4060 8GB – R$ 1.899\nÓtima para 1080p em alto, 1440p em médio. DLSS 3 incluso. Excelente custo-benefício da geração atual!",
        opcoes: ["← Menu de GPUs", "← Menu Principal"]
    },
    "Budget até R$5.000": {
        texto: "Para até R$5.000, recomendo:\n\n🏆 RTX 4070 SUPER 12GB – R$ 4.499\n1440p em ultra com Ray Tracing, 4K em alto. DLSS 3.5 com Ray Reconstruction. A melhor da mid-high range!",
        opcoes: ["← Menu de GPUs", "← Menu Principal"]
    },
    "Melhor da linha": {
        texto: "O topo absoluto:\n\n👑 RTX 4090 24GB – R$ 11.999\n4K em ultra em qualquer jogo. Ideal para criação de conteúdo e streaming simultâneos. Performance sem rival.",
        opcoes: ["← Menu de GPUs", "← Menu Principal"]
    },
    "Montar PC Gamer": {
        texto: "Posso te ajudar a montar! Me conta:\n\n💰 Qual é o seu orçamento total?\n🎯 Vai usar mais para jogos, trabalho ou ambos?\n\nEntre em contato pelo nosso WhatsApp para uma consultoria personalizada! 👇",
        opcoes: ["📱 WhatsApp", "← Voltar"]
    },

    "💳 Pagamento": {
        texto: "Formas de pagamento aceitas:\n\n💚 PIX — 10% de desconto à vista!\n💳 Cartão de Crédito — até 12x sem juros\n🎫 Boleto Bancário — 7% de desconto\n💰 Débito — 5% de desconto\n\nO parcelamento no cartão é calculado no checkout.",
        opcoes: ["← Menu Principal"]
    },

    "🚚 Entrega e Frete": {
        texto: "Informações de entrega:\n\n📦 Calculamos o frete pelo CEP no carrinho\n🚀 Envio Expresso: 1-3 dias úteis\n📬 Envio Padrão: 3-7 dias úteis\n🆓 Frete grátis acima de R$ 500 para SP capital\n\nPedidos confirmados até 14h saem no mesmo dia!",
        opcoes: ["← Menu Principal"]
    },

    "🔧 Suporte Técnico": {
        texto: "Precisa de ajuda técnica? Estou aqui!\n\nPosso ajudar com:\n• Compatibilidade de peças\n• Montagem e instalação\n• Problemas pós-compra\n• Garantia e trocas",
        opcoes: ["Compatibilidade de Peças", "Garantia e Trocas", "📱 WhatsApp", "← Menu Principal"]
    },
    "Compatibilidade de Peças": {
        texto: "Para verificar compatibilidade:\n\n✅ Socket do processador deve bater com a placa mãe\n✅ Verifique DDR4 ou DDR5 na placa mãe\n✅ Fontes: RTX 4070+ requer mínimo 650W\n✅ Gabinete: verifique tamanho ATX/mATX\n\nDúvida específica? Chame no WhatsApp! 👇",
        opcoes: ["📱 WhatsApp", "← Voltar Suporte"]
    },
    "Garantia e Trocas": {
        texto: "Nossa política de garantia:\n\n🔒 Garantia mínima de 12 meses em todos os produtos\n📋 Alguns itens têm garantia estendida do fabricante\n🔄 Troca em até 7 dias por defeito de fabricação\n📦 Produto deve estar na embalagem original\n\nContate nosso suporte pelo WhatsApp para abrir chamado.",
        opcoes: ["📱 WhatsApp", "← Menu Principal"]
    },

    "📦 Meu Pedido": {
        texto: "Para consultar seu pedido:\n\n👤 Acesse Minha Conta no menu superior\n📧 Você recebeu um e-mail de confirmação\n📱 Ou entre em contato pelo WhatsApp com o número do pedido\n\nSeu pedido ainda não chegou? Prazo médio é de 3-7 dias úteis.",
        opcoes: ["📱 WhatsApp", "← Menu Principal"]
    },

    "📱 WhatsApp": {
        texto: "Nosso time de especialistas está pronto para te atender! 🚀\n\nClique abaixo para abrir o WhatsApp direto:",
        opcoes: ["Abrir WhatsApp", "← Menu Principal"],
        acao: "whatsapp"
    },

    "Abrir WhatsApp": { acao: "abrirWhatsapp" },
    "← Voltar": { acao: "menuPrincipal" },
    "← Menu Principal": { acao: "menuPrincipal" },
    "← Menu de GPUs": { acao: "gpuMenu" },
    "← Voltar Suporte": { acao: "suporteMenu" },
};

function toggleAIChat() {
    const chat = document.getElementById('ai-chat-container');
    const aberto = chat.style.display === 'flex';
    chat.style.display = aberto ? 'none' : 'flex';
    if (!aberto && document.getElementById('ai-messages').children.length === 0) {
        setTimeout(mostrarMenuPrincipal, 300);
    }
}

function mostrarMenuPrincipal() {
    adicionarMensagemBot("Olá! Sou o assistente da **Bits Bytes Store** 🖥️\nComo posso te ajudar hoje?", menuPrincipal);
}

function selecionarOpcao(opcao) {
    adicionarMensagem(opcao, 'user');

    // Ações especiais
    if (opcao === "← Voltar" || opcao === "← Menu Principal") {
        setTimeout(mostrarMenuPrincipal, 400); return;
    }
    if (opcao === "← Menu de GPUs") {
        setTimeout(() => processarResposta("Placas de Vídeo"), 400); return;
    }
    if (opcao === "← Voltar Suporte") {
        setTimeout(() => processarResposta("🔧 Suporte Técnico"), 400); return;
    }
    if (opcao === "Abrir WhatsApp" || opcao === "📱 WhatsApp") {
        setTimeout(() => {
            window.open('https://wa.me/5511999999999?text=Olá! Vim pelo site da BBS e preciso de ajuda.', '_blank');
            adicionarMensagemBot("WhatsApp aberto! Nosso time responde em até 5 minutos em horário comercial. 😊", ["← Menu Principal"]);
        }, 400); return;
    }

    setTimeout(() => processarResposta(opcao), 500);
}

function processarResposta(opcao) {
    const r = respostas[opcao];
    if (!r) {
        adicionarMensagemBot("Não entendi. Veja as opções disponíveis:", menuPrincipal);
        return;
    }
    if (r.acao === "menuPrincipal") { mostrarMenuPrincipal(); return; }
    if (r.acao === "abrirWhatsapp") { window.open('https://wa.me/5511999999999', '_blank'); return; }
    adicionarMensagemBot(r.texto, r.opcoes || ["← Menu Principal"]);
}

function adicionarMensagemBot(texto, opcoes = []) {
    const msgArea = document.getElementById('ai-messages');

    const divBot = document.createElement('div');
    divBot.className = 'msg bot';
    // Suporte básico a negrito com **
    divBot.innerHTML = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    msgArea.appendChild(divBot);

    if (opcoes.length > 0) {
        const c = document.createElement('div');
        c.className = 'chat-options';
        opcoes.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = opt;
            btn.onclick = () => selecionarOpcao(opt);
            c.appendChild(btn);
        });
        msgArea.appendChild(c);
    }

    msgArea.scrollTop = msgArea.scrollHeight;
}

function adicionarMensagem(texto, tipo) {
    const msgArea = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = 'msg ' + tipo;
    div.innerText = texto;
    msgArea.appendChild(div);
    msgArea.scrollTop = msgArea.scrollHeight;
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') sendAIMessage && sendAIMessage();
}
