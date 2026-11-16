# Usuários, estacionamentos e histórico

## Navegação

- **Usuários** (`pages/usuario.html`): todos os usuários, seus registros em estacionamentos e veículos. Busca por nome, e-mail, placa e estacionamento.
- **Estacionamentos** (`pages/estacionamentos.html`): todos os estacionamentos, responsável e número de usuários cadastrados.
- **Perfil do usuário** (`pages/perfil.html?id=ID`): informações gerais, placas, estacionamentos cadastrados e histórico diário.
- **Perfil do estacionamento** (`pages/estacionamento.html?id=ID`): usuários cadastrados com suas placas, histórico e dashboard (entradas, saídas, registros do dia em aberto e entradas por hora).
- **Histórico** (`pages/dados.html`, URL antiga mantida): movimentações do dia atual por padrão, ordenadas da mais recente para a mais antiga. Permite mudar a data, pesquisar e filtrar estacionamento. Cada entrada e cada saída é exibida separadamente com usuário, placa e estacionamento.

As placas são de propriedade do usuário; cada registro liga um usuário, um carro e um estacionamento. O mesmo usuário pode registrar vários carros no mesmo estacionamento. O responsável por um estacionamento não é automaticamente registrado como frequentador. Históricos anteriores também não geram registros automaticamente.

## Registro de vínculos

Entre como administrador e abra um perfil de usuário ou estacionamento. O seletor **Registrar carro no estacionamento** cria o registro persistente e permite pesquisar o estacionamento e o carro por nome, placa ou modelo. **Remover registro** remove somente esse vínculo, preservando o usuário, os carros e o histórico. A lista de destinos exclui vínculos já existentes.

## Backend e banco

Reinicie o backend atualizado. A entidade `Registro` cria a tabela `tb_registro` por meio do `spring.jpa.hibernate.ddl-auto=update` já configurado, com chaves estrangeiras e par usuário/estacionamento único. Em ambientes sem atualização automática do schema, providencie a migração equivalente antes de usar as telas.

API nova:

- `GET /estacionamento/registros` → `[{id, usuarioId, estacionamentoId, carroId}]`
- `POST /estacionamento/registros` com `{usuarioId, estacionamentoId, carroId}` → 201; o carro precisa pertencer ao usuário; 400 para IDs inválidos, 404 se não encontrados, 409 se duplicados.
- `DELETE /estacionamento/registros/{id}` → 204; 404 se inexistente.

Falhas da API são exibidas com opção de tentar novamente; não há fallback com registros fictícios. Se não houver movimentações no dia atual, selecione um dia em que o banco possua registros. O modelo atual tem uma única data por permanência, portanto não permite distinguir uma saída na madrugada do dia seguinte sem evolução do schema.

## Validação

Frontend, a partir da raiz do repositório:

```powershell
node --test frontend/tests/consultas.test.cjs
```

Backend, dentro de `backend/estatec`:

```powershell
.\mvnw.cmd -DskipTests compile
.\mvnw.cmd '-Dtest=RegistroServiceTest,RegistroControllerTest' test
```

Os testes de frontend usam Node e um DOM mínimo, sem dependências externas. Os testes backend são unitários/MockMvc, sem conexão com o MySQL. Não substituem um teste no navegador com o banco em execução.

## Segurança preexistente

Os controles do frontend são apenas apresentação. O backend exige sessão, restringe alterações de registros ao administrador e omite a senha nas respostas de usuário. A API de registro retorna somente os IDs nas relações.
