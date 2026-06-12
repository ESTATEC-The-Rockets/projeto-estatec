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
                dropdownEstacionamentos.classList.remove("show"); 
                itemParaDeletar = e.target.closest("li");
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
                itemParaDeletar.remove();
                itemParaDeletar = null;
            }
            if (deleteModal) deleteModal.classList.remove("show");
        });
    }

    if (btnConfirmNo) {
        btnConfirmNo.addEventListener("click", () => {
            itemParaDeletar = null;
            if (deleteModal) deleteModal.classList.remove("show");
        });
    }

    // FECHAR MODAIS AO CLICAR FORA
    if (editModal) {
        editModal.addEventListener("click", (e) => {
            if (e.target === editModal) editModal.classList.remove("show");
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
    // 4. CONFIGURAÇÃO DO GRÁFICO (CHART.JS)
    // ==========================================
    const ctx = document.getElementById('fluxoChart');
    if (ctx) {
        const context = ctx.getContext('2d');
        
        const gradient = context.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, 'rgba(193, 18, 47, 0.25)');
        gradient.addColorStop(1, 'rgba(193, 18, 47, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0h', '4h', '8h', '12h', '16h', '20h', '24h'],
                datasets: [{
                    label: 'Entradas',
                    data: [12, 5, 45, 80, 65, 95, 20],
                    borderColor: '#c1122f',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4, 
                    pointBackgroundColor: '#c1122f',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#888888', font: { family: 'Inter' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#888888', font: { family: 'Inter' } }
                    }
                }
            }
        });
    }
});