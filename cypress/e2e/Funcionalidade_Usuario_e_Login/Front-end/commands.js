import { test_data_and_locators as loc } from './test_data_and_locators.js';



Cypress.Commands.add('validaPresencaNaTabela', (valor) => {
  return cy.get(loc.WEB.serverest.dashboard.tabela)
    .should('be.visible')
    .and('contain', valor)
    .as('Validar_Registro_Tabela');
});