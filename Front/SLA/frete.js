async function calcularFrete() {
    const inputCep = document.getElementById('cep-cart');
    const displayResultado = document.getElementById('resultado-frete');
    const displayValorFrete = document.getElementById('valor-frete-display');
    const cep = inputCep.value.replace(/\D/g, '');
    if (cep.length !== 8) { displayResultado.innerText = "CEP inválido!"; displayResultado.style.color = "#ff416c"; return; }
    displayResultado.innerText = "Calculando..."; displayResultado.style.color = "#888";
    try {
        const data = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
        if (data.erro) { displayResultado.innerText = "CEP não encontrado!"; displayResultado.style.color = "#ff416c"; return; }
        valorFreteGlobal = 15.90;
        displayValorFrete.innerText = valorFreteGlobal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        displayResultado.innerText = `🚚 Entrega para ${data.localidade} - ${data.uf}`;
        displayResultado.style.color = "#4caf50";
        atualizarTotalCarrinho();
    } catch(e) { displayResultado.innerText = "Erro ao calcular frete."; }
}
function atualizarTotalCarrinho() {
    let subtotal = 0;
    Object.values(cart).forEach(item => subtotal += item.price * item.qty);
    document.getElementById('cart-total').innerText = (subtotal + valorFreteGlobal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
