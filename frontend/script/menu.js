document.addEventListener("DOMContentLoaded", () => {
    // Elementos da Sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    // Elementos do Dropdown e Modais
    const btnEstacionamentos = document.getElementById("btnEstacionamentos");
    const dropdownEstacionamentos = document.getElementById("dropdownEstacionamentos");
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const editForm = document.getElementById("editForm");
    const btnCadastro = document.querySelector(".btn-cadastro");

    // Botões de ação do Modal de Exclusão
    const btnConfirmYes = document.getElementById("btnConfirmYes");
    const btnConfirmNo = document.getElementById("btnConfirmNo");

    // Variável de controle para saber qual item deletar da lista
    let itemParaDeletar = null;

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

        // Delegação de cliques nos botões internos do Dropdown
        dropdownEstacionamentos.addEventListener("click", (e) => {
            const editBtn = e.target.closest(".btn-edit-est");
            const deleteBtn = e.target.closest(".btn-delete-est");

            // Clique no Lápis (Editar)
            if (editBtn) {
                e.stopPropagation();
                dropdownEstacionamentos.classList.remove("show"); 
                if (editModal) editModal.classList.add("show");    
            }

            // Clique na Lixeira (Excluir)
            if (deleteBtn) {
                e.stopPropagation();
                dropdownEstacionamentos.classList.remove("show"); 
                
                // Salva o elemento 'li' correspondente na memória
                itemParaDeletar = e.target.closest("li");
                
                // Abre o modal estilizado customizado
                if (deleteModal) deleteModal.classList.add("show");
            }
        });
    }

    // ==========================================
    // 3. CONTROLE DO MODAL DE EXCLUSÃO (AÇÕES)
    // ==========================================
    if (btnConfirmYes) {
        btnConfirmYes.addEventListener("click", () => {
            if (itemParaDeletar) {
                itemParaDeletar.remove(); // Remove o elemento da interface gráfica
                itemParaDeletar = null;
            }
            if (deleteModal) deleteModal.classList.remove("show");
        });
    }

    if (btnConfirmNo) {
        btnConfirmNo.addEventListener("click", () => {
            itemParaDeletar = null; // Cancela a exclusão
            if (deleteModal) deleteModal.classList.remove("show");
        });
    }

    // ==========================================
    // 4. FECHAR MODAIS AO CLICAR FORA (OVERLAY)
    // ==========================================
    if (editModal) {
        editModal.addEventListener("click", (e) => {
            if (e.target === editModal) {
                editModal.classList.remove("show");
            }
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener("click", (e) => {
            if (e.target === deleteModal) {
                deleteModal.classList.remove("show");
                itemParaDeletar = null;
            }
        });
    }

    // ==========================================
    // 5. FORMULÁRIOS E REDIRECIONAMENTOS
    // ==========================================
    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Alterações salvas com sucesso!");
            if (editModal) editModal.classList.remove("show");
        });
    }

    if (btnCadastro) {
        btnCadastro.addEventListener("click", (e) => {
            window.location.href = "../pages/cadastroEstacionamento.html";
        });
    }
});