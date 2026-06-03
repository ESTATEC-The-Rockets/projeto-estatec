// Importamos a função de requisição se formos usar para buscar dados depois
import { darRequisicao } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CONTROLE DO MODAL ("TIPO")
    const modal = document.getElementById('modalTipo');
    const botoesTipo = document.querySelectorAll('.btn-tipo');
    const btnSalvarModal = document.querySelector('.btn-salvar');

    // Funções para abrir e fechar o modal com segurança (sem usar onclick direto no HTML)
    function abrirModal() {
        if (modal) modal.style.display = 'flex';
    }

    function fecharModal() {
        if (modal) modal.style.display = 'none';
    }

    // Adiciona o evento de abrir em todos os botões "TIPO" da lista
    botoesTipo.forEach(botao => {
        botao.addEventListener('click', abrirModal);
    });

    // Fecha o modal ao clicar em salvar
    if (btnSalvarModal) {
        btnSalvarModal.addEventListener('click', fecharModal);
    }

    // Fecha o modal se o usuário clicar do lado de fora do card
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            fecharModal();
        }
    });

    // 2. CONTROLE DOS BOTÕES TOGGLE DENTRO DO MODAL (VISITANTE / FIXO)
    const btnVisitante = document.getElementById('btnVisitante');
    const btnFixo = document.getElementById('btnFixo');

    if (btnVisitante && btnFixo) {
        btnVisitante.addEventListener('click', () => {
            btnVisitante.classList.add('active');
            btnFixo.classList.remove('active');
        });

        btnFixo.addEventListener('click', () => {
            btnFixo.classList.add('active');
            btnVisitante.classList.remove('active');
        });
    }

    // 3. RECURSO FUTURO: BUSCAR USUÁRIOS DO BACK-END
    // Quando o seu Java tiver um @GetMapping para listar os clientes, 
    // a função abaixo será usada para preencher a lista dinamicamente.
    async function carregarClientesDoBackEnd() {
        try {
            // Exemplo: const clientes = await darRequisicao('/usuarios', 'GET');
            console.log('Pronto para carregar dados do back-end...');
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
    }

    // Executa a carga inicial (futura)
    carregarClientesDoBackEnd();
});