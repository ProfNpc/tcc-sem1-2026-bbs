const respostasBase = {
    "Placas de Vídeo": "Temos RTX 3060, 4060 e a linha RX da AMD. Qual série te interessa?",
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
    // Removido "Calcular Frete" da lista abaixo
    const opcoes = ["Placas de Vídeo", "Formas de Pagamento", "Status do Pedido"];
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
    const msgArea = document.getElementById('ai-messages)