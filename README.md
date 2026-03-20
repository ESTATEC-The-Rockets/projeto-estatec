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
Este **Sistema automatizado de estacionamento** é uma aplicação FullStack desenvolvida como um projeto de revisão de conteúdo no curso de Desenvolvimento de Sistemas, oferecido pelo SENAI Sorocaba - Gaspar Ricardo Junior, ministrado pelo Prof. [Vedilson Prado](http://github.com/vedilsonprado). O objetivo do projeto é consolidar conhecimentos em criação de API RestFull, manipulação de Banco de Dados Relacional e integração com o Frontend usando JavaScript.

A aplicação permite o gerenciamento (CRUD) de entrada no estacionamento, incluindo validações de regras de negócio e persistência de dados.

---  

## Tecnologias Utilizadas

### Backend
- **Java 17:** Principal linguagem.
    - **Spring Boot:** Framework para a criação da API.
- **Python:** Reconhecimento dos dígitos das placas.
- **C++:** Linguagem para programar as cameras LPD e sensores magnéticos e infravermelhos(IOT)

### Banco de Dados
- **MySQL:** Banco de Dados Relacional.

### Frontend
- **HTML5 e CSS3:** Estrutura semântica e estilização.
- **JavaScript:** Lógica do cliente e consumo da API.

---

## Como executar o projeto

### 1. Banco de Dados 
- Crie o banco de dados MySQL executando o script SQL: 
```sql
CREATE DATABASE db_cadastro_aluno;
```

### 2. Backend
- Clonar repositório.
- Configure o arquivo apllication.properties com suas credenciais no MySQL.
- A API rodará em: `http://localhost:8080`

### 3. Frontend
- Navegue até a pasta do Frontend. 
- Acesse o index.html no navegador.

---

## Funcionalidades
[x] Cadastrar Aluno
[x] Listar Alunos
[x] Ediar Aluno
[x] Excluir Aluno
