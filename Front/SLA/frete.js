async function calcularValorFrete(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return { sucesso: false, msg: "CEP Inválido" };
    
    // Simulação rápida para teste
    return { 
        sucesso: true, 
        valor: "15,00", 
        prazo: "3", 
        cidade: "São Paulo", 
        uf: "SP" 
    };
}