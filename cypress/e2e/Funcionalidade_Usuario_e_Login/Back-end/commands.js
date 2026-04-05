import { test_data_and_locators as loc } from './test_data_and_locators.js';

// --- USUÁRIOS ---
Cypress.Commands.add('cadastrarUsuarioApi', (usuario) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.usuarios}`,
    body: usuario,
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 201').to.eq(201);
    expect(res.body.message, 'Mensagem de sucesso no cadastro').to.eq('Cadastro realizado com sucesso');
    return res;
  }).as('POST_CadastrarUsuario');
});

Cypress.Commands.add('listarUsuariosApi', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.usuarios}`
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    return res;
  }).as('GET_ListarUsuarios');
});

Cypress.Commands.add('buscarUsuarioPorIdApi', (id) => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.usuarios}/${id}`,
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    return res;
  }).as('GET_BuscarUsuarioPorID');
});

Cypress.Commands.add('editarUsuarioApi', (id, usuario) => {
  return cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.usuarios}/${id}`,
    body: usuario,
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    expect(res.body.message, 'Mensagem de sucesso na edição').to.eq('Registro alterado com sucesso');
    return res;
  }).as('PUT_EditarUsuario');
});

Cypress.Commands.add('excluirUsuarioApi', (id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.usuarios}/${id}`,
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    expect(res.body.message, 'Mensagem de sucesso na exclusão').to.eq('Registro excluído com sucesso');
    return res;
  }).as('DELETE_ExcluirUsuario');
});

// --- AUTH ---
Cypress.Commands.add('loginApi', (email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}${loc.ServeRest.URLs.login}`,
    body: { email, password }
  }).then((res) => {
    expect(res.status, 'Status Code deve ser 200').to.eq(200);
    expect(res.body.message, 'Login realizado com sucesso').to.eq('Login realizado com sucesso');
    return res.body.authorization;
  }).as('POST_Login');
});

Cypress.Commands.add('obterTokenAdmin', () => {
  return cy.gerarEmailUnico().then((email) => {
    const payloadAdmin = {
      ...loc.ServeRest.Usuario,
      email: email,
      administrador: 'true',
      password: Cypress.env('USUARIO_DEFAULT_PASSWORD')
    };

    return cy.cadastrarUsuarioApi(payloadAdmin).then((res) => {
      const idUsuario = res.body._id;

      return cy.loginApi(email, Cypress.env('USUARIO_DEFAULT_PASSWORD')).then((token) => {
        return { token, idUsuario };
      });
    });
  });
});

