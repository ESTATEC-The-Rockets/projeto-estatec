document.addEventListener("DOMContentLoaded", () => {
    // --- LÓGICA DO MENU SUSPENSO (Já existente) ---
    const botaoMenuSuspenso = document.getElementById("botaoMenuSuspenso");
    const conteudoMenuSuspenso = document.getElementById("conteudoMenuSuspenso");

    botaoMenuSuspenso.addEventListener("click", (evento) => {
        evento.stopPropagation(); 
        conteudoMenuSuspenso.classList.toggle("mostrar");
    });

    window.addEventListener("click", (evento) => {
        if (!botaoMenuSuspenso.contains(evento.target) && !conteudoMenuSuspenso.contains(evento.target)) {
            conteudoMenuSuspenso.classList.remove("mostrar");
        }
    });

    const iconesAcao = document.querySelectorAll('.acoes-menu-suspenso i');
    iconesAcao.forEach(icone => {
        icone.addEventListener('click', (evento) => {
            evento.stopPropagation();
            const acao = icone.classList.contains('fa-pen') ? 'Editar' : 'Excluir';
            const nomeEstacionamento = icone.closest('.item-menu-suspenso').querySelector('span').innerText;
            alert(`${acao}: ${nomeEstacionamento}`);
        });
    });

    // --- NOVA LÓGICA DO MODAL (TIPO DE USUÁRIO) ---
    const modal = document.getElementById('modalTipo');
    const botoesAbrirModal = document.querySelectorAll('.btn-tipo');
    const btnVisitante = document.getElementById('btnVisitante');
    const btnFixo = document.getElementById('btnFixo');

    // Função para abrir o modal
    window.abrirModal = () => {
        modal.style.display = 'flex';
    };

    // Função para fechar o modal
    window.fecharModal = () => {
        modal.style.display = 'none';
    };

    // Alternar entre Visitante e Fixo
    btnVisitante.addEventListener('click', () => {
        btnVisitante.classList.add('active');
        btnFixo.classList.remove('active');
    });

    btnFixo.addEventListener('click', () => {
        btnFixo.classList.add('active');
        btnVisitante.classList.remove('active');
    });

    // Fechar o modal se o usuário clicar no fundo escuro (overlay)
    window.addEventListener('click', (evento) => {
        if (evento.target === modal) {
            fecharModal();
        }
    });
});