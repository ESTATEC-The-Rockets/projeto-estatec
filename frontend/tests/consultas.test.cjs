const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = require('../script/consultas-model.js');
const user = { id: 1, nome: 'João Silva', email: 'joao@example.com', telefone: '11999999999' };
const parking = { idEstacionamento: 7, nomeEstacionamento: 'Central', usario: user };
const history = [{ id: 1, data: model.localDay(), horarioEntrada: '08:00:00', horarioSaida: '10:30:00', carro: { usuario: user, placa: 'ABC1D23' }, estacionamento: parking }];

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
function harness(page, query = '?id=1', memberships = [{ id: 9, usuarioId: 1, estacionamentoId: 7 }], failure = false) {
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
    const context = { window: { ConsultaModel: model }, URLSearchParams, AbortController, setTimeout, clearTimeout, location: { search: query, reload() {} }, console,
        localStorage: { getItem: () => 'true' }, confirm: () => true,
        document: { body: { dataset: { page } }, getElementById: id => elements.get(id), createElement: () => new Element('new'), addEventListener() {} },
        fetch: async (url, options = {}) => {
            const endpoint = url.replace('http://localhost:8080', '');
            requests.push({ endpoint, options });
            let data;
            if (endpoint === '/usuarios') data = [user];
            if (endpoint === '/carros') data = [{ idCarros: 2, placa: 'ABC1D23', modelo: 'Civic', usuario: user }];
            if (endpoint === '/estacionamento') data = [parking];
            if (endpoint === '/estacionamento/registros') data = memberships;
            if (endpoint === '/historico') data = history;
            return { ok: !failure, status: failure ? 503 : 200, text: async () => JSON.stringify(failure ? { message: 'Indisponível' } : data) };
        }
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../script/consultas.js'), 'utf8') + '\nthis.start = Consultas.init;', context);
    return { start: context.start, elements, requests };
}
test('lista de usuários contém vínculo explícito, placas e link do perfil', async () => {
    const app = harness('usuarios'); await app.start();
    const html = app.elements.get('listResults').innerHTML;
    assert.match(html, /perfil.html\?id=1/);
    assert.match(html, /estacionamento.html\?id=7/);
    assert.match(html, /ABC1D23/);
    app.elements.get('listSearch').value = 'inexistente';
    app.elements.get('listSearch').listeners.input();
    assert.match(app.elements.get('listResults').innerHTML, /Nenhum usuário/);
});
test('histórico não é usado para inventar registro', async () => {
    const app = harness('usuarios', '', []); await app.start();
    assert.match(app.elements.get('listResults').innerHTML, /Sem registros em estacionamentos/);
    assert.doesNotMatch(app.elements.get('listResults').innerHTML, /estacionamento.html\?id=7/);
});
test('lista de estacionamentos aponta para perfil', async () => {
    const app = harness('estacionamentos'); await app.start();
    assert.match(app.elements.get('listResults').innerHTML, /estacionamento.html\?id=7/);
});
test('perfil de usuário possui informações gerais, veículos e estacionamentos', async () => {
    const app = harness('perfil'); await app.start();
    assert.match(app.elements.get('pageContent').innerHTML, /joao@example.com/);
    assert.match(app.elements.get('pageContent').innerHTML, /ABC1D23/);
    assert.match(app.elements.get('pageContent').innerHTML, /estacionamento.html\?id=7/);
});
test('perfil estacionamento mostra usuários, dashboard e duas movimentações', async () => {
    const app = harness('estacionamento', '?id=7'); await app.start();
    assert.match(app.elements.get('pageContent').innerHTML, /perfil.html\?id=1/);
    assert.match(app.elements.get('parkingStats').innerHTML, /Entradas por horário/);
    assert.match(app.elements.get('historyResults').innerHTML, /Entrada/);
    assert.match(app.elements.get('historyResults').innerHTML, /Saída/);
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
    assert.match(missing.elements.get('pageStatus').textContent, /Usuário não encontrado/);
    const failed = harness('usuarios', '', [], true); await failed.start();
    assert.match(failed.elements.get('pageStatus').textContent, /Indisponível/);
});
test('registro pelo perfil envia IDs de usuário e estacionamento para persistência', async () => {
    const app = harness('perfil', '?id=1', []); await app.start();
    app.elements.get('membershipTarget').value = '7';
    await app.elements.get('membershipForm').listeners.submit({ preventDefault() {}, currentTarget: app.elements.get('membershipForm') });
    const request = app.requests.find(r => r.options.method === 'POST');
    assert.equal(request.endpoint, '/estacionamento/registros');
    assert.deepEqual(JSON.parse(request.options.body), { usuario: { id: 1 }, estacionamento: { idEstacionamento: 7 }, carro: { idCarros: 2 } });
    assert.match(app.elements.get('pageStatus').textContent, /sucesso/);
});
test('remover registro não apaga histórico nem usuário', async () => {
    const app = harness('perfil'); await app.start();
    const button = { dataset: { removeMembership: '9' }, disabled: false };
    await app.elements.get('pageContent').listeners.click({ target: { closest: selector => selector === '[data-remove-membership]' ? button : null } });
    const requests = app.requests.filter(r => r.options.method === 'DELETE');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].endpoint, '/estacionamento/registros/9');
    assert.match(app.elements.get('pageStatus').textContent, /Histórico preservado/);
});
test('páginas carregam dependências na ordem correta e usam recursos locais existentes', () => {
    for (const name of ['usuario.html', 'dados.html', 'estacionamentos.html', 'perfil.html', 'estacionamento.html']) {
        const html = fs.readFileSync(path.join(__dirname, '../pages', name), 'utf8');
        assert.ok(html.indexOf('consultas-model.js') < html.indexOf('consultas.js'));
        for (const match of html.matchAll(/(?:src|href)="(\.\.\/[^"?]+)"/g)) assert.ok(fs.existsSync(path.resolve(__dirname, '../pages', match[1])), match[1]);
    }
});
