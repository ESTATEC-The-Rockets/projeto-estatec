/* Consultas reais: registros são vínculos explícitos, nunca inferidos do histórico. */
const Consultas = (() => {
    const base = 'http://localhost:8080';
    const model = window.ConsultaModel;
    const data = { users: [], cars: [], parking: [], memberships: [], history: [] };
    const paths = { users: '/usuarios', cars: '/carros', parking: '/estacionamento', memberships: '/estacionamento/registros', history: '/historico' };
    const normalizeMembership = membership => ({ ...membership, usuarioId: membership.usuarioId ?? membership.usuario?.id ?? membership.usuario?.idUsuario, estacionamentoId: membership.estacionamentoId ?? membership.estacionamento?.idEstacionamento, carroId: membership.carroId ?? membership.carro?.idCarros });
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const userLink = (user, card = false) => user?.id ? `<a${card ? ' class="card-primary-link"' : ''} href="perfil.html?id=${encodeURIComponent(user.id)}">${esc(user.nome || 'Usuário')}</a>` : 'Usuário não identificado';
    const parkingLink = (parking, card = false) => parking?.idEstacionamento ? `<a${card ? ' class="card-primary-link"' : ''} href="estacionamento.html?id=${encodeURIComponent(parking.idEstacionamento)}">${esc(parking.nomeEstacionamento)}</a>` : 'Estacionamento não identificado';
    const owner = parking => parking.usuario || parking.usario;
    const carOwner = car => car.usuario || car.usario;
    const userById = id => data.users.find(u => Number(u.id) === Number(id));
    const parkingById = id => data.parking.find(p => Number(p.idEstacionamento) === Number(id));
    const carById = id => data.cars.find(c => Number(c.idCarros) === Number(id));
    const carsFor = id => data.cars.filter(c => Number(c.usuario?.id) === Number(id));
    const membershipsFor = id => data.memberships.filter(m => Number(m.usuarioId) === Number(id));
    const registeredCarsFor = (userId, parkingId) => data.memberships.filter(m => Number(m.usuarioId) === Number(userId) && (!parkingId || Number(m.estacionamentoId) === Number(parkingId))).map(m => carById(m.carroId)).filter(Boolean);
    const status = text => { document.getElementById('pageStatus').textContent = text; };

    async function request(path, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(base + path, { ...options, signal: controller.signal });
            const text = await response.text();
            if (!response.ok) {
                let message = `Falha HTTP ${response.status}`;
                try { const body = JSON.parse(text); message = body.detail || body.message || message; } catch { /* resposta sem JSON */ }
                throw new Error(message);
            }
            return text ? JSON.parse(text) : null;
        } catch (error) {
            if (error.name === 'AbortError') throw new Error('O servidor demorou para responder. Tente novamente.');
            throw error;
        } finally { clearTimeout(timeout); }
    }
    async function load(keys) {
        await Promise.all(keys.map(async key => {
            const list = await request(paths[key]);
            if (!Array.isArray(list)) throw new Error('Formato inesperado na consulta ' + paths[key]);
            data[key] = key === 'memberships' ? list.map(normalizeMembership) : list;
        }));
    }
    const empty = message => `<p class="muted">${esc(message)}</p>`;
    const plates = id => {
        const cars = carsFor(id);
        return cars.length ? `<div class="chips">${cars.map(c => `<span class="chip plate">${esc(c.placa)} · ${esc(c.modelo)}</span>`).join('')}</div>` : empty('Nenhum veículo cadastrado.');
    };
    const registeredPlates = (userId, parkingId) => {
        const cars = registeredCarsFor(userId, parkingId);
        return cars.length ? `<div class="chips">${cars.map(c => `<span class="chip plate">${esc(c.placa)} · ${esc(c.modelo)}</span>`).join('')}</div>` : empty('Nenhum carro selecionado.');
    };
    function userCard(user) {
        const memberships = membershipsFor(user.id);
        return `<article class="card" data-entity-card="user" data-entity-id="${Number(user.id)}"><h2>${userLink(user, true)}</h2><p class="muted">${esc(user.email)}</p>
            <h3>Estacionamentos registrados</h3>${memberships.length ? memberships.map(m => `<details class="membership-details"><summary>${parkingLink(parkingById(m.estacionamentoId))}<span class="muted"> · Ver placas</span></summary>${plates(user.id)}</details>`).join('') : empty('Sem registros em estacionamentos.')}
            <h3>Placas do usuário</h3>${plates(user.id)}</article>`;
    }
    function searchToolbar(label) {
        return `<div class="toolbar"><label>Pesquisar<input id="listSearch" type="search" placeholder="${esc(label)}"></label><button type="button" class="btn-cancel" data-clear-list>Limpar pesquisa</button><span id="listCount" class="muted" role="status"></span></div><div id="listResults" class="line-list"></div>`;
    }
    function usersPage() {
        document.getElementById('pageContent').innerHTML = `<p class="muted">Usuários, registros e veículos. Selecione um item para consultar o perfil.</p>${searchToolbar('Nome, e-mail, placa ou estacionamento')}`;
        const render = () => {
            const term = document.getElementById('listSearch').value;
            const list = data.users.filter(u => model.matches([u.nome, u.email, ...carsFor(u.id).map(c => c.placa), ...membershipsFor(u.id).map(m => parkingById(m.estacionamentoId)?.nomeEstacionamento)], term));
            document.getElementById('listResults').innerHTML = list.map(userCard).join('') || empty('Nenhum usuário encontrado.');
            document.getElementById('listCount').textContent = `${list.length} usuário(s)`;
        };
        document.getElementById('listSearch').addEventListener('input', render);
        render();
    }
    function parkingPage() {
        document.getElementById('pageContent').innerHTML = `<p class="muted">Abra um estacionamento para consultar usuários, dashboard e movimentações.</p>${searchToolbar('Nome do estacionamento ou responsável')}`;
        const render = () => {
            const list = data.parking.filter(p => model.matches([p.nomeEstacionamento, owner(p)?.nome], document.getElementById('listSearch').value));
            document.getElementById('listCount').textContent = `${list.length} estacionamento(s)`;
            document.getElementById('listResults').innerHTML = list.map(p => `<article class="card" data-entity-card="parking" data-entity-id="${Number(p.idEstacionamento)}"><h2>${parkingLink(p, true)}</h2><p>Responsável: ${userLink(owner(p))}</p><p class="muted">${data.memberships.filter(m => Number(m.estacionamentoId) === Number(p.idEstacionamento)).length} usuário(s) cadastrado(s)</p></article>`).join('') || empty('Nenhum estacionamento cadastrado.');
        };
        document.getElementById('listSearch').addEventListener('input', render);
        render();
    }
    function carsPage() {
        document.getElementById('pageContent').innerHTML = `<p class="muted">Todos os carros cadastrados, seus usuários, estacionamentos vinculados e histórico de movimentações.</p><div class="toolbar"><label>Pesquisar<input id="carSearch" type="search" placeholder="Placa, modelo, usuário ou estacionamento"></label><label>Data do histórico<input id="carHistoryDate" type="date"></label><button type="button" class="btn-cancel" data-clear-cars>Limpar filtros</button><span id="carCount" class="muted" role="status"></span></div><div id="carResults" class="line-list"></div>`;
        const carParking = car => {
            const user = carOwner(car);
            if (!user?.id) return [];
            return data.memberships
                .filter(m => Number(m.usuarioId) === Number(user.id))
                .map(m => parkingById(m.estacionamentoId))
                .filter(Boolean);
        };
        const render = () => {
            const term = document.getElementById('carSearch').value;
            const date = document.getElementById('carHistoryDate').value;
            const list = data.cars.filter(car => {
                const user = carOwner(car);
                const parkingNames = carParking(car).map(p => p.nomeEstacionamento);
                return model.matches([car.placa, car.marca, car.modelo, car.cor, user?.nome, ...parkingNames], term);
            });
            document.getElementById('carCount').textContent = `${list.length} carro(s)`;
            document.getElementById('carResults').innerHTML = list.map(car => {
                const user = carOwner(car);
                const parking = carParking(car);
                const records = data.history.filter(record => Number(record.carro?.idCarros) === Number(car.idCarros));
                const events = model.events(records).filter(event => !date || event.date === date);
                return `<article class="card" data-entity-card="car" data-entity-id="${Number(car.idCarros)}"><h2><span class="plate">${esc(car.placa || 'Sem placa')}</span></h2><dl><div><dt>Marca</dt><dd>${esc(car.marca || 'Não informada')}</dd></div><div><dt>Modelo</dt><dd>${esc(car.modelo || 'Não informado')}</dd></div><div><dt>Cor</dt><dd>${esc(car.cor || 'Não informada')}</dd></div></dl><h3>Usuário responsável</h3><p>${userLink(user)}</p><h3>Estacionamentos do usuário</h3>${parking.length ? `<div class="chips">${parking.map(item => `<span class="chip">${parkingLink(item)}</span>`).join('')}</div>` : empty('Nenhum estacionamento vinculado ao usuário.')}<h3>Histórico do carro</h3>${eventTable(events)}</article>`;
            }).join('') || empty('Nenhum carro encontrado.');
        };
        ['carSearch', 'carHistoryDate'].forEach(id => document.getElementById(id).addEventListener('input', render));
        document.querySelector('[data-clear-cars]').addEventListener('click', () => {
            document.getElementById('carSearch').value = '';
            document.getElementById('carHistoryDate').value = '';
            render();
        });
        render();
    }
    function eventTable(events) {
        if (!events.length) return empty('Nenhuma entrada ou saída registrada para este dia.');
        return `<div class="table-wrap"><table><caption>Movimentações registradas, mais recentes primeiro</caption><thead><tr><th>Movimentação</th><th>Data</th><th>Horário</th><th>Usuário</th><th>Placa</th><th>Estacionamento</th></tr></thead><tbody>${events.map(e => `<tr><td class="${e.type === 'Entrada' ? 'event-in' : 'event-out'}">${e.type}</td><td>${esc(e.date?.split('-').reverse().join('/'))}</td><td>${esc(e.time?.slice(0, 8))}</td><td>${userLink(e.user)}</td><td class="plate">${esc(e.plate)}</td><td>${parkingLink(e.parking)}</td></tr>`).join('')}</tbody></table></div>`;
    }
    function historyView(records, showParkingFilter = false, dashboard = false) {
        const target = document.getElementById('historyArea');
        target.innerHTML = `<div class="toolbar history-toolbar"><label>Dia das movimentações<input id="historyDate" type="date" value="${model.localDay()}"></label><label>Pesquisar<input id="historySearch" type="search" placeholder="Usuário, placa ou estacionamento"></label>${showParkingFilter ? `<label class="relation-filter">Estacionamento<div class="relation-picker" data-picker="historyParking"><input type="hidden" id="historyParking"><input id="historyParkingSearch" type="search" placeholder="Pesquisar estacionamento" autocomplete="off"><div id="historyParkingOptions" class="relation-options" role="listbox" hidden></div><p id="historyParkingSelected" class="selected-relation">Todos os estacionamentos</p></div></label>` : ''}<label>Movimentação<select id="historyType"><option value="">Todas</option><option value="Entrada">Entradas</option><option value="Saída">Saídas</option></select></label><button type="button" class="btn-cancel" data-reset-history>Limpar filtros</button><span class="muted" id="eventCount" role="status"></span></div><div id="parkingStats"></div><div id="historyResults"></div>`;
        const render = () => {
            const date = document.getElementById('historyDate').value;
            const term = document.getElementById('historySearch').value;
            const selected = document.getElementById('historyParking')?.value;
            const dayEvents = model.events(records).filter(e => e.date === date && (!selected || Number(e.parking?.idEstacionamento) === Number(selected)));
            const type = document.getElementById('historyType').value;
            const filtered = dayEvents.filter(e => (!type || e.type === type) && model.matches([e.user?.nome, e.plate, e.parking?.nomeEstacionamento, e.type], term));
            document.getElementById('eventCount').textContent = `${filtered.length} movimentação(ões)`;
            document.getElementById('historyResults').innerHTML = eventTable(filtered);
            if (dashboard) {
                const entries = dayEvents.filter(e => e.type === 'Entrada');
                const exits = dayEvents.filter(e => e.type === 'Saída');
                const open = records.filter(r => r.data === date && r.horarioEntrada && !r.horarioSaida).length;
                const hours = Array.from({ length: 24 }, (_, hour) => entries.filter(e => Number(e.time.split(':')[0]) === hour).length);
                const max = Math.max(1, ...hours);
                document.getElementById('parkingStats').innerHTML = `<div class="stats"><div class="stat">Entradas no dia<strong>${entries.length}</strong></div><div class="stat">Saídas no dia<strong>${exits.length}</strong></div><div class="stat">Registros do dia em aberto<strong>${open}</strong></div></div><section class="panel"><h3>Entradas por horário</h3><p class="muted">O gráfico considera o dia selecionado, independentemente da pesquisa textual.</p><div class="table-wrap"><div class="hour-chart" role="img" aria-label="Entradas por hora: ${hours.map((count, hour) => `${hour}h: ${count}`).join(', ')}">${hours.map((count, hour) => `<div class="hour" title="${hour}h: ${count} entrada(s)"><div class="hour-bar" style="height:${Math.round(count / max * 100)}px"></div>${hour}h<br>${count}</div>`).join('')}</div></div></section>`;
            }
        };
        if (showParkingFilter) bindRelationPicker('historyParking', data.parking, p => p.nomeEstacionamento, p => p.idEstacionamento, 'Todos os estacionamentos', render);
        ['historyDate', 'historySearch', 'historyParking', 'historyType'].forEach(id => document.getElementById(id)?.addEventListener('input', render));
        render();
    }
    function profilePage(id) {
        const user = userById(id);
        if (!user) throw new Error('Usuário não encontrado. Volte à lista e selecione um usuário válido.');
        const memberships = membershipsFor(id);
        document.getElementById('pageContent').innerHTML = `<p><a href="usuario.html">← Voltar aos usuários</a></p><section class="panel"><h2>${esc(user.nome)}</h2><dl><div><dt>E-mail</dt><dd>${esc(user.email || 'Não informado')}</dd></div><div><dt>Telefone</dt><dd>${esc(user.telefone || 'Não informado')}</dd></div><div><dt>Nascimento</dt><dd>${esc(user.dataNascimento?.split('-').reverse().join('/') || 'Não informado')}</dd></div><div><dt>Identificador</dt><dd>#${esc(user.id)}</dd></div></dl></section><section class="panel"><h2>Veículos e placas</h2>${plates(id)}</section><section class="panel"><h2>Estacionamentos cadastrados</h2>${memberships.length ? memberships.map(m => `<p>${parkingLink(parkingById(m.estacionamentoId))} ${registeredPlates(id, m.estacionamentoId)} ${removeButton(m.id)}</p>`).join('') : empty('Este usuário ainda não está cadastrado em nenhum estacionamento.')}<div id="membershipControls"></div></section><section class="panel"><h2>Histórico do usuário</h2><div id="historyArea"></div></section>`;
        membershipControls('user', id);
        historyView(data.history.filter(r => Number(r.carro?.usuario?.id) === Number(id)), true);
    }
    function parkingProfile(id) {
        const parking = parkingById(id);
        if (!parking) throw new Error('Estacionamento não encontrado. Volte à lista e selecione um estacionamento válido.');
        const memberships = data.memberships.filter(m => Number(m.estacionamentoId) === Number(id));
        const users = [...new Map(memberships.map(m => userById(m.usuarioId)).filter(Boolean).map(user => [user.id, user])).values()];
        document.getElementById('pageContent').innerHTML = `<p><a href="estacionamentos.html">← Voltar aos estacionamentos</a></p><section class="panel"><h2>${esc(parking.nomeEstacionamento)}</h2><p>Responsável: ${userLink(owner(parking))}</p><p class="muted">${users.length} usuário(s) cadastrado(s). O responsável não é automaticamente um frequentador cadastrado.</p></section><section class="panel"><h2>Dashboard e histórico de entrada e saída</h2><div id="historyArea"></div></section><section class="panel"><h2>Usuários cadastrados</h2><div id="membershipControls"></div><div class="cards">${users.map(user => { const membership = memberships.find(m => Number(m.usuarioId) === Number(user.id)); return `<article class="card"><h3>${userLink(user, true)}</h3><p class="muted">${esc(user.email)}</p>${registeredPlates(user.id, id)}${removeButton(membership.id)}</article>`; }).join('') || empty('Nenhum usuário cadastrado neste estacionamento.')}</div></section>`;
        membershipControls('parking', id);
        historyView(data.history.filter(r => Number(r.estacionamento?.idEstacionamento) === Number(id)), false, true);
    }
    function removeButton(id) {
        return localStorage.getItem('isAdmin') === 'true' ? `<button type="button" data-remove-membership="${Number(id)}">Remover registro</button>` : '';
    }
    function sessionUserId() {
        try { return JSON.parse(localStorage.getItem('usuarioSessao') || 'null')?.id; } catch { return null; }
    }
    function bindRelationPicker(id, items, labelFor, valueFor, emptyLabel = 'Selecione uma opção', onChange = () => {}) {
        const search = document.getElementById(`${id}Search`);
        const options = document.getElementById(`${id}Options`);
        const hidden = document.getElementById(id);
        const selected = document.getElementById(`${id}Selected`);
        const render = () => {
            const term = search.value.trim().toLocaleLowerCase('pt-BR');
            const filtered = items.filter(item => !term || String(labelFor(item)).toLocaleLowerCase('pt-BR').includes(term));
            options.innerHTML = `<button type="button" class="relation-option relation-option-clear" data-relation-value="">${esc(emptyLabel)}</button>${filtered.map(item => `<button type="button" class="relation-option${String(valueFor(item)) === String(hidden.value) ? ' is-selected' : ''}" data-relation-value="${esc(valueFor(item))}">${esc(labelFor(item))}</button>`).join('') || '<p class="relation-empty">Nenhum resultado encontrado.</p>'}`;
            options.hidden = false;
        };
        search.addEventListener('focus', render);
        search.addEventListener('input', render);
        options.addEventListener('click', event => {
            const option = event.target.closest('[data-relation-value]');
            if (!option) return;
            hidden.value = option.dataset.relationValue || '';
            selected.textContent = hidden.value ? `Selecionado: ${option.textContent}` : emptyLabel;
            search.value = '';
            options.hidden = true;
            onChange();
        });
        document.addEventListener('click', event => {
            if (!event.target.closest(`[data-picker="${id}"]`)) options.hidden = true;
        });
    }
    function membershipControls(type, id) {
        const area = document.getElementById('membershipControls');
        if (localStorage.getItem('isAdmin') !== 'true' && !(type === 'user' && Number(sessionUserId()) === Number(id))) return;
        const fixedUser = type === 'user' ? Number(id) : '';
        const fixedParking = type === 'parking' ? Number(id) : '';
        const targetItems = type === 'user'
            ? data.parking.filter(p => !data.memberships.some(m => Number(m.usuarioId) === fixedUser && Number(m.estacionamentoId) === Number(p.idEstacionamento) && m.carroId))
            : data.users;
        const cars = type === 'user' ? data.cars.filter(c => Number(carOwner(c)?.id) === fixedUser) : data.cars;
        if (!targetItems.length) {
            area.innerHTML = empty(!cars.length ? 'Este usuÃ¡rio ainda nÃ£o possui carros cadastrados.' : 'NÃ£o hÃ¡ opÃ§Ãµes de registro disponÃ­veis.');
            return;
        }
        area.innerHTML = `<form id="membershipForm" class="membership-form"><label>${type === 'user' ? 'Estacionamento' : 'UsuÃ¡rio'}<div class="relation-picker" data-picker="membershipTarget"><input type="hidden" id="membershipTarget" required><input id="membershipTargetSearch" type="search" placeholder="Pesquisar por nome" autocomplete="off"><div id="membershipTargetOptions" class="relation-options" role="listbox" hidden></div><p id="membershipTargetSelected" class="selected-relation">Selecione uma opÃ§Ã£o</p></div></label><label>Carro do usuÃ¡rio<div class="relation-picker" data-picker="membershipCar"><input type="hidden" id="membershipCar" required><input id="membershipCarSearch" type="search" placeholder="Pesquisar placa ou modelo" autocomplete="off"><div id="membershipCarOptions" class="relation-options" role="listbox" hidden></div><p id="membershipCarSelected" class="selected-relation">Selecione um carro</p></div></label><button type="submit">Cadastrar carro no estacionamento</button></form>`;
        const targetLabel = type === 'user' ? item => item.nomeEstacionamento : item => item.nome;
        const targetValue = type === 'user' ? item => item.idEstacionamento : item => item.id;
        bindRelationPicker('membershipTarget', targetItems, targetLabel, targetValue);
        bindRelationPicker('membershipCar', cars, item => `${item.placa} Â· ${item.marca} ${item.modelo} Â· ${carOwner(item)?.nome || 'Sem dono'}`, item => item.idCarros);
        document.getElementById('membershipForm').addEventListener('submit', async event => {
            event.preventDefault();
            const target = Number(document.getElementById('membershipTarget').value);
            const selectedCar = Number(document.getElementById('membershipCar').value);
            const carId = selectedCar || (cars.length === 1 ? Number(cars[0].idCarros) : 0);
            const usuarioId = type === 'user' ? fixedUser : target;
            const estacionamentoId = type === 'parking' ? fixedParking : target;
            if (!usuarioId || !estacionamentoId || (cars.length && !carId)) { status('Selecione usuÃ¡rio, carro e estacionamento.'); return; }
            const button = event.currentTarget.querySelector('button');
            button.disabled = true;
            try {
                const payload = { usuario: { id: usuarioId }, estacionamento: { idEstacionamento: estacionamentoId } };
                if (carId) payload.carro = { idCarros: carId };
                await request(paths.memberships, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                await load(['memberships']); renderPage(); status('Carro cadastrado no estacionamento com sucesso.');
            } catch (error) { status('NÃ£o foi possÃ­vel cadastrar: ' + error.message); button.disabled = false; }
        });
    }

    function renderPage() {
        const page = document.body.dataset.page;
        const id = Number(new URLSearchParams(location.search).get('id'));
        if (page === 'usuarios') usersPage();
        else if (page === 'estacionamentos') parkingPage();
        else if (page === 'carros') carsPage();
        else if (page === 'perfil') profilePage(id);
        else if (page === 'estacionamento') parkingProfile(id);
        else if (page === 'historico') {
        document.getElementById('pageContent').innerHTML = '<p class="muted">Entradas e saídas registradas no dia selecionado.</p><section class="panel"><div id="historyArea"></div></section>';
            historyView(data.history, true);
        }
    }
    async function init() {
        document.getElementById('menuToggle').addEventListener('click', event => {
            const collapsed = document.getElementById('sidebar').classList.toggle('collapsed');
            event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
        });
        document.getElementById('pageContent').addEventListener('click', async event => {
            if (event.target.closest('[data-clear-list]')) {
                const input = document.getElementById('listSearch'); input.value = ''; input.dispatchEvent(new Event('input')); input.focus(); return;
            }
            if (event.target.closest('[data-reset-history]')) {
                document.getElementById('historyDate').value = model.localDay();
                ['historySearch', 'historyParking', 'historyType'].forEach(id => { const field = document.getElementById(id); if (field) field.value = ''; });
                document.getElementById('historyDate').dispatchEvent(new Event('input')); return;
            }
            const button = event.target.closest('[data-remove-membership]');
            if (!button || button.disabled || localStorage.getItem('isAdmin') !== 'true') return;
            button.disabled = true;
            const approved = await (window.Interface?.confirm || (async message => confirm(message)))('Remover o registro deste usuário no estacionamento? O histórico será preservado.');
            if (!approved) { button.disabled = false; return; }
            try {
                await request(paths.memberships + '/' + Number(button.dataset.removeMembership), { method: 'DELETE' });
                await load(['memberships']); renderPage(); status('Registro removido. Histórico preservado.');
            } catch (error) { status('Não foi possível remover: ' + error.message); button.disabled = false; }
        });
        try {
            const required = {
                historico: ['history', 'parking'],
                usuarios: ['users', 'cars', 'parking', 'memberships'],
                carros: ['users', 'cars', 'parking', 'memberships', 'history'],
                estacionamentos: ['users', 'parking', 'memberships'],
                perfil: ['users', 'cars', 'parking', 'memberships', 'history'],
                estacionamento: ['users', 'cars', 'parking', 'memberships', 'history']
            };
            await load(required[document.body.dataset.page]);
            renderPage(); status('');
        } catch (error) {
            status('Não foi possível carregar a página: ' + error.message + '. Verifique se o backend atualizado está em execução.');
            const retry = document.createElement('button'); retry.textContent = 'Tentar novamente'; retry.onclick = () => location.reload();
            document.getElementById('pageContent').replaceChildren(retry);
        }
    }
    return { init };
})();
document.addEventListener('DOMContentLoaded', Consultas.init);
