const API_URL = "http://localhost:8080/usuarios"; 
let users = []; 

const tableBody = document.getElementById("users-table-body");
const searchInput = document.getElementById("search-input");

async function carregarTabela() {
    try {
        const response = await fetch(API_URL); 
        users = await response.json(); 
        renderUsers(users); 
    } catch (error) {
        console.error("Erro ao buscar dados do servidor:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #ff3b30; padding: 32px;">
                    Erro ao conectar com o servidor. Verifique se o Back-end está rodando.
                </td>
            </tr>
        `;
    }
}

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
        
        tr.innerHTML = `
            <td style="font-weight: 500;">${user.nome}</td>
            <td style="color: #b3b3b3; font-family: monospace; font-size: 14px; letter-spacing: 0.5px;">${user.email}</td>
            <td class="text-right">
                <div class="actions-cell">
                    <button class="btn-action btn-tipo" onclick="handleTipo(${user.id})">
                        <i class="fa-solid fa-user-tag"></i> Tipo
                    </button>
                    <button class="btn-action btn-excluir" onclick="handleDelete(${user.id})">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
}

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

async function handleDelete(id) {
    const user = users.find(u => u.id === id);
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
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

document.addEventListener("DOMContentLoaded", () => {
    carregarTabela();
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }
});