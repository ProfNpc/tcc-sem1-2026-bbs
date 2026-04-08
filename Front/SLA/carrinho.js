let valorFreteGlobal = 0;

async function calcularFrete() {
    const inputCep = document.getElementById('cep-cart');
    const displayResultado = document.getElementById('resultado-frete');
    const displayValorFrete = document.getElementById('valor-frete-display');
    const displayTotal = document.getElementById('cart-total');

    const cep = inputCep.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        displayResultado.innerText = "CEP inválido!";
        displayResultado.style.color = "#ff416c";
        return;
    }

    displayResultado.innerText = "Calculando...";
    displayResultado.style.color = "#888";

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            displayResultado.innerText = "CEP não encontrado!";
            displayResultado.style.color = "#ff416c";
            return;
        }

        const valorFrete = 15.90;

        // pega total atual
        let textoTotal = displayTotal.innerText.replace('R$', '').trim();
        textoTotal = textoTotal.replace(/\./g, '').replace(',', '.');

        let totalAtual = parseFloat(textoTotal) || 0;

        // remove frete antigo antes de somar o novo
        totalAtual = totalAtual - valorFreteGlobal;

        // atualiza frete global
        valorFreteGlobal = valorFrete;

        // soma corretamente (produtos + frete apenas 1x)
        const novoTotal = totalAtual + valorFreteGlobal;

        displayResultado.innerText = `🚚 Entrega para ${data.localidade} - ${data.uf}`;
        displayResultado.style.color = "#4caf50";

        displayValorFrete.innerText = valorFreteGlobal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        displayTotal.innerText = novoTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

    } catch (error) {
        displayResultado.innerText = "Erro ao calcular frete.";
        console.error(error);
    }
}