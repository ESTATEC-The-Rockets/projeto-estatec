window.estatecFetch = window.estatecFetch || ((url, options = {}) => fetch(url, { credentials: "include", ...options }));
/* Consultas reais: registros são vínculos explícitos, nunca inferidos do histórico. */
const Consultas = (() => {
    const base = (window.ESTATEC_API_ORIGIN + "");
    const model = window.ConsultaModel;
    const data = { users: [], cars: [], parking: [], memberships: [], history: [] };
    const paths = { users: '/condutores', cars: '/carros', parking: '/estacionamento', memberships: '/estacionamento/registros', history: '/historico' };
    const normalizeMembership = membership => ({ ...membership, usuarioId: membership.usuarioId ?? membership.usuario?.id ?? membership.usuario?.idUsuario, estacionamentoId: membership.estacionamentoId ?? membership.estacionamento?.idEstacionamento, carroId: membership.carroId ?? membership.carro?.idCarros });
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const userLink = (user, card = false) => user?.id ? `<a${card ? ' class="card-primary-link"' : ''} href="perfil.html?id=${encodeURIComponent(user.id)}">${esc(user.nome || 'Condutor')}</a>` : 'Condutor não identificado';
    const parkingLink = (parking, card = false) => parking?.idEstacionamento ? `<a${card ? ' class="card-primary-link"' : ''} href="estacionamento.html?id=${encodeURIComponent(parking.idEstacionamento)}">${esc(parking.nomeEstacionamento)}</a>` : 'Estacionamento não identificado';
    const carOwner = car => car.usuario || car.usario;
    const carLink = (car, card = false) => car?.idCarros ? `<a${card ? ' class="card-primary-link"' : ''} href="perfil.html?tipo=carro&id=${encodeURIComponent(car.idCarros)}">${esc(car.placa || 'Carro sem placa')}</a>` : 'Carro não identificado';
    const userById = id => data.users.find(u => Number(u.id) === Number(id));
    const parkingById = id => data.parking.find(p => Number(p.idEstacionamento) === Number(id));
    const carById = id => data.cars.find(c => Number(c.idCarros) === Number(id));
    const carsFor = id => data.cars.filter(c => Number(carOwner(c)?.id) === Number(id));
    const membershipsFor = id => data.memberships.filter(m => Number(m.usuarioId) === Number(id));
    const status = text => { document.getElementById('pageStatus').textContent = text; };

    async function request(path, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await window.estatecFetch(base + path, { ...options, signal: controller.signal });
            const text = await response.text();
            if (!response.ok) {
                let body;
                try { body = JSON.parse(text); } catch { body = null; }
                throw window.EstatecMessages.failure(window.EstatecMessages.fromResponse(body, response.status));
            }
            return text ? JSON.parse(text) : null;
        } catch (error) {
            if (error.name === 'AbortError') throw window.EstatecMessages.failure('Tente novamente em instantes.');
            throw error;
        } finally { clearTimeout(timeout); }
    }
    async function load(keys) {
        await Promise.all(keys.map(async key => {
            const list = await request(paths[key]);
            if (!Array.isArray(list)) throw window.EstatecMessages.failure('Não foi possível carregar a lista.');
            data[key] = key === 'memberships' ? list.map(normalizeMembership) : list;
        }));
    }
    const empty = message => `<p class="muted">${esc(message)}</p>`;
    const carMemberships = id => data.memberships.filter(m => Number(m.carroId) === Number(id));
    const carParking = id => [...new Map(carMemberships(id).map(m => parkingById(m.estacionamentoId)).filter(Boolean).map(p => [p.idEstacionamento, p])).values()];
    const parkingChips = car => {
        const parking = carParking(car.idCarros);
        return parking.length ? `<div class="chips">${parking.map(p => `<span class="chip">${parkingLink(p)}</span>`).join('')}</div>` : empty('Sem estacionamento vinculado.');
    };
    function carRow(car) {
        const memberships = carMemberships(car.idCarros);
        return `<article class="vehicle-row vehicle-row--driver" role="listitem" data-entity-card="car" data-entity-id="${Number(car.idCarros)}"><div class="vehicle-row-main"><h3 class="plate">${carLink(car, true)}</h3><p>${esc(car.marca)} ${esc(car.modelo)}</p></div><div class="vehicle-row-links"><span class="muted">Estacionamentos</span>${memberships.length ? memberships.map(m => `<div class="vehicle-membership">${parkingLink(parkingById(m.estacionamentoId))}${removeButton(m.id)}</div>`).join('') : empty('Sem estacionamento vinculado.')}</div></article>`;
    }
    function userCard(user) {
        const cars = carsFor(user.id);
        return `<article class="card" data-entity-card="user" data-entity-id="${Number(user.id)}"><h2>${userLink(user, true)}</h2><p class="muted">${esc(user.email)}</p><h3>Carros do condutor</h3>${cars.length ? cars.map(car => `<p>${carLink(car)} · ${esc(car.modelo)}</p>${parkingChips(car)}`).join('') : empty('Nenhum carro cadastrado.')}</article>`;
    }

    function searchToolbar(label) {
        return `<div class="toolbar"><label>Pesquisar<input id="listSearch" type="search" placeholder="${esc(label)}"></label><button type="button" class="btn-cancel" data-clear-list>Limpar pesquisa</button><span id="listCount" class="muted" role="status"></span></div><div id="listResults" class="line-list"></div>`;
    }
    function usersPage() {
        document.getElementById('pageContent').innerHTML = `<p class="muted">Condutores, registros e veículos. Selecione um item para consultar o perfil.</p>${searchToolbar('Nome, e-mail, placa ou estacionamento')}`;
        const render = () => {
            const term = document.getElementById('listSearch').value;
            const list = data.users.filter(u => model.matches([u.nome, u.email, ...carsFor(u.id).map(c => c.placa), ...membershipsFor(u.id).map(m => parkingById(m.estacionamentoId)?.nomeEstacionamento)], term));
            document.getElementById('listResults').innerHTML = list.map(userCard).join('') || empty('Nenhum condutor encontrado.');
            document.getElementById('listCount').textContent = `${list.length} condutor(s)`;
        };
        document.getElementById('listSearch').addEventListener('input', render);
        render();
    }
    function parkingPage() {
        document.getElementById('pageContent').innerHTML = `<p class="muted">Selecione um estacionamento para consultar os carros e suas placas.</p>${searchToolbar('Nome do estacionamento')}`;
        const render = () => {
            const list = data.parking.filter(p => model.matches([p.nomeEstacionamento], document.getElementById('listSearch').value));
            document.getElementById('listCount').textContent = `${list.length} estacionamento(s)`;
            document.getElementById('listResults').innerHTML = list.map(p => `<article class="card" data-entity-card="parking" data-entity-id="${Number(p.idEstacionamento)}"><h2>${parkingLink(p, true)}</h2><p class="muted">${new Set(data.memberships.filter(m => Number(m.estacionamentoId) === Number(p.idEstacionamento) && carById(m.carroId)).map(m => Number(m.carroId))).size} carro(s) vinculado(s)</p></article>`).join('') || empty('Nenhum estacionamento cadastrado.');
        };
        document.getElementById('listSearch').addEventListener('input', render);
        render();
    }

    function carsPage() {
        document.getElementById('pageContent').innerHTML = `<p class="muted">Consulte os carros e seus condutores. Para cadastrar um carro, abra o perfil do condutor.</p><div class="toolbar"><label>Pesquisar<input id="carSearch" type="search" placeholder="Placa, modelo, condutor ou estacionamento"></label><button type="button" class="btn-cancel" data-clear-cars>Limpar pesquisa</button><span id="carCount" class="muted" role="status"></span></div><div id="carResults" class="line-list"></div>`;
        const render = () => {
            const term = document.getElementById('carSearch').value;
            const list = data.cars.filter(car => {
                const user = carOwner(car);
                const parkingNames = carParking(car.idCarros).map(p => p.nomeEstacionamento);
                return model.matches([car.placa, car.marca, car.modelo, car.cor, user?.nome, ...parkingNames], term);
            });
            document.getElementById('carCount').textContent = `${list.length} carro(s)`;
            document.getElementById('carResults').innerHTML = list.map(car => {
                const user = carOwner(car);
                const parking = carParking(car.idCarros);
return `<article class="card" data-entity-card="car" data-entity-id="${Number(car.idCarros)}"><h2><span class="plate">${carLink(car, true)}</span></h2><dl><div><dt>Marca</dt><dd>${esc(car.marca || 'Não informada')}</dd></div><div><dt>Modelo</dt><dd>${esc(car.modelo || 'Não informado')}</dd></div><div><dt>Cor</dt><dd>${esc(car.cor || 'Não informada')}</dd></div></dl><h3>Condutor responsável</h3><p>${userLink(user)}</p><h3>Estacionamento do carro</h3>${parking.length ? `<div class="chips">${parking.map(item => `<span class="chip">${parkingLink(item)}</span>`).join('')}</div>` : empty('Nenhum estacionamento vinculado ao carro.')}</article>`;
            }).join('') || empty('Nenhum carro encontrado.');
        };
        document.getElementById('carSearch').addEventListener('input', render);
        document.querySelector('[data-clear-cars]').addEventListener('click', () => {
            document.getElementById('carSearch').value = '';
            render();
        });
        render();
    }
    function eventTable(events) {
        if (!events.length) return empty('Nenhuma entrada ou saída registrada para este dia.');
        return `<div class="table-wrap"><table><caption>Movimentações registradas, mais recentes primeiro</caption><thead><tr><th>Movimentação</th><th>Data</th><th>Horário</th><th>Condutor</th><th>Placa</th><th>Estacionamento</th></tr></thead><tbody>${events.map(e => `<tr><td class="${e.type === 'Entrada' ? 'event-in' : 'event-out'}">${e.type}</td><td>${esc(e.date?.split('-').reverse().join('/'))}</td><td>${esc(e.time?.slice(0, 8))}</td><td>${userLink(e.user)}</td><td class="plate">${esc(e.plate)}</td><td>${parkingLink(e.parking)}</td></tr>`).join('')}</tbody></table></div>`;
    }
    function historyView(records, showParkingFilter = false, dashboard = false) {
        const target = document.getElementById('historyArea');
        target.innerHTML = `<div class="toolbar history-toolbar"><label>Dia das movimentações<input id="historyDate" type="date" value="${model.localDay()}"></label><label>Pesquisar<input id="historySearch" type="search" placeholder="Condutor, placa ou estacionamento"></label>${showParkingFilter ? `<label class="relation-filter">Estacionamento<div class="relation-picker" data-picker="historyParking"><input type="hidden" id="historyParking"><input id="historyParkingSearch" type="search" placeholder="Pesquisar estacionamento" autocomplete="off"><div id="historyParkingOptions" class="relation-options" role="listbox" hidden></div><p id="historyParkingSelected" class="selected-relation">Todos os estacionamentos</p></div></label>` : ''}<label>Movimentação<select id="historyType"><option value="">Todas</option><option value="Entrada">Entradas</option><option value="Saída">Saídas</option><option value="Acesso negado">Acessos negados</option></select></label><button type="button" class="btn-cancel" data-reset-history>Limpar filtros</button><span class="muted" id="eventCount" role="status"></span></div><div id="parkingStats"></div><div id="historyResults"></div>`;
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
                const open = model.openCount(records, date, selected);
                const hours = Array.from({ length: 24 }, (_, hour) => entries.filter(e => Number(e.time.split(':')[0]) === hour).length);
                const max = Math.max(1, ...hours);
                document.getElementById('parkingStats').innerHTML = `<div class="stats"><div class="stat">Entradas no dia<strong>${entries.length}</strong></div><div class="stat">Saídas no dia<strong>${exits.length}</strong></div><div class="stat">Veículos no estacionamento<strong>${open}</strong></div></div><section class="panel"><h3>Entradas por horário</h3><p class="muted">O gráfico considera o dia selecionado, independentemente da pesquisa textual.</p><div class="table-wrap"><div class="hour-chart" role="img" aria-label="Entradas por hora: ${hours.map((count, hour) => `${hour}h: ${count}`).join(', ')}">${hours.map((count, hour) => `<div class="hour" title="${hour}h: ${count} entrada(s)"><div class="hour-bar" style="height:${Math.round(count / max * 100)}px"></div>${hour}h<br>${count}</div>`).join('')}</div></div></section>`;
            }
        };
        if (showParkingFilter) bindRelationPicker('historyParking', data.parking, p => p.nomeEstacionamento, p => p.idEstacionamento, 'Todos os estacionamentos', render);
        ['historyDate', 'historySearch', 'historyParking', 'historyType'].forEach(id => document.getElementById(id)?.addEventListener('input', render));
        render();
    }
    function carProfile(id) {
        document.title = 'ESTATEC - Perfil do carro';
        const heading = document.querySelector('h1');
        if (heading) heading.textContent = 'Perfil do carro';
        const car = carById(id);
        if (!car) throw window.EstatecMessages.failure('Carro não encontrado.');
        document.getElementById('pageContent').innerHTML = `<p><a href="carros.html">← Voltar aos carros</a></p><section class="panel" data-profile-entity="car" data-profile-id="${Number(id)}"><h2 class="plate">${esc(car.placa)}</h2><dl><div><dt>Marca</dt><dd>${esc(car.marca)}</dd></div><div><dt>Modelo</dt><dd>${esc(car.modelo)}</dd></div><div><dt>Cor</dt><dd>${esc(car.cor)}</dd></div><div><dt>Condutor</dt><dd>${userLink(carOwner(car))}</dd></div></dl><h3>Estacionamentos vinculados</h3>${parkingChips(car)}</section>`;
    }
    function profilePage(id) {
        if (new URLSearchParams(location.search).get('tipo') === 'carro') return carProfile(id);
        const user = userById(id);
        if (!user) throw window.EstatecMessages.failure('Condutor não encontrado.');
        const cars = carsFor(id);
        document.getElementById('pageContent').innerHTML = `<p><a href="usuario.html">← Voltar aos condutores</a></p><section class="panel" data-profile-entity="user" data-profile-id="${Number(id)}"><h2>${esc(user.nome)}</h2><dl><div><dt>E-mail</dt><dd>${esc(user.email)}</dd></div><div><dt>Telefone</dt><dd>${esc(user.telefone)}</dd></div><div><dt>CPF</dt><dd>${esc(user.cpf || 'Não informado')}</dd></div></dl></section><section class="panel"><div class="toolbar" data-driver-cars="${Number(id)}"><h2>Carros do condutor</h2></div><div class="vehicle-list" role="list" aria-label="Carros do condutor">${cars.map(car => carRow(car)).join('') || empty('Nenhum carro cadastrado. Cadastre o primeiro carro deste condutor.')}</div></section><section class="panel"><h2>Vincular um carro ao estacionamento</h2><div id="membershipControls"></div></section>`;
        membershipControls(id);
    }
    function parkingProfile(id) {
        const parking = parkingById(id);
        if (!parking) throw window.EstatecMessages.failure('Estacionamento não encontrado.');
        const memberships = [...new Map(data.memberships.filter(m => Number(m.estacionamentoId) === Number(id) && carById(m.carroId)).map(m => [Number(m.carroId), m])).values()];
        document.getElementById('pageContent').innerHTML = `<p><a href="estacionamentos.html">← Voltar aos estacionamentos</a></p><section class="panel" data-profile-entity="parking" data-profile-id="${Number(id)}"><h2>${esc(parking.nomeEstacionamento)}</h2><p>${memberships.length} carro(s) vinculado(s)</p></section><section class="panel"><h2>Carros e placas</h2><div class="vehicle-list" role="list" aria-label="Carros do estacionamento">${memberships.map(m => { const car = carById(m.carroId); return `<article class="vehicle-row" role="listitem" data-entity-card="car" data-entity-id="${Number(car.idCarros)}"><div class="vehicle-row-main"><h3 class="plate">${carLink(car, true)}</h3><p>${esc(car.marca)} ${esc(car.modelo)}</p></div><div><span class="muted">Condutor</span><p>${userLink(carOwner(car))}</p></div><div class="vehicle-row-actions">${removeButton(m.id)}</div></article>`; }).join('') || empty('Nenhum carro vinculado a este estacionamento.')}</div></section>`;
    }

    function removeButton(id) {
        return localStorage.getItem('isAdmin') === 'true' ? `<button type="button" data-remove-membership="${Number(id)}">Remover registro</button>` : '';
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
    function membershipControls(id) {
        const area = document.getElementById('membershipControls');
        if (localStorage.getItem('isAdmin') !== 'true') return;
        const cars = carsFor(id);
        if (!cars.length) { area.innerHTML = empty('Cadastre um carro deste condutor antes de vinculá-lo a um estacionamento.'); return; }
        if (!data.parking.length) { area.innerHTML = empty('Cadastre um estacionamento para vincular os carros.'); return; }
        area.innerHTML = `<form id="membershipForm" class="membership-form"><label>Carro do condutor<select id="membershipCar" required>${cars.map(car => `<option value="${Number(car.idCarros)}">${esc(car.placa)} · ${esc(car.modelo)}</option>`).join('')}</select></label><label>Estacionamento<select id="membershipTarget" required></select></label><button type="submit">Vincular carro ao estacionamento</button></form>`;
        document.getElementById('membershipCar').value = String(cars[0].idCarros);
        const updateParking = () => {
            const carId = Number(document.getElementById('membershipCar').value);
            const options = data.parking.filter(p => !data.memberships.some(m => Number(m.carroId) === carId && Number(m.estacionamentoId) === Number(p.idEstacionamento)));
            document.getElementById('membershipTarget').innerHTML = `<option value="">${options.length ? 'Selecione um estacionamento' : 'Este carro já está vinculado a todos os estacionamentos'}</option>${options.map(p => `<option value="${Number(p.idEstacionamento)}">${esc(p.nomeEstacionamento)}</option>`).join('')}`;
            document.getElementById('membershipTarget').value = '';
        };
        document.getElementById('membershipCar').addEventListener('change', updateParking);
        updateParking();
        document.getElementById('membershipForm').addEventListener('submit', async event => {
            event.preventDefault();
            const carroId = Number(document.getElementById('membershipCar').value);
            const estacionamentoId = Number(document.getElementById('membershipTarget').value);
            if (!cars.some(car => Number(car.idCarros) === carroId) || !data.parking.some(p => Number(p.idEstacionamento) === estacionamentoId)) { status('Selecione um carro do condutor e um estacionamento.'); return; }
            if (data.memberships.some(m => Number(m.carroId) === carroId && Number(m.estacionamentoId) === estacionamentoId)) { status('Este carro já está vinculado a este estacionamento.'); return; }
            const button = event.currentTarget.querySelector('button'); button.disabled = true;
            try {
                const payload = { usuario: { id: Number(id) }, carro: { idCarros: carroId }, estacionamento: { idEstacionamento: estacionamentoId } };
                await request(paths.memberships, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                await load(['memberships']); renderPage(); status('Carro vinculado ao estacionamento.');
            } catch (error) { status(window.EstatecMessages.error(error, 'Não foi possível vincular o carro.')); button.disabled = false; }
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
            const approved = await (window.Interface?.confirm || (async message => confirm(message)))('Deseja retirar este carro do estacionamento?');
            if (!approved) { button.disabled = false; return; }
            try {
                await request(paths.memberships + '/' + Number(button.dataset.removeMembership), { method: 'DELETE' });
                await load(['memberships']); renderPage(); status('Carro retirado do estacionamento.');
            } catch (error) { status(window.EstatecMessages.error(error, 'Não foi possível remover o vínculo.')); button.disabled = false; }
        });
        try {
            const required = {
                historico: ['history', 'parking'],
                usuarios: ['users', 'cars', 'parking', 'memberships'],
                carros: ['users', 'cars', 'parking', 'memberships'],
                estacionamentos: ['parking', 'cars', 'memberships'],
                perfil: ['users', 'cars', 'parking', 'memberships'],
                estacionamento: ['cars', 'parking', 'memberships']
            };
            await load(required[document.body.dataset.page]);
            renderPage(); status('');
        } catch (error) {
            status(window.EstatecMessages.error(error, 'Não foi possível carregar esta página.'));
            const retry = document.createElement('button'); retry.textContent = 'Tentar novamente'; retry.onclick = () => location.reload();
            document.getElementById('pageContent').replaceChildren(retry);
        }
    }
    return { init };
})();
document.addEventListener('DOMContentLoaded', Consultas.init);
