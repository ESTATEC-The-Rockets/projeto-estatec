const { test } = require('node:test');
const assert = require('node:assert/strict');
const notices = require('../script/mensagens.js');

test('avisos sao frases curtas sem nomes internos', () => {
    for (const text of Object.values(notices.texts)) {
        assert.ok(text.length <= 100, text);
        assert.ok(/^[A-Z\u00c0-\u00dd].*[.!?]$/.test(text), text);
        assert.doesNotMatch(text, /nomeEstacionamento|estacionamentoId|usuarioId|UTF-8|bytes|SQL|Exception|JSON|servidor|atributo/i);
        assert.equal((text.match(/[.!?]/g) || []).length, 1, text);
    }
});
test('resposta reconhecida ignora texto interno recebido', () => {
    assert.equal(notices.fromResponse({code:'NAME_INVALID',message:'nomeEstacionamento: java.sql.Exception'},400), 'Informe um nome válido.');
});
test('respostas desconhecidas e mensagens brutas nao sao exibidas', () => {
    for (const body of [{message:'nomeEstacionamento: SQL'}, {code:'constructor'}, {code:'toString'}, '<html>Stack trace</html>', null]) {
        assert.equal(notices.fromResponse(body,400), 'Confira os dados informados.');
    }
    assert.equal(notices.error(new Error('Cannot read properties of nomeEstacionamento')), 'Tente novamente em instantes.');
    assert.equal(notices.error(notices.failure('Carro salvo.')), 'Carro salvo.');
});
