const respostasBase = {
    "Placas de Vídeo": "Temos RTX 3060, 4060 e a linha RX da AMD. Qual série te interessa?",
    "Calcular Frete": "O frete é calculado direto no seu carrinho (Meu Setup). Entregamos em todo o Brasil!",
    "Formas de Pagamento": "Aceitamos PIX com 10% de desconto ou cartão em até 12x sem juros.",
    "Status do Pedido": "Para ver seu pedido, entre na área 'Minha Conta' ou chame no WhatsApp."
};

function toggleAIChat() {
    const chat = document.getElementById('ai-chat-container');
    if (chat.style.display === 'flex') {
        chat.style.display = 'none';
    } else {
        chat.style.display = 'flex';
        // Se o chat estiver vazio, mostra o menu inicial
        if (document.getElementById('ai-messages').children.length <= 1) {
            mostrarOpcoesIniciais();
        }
    }
}

function mostrarOpcoesIniciais() {
    const texto = "Olá! Como posso te ajudar hoje? Escolha uma opção:";
    const opcoes = ["Placas de Vídeo", "Calcular Frete", "Formas de Pagamento"];
    adicionarMensagemBot(texto, opcoes);
}

function selecionarOpcao(textoOpcao) {
    // 1. Mostra a escolha do usuário
    adicionarMensagem(textoOpcao, 'user');
    
    // 2. Resposta do Bot
    setTimeout(() => {
        const resposta = respostasBase[textoOpcao] || "Vou te encaminhar para um especialista.";
        adicionarMensagemBot(resposta, ["Voltar ao Menu"]);
    }, 600);
}

function adicionarMensagemBot(texto, opcoes = []) {
    const msgArea = document.getElementById('ai-messages');
    
    // Balão de texto do Bot
    const divBot = document.createElement('div');
    divBot.className = 'msg bot';
    divBot.innerText = texto;
    msgArea.appendChild(divBot);

    // Se tiver opções, cria os botões
    if (opcoes.length > 0) {
        const containerOpcoes = document.createElement('div');
        containerOpcoes.className = 'chat-options';
        
        opcoes.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = opt;
            btn.onclick = () => {
                if (opt === "Voltar ao Menu") {
                    mostrarOpcoesIniciais();
                } else {
                    selecionarOpcao(opt);
                }
            };
            containerOpcoes.appendChild(btn);
        });
        msgArea.appendChild(containerOpcoes);
    }
    
    msgArea.scrollTop = msgArea.scrollHeight;
}

function adicionarMensagem(texto, tipo) {
    const msgArea = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = `msg ${tipo}`;
    div.innerText = texto;
    msgArea.appendChild(div);
    msgArea.scrollTop = msgArea.scrollHeight;
}// Dentro do js/chatbot.js

async function validarCepChat() {
    const input = document.getElementById('cep-input-chat');
    const msgArea = document.getElementById('ai-messages');
    
    // Chama a função que está lá no outro arquivo (frete.js)
    const resultado = await calcularValorFrete(input.value);

    if (!resultado.sucesso) {
        adicionarMensagemBot("Ops! " + resultado.msg, ["Tentar novamente"]);
        return;
    }

    adicionarMensagem(input.value, 'user');
    
    const respostaBot = `Ótima notícia! O frete para ${resultado.cidade}-${resultado.uf} fica em R$ ${resultado.valor.replace('.',',')} com entrega em ${resultado.prazo} dias.`;
    
    adicionarMensagemBot(respostaBot, ["Comprar agora", "Voltar ao Menu"]);
}