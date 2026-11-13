/* Smoke tests no Chrome real com API simulada. Não dependem do MySQL nem de npm install.
   Executar: node --test frontend/tests/interface.browser.cjs
   Chrome pode ser configurado pela variável CHROME_PATH. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('layout responsivo e interações principais em navegador real', { skip: !fs.existsSync(chrome), timeout: 90000 }, async t => {
    const server = http.createServer((req, res) => {
        const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
        res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream');
        res.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'estatec-ui-'));
    const browser = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let socket;
    t.after(async () => {
        socket?.close(); browser.kill(); server.close();
        await delay(500);
        fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    });
    const endpoint = await new Promise((resolve, reject) => {
        let output = '';
        const timer = setTimeout(() => reject(new Error('Chrome não iniciou')), 15000);
        browser.stderr.on('data', chunk => { output += chunk; const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
        browser.on('error', reject);
    });
    socket = new WebSocket(endpoint);
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
    let sequence = 0;
    const pending = new Map();
    const exceptions = [];
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text + ' ' + (message.params.exceptionDetails.exception?.description || ''));
        if (message.id) { const item = pending.get(message.id); if (item) { pending.delete(message.id); message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result); } }
    });
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
        const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const call = (method, params) => send(method, params, sessionId);
    const evaluate = async expression => {
        const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
        return result.result.value;
    };
    const wait = async expression => {
        for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await delay(40); }
        throw new Error('Timeout: ' + expression);
    };
    await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
    await call('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*', '*cdnjs.cloudflare.com*'] });
    await call('Page.addScriptToEvaluateOnNewDocument', { source: `
        localStorage.setItem('isAdmin','true'); localStorage.setItem('token','test');
        const realFetch = window.fetch.bind(window);
        const today = new Date(); const date = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
        const user = {id:1,nome:'Maria Silva',email:'maria@example.com',telefone:'11999999999',cpf:'12345678901',rg:'1234567',dataNascimento:'1990-01-01'};
        const parking = {idEstacionamento:7,nomeEstacionamento:'Estacionamento Central',usario:user};
        const car = {idCarros:3,placa:'ABC1D23',modelo:'Civic',marca:'Honda',cor:'PRETO',usuario:user};
        window.fetch = async (url,options={}) => {
            if (!String(url).startsWith('http://localhost:8080')) return realFetch(url,options);
            const endpoint = new URL(url).pathname;
            const values = {'/usuarios':[user],'/carros':[car],'/estacionamento':[parking],'/estacionamento/registros':[{id:9,usuarioId:1,estacionamentoId:7}],'/historico':[{id:1,data:date,horarioEntrada:'08:00:00',horarioSaida:'09:00:00',carro:car,estacionamento:parking}]};
            return new Response(JSON.stringify(values[endpoint] || {}),{status:200,headers:{'Content-Type':'application/json'}});
        };
    ` });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const pages = ['index.html', 'pages/login.html', 'pages/redefinirSenha.html', 'pages/cadastroEstacionamento.html', 'pages/menu.html', 'pages/usuario.html', 'pages/dados.html', 'pages/perfil.html?id=1', 'pages/estacionamentos.html', 'pages/estacionamento.html?id=7', 'pages/adminCrud.html'];
    for (const width of [1440, 390, 320]) {
        await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
        for (const page of pages) {
            await call('Page.navigate', { url: origin + '/' + page });
            await wait(`document.readyState === 'complete' && !!window.Interface`);
            await delay(60);
            const layout = await evaluate(`({ width:innerWidth, scroll:document.documentElement.scrollWidth, h1:document.querySelector('h1')?.textContent, bg:getComputedStyle(document.body).backgroundColor, buttons:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length && !b.textContent.trim() && !b.getAttribute('aria-label')).length })`);
            assert.ok(layout.h1, page + ' sem título');
            assert.ok(layout.scroll <= layout.width + 2, `${page} em ${width}px transborda: ${layout.scroll}px`);
            assert.equal(layout.buttons, 0, page + ' possui botão sem nome acessível');
            assert.equal(exceptions.length, 0, page + ': ' + exceptions.join('\n'));
        }
    }
    await call('Page.navigate', { url: origin + '/pages/login.html' });
    await wait(`!!document.getElementById('togglePassword') && !!window.Interface`);
    await evaluate(`document.getElementById('togglePassword').click()`);
    assert.equal(await evaluate(`document.getElementById('password').type`), 'text');
    await call('Page.navigate', { url: origin + '/pages/adminCrud.html' });
    await wait(`document.getElementById('loadStatus')?.textContent.includes('atualiz') || document.getElementById('userTableBody')?.children.length > 0`);
    await evaluate(`document.getElementById('carTab').click()`);
    assert.equal(await evaluate(`document.getElementById('carPanel').hidden`), false);
    assert.equal(await evaluate(`document.getElementById('userPanel').hidden`), true);
    await evaluate(`document.getElementById('carTab').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
    assert.equal(await evaluate(`document.getElementById('parkingTab').getAttribute('aria-selected')`), 'true');
    await evaluate(`window.confirmResult = null; Interface.confirm('Teste de cancelamento').then(value=>window.confirmResult=value); true`);
    await wait(`!!document.querySelector('dialog[open]')`);
    await evaluate(`document.querySelector('.confirm-dialog button').click()`);
    await wait(`window.confirmResult === false`);
    await call('Page.navigate', { url: origin + '/pages/dados.html' });
    await wait(`!!document.getElementById('historyType')`);
    await evaluate(`const select=document.getElementById('historyType'); select.value='Saída'; select.dispatchEvent(new Event('input',{bubbles:true}))`);
    assert.equal(await evaluate(`document.querySelectorAll('#historyResults tbody tr').length`), 1);
    await evaluate(`document.querySelector('[data-reset-history]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('#historyResults tbody tr').length`), 2);
    for (const [page, destination] of [['usuario.html', 'perfil.html?id=1'], ['estacionamentos.html', 'estacionamento.html?id=7'], ['estacionamento.html?id=7', 'perfil.html?id=1']]) {
        await call('Page.navigate', { url: origin + '/pages/' + page });
        await wait(`!!document.querySelector('.card-primary-link')`);
        assert.equal(await evaluate(`document.querySelectorAll('.card .action-link').length`), 0, 'Não deve haver botão para abrir o card');
        const point = await evaluate(`(() => { const link=document.querySelector('.card-primary-link'); const card=link.closest('.card'); card.scrollIntoView({block:'center',behavior:'instant'}); const r=card.getBoundingClientRect(); return {x:r.right-10,y:r.top+10,href:document.elementFromPoint(r.right-10,r.top+10).closest('a')?.getAttribute('href')}; })()`);
        assert.equal(point.href, destination, 'Área livre do card deve ser um link');
        await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await wait(`location.href.endsWith('/pages/${destination}')`);
    }
    await call('Page.navigate', { url: origin + '/pages/estacionamentos.html' });
    await wait(`!!document.querySelector('.card-primary-link')`);
    assert.equal(await evaluate(`document.querySelector('.card p a').getAttribute('href')`), 'perfil.html?id=1', 'Link do responsável deve continuar separado');
    await evaluate(`document.querySelector('.card-primary-link').focus()`);
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await wait(`location.href.endsWith('/pages/estacionamento.html?id=7')`);
    assert.equal(exceptions.length, 0, exceptions.join('\n'));
    console.log('33 verificações de layout, interações e navegação por cards (mouse e teclado) aprovadas.');
});
