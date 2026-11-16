# Condutores, carros e estacionamentos

O fluxo é **condutor → carro → vínculo com estacionamento**. A conta que opera
o sistema é independente do condutor e nunca é usada como dono de um carro.

## Telas

- **Condutores** (`pages/usuario.html`): lista condutores, seus carros e os estacionamentos de cada carro.
- **Perfil do condutor** (`pages/perfil.html?id=ID`): dados pessoais, carros e os estacionamentos vinculados a cada carro. É o único local para cadastrar um novo carro; o dono já está definido pelo perfil. O formulário de vínculo permite escolher um carro desse condutor e um estacionamento.
- **Carros** (`pages/carros.html`): somente consulta/listagem e navegação para os perfis; não oferece criação.
- **Perfil do carro** (`pages/perfil.html?tipo=carro&id=ID`): placa, marca, modelo, cor, condutor e estacionamentos vinculados. Oferece edição e exclusão. A edição preserva o condutor.
- **Estacionamentos** (`pages/estacionamentos.html`): lista estacionamentos e a quantidade de carros vinculados.
- **Perfil do estacionamento** (`pages/estacionamento.html?id=ID`): lista apenas os carros/placas efetivamente vinculados, com link para o perfil de cada carro e seu condutor. Não agrupa por condutor nem exibe dashboard ou histórico.
- **Histórico** (`pages/dados.html`): concentra as consultas de movimentações e filtros por dia e estacionamento.

Um estacionamento vinculado ao carro A não é atribuído automaticamente ao
carro B, mesmo que ambos tenham o mesmo condutor. Vários carros do mesmo
condutor podem ser vinculados ao mesmo estacionamento. O histórico não cria vínculos.

## API e integridade

- `POST /condutores/{id}/carros`: cria um carro com o condutor existente identificado pela rota; ignora IDs e donos enviados no corpo. `POST /carros` não cria carros.
- `GET /carros`, `GET /carros/{id}`: consultas.
- `PUT /carros/{id}`: altera os dados do veículo, preservando seu dono; rejeita tentativa de troca de condutor.
- `DELETE /carros/{id}`: remove o carro e seus vínculos, preservando as movimentações e a placa lida no histórico.
- `POST /estacionamento/registros`: exige carro, condutor e estacionamento; valida que o carro pertence ao condutor e rejeita o mesmo vínculo duplicado.
- `DELETE /estacionamento/registros/{id}`: remove apenas o vínculo, preservando carro, condutor e histórico.
- `DELETE /condutores/{id}`: rejeita a exclusão enquanto o condutor possuir carros, evitando deixá-los sem dono.

Contas de operador/administrador precisam estar autenticadas para alterar os cadastros.
Registros legados sem carro não são usados para inferir quais veículos frequentam um estacionamento.
Os nomes de tabelas e campos antigos das relações são mantidos por compatibilidade.

## Verificação

`node --test frontend/tests/consultas.test.cjs frontend/tests/interface.browser.cjs`
verifica os vínculos por carro, o cadastro somente pelo condutor, a edição no perfil,
e a responsividade. `backend/estatec/mvnw.cmd test` testa as regras na API com H2.

Nos perfis do condutor e do estacionamento, os carros aparecem em uma lista
de linhas separadas, com placa, modelo, relações e ações. Em telas pequenas,
os campos se empilham dentro da mesma linha para manter a leitura.

O nome do estacionamento aceita letras, acentos, números, símbolos e pontuação,
com preenchimento obrigatório e limite de 100 caracteres no cadastro e na edição.
