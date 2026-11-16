# projeto-estatec

## Configuração e acesso

O sistema distingue **usuário do sistema** (pessoa que opera as telas) de
**condutor** (pessoa cadastrada para vincular veículos e estacionamentos).
Condutores não possuem login nem senha. O cadastro pede nome, CPF, e-mail e telefone.

Configure as variáveis listadas em `backend/estatec/.env.example` no ambiente do
processo Java. O Spring não carrega um arquivo `.env` automaticamente.
São necessários `DB_URL`, `DB_USER` e `DB_PASSWORD`. Para manter também um
acesso administrativo por configuração, use `ESTATEC_ADMIN_EMAIL` e
`ESTATEC_ADMIN_PASSWORD_HASH` (hash BCrypt); essas duas variáveis são opcionais
para quem cria uma conta pela tela.
Não existe senha padrão. `ESTATEC_FRONTEND_ORIGIN` deve ser a origem exata do
frontend, incluindo porta. Em localhost, o padrão é `http://localhost:5500`.
Use o mesmo hostname no frontend e na API para os cookies de sessão.

```powershell
cd backend/estatec
.\mvnw.cmd spring-boot:run
```

Sirva o frontend por HTTP (por exemplo, Live Server na porta 5500), em vez de
abrir o HTML por `file://`. A API local usa a porta 8080.
O endereço especial `estatec.lab` usa a API em `api.estatec.lab`.

O `data.sql` é executado **depois** da criação das tabelas. Contém um condutor
de demonstração, sem credenciais, e pode ser reexecutado sem duplicar esse registro.
Use `SQL_INIT_MODE=never` para desabilitar esse preenchimento, por exemplo em produção.
As tabelas e colunas antigas (`tb_usuario`, `id_usuario` e relações JSON `usuario`)
foram preservadas para manter os dados existentes. A entidade Java agora é
`Condutor`, e o endpoint principal é `/condutores`; `/usuarios` continua como alias
protegido para compatibilidade. Colunas legadas de senha, RG e nascimento não
são mais usadas pelo modelo. A inicialização remove a obrigatoriedade dessas
colunas legadas em MySQL, preservando seus valores existentes.

Abra **Login → Criar conta e senha**, informe nome, e-mail, senha e confirmação.
Após criar a conta, entre pelo login com o mesmo e-mail e senha. Contas são
persistidas em `tb_conta_acesso`, com senha BCrypt, e continuam disponíveis após
reiniciar o backend. O cadastro não cria um condutor nem exige dados de veículo.

As novas contas recebem o perfil de operador, com acesso ao gerenciamento de
condutores, carros, estacionamentos e registros. Para criar uma conta é necessário
o código de convite definido em `ESTATEC_REGISTRATION_CODE` no backend.
Compartilhe esse código somente com operadores autorizados; sem configuração,
novos cadastros ficam bloqueados. As contas existentes continuam funcionando.
O identificador da conta nunca é usado como dono de um carro.

Autenticação: `POST /auth/cadastro`, `POST /auth/login`, `GET /auth/sessao`, `POST /auth/logout`.
A sessão usa cookie HttpOnly, expira após 30 minutos de inatividade e é validada
no servidor antes das consultas do frontend. Em HTTPS, configure
`SESSION_COOKIE_SECURE=true`. Todas as operações de cadastro de condutores
exigem sessão de operador ou administrador, inclusive quando chamadas diretamente pela API.

Configure `ESTATEC_ACCESS_API_KEY` no backend e use essa chave no dispositivo.
Cada requisição deve informar o estacionamento e a direção (`ENTRADA` ou `SAIDA`)
conforme a passagem monitorada. Use o endereço do servidor acessível pelo
Raspberry; `localhost` no Raspberry aponta para o próprio dispositivo.
O acesso só é autorizado quando o carro está registrado no estacionamento informado.

### Comunicação com o Raspberry Pi

O dispositivo usa `POST /api/acesso/validar`, JSON e o cabeçalho
`X-API-Key` com a mesma chave `ESTATEC_ACCESS_API_KEY` configurada no backend.
Não precisa de login ou cookie do navegador. Exemplo de corpo:

```json
{"placa":"ABC1D23","estacionamentoId":"1","movimento":"SAIDA"}
```

Resposta de uma saída autorizada:

```json
{"placa":"ABC1D23","autorizado":true,"movimento":"SAIDA","mensagem":"ACESSO LIBERADO"}
```

