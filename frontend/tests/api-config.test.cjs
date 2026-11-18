const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../script/api-config.js'), 'utf8');

function origin(hostname, protocol = 'http:', override) {
    const location = { hostname, protocol, origin: `${protocol}//${hostname}`, pathname: '/pages/criarConta.html' };
    const window = { location, ESTATEC_API_ORIGIN: override };
    vm.runInNewContext(source, { window, location, addEventListener() {} });
    return window.ESTATEC_API_ORIGIN;
}

test('API acompanha o servidor do site em acesso local ou pela rede', () => {
    for (const host of ['localhost', '127.0.0.1', '192.168.0.10', '[::1]']) {
        assert.equal(origin(host), `http://${host}:8080`);
    }
});
test('site HTTPS usa a mesma origem para a API por padrão', () => {
    assert.equal(origin('site.exemplo', 'https:'), 'https://site.exemplo');
});
test('domínio especial e configuração explícita preservam o endereço da API', () => {
    assert.equal(origin('estatec.lab'), 'http://api.estatec.lab');
    assert.equal(origin('estatec.lab', 'https:'), 'https://api.estatec.lab');
    assert.equal(origin('site.exemplo', 'https:', 'https://api.exemplo'), 'https://api.exemplo');
});
