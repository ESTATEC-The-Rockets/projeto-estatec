// 1. URL base do seu sistema (Baseado no seu localhost:8080)
const API_URL = "http://localhost:8080/usuarios"; 

<<<<<<< HEAD
let users = []; 

const tableBody = document.getElementById("users-table-body");
const searchInput = document.getElementById("search-input");

// BUSCA REAL: Puxa os dados que você inseriu no Postman
async function carregarTabela() {
    try {
        // Faz o GET em http://localhost:8080/usuarios
        const response = await fetch(API_URL); 
        users = await response.json(); 
        
        renderUsers(users); 
    } catch (error) {
        console.error("Erro ao buscar dados do servidor:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #ff3b30; padding: 32px;">
                    Erro ao conectar com o servidor Java. Verifique se o Back-end está rodando.
                </td>
            </tr>
        `;
    }
}

// RENDERIZAÇÃO: Adaptada para os campos REAIS do seu Postman (nome e email)
function renderUsers(usersList) {
    tableBody.innerHTML = "";

    if (usersList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #8e8e93; padding: 32px;">
                    Nenhum usuário ou e-mail encontrado.
                </td>
            </tr>
        `;
        return;
    }

    usersList.forEach(user => {
        const tr = document.createElement("tr");
        
        // Mudamos de user.placa para user.email (que existe no seu banco!)
        tr.innerHTML = `
            <td style="font-weight: 500;">${user.nome}</td>
            <td style="color: #b3b3b3; font-family: monospace; font-size: 15px; letter-spacing: 0.5px;">${user.email}</td>
            <td class="text-right">
                <div class="actions-cell">
                    <button class="btn-action btn-tipo" onclick="handleTipo(${user.id})">Tipo</button>
                    <button class="btn-action btn-excluir" onclick="handleDelete(${user.id})">Excluir</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// FILTRO DE BUSCA: Agora busca por Nome ou E-mail
searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    const filteredUsers = users.filter(user => 
        user.nome.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    );
    
    renderUsers(filteredUsers);
});

function handleTipo(id) {
    const user = users.find(u => u.id === id);
    alert(`Alterar tipo do cliente: ${user.nome}`);
}

// EXCLUSÃO: Deleta o ID correto diretamente no banco de dados MySQL
async function handleDelete(id) {
    const user = users.find(u => u.id === id);
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
        try {
            // Envia o DELETE para http://localhost:8080/usuarios/1 (ou o ID do usuário)
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Recarrega a tabela direto do banco após deletar
                carregarTabela();
            } else {
                alert("Não foi possível excluir o usuário no servidor.");
            }
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            alert("Erro de comunicação com o servidor.");
        }
    }
}

// INICIALIZAÇÃO: Dispara assim que a página abre
document.addEventListener("DOMContentLoaded", () => {
    carregarTabela();
=======
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
>>>>>>> ba4205a5f926623b5bcbb4cdf8d4a4d89a674a80
});