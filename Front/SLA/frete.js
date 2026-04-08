let valorFreteGlobal = 0; // Esta variável impede o frete de somar infinitamente

async function calcularFrete() {
    const inputCep = document.getElementById('cep-cart').value;
    const displayFrete = document.getElementById('valor-frete-display');
    const displayResultado = document.getElementById('resultado-frete');
    const displayTotal = document.getElementById('cart-total');

    if (inputCep.length < 8) {
        displayResultado.innerText = "CEP Inválido";
        return;
    }

    // Simulando o cálculo (Substitua pela sua lógica de API se tiver)
    // Aqui estou fixando 15.90 apenas para exemplo
    const valorCalculado = 15.90; 

    // AQUI ESTÁ O SEGREDO: 
    // Nós SUBSTITUÍMOS o valor global, nunca somamos (+=)
    valorFreteGlobal = valorCalculado;

    // Atualiza a interface
    displayFrete.innerText = `R$ ${valorFreteGlobal.toFixed(2).replace('.', ',')}`;
    displayResultado.innerText = "Frete calculado com sucesso!";
    
    // Chama a função que atualiza o TOTAL GERAL do carrinho
    atualizarTotalCarrinho();
}
function atualizarTotalCarrinho() {
    let subtotalProdutos = 0;

    // 1. Soma apenas o valor dos produtos que estão no array do carrinho
    // (Certifique-se que o nome da sua variável de itens seja 'cart')
    cart.forEach(item => {
        subtotalProdutos += item.price * item.quantity;
    });

    // 2. O Total é a soma LIMPA: Produtos + Frete Global
    const totalGeral = subtotalProdutos + valorFreteGlobal;

    // 3. Exibe no HTML
    document.getElementById('cart-total').innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}