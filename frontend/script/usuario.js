document.addEventListener("DOMContentLoaded", () => {
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
});