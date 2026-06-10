async function calcularFrete() {
    // ───────────────────────────────────────────────────────────────
    // ViaCEP (API externa) - cálculo de frete pelo CEP
    //
    // Observação importante:
    // Este código chama a ViaCEP só para validar/localizar o CEP.
    // O valor do frete aqui é fixo (15,90) em caso de CEP válido.
    // ───────────────────────────────────────────────────────────────

    // Referências aos elementos da tela
    const inputCep = document.getElementById('cep-cart');
    const displayResultado = document.getElementById('resultado-frete');
    const displayValorFrete = document.getElementById('valor-frete-display');

    // Normaliza o CEP removendo caracteres não numéricos.
    // Ex.: "12.345-678" vira "12345678"
    const cep = inputCep.value.replace(/\D/g, '');

    // Validação: ViaCEP espera CEP de 8 dígitos.
    if (cep.length !== 8) {
        displayResultado.innerText = "CEP inválido!";
        displayResultado.style.color = "#ff416c";
        return;
    }

    // Feedback visual enquanto faz a requisição externa.
    displayResultado.innerText = "Calculando...";
    displayResultado.style.color = "#888";

    try {
        // Chamada externa (rede): GET /ws/{cep}/json/
        const data = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();

        // Se a API retornar erro, tratamos como CEP não encontrado.
        if (data.erro) {
            displayResultado.innerText = "CEP não encontrado!";
            displayResultado.style.color = "#ff416c";
            return;
        }

        // Valor do frete (fixo) para este protótipo.
        valorFreteGlobal = 15.90;

        // Atualiza o display do valor do frete.
        displayValorFrete.innerText = valorFreteGlobal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Mostra informação retornada pela API (localidade/UF)
        displayResultado.innerText = `🚚 Entrega para ${data.localidade} - ${data.uf}`;
        displayResultado.style.color = "#4caf50";

        // Recalcula o total do carrinho usando o novo frete global.
        atualizarTotalCarrinho();
    } catch(e) {
        // Qualquer erro de rede/parse/timeout cai aqui.
        displayResultado.innerText = "Erro ao calcular frete.";
    }
}
function atualizarTotalCarrinho() {
    let subtotal = 0;
    Object.values(cart).forEach(item => subtotal += item.price * item.qty);
    document.getElementById('cart-total').innerText = (subtotal + valorFreteGlobal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
