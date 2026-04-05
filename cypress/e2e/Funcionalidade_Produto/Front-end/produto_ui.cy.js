/// <reference types="cypress" />
import { test_data_and_locators as loc } from './test_data_and_locators';
import { test_data_and_locators as loc_usuario } from '../../Funcionalidade_Usuario_e_Login/Back-end/test_data_and_locators.js';

describe('ServeRest - Front-end - produto_ui', () => {

  // Limpa cookies e local storage antes de cada teste para evitar interferências
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Verificação de Dados no Front-end', () => {

    it('1. Validar Dashboard: Boas-vindas e Card de Listagem de Produtos', () => {
      // SETUP: Cria usuário admin via API e realiza login para acessar o dashboard
      cy.gerarEmailUnico().then((email) => {
        const nomeUser = loc.WEB.serverest.massa.nome_padrao;
        const payload = { ...loc_usuario.ServeRest.Usuario, nome: nomeUser, email: email, administrador: "true", password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        cy.cadastrarUsuarioApi(payload).then((res) => {
          const idUsuario = res.body._id;

          cy.loginServeRest(email, Cypress.env('USUARIO_DEFAULT_PASSWORD'));

          // VALIDAÇÃO: Confirma que o dashboard exibe a mensagem de boas-vindas com o nome do usuário
          cy.contains(`${loc.WEB.serverest.textos.bem_vindo} ${nomeUser}`)
            .should('be.visible');
          cy.contains(loc.WEB.serverest.textos.desc_sistema)
            .should('be.visible');

          // Confirma que o card de listagem de produtos está visível com título e descrição corretos
          cy.get(loc.WEB.serverest.dashboard.card_listar_produtos)
            .should('be.visible')
            .and('contain', loc.WEB.serverest.textos.card_titulo_prod)
            .and('contain', loc.WEB.serverest.textos.card_desc_prod);

          cy.get(loc.WEB.serverest.dashboard.btn_listar_produtos)
            .should('contain', loc.WEB.serverest.textos.btn_listar_texto);
          // LIMPEZA: Feita aqui (e não no afterEach) para evitar overhead de performance.
          // Trade-off aceito: se o teste falhar antes deste ponto, o usuário não é removido.
          // Impacto baixo — emails são únicos por timestamp e não geram conflito em novas execuções.
          cy.excluirUsuarioApi(idUsuario);
        });
      });
    });


    it('2. Validar mensagens de erro ao cadastrar produto', () => {
      // SETUP: Cria usuário admin via API e realiza login para acessar o cadastro de produtos
      cy.gerarEmailUnico().then((email) => {
        const payload = { ...loc_usuario.ServeRest.Usuario, email: email, administrador: "true", password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        cy.cadastrarUsuarioApi(payload).then((res) => {
          const idUsuario = res.body._id;

          cy.loginServeRest(email, Cypress.env('USUARIO_DEFAULT_PASSWORD'));

          // AÇÃO: Navega para o cadastro de produtos e tenta submeter o formulário vazio
          cy.get(loc.WEB.serverest.dashboard.btn_cadastrar_produtos)
            .should('be.visible').click();
          cy.get(loc.WEB.serverest.produtos.btn_cadastrar)
            .should('be.visible').click();

          // VALIDAÇÃO: Itera sobre todas as mensagens de erro cadastradas no locator e confirma que cada uma está visível
          const erros = loc.WEB.serverest.mensagens.erro;
          Object.values(erros).forEach(msg => {
            cy.contains(msg).should('be.visible');
          });
          // LIMPEZA: Remove o usuário criado para não poluir a base de dados
          cy.excluirUsuarioApi(idUsuario);
        });
      });
    });

    it('3. Cadastrar produto e remover via API (Fluxo Híbrido)', () => {
      // SETUP: Cria usuário admin via API e realiza login para acessar o cadastro de produtos
      cy.gerarEmailUnico().then((email) => {
        const payload = { ...loc_usuario.ServeRest.Usuario, email: email, administrador: "true", password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        cy.cadastrarUsuarioApi(payload).then((resUser) => {
          const idUsuario = resUser.body._id;

          cy.loginServeRest(email, Cypress.env('USUARIO_DEFAULT_PASSWORD'));

          // AÇÃO: Navega para o cadastro de produtos e preenche o formulário via UI
          cy.get(loc.WEB.serverest.dashboard.btn_cadastrar_produtos)
            .should('be.visible').click();

          // Nome único com timestamp para evitar conflito com produtos de outras execuções
          const nomeProd = `${loc.WEB.serverest.massa.produto_nome}${Date.now()}`;
          const dadosProd = {
            nome: nomeProd,
            ...loc.WEB.serverest.massa.dados_padrao_prod
          };

          cy.cadastrarProdutoFront(dadosProd);

          // VALIDAÇÃO: Confirma que o produto aparece na tabela após o cadastro via UI
          cy.validaPresencaNaTabela(nomeProd);

          // LIMPEZA via API: Remove o produto diretamente pela API — mais rápido que navegar pela UI
          cy.removerProdutoPorNome(nomeProd);

          // reload necessário: remoção via API não atualiza a UI automaticamente
          cy.reload();
          cy.contains(nomeProd).should('not.exist');
          // LIMPEZA: Remove o usuário admin criado durante o teste
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
