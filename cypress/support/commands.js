// --- Importações da Funcionalidade 1 ---
import '../e2e/Funcionalidade_Produto/Back-end/commands'
import '../e2e/Funcionalidade_Produto/Front-end/commands'

// --- Importações da Funcionalidade_Usuario_e_Login  ---
import '../e2e/Funcionalidade_Usuario_e_Login/Back-end/commands'
import '../e2e/Funcionalidade_Usuario_e_Login/Front-end/commands'

// Importação dos locators de login para uso no comando global loginServeRest
import { test_data_and_locators as loc_login } from '../e2e/Funcionalidade_Usuario_e_Login/Front-end/test_data_and_locators.js';

// --- UTILITÁRIOS GLOBAIS ---
Cypress.Commands.add('gerarEmailUnico', () => {
    return cy.wrap(`teste${Date.now()}@qa.com.br`).as('EmailDinamico');
});

Cypress.Commands.add('loginServeRest', (email, senha) => {
    cy.intercept('POST', '**/login').as('loginPost');
    cy.visit('/login');
    cy.get(loc_login.WEB.serverest.login.email).should('be.visible').type(email);
    cy.get(loc_login.WEB.serverest.login.senha).should('be.visible').type(senha);
    cy.get(loc_login.WEB.serverest.login.btn_entrar).should('be.visible').click();

    return cy.wait('@loginPost').then((interception) => {
        const token = interception.response.body.authorization;
        return cy.url().should('not.include', '/login') // aguarda o redirect para o dashboard antes de continuar
            .then(() => token);
    });
});
