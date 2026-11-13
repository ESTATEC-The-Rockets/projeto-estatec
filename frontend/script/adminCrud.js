"use strict";
const api = window.ESTATEC_API_ORIGIN;
const form = document.getElementById("userForm");
const status = document.getElementById("userStatus");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function request(path, options = {}) {
    const response = await fetch(api + path, {credentials: "include", ...options});
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("isAdmin");
        location.replace("login.html");
        throw new Error("Sessão encerrada. Entre novamente.");
    }
    if (!response.ok) throw new Error(`O servidor recusou a operação (${response.status}). Verifique os dados.`);
    return response.status === 204 ? null : response.json();
}
async function loadSummary() {
    const [users, parking, cars] = await Promise.all([request("/usuarios"), request("/estacionamento"), request("/carros")]);
    document.getElementById("userCount").textContent = `${users.length} dono(s) cadastrado(s)`;
    document.getElementById("parkingCount").textContent = `${parking.length} estacionamento(s)`;
    document.getElementById("carCount").textContent = `${cars.length} veículo(s)`;
    document.getElementById("userTableBody").innerHTML = users.length
        ? users.map(user => `<tr><td>${escapeHtml(user.nome)}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.telefone)}</td></tr>`).join("")
        : '<tr><td colspan="3">Nenhum dono cadastrado.</td></tr>';
}
if (localStorage.getItem("isAdmin") !== "true") location.replace("login.html");
else {
    loadSummary().catch(error => { status.textContent = error.message; });
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const button = form.querySelector('[type="submit"]');
        button.disabled = true;
        status.textContent = "Criando conta…";
        try {
            await request("/usuarios/cadastro", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.fromEntries(new FormData(form).entries()))});
            form.reset();
            status.textContent = "Conta criada com sucesso.";
            await loadSummary();
        } catch (error) { status.textContent = error.message; }
        finally { button.disabled = false; }
    });
    document.getElementById("logoutAdmin").addEventListener("click", async () => {
        try { await request("/usuarios/logout", {method:"POST"}); } catch (_) {}
        localStorage.removeItem("isAdmin");
        location.replace("login.html");
    });
}
