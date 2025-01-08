function redirecionarParaCadastro() {
    window.location.href = "cadastro-os.html";
}

async function cadastrarOS(event) {
    event.preventDefault();

    const osData = {
        cliente: document.getElementById('nome').value,
        veiculo: document.getElementById('veiculo').value,
        placa: document.getElementById('placa').value,
        data_entrada: document.getElementById('dataEntrada').value,
        hora_entrada: document.getElementById('horaEntrada').value,
        data_saida: document.getElementById('dataSaida').value,
        hora_saida: document.getElementById('horaSaida').value,  
        tipo: document.getElementById('tipo').value,
        servicos: JSON.parse(document.getElementById('descricaoServicos').value || "[]"),
        produtos: JSON.parse(document.getElementById('produtos').value || "[]"),
    };
    
    try {
        const response = await fetch('http://localhost:3000/ordens-servico', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(osData),
        });

        if (response.ok) {
            alert('Ordem de Serviço cadastrada com sucesso!');
            window.location.reload();
        } else {
            throw new Error('Erro ao cadastrar a OS');
        }
    } catch (error) {
        alert(error.message);
    }
}

async function filtrarOrdens() {
    const cliente = document.getElementById('filtroCliente').value;

    try {
        const response = await fetch(
            `http://localhost:3000/ordens-servico?cliente=${encodeURIComponent(cliente)}`
        );

        if (!response.ok) {
            const errorMessage = await response.text(); 
            throw new Error(errorMessage || 'Erro ao buscar ordens.');
        }
        
        const ordens = await response.json();

        const tabela = document.querySelector("#tabelaOrdens tbody");
        tabela.innerHTML = "";

        ordens.forEach(ordem => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${ordem.CLIENTE}</td>
                <td>${ordem.VEICULO}</td>
                <td>${ordem.PLACA}</td>
                <td>${ordem.DATA_ENTRADA}</td>
                <td>${ordem.HORA_ENTRADA}</td>
                <td>
                    <button onclick="detalharOrdem(${ordem.ID})">Detalhar</button>
                </td>
            `;
            tabela.appendChild(linha);
        });
    } catch (error) {
        console.error(error);
        alert('Erro ao buscar ordens de serviço.');
    }
}

function detalharOrdem(id) {
    window.location.href = `detalhes-os.html?id=${id}`;
}
