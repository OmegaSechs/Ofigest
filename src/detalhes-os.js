// Extrair o ID da ordem da URL
function obterIdDaUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function carregarDetalhesOS() {
    const id = obterIdDaUrl();
    if (!id) {
        alert("ID da ordem de serviço não encontrado!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/ordens-servico/${id}`);
        if (!response.ok) {
            throw new Error("Erro ao buscar os detalhes da ordem de serviço.");
        }

        const ordem = await response.json();

        // Exibir os detalhes na página
        const detalhesDiv = document.getElementById("detalhesOS");
        detalhesDiv.innerHTML = `
            <p><strong>Cliente:</strong> ${ordem.CLIENTE}</p>
            <p><strong>Veículo:</strong> ${ordem.VEICULO}</p>
            <p><strong>Placa:</strong> ${ordem.PLACA}</p>
            <p><strong>Data de Entrada:</strong> ${ordem.DATA_ENTRADA}</p>
            <p><strong>Hora de Entrada:</strong> ${ordem.HORA_ENTRADA}</p>
            <p><strong>Data de Saída:</strong> ${ordem.DATA_SAIDA}</p>
            <p><strong>Hora de Saída:</strong> ${ordem.HORA_SAIDA}</p>
            <p><strong>Tipo:</strong> ${ordem.TIPO}</p>
         `;
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar os detalhes da ordem.");
    }
}

function voltar() {
    window.history.back();
}

// Carregar detalhes ao abrir a página
window.onload = carregarDetalhesOS;
