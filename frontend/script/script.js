window.estatecFetch = window.estatecFetch || ((url, options = {}) => fetch(url, { credentials: "include", ...options }));
"use strict";

(() => {
    const formLogin = document.getElementById("loginForm");
    if (!formLogin) return;

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const toggle = document.getElementById("togglePassword");
    const remember = document.getElementById("rememberEmail");
    const feedback = document.getElementById("loginFeedback");
    const button = formLogin.querySelector('button[type="submit"]');
    const emailKey = "estatecEmailLembrado";
    let submitting = false;

    function showFeedback(message, state = "error") {
        feedback.dataset.state = state;
        feedback.textContent = message;
    }

    formLogin.addEventListener("invalid", event => {
        event.target.setAttribute("aria-invalid", "true");
        showFeedback("Informe um e-mail válido e preencha a senha para entrar.");
    }, true);

    try {
        const savedEmail = localStorage.getItem(emailKey);
        if (savedEmail) {
            email.value = savedEmail;
            remember.checked = true;
        }
    } catch {
        showFeedback("O armazenamento do navegador está bloqueado. Libere-o para manter a sessão.");
    }

    function rememberEmail() {
        try {
            if (remember.checked) localStorage.setItem(emailKey, email.value.trim());
            else localStorage.removeItem(emailKey);
        } catch {
            showFeedback("Não foi possível atualizar a preferência de e-mail neste navegador.");
        }
    }
    remember.addEventListener("change", rememberEmail);
    email.addEventListener("input", () => {
        email.removeAttribute("aria-invalid");
        if (remember.checked) rememberEmail();
    });
    password.addEventListener("input", () => password.removeAttribute("aria-invalid"));

    toggle.addEventListener("click", () => {
        const visible = password.type === "password";
        password.type = visible ? "text" : "password";
        toggle.setAttribute("aria-pressed", String(visible));
        toggle.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
        toggle.textContent = visible ? "Ocultar senha" : "Mostrar senha";
    });

    formLogin.addEventListener("submit", async event => {
        event.preventDefault();
        if (submitting) return;
        email.value = email.value.trim();
        if (!formLogin.reportValidity()) return;

        const emailValue = email.value;
        const passwordValue = password.value;
        submitting = true;
        button.disabled = true;
        button.textContent = "Entrando…";
        formLogin.setAttribute("aria-busy", "true");
        showFeedback("Verificando seu acesso…", "loading");
        email.removeAttribute("aria-invalid");
        password.removeAttribute("aria-invalid");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let stage = "request";

        try {
            let session;
            {
                const response = await window.estatecFetch((window.ESTATEC_API_ORIGIN + "/usuarios/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailValue, senha: passwordValue }),
                    signal: controller.signal
                });
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403 || response.status === 400) {
                        email.setAttribute("aria-invalid", "true");
                        password.setAttribute("aria-invalid", "true");
                        showFeedback("E-mail ou senha inválidos. Confira os dados e tente novamente.");
                    } else {
                        showFeedback("Não foi possível entrar. Tente novamente mais tarde.");
                    }
                    return;
                }
                stage = "response";
                session = await response.json();
                const userId = session && (session.id ?? session.idUsuario);
                if (!session || typeof session !== "object" || Array.isArray(session)
                    || (session.admin !== true && (!Number.isInteger(Number(userId)) || Number(userId) <= 0))) {
                    email.setAttribute("aria-invalid", "true");
                    password.setAttribute("aria-invalid", "true");
                    showFeedback("E-mail ou senha inválidos. Confira os dados e tente novamente.");
                    return;
                }
            }

            stage = "storage";
            if (session.admin === true) {
                localStorage.removeItem("usuarioSessao");
                localStorage.removeItem("token");
                localStorage.setItem("isAdmin", "true");
            } else {
                // Alguns acessos antigos podem retornar senhas: nunca guardar esses campos.
                const safeSession = JSON.stringify(session, (key, value) => /senha|password/i.test(key) ? undefined : value);
                localStorage.setItem("usuarioSessao", safeSession);
                localStorage.removeItem("token");
                localStorage.setItem("isAdmin", "false");
            }
            rememberEmail();
            password.value = "";
            showFeedback("Acesso confirmado. Abrindo o menu…", "success");
            window.location.href = session.admin === true ? "./adminCrud.html" : "./menu.html";
        } catch (error) {
            if (stage === "storage") {
                showFeedback("Não foi possível guardar a sessão. Libere o armazenamento do navegador e tente novamente.");
            } else if (error.name === "AbortError") {
                showFeedback("O servidor demorou para responder. Tente entrar novamente.");
            } else if (stage === "response") {
                showFeedback("O servidor retornou uma resposta de login inválida. Contate o administrador.");
            } else {
                showFeedback("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
            }
        } finally {
            clearTimeout(timeout);
            submitting = false;
            button.disabled = false;
            button.textContent = "Entrar";
            formLogin.setAttribute("aria-busy", "false");
        }
    });
})();
