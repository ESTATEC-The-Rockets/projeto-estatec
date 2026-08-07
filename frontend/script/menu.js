// 1. URL base do seu sistema
const API_URL = "http://localhost:8080/historico"; 

let historicoLista = []; 

const tableBody = document.getElementById("users-table-body");
const searchInput = document.getElementById("search-input");

// ==========================================
// BUSCA DOS DADOS NO BACK-END (JAVA)
// ==========================================
async function carregarTabela() {
    try {
        const response = await fetch(API_URL); 
        historicoLista = await response.json(); 
        
        renderTabela(historicoLista); 
    } catch (error) {
        console.error("Erro ao buscar dados do servidor:", error);
        if(tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #ff3b30; padding: 32px;">
                        Erro ao conectar com o servidor Java. Verifique se o Back-end está a correr.
                    </td>
                </tr>
            `;
        }
    }
}

// ==========================================
// RENDERIZAÇÃO DA TABELA (PLACA, USUÁRIO E MODELO)
// ==========================================
function renderTabela(lista) {
    if (!tableBody) return; // Proteção extra caso o HTML não carregue a tempo

    tableBody.innerHTML = "";

    if (lista.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #8e8e93; padding: 32px;">
                    Nenhum registo de estacionamento encontrado.
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(registro => {
        const tr = document.createElement("tr");
        
        // CORREÇÃO AQUI: Agora a usar '.nome' exatamente como está na sua classe Usuario.java
        const placaSegura = registro?.carro?.placa || "Sem placa";
        const nomeSeguro = registro?.carro?.usuario?.nome || "Não identificado";
        const modeloSeguro = registro?.carro?.modelo || "Sem modelo";

        tr.innerHTML = `
            <td style="font-weight: 500;">${placaSegura}</td>
            <td style="color: #b3b3b3; font-family: monospace; font-size: 15px; letter-spacing: 0.5px;">${nomeSeguro}</td>
            <td style="color: #b3b3b3; font-family: monospace; font-size: 15px; letter-spacing: 0.5px;">${modeloSeguro}</td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// ==========================================
// FILTRO DE BUSCA (Por Placa, Nome ou Modelo)
// ==========================================
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        const listaFiltrada = historicoLista.filter(registro => {
            const placa = registro.carro && registro.carro.placa ? registro.carro.placa.toLowerCase() : "";
            
            // CORREÇÃO AQUI: Ajustado também no filtro de pesquisa para '.nome'
            const nomeBusca = registro.carro && registro.carro.usuario && registro.carro.usuario.nome ? registro.carro.usuario.nome.toLowerCase() : "";
            
            const modelo = registro.carro && registro.carro.modelo ? registro.carro.modelo.toLowerCase() : "";

            return placa.includes(searchTerm) || nomeBusca.includes(searchTerm) || modelo.includes(searchTerm);
        });
        
        renderTabela(listaFiltrada);
    });
}

// ==========================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    carregarTabela();

    // Controlo do menu lateral (Sidebar)
    const menuToggle = document.getElementById("menuToggle"); 
    const sidebar = document.querySelector(".sidebar"); 

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }

    // Controlo de redirecionamento do botão cadastrar
    const btnCadastro = document.querySelector(".btn-cadastro");
    if (btnCadastro) {
        btnCadastro.addEventListener("click", () => {
            window.location.href = "../pages/cadastroEstacionamento.html";
        });
    }
});