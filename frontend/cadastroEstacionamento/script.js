document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.querySelector('#cadastroForm');

    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Captura dos valores
            const nome = document.getElementById('nomeEstacionamento').value;
            const vagas = document.getElementById('qtdVagas').value;
            const local = document.getElementById('local').value;

            // Simulação de salvamento
            console.log("Dados Enviados:", { nome, vagas, local });

            alert("Estacionamento cadastrado com sucesso!");
            
            // Opcional: Limpar formulário após sucesso
            cadastroForm.reset();
        });
    }
});