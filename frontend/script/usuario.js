// Dados iniciais baseados exatamente na listagem da tabela
const initialUsers = [
    { id: 1, nome: "Matheus Felipe Gonçalves", placa: "BRA2E19" },
    { id: 2, nome: "João Guilherme Vieira", placa: "CRU2G93" },
    { id: 3, nome: "Lucas Emanuel de Souza", placa: "LET2133" },
    { id: 4, nome: "Rômulo Augusto", placa: "VEM2R09" }
];

let users = [...initialUsers];

const tableBody = document.getElementById("users-table-body");
const searchInput = document.getElementById("search-input");

function renderUsers(usersList) {
    tableBody.innerHTML = "";

    if (usersList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #8e8e93; padding: 32px;">
                    Nenhum usuário ou placa encontrado.
                </td>
            </tr>
        `;
        return;
    }

    usersList.forEach(user => {
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td style="font-weight: 500;">${user.nome}</td>
            <td style="color: #b3b3b3; font-family: monospace; font-size: 15px; letter-spacing: 0.5px;">${user.placa}</td>
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

searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    const filteredUsers = users.filter(user => 
        user.nome.toLowerCase().includes(searchTerm) || 
        user.placa.toLowerCase().includes(searchTerm)
    );
    
    renderUsers(filteredUsers);
});

function handleTipo(id) {
    const user = users.find(u => u.id === id);
    alert(`Alterar tipo do cliente: ${user.nome}`);
}

function handleDelete(id) {
    const user = users.find(u => u.id === id);
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
        users = users.filter(u => u.id !== id);
        searchInput.dispatchEvent(new Event('input'));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderUsers(users);
});