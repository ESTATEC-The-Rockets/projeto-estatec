// --- BANCO DE DADOS LOCAL (SIMULADO) ---
let bancoEstacionamentos = [
    { id: 1, nome: "Estacionamento 01" },
    { id: 2, nome: "Estacionamento 02" }
];

// Seletores do Dropdown e Modais
const trigger = document.getElementById('dropdownTrigger');
const menu = document.getElementById('dropdownMenu');
const listaContainer = document.getElementById('listaEstacionamentosContainer');
const modalEditar = document.getElementById('modalEditar');
const btnSalvarModal = document.getElementById('btnSalvarModal');
const inputNomeEstac = document.getElementById('nomeEstacionamento');

// Controladores auxiliares
let idEstacionamentoSendoEditado = null;

// --- FUNÇÃO PARA RENDERIZAR O FRONT-END A PARTIR DO BANCO DE DADOS ---
function renderizarEstacionamentos() {
    listaContainer.innerHTML = ''; // Limpa a área
    
    bancoEstacionamentos.forEach(estac => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.dataset.id = estac.id; // Atribui a identidade do dado ao elemento HTML
        
        item.innerHTML = `
            <span>${estac.nome}</span>
            <div class="dropdown-item-actions">
                <i class="fa-solid fa-pen btn-editar-estac"></i>
                <i class="fa-solid fa-trash btn-excluir-estac"></i>
            </div>
        `;
        listaContainer.appendChild(item);
    });
}

// Inicializa a renderização assim que o script carrega
renderizarEstacionamentos();


// --- INTERAÇÕES DO MENU DROPDOWN ---
trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});

window.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== trigger) {
        menu.style.display = 'none';
    }
});

// Delegação de eventos para as ações dentro do menu dropdown
menu.addEventListener('click', (e) => {
    const itemElement = e.target.closest('.dropdown-item');
    if (!itemElement) return;
    
    const idItem = parseInt(itemElement.dataset.id);

    // EVENTO DE EXCLUSÃO (SUMIR DO BANCO E DO FRONT)
    if (e.target.classList.contains('btn-excluir-estac')) {
        e.stopPropagation();
        if (confirm("Deseja realmente excluir este estacionamento?")) {
            // 1. Apaga do Banco de Dados (Array)
            bancoEstacionamentos = bancoEstacionamentos.filter(estac => estac.id !== idItem);
            
            // 2. Atualiza o Front-end
            renderizarEstacionamentos();
            
            alert("Estacionamento excluído com sucesso!");
            menu.style.display = 'none';
        }
    }

    // EVENTO DE PREPARAÇÃO PARA EDIÇÃO
    if (e.target.classList.contains('btn-editar-estac')) {
        e.stopPropagation();
        idEstacionamentoSendoEditado = idItem;
        
        const estacObjeto = bancoEstacionamentos.find(estac => estac.id === idItem);
        if (estacObjeto) {
            inputNomeEstac.value = estacObjeto.nome;
            menu.style.display = 'none';
            modalEditar.style.display = 'flex';
            inputNomeEstac.focus();
        }
    }
});

// Ação de Salvar o nome Editado
btnSalvarModal.addEventListener('click', () => {
    const novoNome = inputNomeEstac.value.trim();
    
    if (novoNome && idEstacionamentoSendoEditado !== null) {
        // Atualiza no Banco de Dados simulado
        const estacObjeto = bancoEstacionamentos.find(estac => estac.id === idEstacionamentoSendoEditado);
        if (estacObjeto) {
            estacObjeto.nome = novoNome;
        }
        
        // Atualiza o Front-end
        renderizarEstacionamentos();
    }
    
    modalEditar.style.display = 'none';
    idEstacionamentoSendoEditado = null;
    inputNomeEstac.value = "";
});

modalEditar.addEventListener('click', (e) => {
    if (e.target === modalEditar) modalEditar.style.display = 'none';
});


// --- BANCO DE DADOS DE SIMULAÇÃO (GERAÇÃO AUTOMÁTICA DOS BLOCOS INFERIORES) ---
const btnAddEntrada = document.getElementById('btnAddEntrada');
const btnAddAlerta = document.getElementById('btnAddAlerta');

const listaPlacas = ['MKS4J12', 'OPE9B88', 'PQW2E44', 'ZBA8R11', 'KUX5N33', 'JXZ9W99'];
const listaAcoes = ['Entrada', 'Saída'];

const listaModelosAlertas = [
    'Alerta: Tentativa de acesso não autorizada no portão B.',
    'Aviso: Sensor de presença da vaga 14 obstruído.',
    'Atenção: Sistema identificou veículo parado em fila dupla na rampa.',
    'Manutenção: Limpeza preventiva agendada para o setor azul.',
    'Aviso: Totem de pagamento 02 sem papel para impressão.'
];

btnAddEntrada.addEventListener('click', () => {
    const coluna = document.getElementById('colunaEntradas');
    const placaAleatoria = listaPlacas[Math.floor(Math.random() * listaPlacas.length)];
    const acaoAleatoria = listaAcoes[Math.floor(Math.random() * listaAcoes.length)];
    
    const agora = new Date();
    const horarioFormatado = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const novoCard = document.createElement('div');
    novoCard.className = 'info-card';
    novoCard.innerHTML = `<p>Placa ${placaAleatoria}:<br>${acaoAleatoria} às ${horarioFormatado}</p>`;

    coluna.insertBefore(novoCard, btnAddEntrada);
});

btnAddAlerta.addEventListener('click', () => {
    const coluna = document.getElementById('colunaAlertas');
    const alertaAleatorio = listaModelosAlertas[Math.floor(Math.random() * listaModelosAlertas.length)];

    const novoCard = document.createElement('div');
    novoCard.className = 'info-card';
    novoCard.innerHTML = `<p>${alertaAleatorio}</p>`;

    coluna.insertBefore(novoCard, btnAddAlerta);
});