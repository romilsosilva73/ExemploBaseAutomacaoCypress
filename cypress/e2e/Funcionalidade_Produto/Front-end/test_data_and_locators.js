/// <reference types="cypress" />

export const test_data_and_locators = {
  WEB: {
    serverest: {

      dashboard: {
        btn_listar_produtos: '[data-testid="listar-produtos"]',
        btn_cadastrar_produtos: '[data-testid="cadastrar-produtos"]',
        // '.card' é usado pois o container do card não possui data-testid na aplicação ServeRest.
        // O data-testid existe apenas nos botões dentro do card, não no elemento card em si.
        // Preferência seria [data-testid="..."], mas como não está disponível, usamos a classe CSS.
        card_listar_produtos: '.card',
      },
      produtos: {
        nome: '[data-testid="nome"]',
        preco: '[data-testid="preco"]',
        descricao: '[data-testid="descricao"]',
        quantidade: '[data-testid="quantity"]',
        btn_cadastrar: '[data-testid="cadastarProdutos"]' // "cadastar" é o valor real na aplicação ServeRest
                                                          // Possível bug de baixa criticidade na aplicação — o correto seria "cadastrar"
      },
      comum: {
        // '.alert' é usado pois o componente ErrorAlert da aplicação ServeRest não expõe data-testid.
        // O elemento renderizado é <div class="alert alert-secondary alert-dismissible">.
        // Preferência seria [data-testid="..."], mas como não está disponível, usamos a classe CSS.
        alertas: '.alert'
      },
      textos: {
        bem_vindo: 'Bem Vindo',
        desc_sistema: 'Este é seu sistema para administrar seu ecommerce.',
        card_titulo_prod: 'Listar Produtos',
        card_desc_prod: 'Funcionalidade de listagem de produtos que estão cadastrados.',
        btn_listar_texto: 'Listar'
      },
      mensagens: {
        erro: {
          prod_nome: 'Nome é obrigatório',
          prod_preco: 'Preco é obrigatório',
          prod_desc: 'Descricao é obrigatório',
          prod_qtd: 'Quantidade é obrigatório'
        }
      },
      massa: {
        nome_padrao: 'Fulano da Silva',
        produto_nome: 'Produto Cypress ',
        dados_padrao_prod: {
          preco: "100",
          descricao: "Teste",
          quantidade: "10"
        }
      }
    }
  }
};
