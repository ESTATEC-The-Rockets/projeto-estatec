document.addEventListener("DOMContentLoaded", () => {

    const resetForm = document.querySelector("#resetForm");
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    const backLink = document.querySelector(".back-link");

    /* =========================
       MOSTRAR / OCULTAR SENHA
    ========================= */

    toggleButtons.forEach(button => {

        button.addEventListener("click", () => {

            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);

            if (!input) return;

            const isPassword =
                input.getAttribute("type") === "password";

            input.setAttribute(
                "type",
                isPassword ? "text" : "password"
            );

            button.textContent =
                isPassword ? "🙈" : "👁";
        });

    });

    /* =========================
       VOLTAR AO LOGIN
    ========================= */

    if (backLink) {

        backLink.addEventListener("click", (e) => {

            e.preventDefault();

            window.location.href = "../index.html";

        });

    }

    /* =========================
       VALIDAÇÃO DA SENHA
    ========================= */

    if (resetForm) {

        resetForm.addEventListener("submit", (e) => {

            e.preventDefault();

            const newPassword =
                document.getElementById("newPassword").value.trim();

            const confirmPassword =
                document.getElementById("confirmPassword").value.trim();

            /* Campos vazios */

            if (!newPassword || !confirmPassword) {

                alert("Preencha todos os campos.");

                return;
            }

            /* Tamanho mínimo */

            if (newPassword.length < 8) {

                alert(
                    "A senha deve possuir pelo menos 8 caracteres."
                );

                return;
            }

            /* Verifica número */

            if (!/\d/.test(newPassword)) {

                alert(
                    "A senha deve conter pelo menos um número."
                );

                return;
            }

            /* Verifica maiúscula */

            if (!/[A-Z]/.test(newPassword)) {

                alert(
                    "A senha deve conter pelo menos uma letra maiúscula."
                );

                return;
            }

            /* Confirmação */

            if (newPassword !== confirmPassword) {

                alert("As senhas não coincidem.");

                return;
            }

            /* Aqui vai sua API futuramente */

            alert("Senha redefinida com sucesso!");

            window.location.href = "../index.html";

        });

    }

});