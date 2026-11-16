const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = require('../script/consultas-model.js');
const user = { id: 1, nome: 'João Silva', email: 'joao@example.com', telefone: '11999999999' };
const parking = { idEstacionamento: 7, nomeEstacionamento: 'Central', usario: user };
const history = [{ id: 1, data: model.localDay(), horarioEntrada: '08:00:00', horarioSaida: '10:30:00', carro: { usuario: user, placa: 'ABC1D23' }, estacionamento: parking }];

test('contrato real da API preserva entrada, saída, negação e placa histórica', () => {
    const base = { estacionamento: parking, placaLida: 'ABC1D23', carro: { placa: 'NOVA123', usuario: user }, autorizado: true };
    const records = [
        { ...base, id: 1, dataHora: '2026-11-16T23:00:00', entrada: true },
        { ...base, id: 2, dataHora: '2026-11-17T01:00:00', entrada: false, carro: null },
        { ...base, id: 3, dataHora: '2026-11-17T02:00:00', entrada: true, autorizado: false }
    ];
    const events = model.events(records);
    assert.deepEqual(events.map(e => e.type), ['Acesso negado', 'Saída', 'Entrada']);
    assert.ok(events.every(e => e.plate === 'ABC1D23'));
    assert.equal(events[1].date, '2026-11-17');
    assert.equal(events[1].time, '01:00:00');
    assert.equal(model.openCount(records, '2026-11-16'), 1);
    assert.equal(model.openCount(records, '2026-11-17'), 0);
    assert.equal(model.openCount(records, '2026-11-16', 999), 0);
});

test('CPF verifica os dígitos e rejeita sequências repetidas', () => {
    assert.equal(model.validCpf('529.982.247-25'), true);
    assert.equal(model.validCpf('11144477735'), true);
    assert.equal(model.validCpf('11111111111'), false);
    assert.equal(model.validCpf('52998224726'), false);
});

test('uma permanência com dois horários gera entrada e saída, mais recente primeiro', () => {
    const events = model.events(history);
    assert.equal(events.length, 2);
    assert.equal(events[0].type, 'Saída');
    assert.equal(events[0].user.id, 1);
    assert.equal(events[0].plate, 'ABC1D23');
    assert.equal(events[0].parking.idEstacionamento, 7);
});
test('registro aberto não inventa saída e registro sem hora não inventa movimento', () => {
    assert.equal(model.events([{ ...history[0], horarioSaida: null }]).length, 1);
    assert.equal(model.events([{ id: 2, data: '2026-10-20' }]).length, 0);
});
test('ordenação considera data e não somente horário', () => {
    const events = model.events([{ ...history[0], data: '2026-10-19' }, { ...history[0], id: 2, data: '2026-10-20', horarioEntrada: '01:00:00', horarioSaida: null }]);
    assert.equal(events[0].recordId, 2);
});
test('busca ignora acentos e caixa e usa data local', () => {
    assert.ok(model.matches(['João Silva'], 'JOAO'));
    assert.equal(model.localDay(new Date(2026, 9, 21, 23, 30)), '2026-10-21');
});

