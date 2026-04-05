/// <reference types="cypress" />

export const test_data_and_locators = {
  ServeRest: {
    URLs: {

      usuarios: '/usuarios',
      login: '/login',
      produtos: '/produtos'
    },
    Usuario: {
      nome: 'TesteQABaseCypress',
      email: '', // sobrescrito dinamicamente via cy.gerarEmailUnico()
      administrador: 'true'
    },
    Usuario_Edicao: {
      nome: 'TesteQABaseCypress Editado',
      email: '', // sobrescrito dinamicamente via cy.gerarEmailUnico()
      administrador: 'false'
    }
  },
};
