window.estatecFetch = window.estatecFetch || ((url, options = {}) => fetch(url, { credentials: "include", ...options }));
const API_HISTORICO = (window.ESTATEC_API_ORIGIN + "/historico");
const API_ESTACIONAMENTO = (window.ESTATEC_API_ORIGIN + "/estacionamento");

let historicoLista = [];
let estacionamentosLista = [];
let estacionamentoSelecionadoId = null;

const tableBody = document.getElementById("users-table-body");

async function requestJson(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await window.estatecFetch(url, { ...options, signal: controller.signal });
        const text = await response.text();
        let body;
        try { body = text ? JSON.parse(text) : null; } catch { body = text; }
        if (!response.ok) throw new Error(body?.message || body?.detail || "Não foi possível concluir a operação.");
        return body;
    } finally { clearTimeout(timeout); }
}

async function carregarHistorico() {
    if (!tableBody) return;
    try {
        historicoLista = await requestJson(API_HISTORICO);
        if (!Array.isArray(historicoLista)) throw new Error('Resposta inválida.');
        renderHistorico(historicoLista);
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        tableBody.innerHTML = '<tr><td colspan="5">Não foi possível carregar o histórico. <button type="button" id="retryHistory">Tentar novamente</button></td></tr>';
        document.getElementById('retryHistory').addEventListener('click', carregarHistorico);
    }
}

