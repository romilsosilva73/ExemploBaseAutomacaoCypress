/// <reference types="cypress" />

import { test_data_and_locators as loc } from './test_data_and_locators';

describe('ServeRest - Back-end - usuario_login_api', () => {

  // Limpa cookies e local storage antes de cada teste para evitar interferências
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('CRUD de Usuário', () => {

    // ❌ MENOS INDICADO - Todo o CRUD condensado em um único teste
    // Exibido aqui apenas para fins didáticos, para mostrar que é tecnicamente possível.
    // Problema: se qualquer etapa falhar, as seguintes não executam e a causa fica difícil
    // de identificar no relatório. O aninhamento excessivo de .then() (Pyramid of Doom)
    // também reduz a legibilidade e dificulta a manutenção.

    it('0. Cadastrar, Listar, Buscar, Editar e Excluir usuario - CRUD (Menos indicado)', () => {

      // Geração de e-mail dinâmico para evitar erro de duplicidade na API
      cy.gerarEmailUnico().then((email) => {

        // Montagem da massa de dados inicial usando o Spread Operator (...) para unir dados fixos e dinâmicos
        const payload = {
          ...loc.ServeRest.Usuario,
          email: email,
          password: Cypress.env('USUARIO_DEFAULT_PASSWORD')
        };

        // ETAPA 1: Criar o usuário e capturar o ID gerado pelo sistema
        cy.cadastrarUsuarioApi(payload).then((resPost) => {
          const idUsuario = resPost.body._id;
          cy.log(`✅ SUCESSO - Etapa 1: Usuário criado com ID ${idUsuario}`);

          // ETAPA 2: Verificar se o usuário recém-criado aparece na lista de todos os usuários
          cy.listarUsuariosApi().then((resLista) => {
            const encontrado = resLista.body.usuarios.some(u => u._id === idUsuario);

            expect(encontrado, 'Rastreabilidade: O ID criado deve estar presente na listagem').to.be.true;
            cy.log('✅ SUCESSO - Etapa 2: ID localizado na listagem global.');

            // ETAPA 3: Consultar os detalhes específicos deste usuário via ID
            cy.buscarUsuarioPorIdApi(idUsuario).then((resBusca) => {
              expect(resBusca.body._id, 'O ID retornado deve ser idêntico ao solicitado').to.eq(idUsuario);
              expect(resBusca.body.email, 'O e-mail deve corresponder ao e-mail dinâmico gerado').to.eq(email);
              cy.log('✅ SUCESSO - Etapa 3: Dados detalhados conferem com o cadastro.');

              // ETAPA 4: Alterar os dados do usuário (usando locators.js)
              const payloadNovo = {
                ...loc.ServeRest.Usuario_Edicao,
                email: email, // Mantemos o mesmo e-mail para identificar o registro
                password: Cypress.env('USUARIO_EDICAO_PASSWORD')
              };

              cy.editarUsuarioApi(idUsuario, payloadNovo).then(() => {
                cy.log('✅ SUCESSO - Etapa 4: Informações do usuário alteradas.');

                // Validar edição via busca por usuario 
                cy.buscarUsuarioPorIdApi(idUsuario).then((resValidarEdicao) => {
                  expect(resValidarEdicao.body.nome, 'Nome deve refletir a edição realizada').to.eq(loc.ServeRest.Usuario_Edicao.nome);
                  cy.log('✅ Edição confirmada no banco de dados.');

                  // ETAPA 5: Remover o usuário para manter a base de dados limpa
                  cy.excluirUsuarioApi(idUsuario).then((resExcluir) => {
                    expect(resExcluir.body.message, 'Mensagem de confirmação da exclusão').to.eq('Registro excluído com sucesso');
                    cy.log(`✅ SUCESSO - Etapa 5: Usuário ${idUsuario} removido do sistema.`);
                  });
                });
              });
            });
          });
        });
      });
    });

    // ✅ MAIS INDICADO - Cada operação em seu próprio teste (testes 1 a 4)
    // Cada it() tem uma única responsabilidade. Quando falhar, o relatório aponta
    // exatamente qual operação quebrou. Os testes são independentes entre si.
    
    it('1. Cadastrar e Validar listagem de usuario cadastrado (Mais indicado)', () => {

      // SETUP: Gera email único e monta o payload com dados do template + senha do env
      cy.gerarEmailUnico().then((email) => {
        const payload = { ...loc.ServeRest.Usuario, email: email, password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        // AÇÃO: Cadastra o usuário e captura o ID gerado pela API
        cy.cadastrarUsuarioApi(payload).then((resPost) => {
          const idParaVerificar = resPost.body._id;

          // VALIDAÇÃO: Busca a lista completa e confirma que o ID recém-criado está presente
          cy.listarUsuariosApi().then((resLista) => {
            const encontrado = resLista.body.usuarios.some(u => u._id === idParaVerificar);

            // Validação de segurança: Interrompe o teste com mensagem clara se o ID não existir
            expect(encontrado, `✅ SUCESSO: O ID ${idParaVerificar} foi localizado corretamente na listagem`).to.be.true;
            // LIMPEZA: Remove o usuário criado para não poluir a base de dados
            cy.excluirUsuarioApi(idParaVerificar);
          });
        });
      });
    });

    it('2. Buscar usuario (Mais indicado)', () => {

      // SETUP: Gera email único e monta o payload com dados do template
      cy.gerarEmailUnico().then((email) => {
        const payload = { ...loc.ServeRest.Usuario, email: email, password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        // AÇÃO: Cadastra o usuário para ter um ID válido para buscar
        cy.cadastrarUsuarioApi(payload).then((resPost) => {
          const idParaBuscar = resPost.body._id;

          // VALIDAÇÃO: Busca o usuário pelo ID e confirma que os dados retornados são os corretos
          cy.buscarUsuarioPorIdApi(idParaBuscar).then((resBusca) => {
            // Verifica se a API não retornou dados de outro usuário por engano
            expect(resBusca.body._id, 'O ID retornado deve ser idêntico ao solicitado').to.eq(idParaBuscar);
            expect(resBusca.body.nome, 'O nome deve corresponder ao cadastro original').to.eq(loc.ServeRest.Usuario.nome);
            cy.log('✅ Rastreabilidade: Nome e ID conferem na consulta individual.');
            // LIMPEZA: Remove o usuário criado para não poluir a base de dados
            cy.excluirUsuarioApi(idParaBuscar);
          });
        });
      });
    });

    it('3. Editar usuario (Mais indicado)', () => {
      // SETUP: Gera email único e monta os payloads de criação e edição
      cy.gerarEmailUnico().then((email) => {
        const payload = { ...loc.ServeRest.Usuario, email: email, password: Cypress.env('USUARIO_DEFAULT_PASSWORD') };

        // AÇÃO: Cadastra o usuário para ter um ID válido para editar
        cy.cadastrarUsuarioApi(payload).then((resPost) => {
          const idParaEditar = resPost.body._id;

          const payloadNovo = { ...loc.ServeRest.Usuario_Edicao, email: email, password: Cypress.env('USUARIO_EDICAO_PASSWORD') };

          // Executa a alteração com os novos dados
          cy.editarUsuarioApi(idParaEditar, payloadNovo).then(() => {

            // VALIDAÇÃO: Busca o usuário pelo ID e confirma que o nome foi alterado
            cy.buscarUsuarioPorIdApi(idParaEditar).then((resValidarEdicao) => {
              expect(resValidarEdicao.body.nome, 'Nome deve refletir a edição realizada').to.eq(loc.ServeRest.Usuario_Edicao.nome);
              cy.log('✅ Edição confirmada no banco de dados.');
              // LIMPEZA: Remove o usuário editado para não poluir a base de dados
              cy.excluirUsuarioApi(idParaEditar);
            });
          });
        });
      });
    });

    it('4. Cadastrar um usuário, realizar login e excluir usuário (Mais indicado)', () => {

      // SETUP: Gera email único e monta o payload com dados do template + senha do env
      cy.gerarEmailUnico().then((email) => {
        const payload = {
          ...loc.ServeRest.Usuario,
          email: email,
          password: Cypress.env('USUARIO_DEFAULT_PASSWORD')
        };

        // AÇÃO: Cadastra o usuário e em seguida realiza o login para obter o token
        cy.cadastrarUsuarioApi(payload).then((resPost) => {
          const idUsuario = resPost.body._id;
          cy.log(`✅ Usuário cadastrado: ${email}`);

          cy.loginApi(email, Cypress.env('USUARIO_DEFAULT_PASSWORD')).then((token) => {

            // VALIDAÇÃO: Confirma que o token retornado é uma string válida
            expect(token, 'Token de autenticação deve ser retornado como string').to.be.a('string');
            cy.log('✅ Login realizado com sucesso');
            // LIMPEZA: Remove o usuário criado para não poluir a base de dados
            cy.excluirUsuarioApi(idUsuario);
          });
        });
      });
    });
  });

  // afterEach comentado pois impacta a performance — executa após cada teste mesmo quando não há dados para limpar.
  // A limpeza foi movida para o final de cada teste (inline), mantendo o controle direto sobre o que é deletado.
  //
  // EXEMPLO de como o afterEach funcionaria com array de IDs acumulados:
  //
  // beforeEach(() => {
  //   cy.wrap([]).as('idsParaLimpar'); // Inicializa array vazio antes de cada teste
  // });
  //
  // it('exemplo de teste usando afterEach', () => {
  //   cy.cadastrarUsuarioApi(payload).then((res) => {
  //     const idUsuario = res.body._id;
  //     cy.get('@idsParaLimpar').then((ids) => {
  //       ids.push(idUsuario); // Registra o ID
  //     });
  //     // ... restante do teste sem se preocupar com limpeza ...
  //   });
  // });
  //
  // afterEach(function() {
  //   cy.get('@idsParaLimpar').then((ids) => {
  //     ids.forEach(id => {
  //       cy.excluirUsuarioApi(id); // Deleta todos os IDs registrados, mesmo se o teste falhou
  //     });
  //   });
  // });

});