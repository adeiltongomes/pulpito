const http = require('http');
const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'pulpito-sermao.html');
const PORT = 3000;

// Clientes SSE conectados aguardando reload
const clients = new Set();

// Injeta o script de live-reload antes de </body>
function injectReload(html) {
  const script = `
<script>
(function(){
  const es = new EventSource('/livereload');
  es.onmessage = () => location.reload();
  es.onerror   = () => setTimeout(() => location.reload(), 1000);
})();
</script>`;
  const idx = html.lastIndexOf('</body>');
  if (idx === -1) return html + script;
  return html.slice(0, idx) + script + '\n' + html.slice(idx);
}

const server = http.createServer((req, res) => {

  // SSE — canal de live reload
  if (req.url === '/livereload') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 2000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Serve o HTML com script de reload injetado
  fs.readFile(FILE, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Erro ao ler pulpito-sermao.html');
      return;
    }
    const body = Buffer.from(injectReload(data), 'utf8');
    res.writeHead(200, {
      'Content-Type':   'text/html; charset=utf-8',
      'Content-Length': body.length
    });
    res.end(body);
  });
});

// Observa mudanças no arquivo HTML
let debounce;
fs.watch(FILE, () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log(`[reload] ${new Date().toLocaleTimeString('pt-BR')} — arquivo alterado`);
    clients.forEach(c => c.write('data: reload\n\n'));
  }, 120);
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✝  Púlpito — servidor de desenvolvimento');
  console.log('');
  console.log(`  Abra no navegador: http://localhost:${PORT}`);
  console.log('');
  console.log('  O navegador recarrega automaticamente ao salvar o arquivo.');
  console.log('  Pressione Ctrl+C para encerrar.');
  console.log('');
});