O backend normaliza a placa e grava cada leitura válida com a hora do servidor,
direção e autorização, incluindo tentativas negadas. Sem chave válida retorna
401; sem direção válida retorna 400, sem gravar movimentação. O leitor só deve
acionar o relé quando receber HTTP 200 e `autorizado: true`; falhas de rede não
liberam a passagem. A URL deve ser alcançável pela rede do Raspberry (porta 8080
ou endereço do proxy). A comunicação não depende de CORS nem de sessão web.

O histórico usa `dataHora`, `entrada`, `autorizado` e `placaLida` retornados
pela API. Tentativas negadas aparecem no histórico, mas não aumentam os totais
de entradas e saídas. A placa original é preservada ao editar ou excluir o carro.

## Fluxo dos cadastros

Cadastre o condutor, abra seu perfil e use **Cadastrar carro deste condutor**.
O sistema define o dono pelo perfil e valida essa relação no backend. Depois,
vincule o carro a um estacionamento no perfil do condutor. Cada carro possui
seus próprios vínculos; eles não são herdados de outros carros do mesmo dono.
A aba Carros apenas lista os veículos e abre seus perfis, onde podem ser editados
ou excluídos. O perfil do estacionamento lista carros, placas e seus condutores.
Um condutor com carros não pode ser excluído até que seus carros sejam removidos.

## Verificação

```powershell
cd backend/estatec
.\mvnw.cmd clean test
# A partir da raiz do projeto:
node --test frontend/tests/consultas.test.cjs frontend/tests/mensagens.test.cjs frontend/tests/interface.browser.cjs
```

Os testes de integração usam H2 em modo MySQL, sem alterar o banco configurado.
Verificam o carregamento e a reexecução do SQL, proteção das rotas, validação
de login, encerramento de sessão e CRUD sem senha. O teste de navegador usa Chrome
instalado e simula a API; inclui telas pequenas e rejeição de sessão adulterada.

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![Python](https://img.shields.io/badge/python-%233776AB.svg?style=for-the-badge&logo=python&logoColor=white)

## Sobre o Projeto
O EstaTec é um sistema inteligente de gestão de estacionamentos que une o mundo físico (IoT) ao digital (Web). Desenvolvido no curso de Desenvolvimento de Sistemas do SENAI Sorocaba - Gaspar Ricardo Junior, ministrado pelo Prof. [Vedilson Prado](http://github.com/vedilsonprado). O projeto automatiza o controle de acesso veicular através do reconhecimento de placas (LPR) e sensores de presença.

#### O Diferencial: Fluxo de Automação
Diferente de um CRUD comum, este sistema integra:
- Sensores (C++): Detectam a presença do veículo.
- Visão Computacional (Python): Lê a placa do carro via câmera.
- **Regra de negócio (Java/Spring):** Valida se a placa pertence a um condutor cadastrado e libera a cancela automaticamente.

---  

## Tecnologias Utilizadas

### Hardware & Baixo Nível (IoT)
- **C++:** Programação de microcontroladores para gestão de sensores magnéticos, infravermelhos e controle de motores da cancela.
- **Sensores:** Detecção de massa metálica e barreira física.

### Inteligência e Backend
- **Python:** Script especializado em OCR (Optical Character Recognition) para processamento de imagem e extração de texto de placas.
- **Java 17 & Spring Boot:** O "cérebro" do projeto. Gerencia a API RESTful, autenticação e as validações de entrada/saída.
- **MySQL:** Persistência robusta de dados relacionais.

### Frontend
- **HTML5 e CSS3:** Estrutura semântica e estilização.
- **JavaScript:** Lógica do cliente e consumo da API.

---

## Como executar o projeto

### 1. Banco de Dados 
- Crie o banco de dados MySQL executando o script SQL: 
```sql
CREATE DATABASE db_estatec;
```

### 2. Backend
- Clonar repositório.
- Configure as variáveis de ambiente descritas acima.
- A API rodará em: `http://localhost:8080`

### 3. Módulo de Visão (Python)
- Instale as dependências de OCR (como OpenCV e Tesseract).
- Configure o endpoint da API Java no script Python para envio da placa capturada.

### 4. Frontend
- Navegue até a pasta do Frontend. 
- Sirva a pasta frontend por HTTP e acesse index.html.

---

## Funcionalidades
[x] CRUD Completo: Gerenciamento de Alunos/Donos de Carros.

[x] Segurança: Acesso administrativo autenticado por sessão.

[x] Automação LPR: Reconhecimento de placa via sensor.

[x] Validação de Acesso: Verificação instantânea de permissão de entrada.

[x] Gestão de Vagas: Controle entre as entidades Carro e Estacionamento.
