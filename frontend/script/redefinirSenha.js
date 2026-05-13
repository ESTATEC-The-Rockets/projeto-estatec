document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleção dos elementos
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const btnVoltar = document.querySelector('.btn-voltar');
    const resetForm = document.querySelector('#resetForm');

    // 2. Lógica do Botão Voltar (Ajuste o caminho aqui!)
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            
            window.location.href = "../index.html";

        });
    }

    // 3. Lógica para os DOIS olhos (Macaquinho)
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = button.querySelector('.eye-span');

            if (passwordInput && eyeIcon) {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

                // Troca o emoji
                eyeIcon.textContent = isPassword ? '🗨️' : '👁️‍🗨️';
            }
        });
    });
    // 4. Formulário de Salvar if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        if (newPass !== confirmPass) {
            alert("As senhas não coincidem!");
            return;
        }

        alert("Senha redefinida com sucesso!");
        // Redireciona após salvar (mesmo caminho do botão voltar)
        window.location.href = "../index.html";
    });
    }
);


