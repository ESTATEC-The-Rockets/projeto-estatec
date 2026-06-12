// 1. URL base do seu sistema (Baseado no seu localhost:8080)
const API_URL = "http://localhost:8080/usuarios"; 

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
});