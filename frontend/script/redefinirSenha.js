document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const btnVoltar = document.querySelector('.btn-voltar');
    const resetForm = document.querySelector('#resetForm');

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            window.location.href = "../paginaLogin/index.html";
        });
    }

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = button.querySelector('.eye-span');

            if (passwordInput && eyeIcon) {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

                eyeIcon.textContent = isPassword ? '🗨️' : '👁️‍🗨️';
            }
        });
    });

    if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            if (newPass !== confirmPass) {
                alert("As senhas não coincidem!");
                return;
            }

            alert("Senha redefinida com sucesso!");
            window.location.href = "../paginaLogin/index.html";
        });
    }
});