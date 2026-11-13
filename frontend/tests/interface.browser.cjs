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

test('dono e administrador veem as ações corretas em navegador real', { skip: !fs.existsSync(chrome), timeout: 90000 }, async t => {
    const server = http.createServer((req, res) => {
        const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
        res.setHeader('Content-Type', ({ '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png' })[path.extname(file)] || 'application/octet-stream');
        res.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'estatec-ui-'));
    const browser = spawn(chrome, ['--headless=new','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'], {stdio:['ignore','ignore','pipe']});
    let socket;
    t.after(async () => { socket?.close(); browser.kill(); server.close(); await delay(500); fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200}); });
    const endpoint = await new Promise((resolve,reject) => {
        let output=''; const timer=setTimeout(()=>reject(new Error('Chrome não iniciou')),15000);
        browser.stderr.on('data',chunk=>{ output+=chunk; const match=output.match(/DevTools listening on (ws:\/\/[^\s]+)/); if(match){clearTimeout(timer);resolve(match[1]);} });
        browser.on('error',reject);
    });
    socket = new WebSocket(endpoint);
    await new Promise(resolve => socket.addEventListener('open',resolve,{once:true}));
    let sequence=0; const pending=new Map(); const exceptions=[];
    socket.addEventListener('message',event=>{
        const message=JSON.parse(event.data);
        if(message.method==='Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
        if(message.id){ const item=pending.get(message.id); if(item){pending.delete(message.id); message.error?item.reject(new Error(message.error.message)):item.resolve(message.result);} }
    });
    const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{ const id=++sequence; pending.set(id,{resolve,reject}); socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})); });
    const {targetId}=await send('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
    const call=(method,params)=>send(method,params,sessionId);
    const evaluate=async expression=>{ const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text); return result.result.value; };
    const wait=async expression=>{ for(let i=0;i<100;i++){ if(await evaluate(expression)) return; await delay(50); } throw new Error('Timeout: '+expression); };
    await call('Page.enable'); await call('Runtime.enable');
    await call('Network.enable');
    await call('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*','*cdnjs.cloudflare.com*']});
    await call('Page.addScriptToEvaluateOnNewDocument',{source: `
        localStorage.setItem('isAdmin',location.pathname.endsWith('/adminCrud.html') ? 'true' : 'false');
        localStorage.setItem('usuarioSessao',JSON.stringify({id:1,nome:'Maria Silva'}));
        const realFetch=window.fetch.bind(window);
        const user={id:1,nome:'Maria Silva',email:'maria@example.com'};
        const parking={idEstacionamento:7,nomeEstacionamento:'Estacionamento Central',usuario:user};
        const car={idCarros:3,placa:'ABC1D23',modelo:'Civic',marca:'Honda',cor:'PRETO',usuario:user};
        window.fetch=async(url,options={})=>{
            if(!String(url).startsWith('http://localhost:8080')) return realFetch(url,options);
            const endpoint=new URL(url).pathname;
            const values={'/usuarios':[user],'/carros':[car],'/estacionamento':[parking],'/estacionamento/registros':[],'/historico':[]};
            return new Response(JSON.stringify(values[endpoint]||{}),{status:200,headers:{'Content-Type':'application/json'}});
        };
    `});
    const origin='http://127.0.0.1:'+server.address().port;
    for(const width of [1440,390]){
        await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
        for(const page of ['menu.html','carros.html','estacionamentos.html','estacionamento.html?id=7']){
            await call('Page.navigate',{url:origin+'/pages/'+page});
            await wait(`document.readyState==='complete' && !!document.querySelector('h1')`);
            await delay(80);
            const view=await evaluate(`({scroll:document.documentElement.scrollWidth,width:innerWidth,logo:!!document.querySelector('#menuToggle img.toggle-logo'),text:document.body.textContent})`);
            assert.ok(view.scroll<=view.width+2,page+' transborda');
            assert.ok(view.logo,page+' sem logomarca no botão');
            assert.ok(!view.text.includes('usuÃ'),page+' com texto desconfigurado');
        }
    }
    await call('Page.navigate',{url:origin+'/pages/carros.html'});
    await wait(`!!document.querySelector('[data-entity-action="create"]')`);
    await evaluate(`document.querySelector('[data-entity-action="create"]').click()`);
    assert.ok(await evaluate(`!!document.querySelector('.entity-modal[open]')`));
    await evaluate(`localStorage.setItem('isAdmin','true')`);
    await call('Page.navigate',{url:origin+'/pages/adminCrud.html'});
    await wait(`document.getElementById('userTableBody')?.children.length>0`);
    assert.equal(await evaluate(`document.querySelectorAll('#userTableBody tr').length`),1);
    assert.equal(await evaluate(`!!document.querySelector('[data-entity-action="create"]')`),false);
    assert.equal(exceptions.length,0,exceptions.join('\n'));
});
