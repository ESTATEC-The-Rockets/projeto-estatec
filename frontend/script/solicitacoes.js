document.addEventListener("DOMContentLoaded", () => {
    // Elementos da Sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    // Elementos do Dropdown e Modais Customizados
    const btnEstacionamentos = document.getElementById("btnEstacionamentos");
    const dropdownEstacionamentos = document.getElementById("dropdownEstacionamentos");
    
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const editForm = document.getElementById("editForm");
    const newNameInput = document.getElementById("newNameInput");
    
    const btnConfirmYes = document.getElementById("btnConfirmYes");
    const btnConfirmNo = document.getElementById("btnConfirmNo");
    const btnCadastro = document.querySelector(".btn-cadastro");

    // Elementos da Tela de Solicitações
    const solicitacoesList = document.getElementById("solicitacoesList");
    const searchInput = document.getElementById("searchInput");

    // Armazena temporariamente o elemento ativo selecionado nas listas
    let itemSelecionadoParaAcao = null;

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
            
            const icon = btnEstacionamentos.querySelector("i");
            if (icon) {
                icon.style.transform = dropdownEstacionamentos.classList.contains("show") ? "rotate(180deg)" : "rotate(0deg)";
            }
        });

        document.addEventListener("click", () => {
            fecharDropdown();
        });
    }

    function fecharDropdown() {
        if (dropdownEstacionamentos) {
            dropdownEstacionamentos.classList.remove("show");
            const icon = btnEstacionamentos.querySelector("i");
            if (icon) icon.style.transform = "rotate(0deg)";
        }
    }

    // =======================================================
    // 3. CAPTURA DE EVENTOS DO DROPDOWN (MODAIS EXCLUSIVOS)
    // =======================================================
    if (dropdownEstacionamentos) {
        dropdownEstacionamentos.addEventListener("click", (e) => {
            const editBtn = e.target.closest(".btn-edit-est");
            const deleteBtn = e.target.closest(".btn-delete-est");

            if (editBtn) {
                e.stopPropagation();
                fecharDropdown();
                itemSelecionadoParaAcao = e.target.closest("li");
                
                const nomeAtual = itemSelecionadoParaAcao.querySelector("span").textContent;
                newNameInput.value = nomeAtual;

                if (editModal) {
                    editModal.classList.add("show");
                    setTimeout(() => {
                        newNameInput.focus();
                    }, 50);
                }
            }

            if (deleteBtn) {
                e.stopPropagation();
                fecharDropdown();
                itemSelecionadoParaAcao = e.target.closest("li");
                
                if (deleteModal) deleteModal.classList.add("show");
            }
        });
    }

    // ==========================================
    // 4. AÇÕES DO MODAL DE EXCLUSÃO (SIM / NÃO)
    // ==========================================
    if (btnConfirmYes) {
        btnConfirmYes.addEventListener("click", () => {
            if (itemSelecionadoParaAcao) {
                itemSelecionadoParaAcao.remove();
                itemSelecionadoParaAcao = null;
            }
            if (deleteModal) deleteModal.classList.remove("show");
        });
    }

    if (btnConfirmNo) {
        btnConfirmNo.addEventListener("click", () => {
            itemSelecionadoParaAcao = null;
            if (deleteModal) deleteModal.classList.remove("show");
        });
    }

    // ==========================================
    // 5. ENVIO DO FORMULÁRIO DE EDIÇÃO (SALVAR)
    // ==========================================
    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const novoNome = newNameInput.value.trim();
            
            if (novoNome && itemSelecionadoParaAcao) {
                itemSelecionadoParaAcao.querySelector("span").textContent = novoNome.toUpperCase();
            }
            
            if (editModal) editModal.classList.remove("show");
            itemSelecionadoParaAcao = null;
        });
    }

    if (btnCadastro) {
        btnCadastro.addEventListener("click", () => {
            window.location.href = "../pages/cadastroEstacionamento.html";
        });
    }

    // ==========================================
    // 6. FUNCIONALIDADES DE SOLICITAÇÕES
    // ==========================================
    if (solicitacoesList) {
        solicitacoesList.addEventListener("click", (e) => {
            const card = e.target.closest(".solicitacao-card");
            
            if (!card || card.classList.contains("empty-slot")) return;

            // Clicou em Aceitar
            if (e.target.classList.contains("btn-aceitar")) {
                card.remove(); 
            }

            // Clicou em Rejeitar
            if (e.target.classList.contains("btn-rejeitar")) {
                card.remove();
            }
        });
    }

    // Filtro Dinâmico da Barra de Pesquisa
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

    // Fechar modais clicando fora no fundo escuro
    window.addEventListener("click", (e) => {
        if (e.target === editModal) {
            editModal.classList.remove("show");
            itemSelecionadoParaAcao = null;
        }
        if (e.target === deleteModal) {
            deleteModal.classList.remove("show");
            itemSelecionadoParaAcao = null;
        }
    });
});