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

    // Elementos da Tela de Solicitações
    const solicitacoesList = document.getElementById("solicitacoesList");
    const searchInput = document.getElementById("searchInput");

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
        btnEstacionamentos.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownEstacionamentos.classList.toggle("show");
        });

        document.addEventListener("click", () => {
            dropdownEstacionamentos.classList.remove("show");
        });

        dropdownEstacionamentos.addEventListener("click", (e) => {
            const editBtn = e.target.closest(".btn-edit-est");
            const deleteBtn = e.target.closest(".btn-delete-est");

            if (editBtn) {
                e.stopPropagation();
                dropdownEstacionamentos.classList.remove("show");
                if (editModal) editModal.classList.add("show");
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
        editModal.addEventListener("click", (e) => {
            if (e.target === editModal) {
                editModal.classList.remove("show");
            }
        });
    }

    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Alterações salvas com sucesso!");
            if (editModal) editModal.classList.remove("show");
        });
    }

    if (btnCadastro) {
        btnCadastro.addEventListener("click", () => {
            window.location.href = "../pages/cadastroEstacionamento.html";
        });
    }

    // ==========================================
    // 4. FUNCIONALIDADES DE SOLICITAÇÕES
    // ==========================================
    if (solicitacoesList) {
        solicitacoesList.addEventListener("click", (e) => {
            const card = e.target.closest(".solicitacao-card");
            
            if (!card || card.classList.contains("empty-slot")) return;

            if (e.target.classList.contains("btn-aceitar")) {
                alert("Solicitação aceita com sucesso!");
                card.remove(); 
            }

            if (e.target.classList.contains("btn-rejeitar")) {
                const confirmar = confirm("Deseja realmente rejeitar esta solicitação?");
                if (confirmar) {
                    card.remove();
                }
            }
        });
    }

    // Filtro da Barra de Pesquisa
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const termoBusca = e.target.value.toLowerCase();
            const cards = document.querySelectorAll(".solicitacao-card:not(.empty-slot)");

            cards.forEach(card => {
                const nome = card.querySelector(".user-name").textContent.toLowerCase();
                const placa = card.querySelector(".plate-info").textContent.toLowerCase();

                if (nome.includes(termoBusca) || placa.includes(termoBusca)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
});