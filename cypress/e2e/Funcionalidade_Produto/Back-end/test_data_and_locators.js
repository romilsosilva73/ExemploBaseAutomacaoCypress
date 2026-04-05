/// <reference types="cypress" />

export const test_data_and_locators = {
  ServeRest: {
    URLs: {
      produtos: '/produtos'
    },
    Produto: {
      nome: 'Teclado Mecânico RGB',
      preco: 250,
      descricao: 'Switch Blue',
      quantidade: 50
    },
    Produto_Edicao: {
      nome: 'Teclado Mecânico Wireless',
      preco: 350,
      descricao: 'Switch Brown',
      quantidade: 30
    }
  },
};
