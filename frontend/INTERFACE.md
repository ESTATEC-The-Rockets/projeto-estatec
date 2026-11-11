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
- Dashboard exibe dados reais: totais de hoje e até oito movimentações recentes, ordenadas, com usuário, placa e estacionamento.
- Preferência de redução de movimento respeitada. Não há dependência de animação para operar a interface.

## Limitações funcionais mantidas explícitas

Recuperação de senha não possui endpoint implementado no backend; a página informa indisponibilidade e não alega ter alterado uma senha. Login administrativo local e controle de permissão via localStorage continuam sendo limitações preexistentes, não mecanismos de segurança para produção.

A atualização de usuário no backend exige senha completa. Por isso o painel pede uma senha nova na edição e nunca preenche o formulário com o hash devolvido pela API.

## Testes

Na raiz do repositório:

```powershell
node --test frontend/tests/consultas.test.cjs
node --test frontend/tests/interface.browser.cjs
```

O primeiro conjunto cobre consultas, perfis, cadastros e histórico com DOM/API simulados. O segundo abre as 11 páginas ativas no Chrome headless, verifica layout a 1440, 390 e 320 px, captura exceções JavaScript e verifica interações de senha, abas, diálogo e filtros.

O teste de navegador utiliza API simulada e bloqueia fontes/ícones de CDN para ser independente da rede; o layout é verificado também com as fontes de fallback. Não substitui validação integrada com o backend/MySQL ou uma auditoria manual completa de acessibilidade. Defina `CHROME_PATH` caso o Chrome não esteja no caminho padrão do Windows; sem Chrome o teste é marcado como ignorado.
