"use strict";

const API_USUARIOS = "http://localhost:8080/usuarios";
const API_CARROS = "http://localhost:8080/carros";
const API_ESTACIONAMENTO = "http://localhost:8080/estacionamento";
const API_REGISTROS = "http://localhost:8080/estacionamento/registros";
const $ = (id) => document.getElementById(id);
const state = { loading: false, busy: false };
const resources = {
    user: { url: API_USUARIOS, createUrl: `${API_USUARIOS}/cadastro`, id: "id", label: "usuário", plural: "usuários", columns: 6, rows: [], loaded: false, error: false, filter: "" },
    car: { url: API_CARROS, id: "idCarros", label: "carro", plural: "carros", columns: 7, rows: [], loaded: false, error: false, filter: "" },
    parking: { url: API_ESTACIONAMENTO, id: "idEstacionamento", label: "estacionamento", plural: "estacionamentos", columns: 3, rows: [], loaded: false, error: false, filter: "" },
    registration: { url: API_REGISTROS, id: "id", label: "registro", plural: "registros", columns: 5, rows: [], loaded: false, error: false, filter: "" }
};

async function requestJson(url, options = {}) {
    const { timeout = 15000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
        const text = response.status === 204 ? "" : await response.text();
        let body = text;
        if (text) {
            try { body = JSON.parse(text); } catch { /* DELETE também pode retornar texto. */ }
        }
        if (!response.ok) {
            const detail = typeof body === "string" ? body : body?.message || body?.detail || body?.error;
            throw new Error(detail || "Não foi possível concluir a operação.");
        }
        return text ? body : null;
    } catch (error) {
        if (error.name === "AbortError") throw new Error("O servidor demorou para responder. Tente novamente.");
        if (error instanceof TypeError) throw new Error("Não foi possível conectar ao sistema. Verifique sua conexão.");
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function feedback(key, message, type = "info", notify = true) {
    const status = $(key === "load" ? "loadStatus" : `${key}Status`);
    status.textContent = message;
    status.dataset.type = type;
    if (notify && typeof window.Interface?.notify === "function") {
        try { window.Interface.notify(message, type); } catch (error) { console.error("Falha no aviso da interface.", error); }
    }
}

function onlyDigits(value) { return String(value || "").replace(/\D/g, ""); }
function formatCPF(value) {
    return onlyDigits(value).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function formatTelefone(value) {
    const digits = onlyDigits(value).slice(0, 11);
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(digits.length <= 10 ? /(\d{4})(\d)/ : /(\d{5})(\d)/, "$1-$2");
}
function formatPlaca(value) { return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7); }
function getOwnerName(item) { return item?.usuario?.nome || item?.usario?.nome || "—"; }
function getOwnerId(item) { return item?.usuario?.id ?? item?.usario?.id ?? ""; }
function currentUserId() {
    try {
        const session = JSON.parse(localStorage.getItem("usuarioSessao") || "null");
        return session?.id ?? session?.idUsuario ?? null;
    } catch {
        return null;
    }
}
function userName(id) { return resources.user.rows.find((item) => String(item.id) === String(id))?.nome || `Usuário #${id ?? "—"}`; }
function parkingName(id) { return resources.parking.rows.find((item) => String(item.idEstacionamento) === String(id))?.nomeEstacionamento || `Estacionamento #${id ?? "—"}`; }
function carForId(id) { return resources.car.rows.find((item) => String(item.idCarros) === String(id)); }
function carLabel(id) { const car = carForId(id); return car ? `${car.placa} · ${car.marca} ${car.modelo}` : `Carro #${id ?? "—"}`; }

function setControls() {
    const locked = state.loading || state.busy;
    Object.keys(resources).forEach((key) => {
        const form = $(`${key}Form`);
        form.setAttribute("aria-busy", String(locked));
        form.querySelectorAll("input, select, button").forEach((control) => { control.disabled = locked; });
        $(`${key}TableBody`).querySelectorAll("button").forEach((button) => { button.disabled = locked; });
    });
    $("retryLoad").disabled = locked;
}

function registrationIds(row) {
    return {
        usuarioId: row.usuarioId ?? row.usuario?.id ?? row.usuario?.idUsuario,
        carroId: row.carroId ?? row.carro?.idCarros,
        estacionamentoId: row.estacionamentoId ?? row.estacionamento?.idEstacionamento
    };
}

function renderOwnerPicker(id) {
    const input = $(`${id.replace("Id", "Search")}`);
    const options = $(`${id.replace("Id", "Options")}`);
    const selected = $(id).value;
    const term = input.value.trim().toLocaleLowerCase("pt-BR");
    const users = resources.user.rows.filter((user) => !term || `${user.nome} ${user.email}`.toLocaleLowerCase("pt-BR").includes(term));
    options.innerHTML = `<button type="button" class="relation-option relation-option-clear" data-owner-value="">Sem dono</button>${users.map((user) => `<button type="button" class="relation-option${String(user.id) === String(selected) ? " is-selected" : ""}" data-owner-value="${escapeHtml(user.id)}"><strong>${escapeHtml(user.nome)}</strong><small>${escapeHtml(user.email || `ID ${user.id}`)}</small></button>`).join("") || `<p class="relation-empty">Nenhum usuário encontrado.</p>`}`;
    options.hidden = false;
}
function fillOwnerSelects() {
    ["carUsuarioId"].forEach((id) => {
        const selected = $(id).value;
        const user = resources.user.rows.find((item) => String(item.id) === String(selected));
        $(`${id.replace("Id", "Selected")}`).textContent = user ? `Selecionado: ${user.nome}` : "Sem dono";
        renderOwnerPicker(id);
        $(`${id.replace("Id", "Options")}`).hidden = true;
    });
}

function renderRegistrationPicker(id, items, labelFor) {
    const input = $(`${id.replace("Id", "Search")}`);
    const options = $(`${id.replace("Id", "Options")}`);
    const selected = $(id).value;
    const term = input.value.trim().toLocaleLowerCase("pt-BR");
    const filtered = items.filter((item) => !term || labelFor(item).toLocaleLowerCase("pt-BR").includes(term));
    options.innerHTML = filtered.map((item) => {
        const value = id === "registrationUsuarioId" ? item.id : id === "registrationCarroId" ? item.idCarros : item.idEstacionamento;
        return `<button type="button" class="relation-option${String(value) === String(selected) ? " is-selected" : ""}" data-registration-value="${escapeHtml(value)}"><strong>${escapeHtml(labelFor(item))}</strong></button>`;
    }).join("") || `<p class="relation-empty">Nenhum resultado encontrado.</p>`;
    options.hidden = false;
}

function fillRegistrationPickers() {
    const definitions = {
        registrationUsuarioId: [resources.user.rows, (item) => `${item.nome} · ${item.email || ""}`],
        registrationCarroId: [resources.car.rows.filter((item) => getOwnerId(item)), (item) => `${item.placa} · ${item.marca} ${item.modelo} · ${getOwnerName(item)}`],
        registrationParkingId: [resources.parking.rows, (item) => `${item.nomeEstacionamento} · ${getOwnerName(item)}`]
    };
    Object.entries(definitions).forEach(([id, [items, labelFor]]) => {
        const selected = $(id).value;
        const item = items.find((value) => String(id === "registrationUsuarioId" ? value.id : id === "registrationCarroId" ? value.idCarros : value.idEstacionamento) === String(selected));
        $(`${id.replace("Id", "Selected")}`).textContent = item ? `Selecionado: ${labelFor(item)}` : `Selecione ${id === "registrationUsuarioId" ? "um usuário" : id === "registrationCarroId" ? "um carro" : "um estacionamento"}`;
        const search = $(`${id.replace("Id", "Search")}`);
        const options = $(`${id.replace("Id", "Options")}`);
        search.onfocus = () => renderRegistrationPicker(id, definitions[id][0], definitions[id][1]);
        search.oninput = () => renderRegistrationPicker(id, definitions[id][0], definitions[id][1]);
        options.onclick = (event) => {
            const option = event.target.closest("[data-registration-value]");
            if (!option) return;
            $(id).value = option.dataset.registrationValue;
            search.value = "";
            options.hidden = true;
            fillRegistrationPickers();
        };
    });
}

function render(key) {
    const resource = resources[key];
    const filter = resource.filter.toLocaleLowerCase("pt-BR");
    const cellsFor = (row) => {
        if (key === "user") return [row.id, row.nome, row.email, row.cpf, row.telefone];
        if (key === "car") return [row.idCarros, row.placa, row.marca, row.modelo, row.cor, getOwnerName(row)];
        if (key === "registration") { const ids = registrationIds(row); return [row.id, userName(ids.usuarioId), carLabel(ids.carroId), parkingName(ids.estacionamentoId)]; }
        return [row.idEstacionamento, row.nomeEstacionamento];
    };
    const rows = resource.rows.filter((row) => cellsFor(row).join(" ").toLocaleLowerCase("pt-BR").includes(filter));
    $(`${key}Count`).textContent = resource.loaded
        ? `${rows.length} de ${resource.rows.length} registro(s)${resource.error ? " · dados anteriores" : ""}`
        : "Dados ainda não carregados";
    let empty = filter ? "Nenhum resultado para este filtro." : `Nenhum ${resource.label} cadastrado.`;
    if (!resource.loaded) empty = resource.error ? "Não foi possível carregar. Use Tentar novamente acima." : "Carregando registros…";
    $(`${key}TableBody`).innerHTML = rows.length ? rows.map((row) => {
        const id = escapeHtml(row[resource.id]);
        return `<tr>${cellsFor(row).map((value) => `<td>${escapeHtml(value ?? "—")}</td>`).join("")}<td><div class="row-actions"><button type="button" class="btn-edit icon-action" data-${key}-edit="${id}" aria-label="Editar ${resource.label} ${id}" title="Editar ${resource.label}"><i class="fa-solid fa-pencil" aria-hidden="true"></i></button><button type="button" class="btn-delete icon-action" data-${key}-delete="${id}" aria-label="Excluir ${resource.label} ${id}" title="Excluir ${resource.label}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div></td></tr>`;
    }).join("") : `<tr><td colspan="${resource.columns}" class="empty-state">${empty}</td></tr>`;
    setControls();
}

async function loadAll() {
    if (state.loading) return false;
    state.loading = true;
    setControls();
    feedback("load", "Carregando dados…", "info", false);
    const keys = Object.keys(resources);
    const results = await Promise.allSettled(keys.map(async (key) => {
        const rows = await requestJson(resources[key].url);
        if (!Array.isArray(rows)) throw new Error("Não foi possível carregar a lista.");
        return rows;
    }));
    const failures = [];
    results.forEach((result, index) => {
        const key = keys[index];
        const resource = resources[key];
        resource.error = result.status === "rejected";
        if (resource.error) {
            failures.push(resource.plural);
            feedback(key, `Falha ao carregar ${resource.plural}: ${result.reason.message} Use Tentar novamente.`, "error", false);
        } else {
            resource.rows = key === "registration" ? result.value.map((row) => ({ ...row, ...registrationIds(row) })) : result.value;
            resource.loaded = true;
            if ($(`${key}Status`).dataset.loadError === "true") feedback(key, "Dados atualizados.", "info", false);
        }
        $(`${key}Status`).dataset.loadError = String(resource.error);
    });
    if (results[0].status === "fulfilled") fillOwnerSelects();
    if (results.every((result) => result.status === "fulfilled")) fillRegistrationPickers();
    state.loading = false;
    keys.forEach(render);
    $("retryLoad").hidden = failures.length === 0;
    feedback("load", failures.length
        ? `Falha ao carregar: ${failures.join(", ")}. Dados anteriores foram mantidos, quando disponíveis.`
        : "Dados atualizados.", failures.length ? "error" : "info", failures.length > 0);
    return failures.length === 0;
}

function setEditMode(key, id = "") {
    const editing = Boolean(id);
    $(`${key}Id`).value = id;
    $(`${key}Form`).dataset.editing = String(editing);
    $(`${key}FormTitle`).textContent = editing ? `Editando ${resources[key].label} #${id}` : `Novo ${resources[key].label}`;
    $(`${key}CancelEdit`).hidden = !editing;
    $(`${key}Form`).querySelector('[type="submit"]').textContent = editing ? "Salvar alterações" : `Salvar ${resources[key].label}`;
    if (key === "user") {
        $("userSenha").value = "";
        $("userSenhaLabel").textContent = editing ? "Nova senha (obrigatória)" : "Senha";
        $("userSenhaHelp").textContent = editing
            ? "Informe uma nova senha com pelo menos 8 caracteres. Ela substituirá a senha atual."
            : "Use no mínimo 8 caracteres.";
    }
}

function openModal(key) {
    const modal = $(`${key}Modal`);
    if (modal && !modal.open) modal.showModal();
}

function closeModal(key) {
    const modal = $(`${key}Modal`);
    if (modal?.open) modal.close();
}

function resetForm(key) {
    $(`${key}Form`).reset();
    $(`${key}Form`).querySelectorAll("input, select").forEach((field) => field.setCustomValidity(""));
    setEditMode(key);
    closeModal(key);
}

function editRow(key, id) {
    const row = resources[key].rows.find((item) => String(item[resources[key].id]) === id);
    if (!row) return;
    $(`${key}Form`).querySelectorAll("input, select").forEach((field) => field.setCustomValidity(""));
    setEditMode(key, id);
    const fields = key === "user" ? {
        userNome: row.nome, userEmail: row.email, userCpf: formatCPF(row.cpf), userRg: row.rg,
        userTelefone: formatTelefone(row.telefone), userDataNascimento: String(row.dataNascimento || "").slice(0, 10)
    } : key === "car" ? {
        carMarca: row.marca, carModelo: row.modelo, carPlaca: formatPlaca(row.placa), carCor: row.cor, carUsuarioId: getOwnerId(row)
    } : { parkingNome: row.nomeEstacionamento };
    Object.entries(fields).forEach(([id, value]) => {
        const field = $(id);

        field.value = value ?? "";
        if (id.endsWith("UsuarioId")) {
            const user = resources.user.rows.find((item) => String(item.id) === String(value));
            $(`${id.replace("Id", "Selected")}`).textContent = user ? `Selecionado: ${user.nome}` : "Sem dono";
            $(`${id.replace("Id", "Search")}`).value = "";
        }
    });
    if (key === "registration") fillRegistrationPickers();
    feedback(key, "Modo de edição ativo. Altere os campos ou cancele a edição.", "info", false);
    openModal(key);
    $(`${key}Form`).scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    $(key === "user" ? "userNome" : key === "car" ? "carMarca" : key === "parking" ? "parkingNome" : "registrationUsuarioSearch").focus({ preventScroll: true });
}

function payloadFromForm(key) {
    const value = (id) => $(id).value.trim();
    if (key === "user") return {
        nome: value("userNome"), email: value("userEmail"), senha: $("userSenha").value,
        cpf: value("userCpf"), rg: value("userRg"), telefone: value("userTelefone"), dataNascimento: value("userDataNascimento")
    };
    const ownerId = key === "car" ? Number(value("carUsuarioId")) : currentUserId();
    const usuario = ownerId ? { id: ownerId } : null;
    if (key === "car") return { marca: value("carMarca"), modelo: value("carModelo"), placa: formatPlaca(value("carPlaca")), cor: value("carCor"), usuario };
    if (key === "registration") {
        const usuarioId = Number(value("registrationUsuarioId"));
        const carroId = Number(value("registrationCarroId"));
        const estacionamentoId = Number(value("registrationParkingId"));
        return { usuario: { id: usuarioId }, carro: { idCarros: carroId }, estacionamento: { idEstacionamento: estacionamentoId }, usuarioId, carroId, estacionamentoId };
    }
    return { nomeEstacionamento: value("parkingNome"), usuario };
}

function validatePayload(key, payload) {
    const reject = (id, message) => {
        $(id).setCustomValidity(message);
        $(id).reportValidity();
        $(id).focus();
        throw new Error(message);
    };
    const namePattern = /^[\p{L}]+( [\p{L}]+)*$/u;
    if (key === "user") {
        if (!namePattern.test(payload.nome) || payload.nome.length > 120) reject("userNome", "Use apenas letras e espaços, até 120 caracteres.");
        if (!payload.senha.trim() || payload.senha.length < 8) reject("userSenha", "Informe uma senha com pelo menos 8 caracteres, inclusive na edição.");
        if (onlyDigits(payload.cpf).length !== 11) reject("userCpf", "CPF deve conter 11 dígitos.");
        if (!/^[A-Za-z0-9.-]{7,12}$/.test(payload.rg)) reject("userRg", "RG deve ter de 7 a 12 caracteres: letras, números, ponto ou hífen.");
        if (!/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(payload.telefone)) reject("userTelefone", "Informe um telefone brasileiro válido, com DDD.");
        if (!payload.dataNascimento || payload.dataNascimento > $("userDataNascimento").max) reject("userDataNascimento", "A data de nascimento deve estar no passado.");
    } else if (key === "car") {
        if (payload.marca.length < 3 || payload.marca.length > 15) reject("carMarca", "Marca deve ter de 3 a 15 caracteres.");
        if (payload.modelo.length < 2 || payload.modelo.length > 50) reject("carModelo", "Modelo deve ter de 2 a 50 caracteres.");
        if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(payload.placa)) reject("carPlaca", "Use uma placa no formato ABC1234 ou ABC1D23.");
    } else if (key === "registration") {
        if (!payload.usuarioId) reject("registrationUsuarioSearch", "Selecione um usuário.");
        if (!payload.carroId) reject("registrationCarroSearch", "Selecione um carro.");
        if (!payload.estacionamentoId) reject("registrationParkingSearch", "Selecione um estacionamento.");
    } else if (!namePattern.test(payload.nomeEstacionamento)) {
        reject("parkingNome", "O nome do estacionamento deve conter apenas letras e espaços.");
    }
}

async function saveForm(key, event) {
    event.preventDefault();
    if (state.busy || state.loading) return;
    const form = $(`${key}Form`);
    try {
        const payload = payloadFromForm(key);
        validatePayload(key, payload);
        if (!form.reportValidity()) return;
        const id = $(`${key}Id`).value;
        const resource = resources[key];
        state.busy = true;
        setControls();
        feedback(key, "Salvando…", "info", false);
        await requestJson(id ? `${resource.url}/${encodeURIComponent(id)}` : resource.createUrl || resource.url, {
            method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        resetForm(key);
        const refreshed = await loadAll();
        feedback(key, `${resource.label[0].toUpperCase() + resource.label.slice(1)} salvo.${refreshed ? "" : " A gravação foi concluída, mas a atualização das listas falhou. Use Tentar novamente; não reenvie o registro."}`, refreshed ? "success" : "warning");
    } catch (error) {
        feedback(key, `Não foi possível salvar: ${error.message}`, "error");
    } finally {
        state.busy = false;
        setControls();
    }
}

async function deleteRow(key, id) {
    if (state.busy || state.loading) return;
    state.busy = true;
    setControls();
    try {
        if (typeof window.Interface?.confirm !== "function") {
            feedback(key, "A confirmação está indisponível. Nenhum registro foi excluído. Verifique o carregamento da interface.", "error");
            return;
        }
        const approved = await window.Interface.confirm(`Excluir ${resources[key].label} #${id}? Esta ação não pode ser desfeita.`);
        if (approved !== true) {
            feedback(key, "Exclusão cancelada. Nenhum registro foi alterado.", "info", false);
            return;
        }
        feedback(key, "Excluindo…", "info", false);
        await requestJson(`${resources[key].url}/${encodeURIComponent(id)}`, { method: "DELETE" });
        if ($(`${key}Id`).value === id) resetForm(key);
        const refreshed = await loadAll();
        feedback(key, `Registro excluído.${refreshed ? "" : " A atualização das listas falhou. Use Tentar novamente; não repita a exclusão."}`, refreshed ? "success" : "warning");
    } catch (error) {
        feedback(key, `Não foi possível excluir: ${error.message}`, "error");
    } finally {
        state.busy = false;
        setControls();
    }
}

function bindTabs() {
    const tabs = Array.from($("adminTabs").querySelectorAll('[role="tab"]'));
    const activate = (selected, focus = false) => {
        tabs.forEach((tab) => {
            const active = tab === selected;
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
            $(tab.getAttribute("aria-controls")).hidden = !active;
        });
        if (focus) selected.focus();
    };
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activate(tab));
        tab.addEventListener("keydown", (event) => {
            let next;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault();
            activate(tabs[next], true);
        });
    });
}

