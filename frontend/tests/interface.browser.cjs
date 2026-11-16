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

test('layout responsivo e interações principais em navegador real', { skip: !fs.existsSync(chrome), timeout: 180000 }, async t => {
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
        if (!sessionStorage.getItem('denySession')) { localStorage.setItem('isAdmin','true'); localStorage.setItem('token','test'); }
        window.apiCalls = [];
        const realFetch = window.fetch.bind(window);
        const today = new Date(); const date = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
        const user = {id:1,nome:'Maria da Silva Andrade de Oliveira e Souza',email:'maria.da.silva.andrade.de.oliveira.e.souza.contato@example.com',telefone:'11999999999',cpf:'52998224725',rg:'1234567',dataNascimento:'1990-01-01'};
        const parking = {idEstacionamento:7,nomeEstacionamento:'Estacionamento Central da Unidade de Desenvolvimento e Tecnologia',usario:user};
        const car = {idCarros:3,placa:'ABC1D23',modelo:'Civic',marca:'Honda',cor:'PRETO',usuario:user};
        window.fetch = async (url,options={}) => {
            if (!String(url).startsWith('http://localhost:8080')) return realFetch(url,options);
            const endpoint = new URL(url).pathname; if(options.method==='POST'||options.method==='PUT') sessionStorage.setItem('lastEntityRequest',JSON.stringify({endpoint,method:options.method,body:options.body})); window.apiCalls.push({endpoint,method:options.method || 'GET'});
            if (endpoint === '/estacionamento' && options.method === 'POST' && window.noticeFailure) {
                if (window.noticeFailure === 'exception') throw new Error('Cannot read properties of nomeEstacionamento java.sql.Exception');
                return new Response(JSON.stringify({code:window.noticeFailure === 'known' ? 'NAME_LONG' : 'UNKNOWN_INTERNAL',message:'nomeEstacionamento: java.sql.Exception UTF-8 bytes'}),{status:400,headers:{'Content-Type':'application/json'}});
            }
            if (endpoint === '/auth/login') { sessionStorage.setItem('accountLogin','true'); return new Response(JSON.stringify({idUsuario:2,nome:'Pessoa Teste',admin:false,podeGerenciar:true}),{status:200,headers:{'Content-Type':'application/json'}}); }
            if (endpoint === '/auth/cadastro') return new Response(JSON.stringify({id:2,nome:'Pessoa Teste',email:'pessoa@example.com'}),{status:201,headers:{'Content-Type':'application/json'}});
            if (endpoint === '/auth/sessao' && sessionStorage.getItem('denySession')) return new Response('{}', {status:401});
            if (endpoint === '/auth/sessao' && sessionStorage.getItem('accountLogin')) return new Response(JSON.stringify({idUsuario:2,nome:'Pessoa Teste',admin:false,podeGerenciar:true}),{status:200,headers:{'Content-Type':'application/json'}});
            if (endpoint === '/carros/3') return new Response(JSON.stringify(car),{status:200,headers:{'Content-Type':'application/json'}});
            const values = {'/condutores':[user],'/auth/sessao':{idUsuario:0,nome:'Administrador',admin:true},'/carros':[car],'/estacionamento':[parking],'/estacionamento/registros':[{id:9,usuarioId:1,carroId:3,estacionamentoId:7}],'/historico':[{id:1,dataHora:date+'T08:00:00',entrada:true,autorizado:true,placaLida:'ABC1D23',carro:car,estacionamento:parking},{id:2,dataHora:date+'T09:00:00',entrada:false,autorizado:true,placaLida:'ABC1D23',carro:car,estacionamento:parking}]};
            return new Response(JSON.stringify(values[endpoint] || {}),{status:200,headers:{'Content-Type':'application/json'}});
        };
    ` });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const pages = ['index.html', 'pages/login.html', 'pages/criarConta.html', 'pages/redefinirSenha.html', 'pages/cadastroEstacionamento.html', 'pages/menu.html', 'pages/usuario.html', 'pages/carros.html', 'pages/dados.html', 'pages/perfil.html?id=1', 'pages/perfil.html?tipo=carro&id=3', 'pages/estacionamentos.html', 'pages/estacionamento.html?id=7', 'pages/adminCrud.html', 'pages/pageAdminLoginDono.html'];

    const viewports = [
        [320,568], [390,844], [600,800], [768,1024], [820,1180],
        [1024,768], [1280,720], [1440,900], [844,390]
    ];
    const screenshotDir = process.env.ESTATEC_SCREENSHOT_DIR;
    if (screenshotDir) fs.mkdirSync(screenshotDir, {recursive:true});
    let layoutChecks = 0;
    const checkDialog = async (page, width, height) => {
        const bounds = await evaluate(`(() => {
            const dialog=document.querySelector('dialog[open]');const r=dialog.getBoundingClientRect();
            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,scroll:dialog.scrollWidth,width:dialog.clientWidth,
                fields:[...dialog.querySelectorAll('input:not([type="hidden"]),select')].filter(e=>e.getClientRects().length).map(e=>({id:e.id||e.name,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),
                cardScroll:dialog.querySelector('.modal-card,.entity-modal-card')?.scrollWidth,
                cardWidth:dialog.querySelector('.modal-card,.entity-modal-card')?.clientWidth};
        })()`);
        assert.ok(bounds.left>=-1 && bounds.right<=width+1 && bounds.top>=-1 && bounds.bottom<=height+1, `${page}: modal fora da tela ${width}x${height}: ${JSON.stringify(bounds)}`);
        assert.ok(bounds.scroll<=bounds.width+2, `${page}: modal transborda horizontalmente`);
        assert.ok(bounds.cardScroll<=bounds.cardWidth+2, `${page}: formulario transborda horizontalmente`);
        assert.ok(bounds.fields.every(e=>e.left>=0 && e.right<=width+1), `${page}: campo cortado ${JSON.stringify(bounds.fields)}`);
        await evaluate(`document.querySelector('dialog[open]').close()`);
    };
    for (const [width,height] of viewports) {
        await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
        for (const page of pages) {
            await call('Page.navigate', { url: origin + '/' + page });
            await wait(`document.readyState === 'complete' && !!window.Interface`);
            await delay(80);
            const layout = await evaluate(`({ width:innerWidth, scroll:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent,
                buttons:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length&&!b.textContent.trim()&&!b.getAttribute('aria-label')).length,
                overflow:[...document.querySelectorAll('.history-toolbar,.membership-form,.acesso-card,.header,.stats,.toolbar,.line-list>.card')].filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+2).map(e=>({el:e.className,width:e.clientWidth,scroll:e.scrollWidth})),
                cards:[...document.querySelectorAll('.line-list>.card')].map(e=>e.getBoundingClientRect().width),
                keyboardScroll:[...document.querySelectorAll('.table-wrap')].every(e=>e.tabIndex===0&&e.getAttribute('role')==='region') })`);
            assert.ok(layout.h1, page + ' sem titulo');
            assert.ok(layout.scroll <= layout.width + 2, `${page} em ${width}x${height} transborda: ${layout.scroll}px`);
            assert.deepEqual(layout.overflow, [], `${page} em ${width}x${height}: conteudo cortado`);
            assert.ok(layout.cards.every(w=>w>=240), `${page}: cards estreitos em ${width}px: ${layout.cards}`);
            assert.ok(layout.keyboardScroll, `${page}: tabela sem rolagem por teclado`);
            assert.equal(layout.buttons, 0, page + ' possui botao sem nome acessivel');
            assert.equal(exceptions.length, 0, page + ': ' + exceptions.join('\n'));
            if (await evaluate(`!!document.getElementById('menuToggle')`)) {
                if (width<=600) {
                    assert.ok(await evaluate(`[...document.querySelectorAll('.sidebar-nav .menu-text')].every(e=>e.getClientRects().length)`), page+': nomes do menu ocultos no celular');
                    assert.ok(await evaluate(`document.querySelector('.logout-btn span')?.getClientRects().length>0`), page+': Sair oculto no celular');
                }
                const expanded = await evaluate(`document.getElementById('menuToggle').getAttribute('aria-expanded')`);
                await evaluate(`document.getElementById('menuToggle').click()`);
                assert.equal(await evaluate(`document.getElementById('menuToggle').getAttribute('aria-expanded')`), String(expanded!=='true'));
                assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth+2`));
                await evaluate(`document.getElementById('menuToggle').click()`);
                assert.equal(await evaluate(`document.getElementById('menuToggle').getAttribute('aria-expanded')`), expanded);
            }
            if (page==='pages/adminCrud.html') {
                await wait(`document.getElementById('loadStatus')?.textContent.includes('atualizados')`);
                for (const key of ['user','parking','registration']) {
                    await evaluate(`document.getElementById('${key}Tab')?.click();document.querySelector('[data-modal="${key}Modal"]').click()`);
                    await checkDialog(page+' '+key,width,height);
                }
            } else if (['pages/usuario.html','pages/estacionamentos.html','pages/perfil.html?id=1'].includes(page)) {
                await wait(`!!document.querySelector('[data-entity-action="create"]')`);
                await evaluate(`document.querySelector('[data-entity-action="create"]').click()`);
                await checkDialog(page,width,height);
            }
            if (page==='pages/carros.html') assert.equal(await evaluate(`document.querySelectorAll('[data-entity-action="create"]').length`),0,'Nao pode criar carro na aba Carros');
            if (page==='pages/adminCrud.html') assert.equal(await evaluate(`document.querySelectorAll('[data-modal="carModal"]').length`),0,'Nao pode criar carro no CRUD geral');
            if (screenshotDir && [390,820,1280].includes(width) && ['pages/menu.html','pages/dados.html','pages/usuario.html','pages/criarConta.html'].includes(page)) {
                const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
                fs.writeFileSync(path.join(screenshotDir,width+'-'+path.basename(page)+'.png'),Buffer.from(shot.data,'base64'));
            }
            layoutChecks++;
        }
    }
    await call('Page.navigate',{url:origin+'/pages/adminCrud.html'});
    await wait(`document.getElementById('loadStatus')?.textContent==='Dados atualizados.'`);
    await evaluate(`document.getElementById('parkingTab').click();document.querySelector('[data-modal="parkingModal"]').click();document.getElementById('parkingNome').value='Pátio #2 - 24h & Cia.';document.getElementById('parkingForm').requestSubmit()`);
    await wait(`document.getElementById('parkingStatus')?.textContent==='Cadastro salvo.'`);
    assert.equal(JSON.parse((await evaluate(`JSON.parse(sessionStorage.getItem('lastEntityRequest'))`)).body).nomeEstacionamento,'Pátio #2 - 24h & Cia.');
    await call('Page.navigate',{url:origin+'/pages/estacionamentos.html'});
    await wait(`!!document.querySelector('[data-entity-action="create"]')`);
    await evaluate(`document.querySelector('[data-entity-action="create"]').click();document.querySelector('[name="nomeEstacionamento"]').value='penha';window.noticeFailure='known';document.querySelector('.entity-form').requestSubmit()`);
    await wait(`document.querySelector('.entity-modal-status')?.textContent==='Use um nome mais curto.'`);
    await evaluate(`window.noticeFailure='unknown';document.querySelector('.entity-form').requestSubmit()`);
    await wait(`document.querySelector('.entity-modal-status')?.textContent==='Confira os dados informados.'`);
    await evaluate(`window.noticeFailure='exception';document.querySelector('.entity-form').requestSubmit()`);
    await wait(`document.querySelector('.entity-modal-status')?.textContent==='Não foi possível salvar.'`);
    assert.doesNotMatch(await evaluate(`document.querySelector('.entity-modal-status').textContent`),/nomeEstacionamento|Exception|bytes|SQL/);
    await evaluate(`document.querySelector('[data-entity-close]').click()`);
    await call('Page.navigate', {url:origin+'/pages/perfil.html?id=1'});
    await wait(`!!document.querySelector('[data-entity-action="create"][data-entity-type="car"]')`);
    await evaluate(`document.querySelector('[data-entity-action="create"][data-entity-type="car"]').click()`);
    await evaluate(`const form=document.querySelector('.entity-form');form.elements.marca.value='Toyota';form.elements.modelo.value='Corolla';form.elements.placa.value='XYZ1A23';form.elements.cor.value='PRETO';form.requestSubmit()`);
    await wait(`!document.querySelector('dialog[open]') && document.readyState==='complete'`);
    const creation=await evaluate(`JSON.parse(sessionStorage.getItem('lastEntityRequest'))`);
    assert.equal(creation.endpoint,'/condutores/1/carros');assert.equal(creation.method,'POST');
    assert.equal(JSON.parse(creation.body).usuario,undefined,'O servidor define o dono pelo perfil; a conta de acesso nao e um condutor');
    await call('Page.navigate',{url:origin+'/pages/perfil.html?tipo=carro&id=3'});
    await wait(`!!document.querySelector('[data-entity-action="edit"][data-entity-type="car"]')`);
    assert.equal(await evaluate(`!!document.getElementById('historyArea')`),false);
    assert.equal(await evaluate(`document.querySelector('h1').textContent`),'Perfil do carro');
    await evaluate(`document.querySelector('[data-entity-action="edit"][data-entity-type="car"]').click()`);
    await wait(`!!document.querySelector('.entity-form')`);
    assert.equal(await evaluate(`document.querySelector('[name="modelo"]').value`),'Civic');
    await evaluate(`const form=document.querySelector('.entity-form');form.elements.modelo.value='Accord';form.requestSubmit()`);
    await wait(`!document.querySelector('dialog[open]') && document.readyState==='complete'`);
    const edition=await evaluate(`JSON.parse(sessionStorage.getItem('lastEntityRequest'))`);
    assert.equal(edition.endpoint,'/carros/3');assert.equal(edition.method,'PUT');
    assert.equal(JSON.parse(edition.body).usuario,undefined,'Editar nao remove nem troca o condutor');
    await call('Page.navigate', { url: origin + '/pages/login.html' });
    await wait(`!!document.getElementById('togglePassword') && !!window.Interface`);
    await evaluate(`document.getElementById('togglePassword').click()`);
    assert.equal(await evaluate(`document.getElementById('password').type`), 'text');
    await call('Page.navigate', { url: origin + '/pages/adminCrud.html' });
    await wait(`document.getElementById('loadStatus')?.textContent === 'Dados atualizados.'`);
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
    for (const [page, destination] of [['usuario.html', 'perfil.html?id=1'], ['estacionamentos.html', 'estacionamento.html?id=7'], ['estacionamento.html?id=7', 'perfil.html?tipo=carro&id=3']]) {
        await call('Page.navigate', { url: origin + '/pages/' + page });
        await wait(`!!document.querySelector('.card-primary-link')`);
        assert.equal(await evaluate(`document.querySelectorAll('.card .action-link').length`), 0, 'Não deve haver botão para abrir o card');
        const point = await evaluate(`(() => { const link=document.querySelector('.card-primary-link'); const card=link.closest('.card,.vehicle-row'); card.scrollIntoView({block:'center',behavior:'instant'}); const r=card.getBoundingClientRect(); return {x:r.right-10,y:r.top+10,href:document.elementFromPoint(r.right-10,r.top+10).closest('a')?.getAttribute('href')}; })()`);
        assert.equal(point.href, destination, 'Área livre do card deve ser um link');
        await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await wait(`location.href.endsWith('/pages/${destination}')`);
    }
    await call('Page.navigate', { url: origin + '/pages/estacionamentos.html' });
    await wait(`!!document.querySelector('.card-primary-link')`);
    await evaluate(`document.querySelector('.card-primary-link').focus()`);
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await wait(`location.href.endsWith('/pages/estacionamento.html?id=7')`);
    assert.equal(exceptions.length, 0, exceptions.join('\n'));
    await call('Page.navigate', { url: origin + '/pages/adminCrud.html' });
    await wait(`document.getElementById('loadStatus')?.textContent.includes('atualizados')`);
    await evaluate(`document.querySelector('[data-modal="userModal"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('#userForm input[type="password"],#userRg,#userDataNascimento').length`), 0);
    await evaluate(`document.getElementById('userModal').close(); document.querySelector('[data-registration-edit="9"]').click()`);
    assert.equal(await evaluate(`document.getElementById('registrationUsuarioId').value`), '1');
    assert.equal(await evaluate(`document.getElementById('registrationCarroId').value`), '3');
    assert.equal(await evaluate(`document.getElementById('registrationParkingId').value`), '7');
    await evaluate(`document.getElementById('registrationModal').close();document.querySelector('[data-user-edit="1"]').click();window.apiCalls=[];document.getElementById('userForm').requestSubmit()`);
    await wait(`document.getElementById('userStatus')?.textContent.includes('salvo.')`);
    assert.equal(await evaluate(`window.apiCalls.filter(c=>c.method==='GET'&&c.endpoint==='/condutores').length`), 1);
    assert.equal(await evaluate(`window.apiCalls.filter(c=>c.method==='GET'&&c.endpoint==='/carros').length`), 0, 'Salvar condutor deve atualizar somente a lista afetada');
    await call('Page.navigate', { url: origin + '/pages/login.html' });
    await wait(`!!document.querySelector('a[href="./criarConta.html"]')`);
    await evaluate(`document.querySelector('a[href="./criarConta.html"]').click()`);
    await wait(`!!document.getElementById('cadastroContaForm')`);
    await evaluate(`document.getElementById('codigoConvite').value='convite-teste';document.getElementById('nome').value='Pessoa Teste';document.getElementById('email').value='pessoa@example.com';document.getElementById('password').value='MinhaSenha123';document.getElementById('confirmacaoSenha').value='Diferente123';document.getElementById('cadastroContaForm').requestSubmit()`);
    assert.equal(await evaluate(`document.getElementById('confirmacaoSenha').validity.customError`), true);
    assert.equal(await evaluate(`window.apiCalls.filter(c=>c.endpoint==='/auth/cadastro').length`), 0);
    await evaluate(`document.getElementById('confirmacaoSenha').value='MinhaSenha123';document.getElementById('confirmacaoSenha').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('cadastroContaForm').requestSubmit()`);
    await wait(`location.href.endsWith('/pages/login.html?cadastro=sucesso') && document.getElementById('loginFeedback')?.textContent.includes('Conta criada')`);
    await evaluate(`document.getElementById('email').value='pessoa@example.com';document.getElementById('password').value='MinhaSenha123';document.getElementById('loginForm').requestSubmit()`);
    await wait(`location.pathname.endsWith('/pages/menu.html') && document.documentElement.style.visibility !== 'hidden' && document.readyState==='complete'`);
    assert.equal(await evaluate(`localStorage.getItem('isAdmin')`), 'true', 'Conta de operador deve acessar o gerenciamento');
    assert.equal(await evaluate(`localStorage.getItem('usuarioSessao')`), null, 'Conta de acesso nao deve ser usada como condutor');
    await evaluate(`sessionStorage.setItem('denySession','true');localStorage.setItem('isAdmin','true')`);
    await call('Page.navigate', { url: origin + '/pages/adminCrud.html' });
    await wait(`location.pathname.endsWith('/pages/login.html')`);
    assert.equal(await evaluate(`localStorage.getItem('isAdmin')`), null, 'LocalStorage adulterado nao autoriza acesso');
    console.log(`${layoutChecks} combinacoes de pagina/tela, 54 modais, menus e fluxo de cadastro/login aprovados.`);
});
