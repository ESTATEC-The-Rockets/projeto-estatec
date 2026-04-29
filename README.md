# projeto-estatec

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
- **Regra de negócio (Java/Spring):** Valida se a placa pertence a um aluno/usuário cadastrado e libera a cancela automaticamente.

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
- Configure o arquivo apllication.properties com suas credenciais no MySQL.
- A API rodará em: `http://localhost:8080`

### 3. Módulo de Visão (Python)
- Instale as dependências de OCR (como OpenCV e Tesseract).
- Configure o endpoint da API Java no script Python para envio da placa capturada.

### 4. Frontend
- Navegue até a pasta do Frontend. 
- Acesse o index.html no navegador.

---

## Funcionalidades
[x] CRUD Completo: Gerenciamento de Alunos/Donos de Carros.
[x] Segurança: Acesso restrito via Entidade Usuário.
[x] Automação LPR: Reconhecimento de placa via sensor.
[x] Validação de Acesso: Verificação instantânea de permissão de entrada.
[x] Gestão de Vagas: Controle entre as entidades Carro e Estacionamento.