/* DOM mínimo para testar o contrato de renderização e os handlers sem dependências externas. */
function harness(page, query = '?id=1', memberships = [{ id: 9, usuarioId: 1, carroId: 2, estacionamentoId: 7 }], failure = false, overrides = {}) {
    const elements = new Map();
    class Element {
        constructor(id) { this.id = id; this.value = ''; this.listeners = {}; this.textContent = ''; this.disabled = false; this.classList = { toggle: () => true }; }
        set innerHTML(html) {
            this.html = html;
            for (const match of html.matchAll(/<(input|select|div|span|form)[^>]*id="([^"]+)"[^>]*>/g)) {
                const el = new Element(match[2]);
                el.value = /value="([^"]*)"/.exec(match[0])?.[1] || '';
                elements.set(match[2], el);
            }
        }
        get innerHTML() { return this.html || ''; }
        addEventListener(type, fn) { this.listeners[type] = fn; }
        setAttribute() {}
        replaceChildren() { this.innerHTML = ''; }
        querySelector() { return new Element('button'); }
    }
    for (const id of ['pageContent', 'pageStatus', 'menuToggle', 'sidebar']) elements.set(id, new Element(id));
    const requests = [];
    const context = { window: { ConsultaModel: model, EstatecMessages: require('../script/mensagens.js'), ESTATEC_API_ORIGIN: 'http://api.estatec.lab' }, URLSearchParams, AbortController, setTimeout, clearTimeout, location: { search: query, reload() {} }, console,
        localStorage: { getItem: () => 'true' }, confirm: () => true,
        document: { body: { dataset: { page } }, getElementById: id => elements.get(id), createElement: () => new Element('new'), querySelector: () => new Element('button'), addEventListener() {} },
        fetch: async (url, options = {}) => {
            const endpoint = url.replace('http://api.estatec.lab', '');
            requests.push({ endpoint, options });
            let data;
            if (endpoint === '/condutores') data = [user];
            if (endpoint === '/carros') data = [{ idCarros: 2, placa: 'ABC1D23', modelo: 'Civic', usuario: user }];
            if (endpoint === '/estacionamento') data = [parking];
            if (endpoint === '/estacionamento/registros') data = memberships;
            if (endpoint === '/historico') data = history;
            data = overrides[endpoint] ?? data;
            return { ok: !failure, status: failure ? 503 : 200, text: async () => JSON.stringify(failure ? { message: 'Indisponível' } : data) };
        }
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../script/consultas.js'), 'utf8') + '\nthis.start = Consultas.init;', context);
    return { start: context.start, elements, requests };
}
test('lista de condutores contém vínculo explícito, placas e link do perfil', async () => {
    const app = harness('usuarios'); await app.start();
    const html = app.elements.get('listResults').innerHTML;
    assert.match(html, /perfil.html\?id=1/);
    assert.match(html, /estacionamento.html\?id=7/);
    assert.match(html, /ABC1D23/);
    app.elements.get('listSearch').value = 'inexistente';
    app.elements.get('listSearch').listeners.input();
    assert.match(app.elements.get('listResults').innerHTML, /Nenhum condutor/);
});
test('histórico não é usado para inventar registro', async () => {
    const app = harness('usuarios', '', []); await app.start();
    assert.match(app.elements.get('listResults').innerHTML, /Sem estacionamento vinculado/);
    assert.doesNotMatch(app.elements.get('listResults').innerHTML, /estacionamento.html\?id=7/);
});
test('lista de estacionamentos aponta para perfil', async () => {
    const app = harness('estacionamentos'); await app.start();
    assert.match(app.elements.get('listResults').innerHTML, /estacionamento.html\?id=7/);
});
test('perfil de condutor possui informações gerais, veículos e estacionamentos', async () => {
    const app = harness('perfil'); await app.start();
    assert.match(app.elements.get('pageContent').innerHTML, /joao@example.com/);
    assert.match(app.elements.get('pageContent').innerHTML, /ABC1D23/);
    assert.match(app.elements.get('pageContent').innerHTML, /estacionamento.html\?id=7/);
});
test('perfil do estacionamento lista carros e placas relacionados ao condutor', async () => {
    const app = harness('estacionamento', '?id=7'); await app.start();
    const html = app.elements.get('pageContent').innerHTML;
    assert.match(html, /perfil.html\?id=1/);
    assert.match(html, /perfil.html\?tipo=carro&id=2/);
    assert.match(html, /ABC1D23/);
    assert.doesNotMatch(html, /Condutores cadastrados|historyArea|membershipControls|joao@example.com/);
});

test('estacionamentos pertencem ao carro exato, sem herdar os de outro carro do condutor', async () => {
    const overrides = {
        '/carros': [{idCarros:2,placa:'ABC1D23',modelo:'Civic',usuario:user},{idCarros:3,placa:'XYZ9A87',modelo:'Corolla',usuario:user}],
        '/estacionamento': [parking,{idEstacionamento:8,nomeEstacionamento:'Outro Patio'}]
    };
    const memberships=[{id:9,usuarioId:1,carroId:2,estacionamentoId:7},{id:10,usuarioId:1,carroId:3,estacionamentoId:8}];
    const app=harness('carros','',memberships,false,overrides);await app.start();
    const html=app.elements.get('carResults').innerHTML;
    const first=html.split('</article>')[0];const second=html.split('</article>')[1];
    assert.match(first,/estacionamento.html\?id=7/);assert.doesNotMatch(first,/estacionamento.html\?id=8/);
    assert.match(second,/estacionamento.html\?id=8/);assert.doesNotMatch(second,/estacionamento.html\?id=7/);
});

