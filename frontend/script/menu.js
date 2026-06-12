document.addEventListener("DOMContentLoaded", () => {
    // Elementos da Sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    // Elementos do Dropdown e Modal de Estacionamentos
    const btnEstacionamentos = document.getElementById("btnEstacionamentos");
    const dropdownEstacionamentos = document.getElementById("dropdownEstacionamentos");
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const btnCadastro = document.querySelector(".btn-cadastro");

    // ==========================================
    // 1. CONTROLE DA SIDEBAR (ABRIR / FECHAR)
    // ==========================================
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }

    // ==========================================
    // 2. CONTROLE DO DROPDOWN (ESTACIONAMENTOS)
    // ==========================================
    if (btnEstacionamentos && dropdownEstacionamentos) {
        // Abre e fecha ao clicar no botão
        btnEstacionamentos.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownEstacionamentos.classList.toggle("show");
        });

        // Fecha se clicar em qualquer outro lugar da tela
        document.addEventListener("click", () => {
            dropdownEstacionamentos.classList.remove("show");
        });

        // Intercepta cliques nos botões internos (Editar e Excluir)
        dropdownEstacionamentos.addEventListener("click", (e) => {
            const editBtn = e.target.closest(".btn-edit-est");
            const deleteBtn = e.target.closest(".btn-delete-est");

            if (editBtn) {
                e.stopPropagation();
                dropdownEstacionamentos.classList.remove("show"); // Fecha o menu
                if (editModal) editModal.classList.add("show");    // Abre o modal
            }

            if (deleteBtn) {
                e.stopPropagation();
                const confirmacao = confirm("Deseja realmente excluir este estacionamento?");
                if (confirmacao) {
                    e.target.closest("li").remove();
                }
            }
        });
    }

    // ==========================================
    // 3. CONTROLE DO MODAL DE EDIÇÃO
    // ==========================================
    if (editModal) {
        // Fecha o modal se clicar na parte escura do fundo
        editModal.addEventListener("click", (e) => {
            if (e.target === editModal) {
                editModal.classList.remove("show");
            }
        });
    }

    if (editForm) {
        // Ação do formulário ao salvar
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Lógica de salvamento entra aqui
            alert("Alterações salvas com sucesso!");
            if (editModal) editModal.classList.remove("show");
        });
    }

    // Redirecionar para a página de cadastro
    if (btnCadastro) {
        btnCadastro.addEventListener("click", () => {
            window.location.href = "../pages/cadastroEstacionamento.html";
        });
    }

    
});