function renderHistorico(lista) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const events = window.ConsultaModel.events(lista || []);
    const today = events.filter(event => event.date === window.ConsultaModel.localDay());
    document.getElementById('todayEntries').textContent = today.filter(event => event.type === 'Entrada').length;
    document.getElementById('todayExits').textContent = today.filter(event => event.type === 'Saída').length;
    if (!events.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhuma movimentação registrada. Os acessos aparecerão aqui quando forem registrados no sistema.
                </td>
            </tr>
        `;
        return;
    }

    events.slice(0, 8).forEach((event) => {
        const tr = document.createElement("tr");
        const type = document.createElement('td');
        type.textContent = event.type;
        const when = document.createElement('td');
        when.textContent = `${event.date?.split('-').reverse().join('/')} · ${event.time.slice(0, 5)}`;
        const placa = document.createElement('td');
        placa.textContent = event.plate;
        const usuario = document.createElement('td');
        const dono = event.user;
        if (dono?.id) {
            const link = document.createElement('a');
            link.href = `perfil.html?id=${encodeURIComponent(dono.id)}`;
            link.textContent = dono.nome || 'Usuário';
            link.style.color = 'inherit';
            usuario.append(link);
        } else usuario.textContent = 'Não identificado';
        const parking = document.createElement('td');
        if (event.parking?.idEstacionamento) {
            const link = document.createElement('a');
            link.href = `estacionamento.html?id=${Number(event.parking.idEstacionamento)}`;
            link.textContent = event.parking.nomeEstacionamento || 'Estacionamento';
            parking.append(link);
        } else parking.textContent = 'Não identificado';
        tr.append(type, when, usuario, placa, parking);
        tableBody.appendChild(tr);
    });
}

async function carregarEstacionamentos() {
    try {
        estacionamentosLista = await requestJson(API_ESTACIONAMENTO);
        if (!Array.isArray(estacionamentosLista)) throw new Error('Resposta inválida.');
        document.getElementById('parkingCount').textContent = estacionamentosLista.length;
        renderDropdownEstacionamentos();
    } catch (error) {
        console.error("Erro ao buscar estacionamentos:", error);
        const dropdown = document.getElementById('dropdownEstacionamentos');
        if (dropdown) {
            dropdown.innerHTML = '<li><button type="button" id="retryParking">Não foi possível carregar. Tentar novamente</button></li>';
            document.getElementById('retryParking').addEventListener('click', carregarEstacionamentos);
        }
    }
}

function renderDropdownEstacionamentos() {
    const dropdown = document.getElementById("dropdownEstacionamentos");
    if (!dropdown) return;

    if (!estacionamentosLista.length) {
        dropdown.innerHTML = `<li><span>NENHUM ESTACIONAMENTO</span></li>`;
        return;
    }

    dropdown.innerHTML = estacionamentosLista
        .map((e) => `
            <li data-est-id="${e.idEstacionamento}">
                <span><a href="estacionamento.html?id=${Number(e.idEstacionamento)}">${(e.nomeEstacionamento || "SEM NOME").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).toUpperCase()}</a></span>
                <div class="actions">
                    ${localStorage.getItem('isAdmin') === 'false' ? '<button class="btn-edit-est" title="Editar" aria-label="Editar estacionamento"><i class="fa-solid fa-pencil" aria-hidden="true"></i></button>' : ''}
                </div>
            </li>
        `)
        .join("");
}

function atualizarDataAtual() {
    const currentDate = document.getElementById("currentDate");
    const currentDay = document.getElementById("currentDay");
    if (!currentDate || !currentDay) return;

    const agora = new Date();
    currentDate.textContent = agora.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    currentDay.textContent = agora.toLocaleDateString("pt-BR", { weekday: "long" });
}

function aplicarVisaoAdmin() {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const profileSpan = document.querySelector(".user-profile span");

    if (profileSpan) profileSpan.textContent = isAdmin ? "Administrador" : "Dono Estacionamento";
}

function bindLayoutEvents() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    const btnEstacionamentos = document.getElementById("btnEstacionamentos");
    const dropdownEstacionamentos = document.getElementById("dropdownEstacionamentos");
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const editForm = document.getElementById("editForm");
    const newNameInput = document.getElementById("newNameInput");
    const btnConfirmYes = document.getElementById("btnConfirmYes");
    const btnConfirmNo = document.getElementById("btnConfirmNo");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("collapsed"));
    }

    if (btnEstacionamentos && dropdownEstacionamentos) {
        const updateExpanded = () => btnEstacionamentos.setAttribute('aria-expanded', String(dropdownEstacionamentos.classList.contains('show')));
        new MutationObserver(updateExpanded).observe(dropdownEstacionamentos, { attributes: true, attributeFilter: ['class'] });
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && dropdownEstacionamentos.classList.contains('show')) { dropdownEstacionamentos.classList.remove('show'); btnEstacionamentos.focus(); } });
        btnEstacionamentos.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownEstacionamentos.classList.toggle("show");
            const icon = btnEstacionamentos.querySelector("i");
            if (icon) icon.style.transform = dropdownEstacionamentos.classList.contains("show") ? "rotate(180deg)" : "rotate(0deg)";
        });

        document.addEventListener("click", () => {
            dropdownEstacionamentos.classList.remove("show");
            const icon = btnEstacionamentos.querySelector("i");
            if (icon) icon.style.transform = "rotate(0deg)";
        });

        dropdownEstacionamentos.addEventListener("click", (e) => {
            const li = e.target.closest("li[data-est-id]");
            if (!li) return;

            const editBtn = e.target.closest(".btn-edit-est");
            const deleteBtn = e.target.closest(".btn-delete-est");
            if ((editBtn || deleteBtn) && localStorage.getItem('isAdmin') !== 'false') return;
            const id = Number(li.dataset.estId);

            if (editBtn) {
                e.stopPropagation();
                estacionamentoSelecionadoId = id;
                newNameInput.value = li.querySelector("span")?.textContent || "";
                dropdownEstacionamentos.classList.remove("show");
                editModal?.classList.add("show");
            }

            if (deleteBtn) {
                e.stopPropagation();
                estacionamentoSelecionadoId = id;
                dropdownEstacionamentos.classList.remove("show");
                deleteModal?.classList.add("show");
            }
        });
    }

    editForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (editForm.dataset.busy) return;
        const novoNome = newNameInput.value.trim();
        if (!novoNome || !estacionamentoSelecionadoId) return;

        const estacionamentoAtual = estacionamentosLista.find((e) => e.idEstacionamento === estacionamentoSelecionadoId);
        const responsavel = estacionamentoAtual?.usuario || estacionamentoAtual?.usario;
        const payload = {
            nomeEstacionamento: novoNome,
            usuario: responsavel?.id ? { id: responsavel.id } : null
        };

        editForm.dataset.busy = 'true';
        const saveButton = editForm.querySelector('[type=submit]');
        saveButton.disabled = true;
        saveButton.textContent = 'Salvando...';
        try {
            await requestJson(`${API_ESTACIONAMENTO}/${estacionamentoSelecionadoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            await carregarEstacionamentos();
            editModal?.classList.remove("show");
            estacionamentoSelecionadoId = null;
            window.Interface.notify('Estacionamento atualizado.', 'success');
        } catch (error) {
            window.Interface.notify(`Não foi possível salvar. ${error.message}`, 'error');
        } finally {
            delete editForm.dataset.busy;
            saveButton.disabled = false;
            saveButton.textContent = 'Salvar alteração';
        }
    });

    btnConfirmYes?.addEventListener("click", async () => {
        if (!estacionamentoSelecionadoId || btnConfirmYes.disabled) return;
        btnConfirmYes.disabled = true;
        btnConfirmYes.textContent = 'Excluindo...';
        try {
            await requestJson(`${API_ESTACIONAMENTO}/${estacionamentoSelecionadoId}`, { method: "DELETE" });
            await carregarEstacionamentos();
            deleteModal?.classList.remove("show");
            estacionamentoSelecionadoId = null;
            window.Interface.notify('Estacionamento excluído.', 'success');
        } catch (error) {
            window.Interface.notify(`Não foi possível excluir. Verifique se existem veículos, usuários ou históricos vinculados. ${error.message}`, 'error');
        } finally {
            btnConfirmYes.disabled = false;
            btnConfirmYes.textContent = 'Excluir estacionamento';
        }
    });

    btnConfirmNo?.addEventListener("click", () => {
        estacionamentoSelecionadoId = null;
        deleteModal?.classList.remove("show");
    });

    editModal?.addEventListener("click", (e) => {
        if (e.target === editModal) {
            editModal.classList.remove("show");
            estacionamentoSelecionadoId = null;
        }
    });

    deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove("show");
            estacionamentoSelecionadoId = null;
        }
    });

}

document.addEventListener("DOMContentLoaded", async () => {
    bindLayoutEvents();
    aplicarVisaoAdmin();
    atualizarDataAtual();
    await Promise.all([carregarHistorico(), carregarEstacionamentos()]);
});