test('dois carros do mesmo condutor podem ser vinculados ao mesmo estacionamento', async () => {
    const app=harness('perfil','?id=1',[{id:9,usuarioId:1,carroId:2,estacionamentoId:7}],false,{
        '/carros':[{idCarros:2,placa:'ABC1D23',modelo:'Civic',usuario:user},{idCarros:3,placa:'XYZ9A87',modelo:'Corolla',usuario:user}]
    });await app.start();
    app.elements.get('membershipCar').value='3';app.elements.get('membershipCar').listeners.change();
    assert.match(app.elements.get('membershipTarget').innerHTML,/value="7"/);
    app.elements.get('membershipTarget').value='7';
    await app.elements.get('membershipForm').listeners.submit({preventDefault(){},currentTarget:app.elements.get('membershipForm')});
    const request=app.requests.find(r=>r.options.method==='POST');
    assert.equal(JSON.parse(request.options.body).carro.idCarros,3);
});

test('perfil do carro possui somente dados essenciais e nao consulta historico', async () => {
    const app=harness('perfil','?tipo=carro&id=2');await app.start();
    assert.match(app.elements.get('pageContent').innerHTML,/data-profile-entity="car"/);
    assert.doesNotMatch(app.elements.get('pageContent').innerHTML,/Histórico|historyArea|membershipControls|data-driver-cars/);
    assert.equal(app.requests.some(r=>r.endpoint==='/historico'),false);
});

test('histórico diário permite selecionar outro dia e preserva identidade completa', async () => {
    const app = harness('historico'); await app.start();
    const html = app.elements.get('historyResults').innerHTML;
    for (const value of ['João Silva', 'ABC1D23', 'Central', '10:30:00']) assert.ok(html.includes(value));
    app.elements.get('historyDate').value = '2000-01-01';
    app.elements.get('historyDate').listeners.input();
    assert.match(app.elements.get('historyResults').innerHTML, /Nenhuma entrada ou saída/);
});
test('ID inexistente e falha da API mostram erro, nunca dados fictícios', async () => {
    const missing = harness('perfil', '?id=999'); await missing.start();
    assert.match(missing.elements.get('pageStatus').textContent, /Condutor não encontrado/);
    const failed = harness('usuarios', '', [], true); await failed.start();
    assert.match(failed.elements.get('pageStatus').textContent, /Tente novamente em instantes/);
});
test('registro pelo perfil envia IDs de condutor e estacionamento para persistência', async () => {
    const app = harness('perfil', '?id=1', []); await app.start();
    app.elements.get('membershipTarget').value = '7';
    await app.elements.get('membershipForm').listeners.submit({ preventDefault() {}, currentTarget: app.elements.get('membershipForm') });
    const request = app.requests.find(r => r.options.method === 'POST');
    assert.equal(request.endpoint, '/estacionamento/registros');
    assert.deepEqual(JSON.parse(request.options.body), { usuario: { id: 1 }, estacionamento: { idEstacionamento: 7 }, carro: { idCarros: 2 } });
    assert.match(app.elements.get('pageStatus').textContent, /Carro vinculado ao estacionamento/);
});
test('remover registro não apaga histórico nem condutor', async () => {
    const app = harness('perfil'); await app.start();
    const button = { dataset: { removeMembership: '9' }, disabled: false };
    await app.elements.get('pageContent').listeners.click({ target: { closest: selector => selector === '[data-remove-membership]' ? button : null } });
    const requests = app.requests.filter(r => r.options.method === 'DELETE');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].endpoint, '/estacionamento/registros/9');
    assert.match(app.elements.get('pageStatus').textContent, /Carro retirado do estacionamento/);
});
test('páginas carregam dependências na ordem correta e usam recursos locais existentes', () => {
    for (const name of ['usuario.html', 'dados.html', 'estacionamentos.html', 'perfil.html', 'estacionamento.html']) {
        const html = fs.readFileSync(path.join(__dirname, '../pages', name), 'utf8');
        assert.ok(html.indexOf('consultas-model.js') < html.indexOf('consultas.js'));
        for (const match of html.matchAll(/(?:src|href)="(\.\.\/[^"?]+)"/g)) assert.ok(fs.existsSync(path.resolve(__dirname, '../pages', match[1])), match[1]);
    }
});
