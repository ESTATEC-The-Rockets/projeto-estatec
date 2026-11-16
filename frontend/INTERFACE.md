# Interface minimalista

## Identidade

A interface ativa mantém preto/cinza e vermelho, com superfícies planas, cantos retos e uma família tipográfica legível (Space Grotesk com fallback system-ui). Os estilos comuns estão em `css/interface.css`, carregados após os estilos específicos. Font Awesome mantém sua família própria: não aplicar `font-family: ... !important` global em `*`.

- `css/index.css`: landing responsiva e recursos da plataforma.
- `css/acesso.css`: login, informação de recuperação e cadastro de estacionamento.
- `css/consultas.css` + `css/interface.css`: listagens, perfis e histórico.
- `css/menu.css` + `css/interface.css`: dashboard e modais de estacionamento.
- `css/adminCrud.css` + `css/interface.css`: administração por abas.

As folhas de estilo antigas de login, recuperação e cadastro não são mais carregadas pelas páginas ativas. `pageAdminLoginDono.html` é somente um redirecionamento de compatibilidade.

## Interações

- Navegação com nomes acessíveis mesmo quando recolhida; foco visível e link para pular ao conteúdo.
- Abas administrativas com teclado (setas, Home, End), labels, estado de edição e contadores.
- Feedback inline e avisos não bloqueantes, confirmação cancelável, carregamento e bloqueio de envio duplicado.
- Escape, foco inicial, contenção e restauração do foco nos modais do dashboard.
- Login com mostrar/ocultar senha e opção para lembrar **somente o e-mail** neste navegador.
- Cadastro de estacionamento mostra confirmação e link para a lista, sem redirecionamento automático.
- Histórico com filtro Entrada/Saída, botão para voltar a hoje/limpar filtros e busca limpa com um clique.
- Dashboard exibe dados reais: totais de hoje e até oito movimentações recentes, ordenadas, com condutor, placa e estacionamento.
- Preferência de redução de movimento respeitada. Não há dependência de animação para operar a interface.

## Limitações funcionais mantidas explícitas

Recuperação de senha não possui endpoint implementado no backend; a página informa indisponibilidade e não alega ter alterado uma senha. O login administrativo é validado pelo backend; o localStorage controla apenas a apresentação da interface.


## Testes

Na raiz do repositório:

```powershell
node --test frontend/tests/consultas.test.cjs
node --test frontend/tests/interface.browser.cjs
```

O primeiro conjunto cobre consultas, perfis, cadastros e histórico com DOM/API simulados. O segundo verifica 15 páginas/variações no Chrome headless em 9 tamanhos de tela, captura exceções JavaScript e verifica menus, modais, filtros e os fluxos de cadastro/login e criação/edição de carros.

O teste de navegador utiliza API simulada e bloqueia fontes/ícones de CDN para ser independente da rede; o layout é verificado também com as fontes de fallback. Não substitui validação integrada com o backend/MySQL ou uma auditoria manual completa de acessibilidade. Defina `CHROME_PATH` caso o Chrome não esteja no caminho padrão do Windows; sem Chrome o teste é marcado como ignorado.

A tela `pages/criarConta.html`, acessível pelo login, cadastra a conta de acesso
com nome, e-mail e senha confirmada. `script/criarConta.js` envia o cadastro
para `/auth/cadastro` e volta ao login após sucesso. O login aceita contas
persistidas, separadas dos condutores, e o backend valida a sessão de operador.


## Responsividade

`css/responsive.css` é carregado depois das folhas de cada página e centraliza
os ajustes de layout. No celular (até 600 px), o menu aparece acima do conteúdo,
com os nomes das abas e o botão Sair visíveis. Entre 601 e 1100 px, o menu
compacto libera espaço para as consultas. O controle de recolher/expandir fica
em `script/interface.js`, compartilhado entre o painel e as consultas.

Cards e filtros ajustam suas colunas ao espaço disponível. Tabelas e gráficos
largos têm rolagem horizontal própria, acessível pelo teclado. Modais se limitam
à largura e altura disponíveis, com rolagem interna nos formulários.

O teste de navegador verifica 15 páginas/variações em 9 tamanhos (320 a 1440 px,
incluindo paisagem), os três modais de criação do CRUD e os cadastros permitidos nas consultas/perfis.
Inclui nomes/e-mails longos, menu aberto/fechado e navegação por teclado.
Use `ESTATEC_SCREENSHOT_DIR` para salvar capturas das telas durante o teste.

O cadastro de carros fica exclusivamente no perfil do condutor. O CRUD geral e
a aba Carros encaminham para os perfis, onde ficam os controles de edição e exclusão.
Veja `CONSULTAS.md` para as regras atuais de relação entre as entidades.


## Avisos exibidos nas telas

Use uma frase curta, direta e em português para cada aviso. Não inclua nomes de
atributos, identificadores, caminhos, detalhes de falhas ou termos de implementação.
Evite prefixos como “Não foi possível salvar:” seguidos de outra mensagem.

`script/mensagens.js` traduz apenas os códigos previstos para textos aprovados.
Mensagens arbitrárias recebidas em falhas são ignoradas; exceções desconhecidas
recebem um aviso genérico. O backend aplica o mesmo padrão em `Avisos` e
`ApiExceptionHandler`, retornando apenas um aviso por resposta. Detalhes de
falhas inesperadas ficam nos registros do backend.

`tests/mensagens.test.cjs` verifica frases curtas e bloqueio de detalhes internos.
O teste de navegador também simula respostas e exceções com detalhes que não
podem aparecer no formulário.