function protectRoute() {
    // Mantém a proteção existente; não substitui autorização no backend.
    if (localStorage.getItem("isAdmin") === "true") return true;
    feedback("load", "Acesso restrito ao administrador.", "error");
    window.location.href = "./menu.html";
    return false;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!protectRoute()) return;
    bindTabs();
    document.querySelectorAll("[data-modal]").forEach((button) => {
        button.addEventListener("click", () => {
            const key = button.dataset.modal.replace("Modal", "");
            resetForm(key);
            openModal(key);
        });
    });
    document.querySelectorAll("[data-modal-close]").forEach((button) => {
        button.addEventListener("click", () => closeModal(button.dataset.modalClose.replace("Modal", "")));
    });
    document.querySelectorAll(".crud-modal").forEach((modal) => {
        modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
    });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    $("userDataNascimento").max = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    [["userCpf", formatCPF], ["userTelefone", formatTelefone], ["carPlaca", formatPlaca]].forEach(([id, format]) => {
        $(id).addEventListener("input", () => { $(id).value = format($(id).value); });
    });
    Object.keys(resources).forEach((key) => {
        const form = $(`${key}Form`);
        form.addEventListener("input", (event) => { if (event.target.setCustomValidity) event.target.setCustomValidity(""); });
        form.addEventListener("invalid", (event) => feedback(key, event.target.validationMessage, "error", false), true);
        form.addEventListener("submit", (event) => { void saveForm(key, event); });
        $(`${key}CancelEdit`).addEventListener("click", () => {
            if (state.busy || state.loading) return;
            resetForm(key);
            feedback(key, "Edição cancelada.", "info", false);
            form.querySelector("input:not([type='hidden'])").focus();
        });
        $(`${key}Search`).addEventListener("input", (event) => {
            resources[key].filter = event.target.value.trim();
            render(key);
        });
        $(`${key}TableBody`).addEventListener("click", (event) => {
            if (state.busy || state.loading) return;
            const edit = event.target.closest(`[data-${key}-edit]`);
            const remove = event.target.closest(`[data-${key}-delete]`);
            if (edit) editRow(key, edit.getAttribute(`data-${key}-edit`));
            if (remove) void deleteRow(key, remove.getAttribute(`data-${key}-delete`));
        });
    });
    ["carUsuarioId"].forEach((id) => {
        const search = $(`${id.replace("Id", "Search")}`);
        const options = $(`${id.replace("Id", "Options")}`);
        search.addEventListener("focus", () => renderOwnerPicker(id));
        search.addEventListener("input", () => renderOwnerPicker(id));
        options.addEventListener("click", (event) => {
            const option = event.target.closest("[data-owner-value]");
            if (!option) return;
            $(id).value = option.dataset.ownerValue || "";
            const user = resources.user.rows.find((item) => String(item.id) === String($(id).value));
            $(`${id.replace("Id", "Selected")}`).textContent = user ? `Selecionado: ${user.nome}` : "Sem dono";
            search.value = "";
            options.hidden = true;
        });
        document.addEventListener("click", (event) => {
            if (!event.target.closest(`[data-picker="${id}"]`)) options.hidden = true;
        });
    });    $("retryLoad").addEventListener("click", () => { if (!state.busy && !state.loading) void loadAll(); });
    $("logoutAdmin").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("usuarioSessao");
        window.location.href = "../index.html";
    });
    void loadAll();
});
