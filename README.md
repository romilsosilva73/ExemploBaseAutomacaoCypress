# 🚀 Cypress Automation Framework - Web & API

Este repositório contém uma estrutura de automação híbrida utilizando Cypress, abrangendo testes de Front-end (Web) e Back-end (API). O framework foca na modularização por funcionalidades, reutilização de lógica via Custom Commands e centralização de mapeamentos (Locators).

## 🌐 Sistema Automatizado — ServeRest

O sistema utilizado como alvo desta automação é o **[ServeRest](https://serverest.dev)**, um servidor REST open source que simula uma loja virtual, criado especificamente para o estudo e prática de testes manuais e automatizados.

| Camada | URL |
|---|---|
| Front-end (Web) | https://front.serverest.dev |
| Back-end (API) | https://serverest.dev |

**Principais características:**
- Suporta os verbos HTTP completos (GET, POST, PUT, DELETE) com persistência de dados
- Possui autenticação por token via header `Authorization`
- No ambiente online, **os dados cadastrados são removidos diariamente** — por isso os testes criam e limpam seus próprios dados via API
- Disponível também localmente via NPM (`npx serverest@latest`) ou Docker, onde os dados persistem até o servidor ser reiniciado

> ServeRest é amplamente utilizado em cursos, mentorias e processos seletivos de empresas como Globo.com e TOTVS. Mais informações em [github.com/ServeRest/ServeRest](https://github.com/ServeRest/ServeRest).

------------------------------------------------------------------------------------

```md
EXEMPLOBASECYPRESS/
└── cypress/
    ├── e2e/
    │   ├── Funcionalidade_Produto/
    │   │   ├── Back-end/
    │   │   │   ├── commands.js          <-- Comandos de API (CRUD de Produtos)
    │   │   │   ├── test_data_and_locators.js <-- Endpoints e payloads de Produtos
    │   │   │   └── produto_api.cy.js    <-- Testes de API
    │   │   └── Front-end/
    │   │       ├── commands.js          <-- Interações de UI (Dashboard/Listagem)
    │   │       ├── test_data_and_locators.js <-- Seletores de elementos
    │   │       └── produto_ui.cy.js     <-- Testes Web
    │   └── Funcionalidade_Usuario_e_Login/
    │       ├── Back-end/
    │       │   ├── commands.js          <-- Comandos de API (CRUD de Usuários)
    │       │   ├── test_data_and_locators.js <-- Endpoints e payloads de Usuários
    │       │   └── usuario_login_api.cy.js  <-- Testes de API
    │       └── Front-end/
    │           ├── commands.js          <-- Interações de UI (Login/Cadastro)
    │           ├── test_data_and_locators.js <-- Seletores de elementos
    │           └── usuario_login_ui.cy.js   <-- Testes Web
    └── support/
        ├── commands.js   <-- Importação global de todos os comandos
        └── e2e.js        <-- Configurações globais (Hooks, logs, etc.)
```

## 📍 Arquitetura e Estratégia

### 🛠️ Custom Commands
Em vez de repetir blocos de código complexos em todos os testes, utilizamos os `Cypress Commands` localizados dentro de cada contexto (Back-end/Front-end):

Diferente de frameworks tradicionais onde todos os comandos ficam em um único arquivo, aqui cada Funcionalidade possui seus próprios commands.js. Isso evita que o arquivo global de suporte fique sobrecarregado e facilita a manutenção.

> **Por que os `commands.js` ficam dentro da pasta de cada feature e não em `support/`?**
> Essa é uma decisão arquitetural intencional. Manter os commands co-localizados com a feature traz três benefícios práticos:
> - **Identificação imediata:** quem trabalha em `Funcionalidade_Produto` encontra todos os arquivos relacionados em um só lugar, sem navegar entre pastas.
> - **Manutenção localizada:** uma mudança na feature impacta apenas os arquivos daquela pasta, sem risco de afetar outras funcionalidades.
> - **Remoção segura:** se uma feature for descontinuada, basta deletar a pasta — os commands somem junto, sem deixar código órfão.
>
> Os commands continuam sendo registrados globalmente via importação no `support/commands.js`, seguindo o funcionamento esperado pelo Cypress.

* **Encapsulamento:** Escondemos a complexidade de requisições API (headers, métodos, status codes) e interações repetitivas de UI.
* **Legibilidade:** Os testes tornam-se muito mais limpos, focando apenas no fluxo de negócio, com nomes descritivos que indicam seu propósito.
* **Reutilização:** Um mesmo comando pode ser usado por múltiplos arquivos de teste, reduzindo a duplicidade de código.

### 📁 Locators e Fixtures Repository

O arquivo `test_data_and_locators.js` centraliza os **selectors de UI**, **endpoints de API** e **dados de teste** utilizados nos cenários automatizados:
* **Centralização:** Caso um endpoint de API ou um selector da interface seja alterado, a manutenção é realizada em um único arquivo, reduzindo impacto e esforço de manutenção.
* **Dinamicidade:** Permite a organização e geração de massas de dados de forma estruturada, incluindo o uso de técnicas como *Spread Operator* para criação de dados dinâmicos (ex.: e-mails únicos).

### 🔗 Integração Front-end + Back-end

Além da separação por domínio (Web e API), o projeto permite a integração de comandos e dados de Back-end diretamente em testes de Front-end. Essa abordagem possibilita:
* Reutilização de comandos de API em diferentes contextos
* Criação e limpeza de massa de dados via API antes ou durante testes Web
* Demonstração prática de testes híbridos (UI + API)

### 🏷️ Aliases de Requisição nos Commands

Os Custom Commands de API utilizam `.as('NOME_DO_COMANDO')` ao final de cada `cy.request()`.
Esses aliases **não são consumidos via `cy.get('@...')`** nos testes — essa é uma decisão intencional.

O objetivo é melhorar a **rastreabilidade visual** durante a execução no Cypress Test Runner:
em vez de exibir um genérico `cy.request()` no log, o alias nomeia a requisição de forma descritiva
(ex: `POST_CadastrarProduto`, `DELETE_ExcluirUsuario`), facilitando a leitura dos passos durante a inspeção manual.

### 🎯 Execução Isolada por Camada

A separação entre Back-end (API) e Front-end (Web) foi pensada, desde o início, para permitir a **execução isolada de suítes de teste**, conforme a necessidade do contexto. Com essa abordagem, é possível:
* Executar uma suíte focada exclusivamente em **validações de API**, sem dependência de interface
* Validar regras de negócio, contratos e persistência de dados de forma mais rápida
* Utilizar os testes de Back-end como base para testes de regressão e smoke tests
* Reduzir o custo de execução quando o objetivo for validar apenas as APIs
* Essa estratégia oferece maior flexibilidade na execução dos testes e facilita a adaptação do framework a diferentes pipelines e cenários de validação.

------------------------------------------------------------------------------------

## 🏗️ Estrutura do Projeto

O projeto está dividido em duas frentes principais, organizadas por domínios conforme a estrutura de pastas:

### 1. Back-end (API)
Validação do ciclo de vida completo (CRUD) na API [ServeRest](https://serverest.dev/).
* **`test_data_and_locators.js`**: URLs, seletores e payloads (massa de dados).
* **`commands.js`**: Abstração da lógica técnica (Requests de API).
* **`<funcionalidade>_api.cy.js`**: Scripts de teste focados na regra de negócio e rastreabilidade de dados.

### 2. Front-end (WEB)
Validação de navegação e funcionalidade de busca no site [ServeRest](https://serverest.dev/).
* **`test_data_and_locators.js`**: Seletores de elementos e URLs.
* **`commands.js`**: Comandos personalizados de interação com a interface.
* **`<funcionalidade>_ui.cy.js`**: Fluxos de teste de ponta a ponta (E2E).

------------------------------------------------------------------------------------

## 🧪 Cobertura de Testes

### 📡 Back-end (API ServeRest)
Foco em rastreabilidade total do dado:
* **CRUD de Usuário**: Cadastro e listagem, Login e fluxo completo de exclusão para limpeza de base.
* **CRUD de Produto**: Obtenção de token, Cadastro, Busca por ID, Edição e Exclusão.

### 🖥️ Front-end ( Site ServeRest)
Foco em estabilidade e interface:
* **Validação de Dados**: Verificação de Dashboard, Cards de Listagem e fluxos de erro (campos obrigatórios, senha inválida).
* **Fluxo Híbrido**: Cadastro de produto via API e remoção/validação via interface.

------------------------------------------------------------------------------------
### 📂 Nomeação Descritiva de Testes

Os arquivos de teste utilizam nomes **descritivos e padronizados** que facilitam a identificação imediata do seu conteúdo:

* **`<funcionalidade>_api.cy.js`**: Testes de Back-end/API da funcionalidade (ex: `usuario_login_api.cy.js`, `produto_api.cy.js`).
* **`<funcionalidade>_ui.cy.js`**: Testes de Front-end/UI da funcionalidade (ex: `usuario_login_ui.cy.js`, `produto_ui.cy.js`).

Essa abordagem oferece:
* **Clareza:** Qualquer QA consegue identificar o escopo do teste ao ler apenas o nome do arquivo.
* **Escalabilidade:** Novos arquivos de teste seguem o mesmo padrão, mantendo consistência.
* **Busca simplificada:** Fácil localizar testes em IDEs, CI/CD e relatórios com padrões de glob (`*_api.cy.js` ou `*_ui.cy.js`).
------------------------------------------------------------------------------------

## 🧪 Como Executar o Projeto

### 1. Pré-requisitos

Antes de começar, você vai precisar ter instalado:

![Node](https://img.shields.io/badge/node-v22.17.1-339933?logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-v10.9.2-CB3837?logo=npm&logoColor=white)
![Cypress](https://img.shields.io/badge/cypress-v14.5.4-17202C?logo=cypress&logoColor=white)

### 2. Instalação e Configuração

1. Clone o repositório:
```bash
git clone https://github.com/romilsosilva73/ExemploBaseAutomacaoCypress.git
```

2. Abrir o CMD na pasta do projeto:
Navegue até o diretório onde o projeto foi clonado e abra o terminal (CMD ou PowerShell).


3. Instalar as dependências:
```bash
npm install
```

4. Pronto! Agora você pode executar os testes (veja seção abaixo)
```bash
npx cypress open
```

------------------------------------------------------------------------------------

## 🔐 Variáveis de Ambiente (cypress.env.json)

Este projeto usa `cypress.env.json` para armazenar senhas e dados de teste utilizados nos cenários automatizados.

> **⚠️ Atenção — Decisão Intencional para Fins Educativos**
>
> Em projetos reais, arquivos como `cypress.env.json` **nunca devem ser commitados** no repositório. Commitar credenciais — mesmo que sejam senhas de teste — representa um **risco de segurança**, pois qualquer pessoa com acesso ao repositório pode visualizá-las no histórico do Git, mesmo que o arquivo seja removido posteriormente.
>
> Neste projeto, o arquivo está commitado **exclusivamente para fins didáticos**: para que qualquer QA possa clonar o repositório e executar os testes imediatamente, sem precisar configurar nada manualmente. Isso remove uma barreira de entrada e facilita o aprendizado.

```json
{
    "USUARIO_DEFAULT_PASSWORD": "passwordTesteQABaseCypress",
    "USUARIO_EDICAO_PASSWORD": "newpassword123",
    "LOGIN_INVALIDO_SENHA": "123456"
}
```

**✅ Como funciona neste projeto (educacional):**
- `cypress.env.json` está commitado para execução imediata após clonar
- O arquivo contém a chave `_aviso` com lembrete direto sobre o risco
- `cypress.env.example.json` serve como template de referência

**🚫 O que fazer em projetos reais:**
- Adicione `cypress.env.json` ao `.gitignore`
- Forneça apenas o `cypress.env.example.json` para novos QAs preencherem localmente
- Use variáveis de ambiente do CI/CD (ex: GitHub Actions Secrets, Azure DevOps Variables)




------------------------------------------------------------------------------------

## ▶️ Como executar os testes

Opção 1 — Rodar tudo de uma vez (mais simples):
```bash
npx cypress run --spec "cypress/e2e/**/*.cy.js"
```
Opção 2 — Executar apenas uma Funcionalidade específica (Ex: Usuario e Login)::
```bash
npx cypress run --spec "cypress/e2e/Funcionalidade_Usuario_e_Login/**"
```
Opção 3 — Executar apenas uma Funcionalidade específica (Ex: Produto):
```bash
npx cypress run --spec "cypress/e2e/Funcionalidade_Produto/**"
```
Opção 4 - Executar apenas o Back-end 
```bash
npx cypress run --spec "cypress/e2e/*/Back-end/*.cy.js"
```
Opção 5 — Executar apenas o Front-end
```bash
npx cypress run --spec "cypress/e2e/*/Front-end/*.cy.js"
```
Opção 6 — Abrir interface visual do Cypress:
```bash
npx cypress open
```

## 📊 Relatório de Testes

Após executar os testes, o relatório HTML é gerado automaticamente em:

```
cypress/reports/html/index.html
```

> **⚠️ Atenção:** O relatório só é gerado ao executar os testes via linha de comando.  
> Com `cypress open` (modo interativo), os relatórios **não são criados**.

Para visualizar, basta entrar na pasta `cypress/reports/html/` e abrir o arquivo `index.html` no navegador:

```bash
# Windows
start cypress/reports/html/index.html

# Mac
open cypress/reports/html/index.html
```

O relatório inclui:
- Status de cada teste (passou / falhou)
- Gráficos de resultado por suíte

------------------------------------------------------------------------------------

## 📚 Referências

- 🛠️ [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
- 📡 [API Automation](https://docs.cypress.io/api/commands/request)
- 🎯 [Selecting Elements](https://docs.cypress.io/app/core-concepts/best-practices#Selecting-Elements)



