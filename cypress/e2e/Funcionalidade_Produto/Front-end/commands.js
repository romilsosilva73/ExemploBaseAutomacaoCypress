import { test_data_and_locators as loc } from './test_data_and_locators.js';

Cypress.Commands.add('cadastrarProdutoFront', (prod) => {
  cy.get(loc.WEB.serverest.produtos.nome)
    .should('be.visible').type(prod.nome);
  cy.get(loc.WEB.serverest.produtos.preco)
    .should('be.visible').type(prod.preco);
  cy.get(loc.WEB.serverest.produtos.descricao)
    .should('be.visible').type(prod.descricao);
  cy.get(loc.WEB.serverest.produtos.quantidade)
    .should('be.visible').type(prod.quantidade);
  cy.get(loc.WEB.serverest.produtos.btn_cadastrar)
    .should('be.visible').click();
});

Cypress.Commands.add('removerProdutoPorNome', (nomeProduto) => {
  // 1. Captura o token do LocalStorage do navegador
  cy.window().then((win) => {
    const token = win.localStorage.getItem('serverest/userToken');

    // 2. Busca a lista de produtos para encontrar o ID correspondente ao Nome
    cy.listarProdutosApi().then((resProd) => {
      const produto = resProd.body.produtos.find(p => p.nome === nomeProduto);

      // 3. Chama o seu comando de exclusão do backend enviando o Token e o ID encontrado
      if (produto) {
        cy.excluirProdutoApi(token, produto._id);
      } else {
        throw new Error(`Produto ${nomeProduto} não encontrado para exclusão.`);
      }
    });
  });
});

