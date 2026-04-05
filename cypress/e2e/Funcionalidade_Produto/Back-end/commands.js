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

// Busca de Produto - Cenário Negativo: produto não encontrado
// Nota: A API ServeRest retorna 400 para IDs inexistentes (comportamento da API, não um erro do teste)
Cypress.Commands.add('buscarProdutoPorIdNaoEncontradoApi', (id) => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`,
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 400 — comportamento da ServeRest para produto inexistente').to.eq(400);
    expect(res.body.message, 'Mensagem de erro deve ser "Produto não encontrado"').to.eq('Produto não encontrado');
    return res;
  }).as('GET_BuscarProduto_Negativo');
});

// Busca de Produto - Cenário Negativo: ID com formato inválido/malformado
// Comportamento da ServeRest: quando o ID não segue o padrão MongoDB (ObjectId),
// a API rejeita na camada de validação Joi — antes mesmo de buscar no banco.
// Por isso a resposta NÃO tem 'message', mas sim o campo '_id' com a mensagem de erro.
// Contraste com 'buscarProdutoPorIdNaoEncontradoApi': lá o ID tem formato válido mas
// não existe na base — aí sim a API retorna { message: "Produto não encontrado" }.
Cypress.Commands.add('buscarProdutoPorIdMalformadoApi', (id) => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`,
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 400 para ID malformado').to.eq(400);
    return res;
  }).as('GET_BuscarProduto_IDMalformado');
});

// POST de Produto - Cenário Negativo: payload sem campo obrigatório ('nome' ausente)
// Demonstra que a API valida a presença dos campos obrigatórios antes de persistir o dado
Cypress.Commands.add('cadastrarProdutoPayloadInvalidoApi', (token, produto) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}`,
    headers: { authorization: token },
    body: produto,
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 400 para payload sem campo obrigatório').to.eq(400);
    return res;
  }).as('POST_CadastrarProduto_PayloadInvalido');
});

// PUT de Produto - Cenário Negativo: token inválido no header Authorization
// Demonstra que a API rejeita requisições com credencial inválida antes de verificar o recurso
Cypress.Commands.add('editarProdutoTokenInvalidoApi', (id, produto) => {
  return cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`,
    headers: { authorization: loc.ServeRest.Strings.token_invalido },
    body: produto,
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 401 — token inválido').to.eq(401);
    expect(res.body.message, 'Mensagem de erro de autorização').to.eq('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
    return res;
  }).as('PUT_EditarProduto_TokenInvalido');
});

// DELETE de Produto - Cenário Negativo: header Authorization ausente
// Demonstra que a API bloqueia a exclusão sem nenhuma credencial informada
Cypress.Commands.add('excluirProdutoSemTokenApi', (id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.produtos}/${id}`,
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 401 — token ausente').to.eq(401);
    expect(res.body.message, 'Mensagem de erro de autorização').to.eq('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
    return res;
  }).as('DELETE_ExcluirProduto_SemToken');
});