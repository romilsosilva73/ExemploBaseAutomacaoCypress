/// <reference types="cypress" />
import { test_data_and_locators as loc } from './test_data_and_locators';
import { test_data_and_locators as loc_backend } from '../Back-end/test_data_and_locators.js';

describe('ServeRest - Front-end - usuario_login_ui', () => {

  // Limpa cookies e local storage antes de cada teste para evitar interferências
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Verificação de Dados no Front-end', () => {

    it('1. Validar as mensagens de campos obrigatórios no cadastro de usuários', () => {
      // AÇÃO: Navega para o login e acessa a tela de cadastro sem preencher nenhum campo
      cy.visit('/login');
      cy.get(loc.WEB.serverest.login.btn_ir_para_cadastro)
        .should('be.visible').click();

      // Confirma que a navegação para a tela de cadastro ocorreu corretamente
      cy.url().should('include', loc.WEB.serverest.rotas.cadastro);

      // Tenta submeter o formulário vazio para disparar as validações de campos obrigatórios
      cy.get(loc.WEB.serverest.cadastro.btn_finalizar_cadastro)
        .should('be.visible').click();

      // VALIDAÇÃO: Confirma que todos os alertas de campos obrigatórios são exibidos
      cy.get(loc.WEB.serverest.comum.alertas)
        .should('be.visible');

      cy.contains(loc.WEB.serverest.mensagens.erro.nome_obrigatorio)
        .should('be.visible');
      cy.contains(loc.WEB.serverest.mensagens.erro.email_obrigatorio)
        .should('be.visible');
      cy.contains(loc.WEB.serverest.mensagens.erro.senha_obrigatorio)
        .should('be.visible');
    });


    it('2. Validar mensagem de erro com senha inválida', () => {
      // AÇÃO: Navega para o login e preenche com um e-mail inexistente e senha inválida
      cy.visit('/login');

      // Email e senha lidos da massa de dados centralizada (test_data_and_locators.js e cypress.env.json)
      cy.get(loc.WEB.serverest.login.email)
        .should('be.visible').type(loc.WEB.serverest.massa.login_invalido.email);

      cy.get(loc.WEB.serverest.login.senha)
        .should('be.visible').type(Cypress.env('LOGIN_INVALIDO_SENHA'));

      cy.get(loc.WEB.serverest.login.btn_entrar)
        .should('be.visible').click();

      // VALIDAÇÃO: Confirma que a mensagem de credenciais inválidas é exibida
      cy.get(loc.WEB.serverest.comum.alertas)
        .should('be.visible')
        .and('contain', loc.WEB.serverest.mensagens.erro.login_invalido);
    });



    it('3. Validar que o usuário cadastrado via API consta na listagem do Front-end', () => {
      // SETUP: Cria o usuário via API — mais rápido que criar pela UI e garante dados controlados
      cy.gerarEmailUnico().then((email) => {
        const nome = loc.WEB.serverest.massa.nome_padrao;
        const payload = { ...loc_backend.ServeRest.Usuario, nome: nome, email: email, password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        cy.cadastrarUsuarioApi(payload).then((res) => {
          const idUsuario = res.body._id;

          // AÇÃO: Realiza login via UI e navega para a listagem de usuários
          cy.loginServeRest(email, Cypress.env('USUARIO_DEFAULT_PASSWORD'));
          cy.get(loc.WEB.serverest.dashboard.btn_listar_usuarios)
            .should('be.visible').click();

          // VALIDAÇÃO: Confirma que o usuário criado via API aparece na tabela da UI
          cy.validaPresencaNaTabela(nome);
          // LIMPEZA: Remove o usuário criado via API
          cy.excluirUsuarioApi(idUsuario);
        });
      });
    });

  });

  describe('BACK-END + FRONT-END - Exemplo de fluxo híbrido', () => {

    it('0. Criar usuário via API, listar via UI e validar (Fluxo Híbrido)', () => {
      // SETUP: Gera email único, monta payload e cria o usuário via API (sem depender de UI)
      cy.gerarEmailUnico().then((email) => {
        const nomeUser = loc.WEB.serverest.massa.nome_padrao;
        const payload = { ...loc_backend.ServeRest.Usuario, nome: nomeUser, email: email, administrador: "true", password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        cy.cadastrarUsuarioApi(payload).then((resPost) => {
          const idUsuario = resPost.body._id;
          cy.log(`✅ Usuário criado via API: ${email}`);

          // AÇÃO: Realiza login via UI e navega para a listagem de usuários
          cy.loginServeRest(email, Cypress.env('USUARIO_DEFAULT_PASSWORD'));
          cy.log('✅ Login realizado via UI');

          cy.get(loc.WEB.serverest.dashboard.btn_listar_usuarios)
            .should('be.visible').click();

          // VALIDAÇÃO: Confirma que o usuário criado via API aparece na tabela da UI
          cy.validaPresencaNaTabela(nomeUser);
          cy.log(`✅ Usuário "${nomeUser}" encontrado na listagem da UI`);
          // LIMPEZA: Remove o usuário criado via API
          cy.excluirUsuarioApi(idUsuario);
        });
      });
    });

  });

  // POSSIBILIDADE: Centralizar a limpeza no afterEach garante execução mesmo se o teste falhar,
  // porém pode impactar a performance por rodar após cada teste independente de necessidade.
  // afterEach(function() {
  //   cy.get('@idsUsuariosParaLimpar').then((ids) => {
  //     ids.forEach(id => {
  //       cy.excluirUsuarioApi(id);
  //     });
  //   });
  // });

});