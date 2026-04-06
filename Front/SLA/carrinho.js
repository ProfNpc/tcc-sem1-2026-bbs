// js/carrinho.js

async function calcularFrete() {
    // 1. Mapeia os elementos do seu HTML
    const inputCep = document.getElementById('cep-cart');
    const displayResultado = document.getElementById('resultado-frete');
    const displayValorFrete = document.getElementById('valor-frete-display');
    const displayTotal = document.getElementById('cart-total');

    // 2. Limpa o CEP (deixa só números)
    const cep = inputCep.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        displayResultado.innerText = "CEP inválido!";
        displayResultado.style.color = "#ff416c";
        return;
    }

    displayResultado.innerText = "Calculando...";
    displayResultado.style.color = "#888";

    try {
        // 3. Busca o endereço na API
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            displayResultado.innerText = "CEP não encontrado!";
            displayResultado.style.color = "#ff416c";
            return;
        }

        // --- LÓGICA DE SOMA ---
        
        // 4. Define o valor do frete (ex: 15.90)
        const valorFrete = 15.90; 

        // 5. Pega o Total que já está na tela e transforma em número
        // Remove "R$", pontos de milhar e troca a vírgula por ponto decimal
        let textoTotalCripto = displayTotal.innerText.replace('R$', '').trim();
        textoTotalCripto = textoTotalCripto.replace(/\./g, '').replace(',', '.');
        
        const subtotalProdutos = parseFloat(textoTotalCripto) || 0;

        // 6. Soma tudo
        const novoTotal = subtotalProdutos + valorFrete;

        // 7. Devolve os valores formatados para o HTML
        displayResultado.innerText = `🚚 Entrega para ${data.localidade} - ${data.uf}`;
        displayResultado.style.color = "#4caf50";

        // Formata para o padrão de moeda brasileiro (R$ 0,00)
        displayValorFrete.innerText = valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        displayTotal.innerText = novoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    } catch (error) {
        displayResultado.innerText = "Erro ao calcular frete.";
        console.error(error);
    }
}