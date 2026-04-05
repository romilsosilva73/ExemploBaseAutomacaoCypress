import { test_data_and_locators as loc } from './test_data_and_locators.js';

// --- PRODUTOS ---
Cypress.Commands.add('listarProdutosApi', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}`
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    return res;
  }).as('GET_ListarProdutos');
});


Cypress.Commands.add('cadastrarProdutoApi', (token, produto) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}`,
    headers: { authorization: token },
    body: produto
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 201').to.eq(201);
    expect(res.body.message, 'Mensagem de sucesso no cadastro').to.eq('Cadastro realizado com sucesso');
    return res;
  }).as('POST_CadastrarProduto');
});

Cypress.Commands.add('buscarProdutoPorIdApi', (id) => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    expect(res.body, 'Corpo da resposta deve conter o ID do produto').to.have.property('_id', id);
    return res;
  }).as('GET_BuscarProdutoPorID');
});

Cypress.Commands.add('editarProdutoApi', (token, id, produto) => {
  return cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`,
    headers: { authorization: token },
    body: produto
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    expect(res.body.message, 'Mensagem de sucesso na edição').to.eq('Registro alterado com sucesso');
    return res;
  }).as('PUT_EditarProduto');
});

Cypress.Commands.add('excluirProdutoApi', (token, id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`,
    headers: { authorization: token }
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    expect(res.body.message, 'Mensagem de sucesso na exclusão').to.eq('Registro excluído com sucesso');
    return res;
  }).as('DELETE_ExcluirProduto');
});

// Busca de Produto - Cenário de Erro (400)
Cypress.Commands.add('buscarProdutoPorIdApiErro400', (id) => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`,
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 400 (Bad Request)').to.eq(400);
    expect(res.body.message, 'Mensagem de erro deve ser "Produto não encontrado"').to.eq('Produto não encontrado');
    return res;
  }).as('GET_BuscarProduto_Negativo');
});