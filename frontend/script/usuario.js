document.addEventListener("DOMContentLoaded", () => {
    const botaoMenuSuspenso = document.getElementById("botaoMenuSuspenso");
    const conteudoMenuSuspenso = document.getElementById("conteudoMenuSuspenso");

    // Abrir/Fechar menu suspenso ao clicar no botão
    botaoMenuSuspenso.addEventListener("click", (evento) => {
        evento.stopPropagation(); // Evita que o evento suba para a janela (window)
        conteudoMenuSuspenso.classList.toggle("mostrar");
    });

    // Fechar o menu suspenso se o usuário clicar em qualquer lugar fora dele
    window.addEventListener("click", (evento) => {
        if (!botaoMenuSuspenso.contains(evento.target) && !conteudoMenuSuspenso.contains(evento.target)) {
            conteudoMenuSuspenso.classList.remove("mostrar");
        }
    });

    // Exemplo: Feedback ao clicar nos ícones de edição/eliminação
    const iconesAcao = document.querySelectorAll('.acoes-menu-suspenso i');
    iconesAcao.forEach(icone => {
        icone.addEventListener('click', (evento) => {
            evento.stopPropagation();
            const acao = icone.classList.contains('fa-pen') ? 'Editar' : 'Excluir';
            const nomeEstacionamento = icone.closest('.item-menu-suspenso').querySelector('span').innerText;
            alert(`${acao}: ${nomeEstacionamento}`);
        });
    });
});