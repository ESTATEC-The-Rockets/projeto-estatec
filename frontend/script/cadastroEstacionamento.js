"use strict";

(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
        window.location.replace("./adminCrud.html");
        return;
    }

    const formCadastro = document.getElementById("cadastroForm");
    if (!formCadastro) return;

    const nome = document.getElementById("nomeEstacionamento");
    const feedback = document.getElementById("cadastroFeedback");
    const success = document.getElementById("cadastroSuccess");
    const button = formCadastro.querySelector('button[type="submit"]');
    let submitting = false;
    let saved = false;

    function showFeedback(message, state = "error") {
        feedback.dataset.state = state;
        feedback.textContent = message;
    }

    formCadastro.addEventListener("invalid", event => {
        event.target.setAttribute("aria-invalid", "true");
        showFeedback("Informe um nome para o estacionamento.");
    }, true);

    nome.addEventListener("input", () => {
        nome.setCustomValidity("");
        nome.removeAttribute("aria-invalid");
    });

    formCadastro.addEventListener("submit", async event => {
        event.preventDefault();
        if (submitting || saved) return;

        nome.value = nome.value.trim();
        nome.setCustomValidity(nome.value ? "" : "Informe o nome do estacionamento.");
        if (!formCadastro.reportValidity()) {
            nome.setAttribute("aria-invalid", "true");
            showFeedback("Informe um nome para o estacionamento.");
            return;
        }

        const id = document.getElementById("estacionamentoId").value.trim();
        const urlBase = "http://localhost:8080/estacionamento";
        const url = id ? `${urlBase}/${encodeURIComponent(id)}` : urlBase;
        submitting = true;
        button.disabled = true;
        nome.readOnly = true;
        button.textContent = "Salvando…";
        formCadastro.setAttribute("aria-busy", "true");
        showFeedback("Enviando os dados do estacionamento…", "loading");
        success.hidden = true;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        try {
            const response = await fetch(url, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nomeEstacionamento: nome.value }),
                signal: controller.signal
            });
            if (!response.ok) {
                if (response.status === 400 || response.status === 422) {
                    nome.setAttribute("aria-invalid", "true");
                    showFeedback("O servidor recusou os dados. Verifique o nome: use letras e espaços.");
                } else if (response.status === 409) {
                    showFeedback("Já existe um cadastro conflitante. Consulte a lista antes de tentar novamente.");
                    success.hidden = false;
                } else if (response.status === 401 || response.status === 403) {
                    showFeedback("Sem permissão para salvar. Volte ao menu e verifique seu acesso com o administrador.");
                } else {
                    showFeedback(`Não foi possível confirmar o salvamento (HTTP ${response.status}). Consulte a lista antes de reenviar.`);
                    success.hidden = false;
                }
                return;
            }

            // Qualquer 2xx confirma a operação, inclusive resposta sem JSON/204.
            saved = true;
            showFeedback(id ? "Estacionamento atualizado com sucesso." : "Estacionamento cadastrado com sucesso.", "success");
            success.hidden = false;
            success.querySelector("a").focus();
        } catch (error) {
            const reason = error.name === "AbortError" ? "O servidor demorou para responder." : "A conexão com o servidor falhou.";
            showFeedback(`${reason} Não foi possível confirmar o salvamento. Consulte a lista antes de reenviar para evitar duplicatas.`);
            success.hidden = false;
        } finally {
            clearTimeout(timeout);
            submitting = false;
            formCadastro.setAttribute("aria-busy", "false");
            button.disabled = saved;
            nome.readOnly = saved;
            button.textContent = saved ? "Salvo" : "Tentar salvar novamente";
        }
    });
})();
