const API_URL = "http://localhost:8080/usuarios";

let users = [];
let tipoSelecionado = "visitante";

function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.dataset.id = user.id;

    card.innerHTML = `
        <div class="user-card-left">
            <div class="avatar-bg"><i class="fa-solid fa-user"></i></div>
            <div class="user-info">
                <div class="user-name">${user.nome}</div>
                <div class="user-email">${user.email}</div>
            </div>
        </div>
        <div class="user-card-right">
            <button class="btn-action btn-tipo">Tipo</button>
        </div>
    `;

    // handlers
    card.querySelector('.btn-tipo').addEventListener('click', () => handleTipo(user.id));

    return card;
}

async function carregarTabela() {
    const container = document.getElementById('users-table-body');
    if (!container) return;

    try {
        const response = await fetch(API_URL);
        users = await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados do servidor:', error);
        // fallback de mock para permitir teste do frontend
        users = [
            { id: 1, nome: 'Fulano de Tal', email: 'fulano@exemplo.com' },
            { id: 2, nome: 'Maria da Silva', email: 'maria@exemplo.com' }
        ];
        container.innerHTML = '';
    }

    renderUsers(users);
}

function renderUsers(list) {
    const container = document.getElementById('users-table-body');
    if (!container) return;

    container.innerHTML = '';

    if (!list || list.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Nenhum usuário encontrado.';
        container.appendChild(empty);
        return;
    }

    list.forEach(user => {
        const card = createUserCard(user);
        container.appendChild(card);
    });
}

function handleTipo(id) {
    const user = users.find(u => u.id === id);
    const tipoModal = document.getElementById('tipoModal');
    if (!tipoModal) return;

    const tituloModal = tipoModal.querySelector('h2');
    if (tituloModal && user?.nome) {
        tituloModal.textContent = `TIPO - ${user.nome.toUpperCase()}`;
    }

    setTipo(tipoSelecionado);
    tipoModal.classList.add('show');
}

async function handleDelete(id) {
    const user = users.find(u => u.id === id) || { nome: 'usuário' };
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            // remove localmente
            users = users.filter(u => u.id !== id);
            renderUsers(users);
        } else {
            alert('Não foi possível excluir o usuário no servidor.');
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        // fallback: remover localmente
        users = users.filter(u => u.id !== id);
        renderUsers(users);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarTabela();

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    }

    const btnCadastro = document.querySelector('.btn-cadastro');
    if (btnCadastro) {
        btnCadastro.addEventListener('click', () => {
            window.location.href = './cadastroEstacionamento.html';
        });
    }

    const btnEstacionamentos = document.getElementById('btnEstacionamentos');
    const dropdownEstacionamentos = document.getElementById('dropdownEstacionamentos');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const editForm = document.getElementById('editForm');
    const newNameInput = document.getElementById('newNameInput');
    const btnConfirmYes = document.getElementById('btnConfirmYes');
    const btnConfirmNo = document.getElementById('btnConfirmNo');
    let itemSelecionadoParaAcao = null;

    if (btnEstacionamentos && dropdownEstacionamentos) {
        btnEstacionamentos.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownEstacionamentos.classList.toggle('show');

            const icon = btnEstacionamentos.querySelector('i');
            if (icon) {
                icon.style.transform = dropdownEstacionamentos.classList.contains('show')
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)';
            }
        });

        document.addEventListener('click', () => {
            dropdownEstacionamentos.classList.remove('show');
            const icon = btnEstacionamentos.querySelector('i');
            if (icon) icon.style.transform = 'rotate(0deg)';
        });

        dropdownEstacionamentos.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit-est');
            const deleteBtn = e.target.closest('.btn-delete-est');

            if (editBtn) {
                e.stopPropagation();
                itemSelecionadoParaAcao = editBtn.closest('li');
                const nomeAtual = itemSelecionadoParaAcao?.querySelector('span')?.textContent || '';
                if (newNameInput) newNameInput.value = nomeAtual;
                dropdownEstacionamentos.classList.remove('show');
                editModal?.classList.add('show');
            }

            if (deleteBtn) {
                e.stopPropagation();
                itemSelecionadoParaAcao = deleteBtn.closest('li');
                dropdownEstacionamentos.classList.remove('show');
                deleteModal?.classList.add('show');
            }
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const novoNome = newNameInput?.value.trim();
            if (novoNome && itemSelecionadoParaAcao) {
                const spanNome = itemSelecionadoParaAcao.querySelector('span');
                if (spanNome) spanNome.textContent = novoNome.toUpperCase();
            }
            itemSelecionadoParaAcao = null;
            editModal?.classList.remove('show');
        });
    }

    if (btnConfirmYes) {
        btnConfirmYes.addEventListener('click', () => {
            if (itemSelecionadoParaAcao) itemSelecionadoParaAcao.remove();
            itemSelecionadoParaAcao = null;
            deleteModal?.classList.remove('show');
        });
    }

    if (btnConfirmNo) {
        btnConfirmNo.addEventListener('click', () => {
            itemSelecionadoParaAcao = null;
            deleteModal?.classList.remove('show');
        });
    }

    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.classList.remove('show');
                itemSelecionadoParaAcao = null;
            }
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.classList.remove('show');
                itemSelecionadoParaAcao = null;
            }
        });
    }

    // filtro de busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = users.filter(u => (u.nome || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term));
            renderUsers(filtered);
        });
    }
});

function setTipo(tipo) {
    tipoSelecionado = tipo;

    const btnVisitante = document.getElementById('btn-visitante');
    const btnFixo = document.getElementById('btn-fixo');
    const modalDates = document.getElementById('modal-dates');

    if (btnVisitante && btnFixo) {
        btnVisitante.classList.toggle('active', tipo === 'visitante');
        btnFixo.classList.toggle('active', tipo === 'fixo');
    }

    if (modalDates) {
        modalDates.style.display = tipo === 'visitante' ? 'grid' : 'none';
    }
}

function closeModal() {
    const tipoModal = document.getElementById('tipoModal');
    if (tipoModal) tipoModal.classList.remove('show');
}

function closeModalOutside(event) {
    if (event.target?.id === 'tipoModal') {
        closeModal();
    }
}

window.setTipo = setTipo;
window.closeModal = closeModal;
window.closeModalOutside = closeModalOutside;
