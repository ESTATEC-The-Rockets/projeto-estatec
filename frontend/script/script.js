document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.querySelector("#loginForm");
    const passwordInput = document.querySelector("#password");
    const togglePassword = document.querySelector("#togglePassword");
    const forgotPassword = document.querySelector(".forgot-password");

    // Mostrar/Ocultar senha
    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const isPassword =
                passwordInput.getAttribute("type") === "password";

            passwordInput.setAttribute(
                "type",
                isPassword ? "text" : "password"
            );

            togglePassword.innerHTML =
                isPassword
                    ? "🙈"
                    : "👁";
        });
    }

    // Recuperação de senha
    if (forgotPassword) {

        forgotPassword.addEventListener("click", (e) => {

            e.preventDefault();

            window.location.href =
                "../redefinirSenha/index.html";
        });
    }

    // Login
    if (loginForm) {

        loginForm.addEventListener("submit", (e) => {

            e.preventDefault();

            const email =
                document.querySelector("#email").value.trim();

            const password =
                passwordInput.value.trim();

            if (!email || !password) {

                alert("Preencha todos os campos.");
                return;
            }

            // Futuramente conectar API aqui

            window.location.href =
                "../menuInicial/index.html";
        });
    }
});