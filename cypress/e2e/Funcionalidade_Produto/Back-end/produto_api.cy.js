/// <reference types="cypress" />

import { test_data_and_locators as loc } from './test_data_and_locators';

describe('ServeRest - Back-end - produto_api', () => {

  // Limpa cookies e local storage antes de cada teste para evitar interferências
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('CRUD de Produto', () => {

    // ❌ MENOS INDICADO - Todo o CRUD condensado em um único teste
    // Exibido aqui apenas para fins didáticos, para mostrar que é tecnicamente possível.
    // Problema: se qualquer etapa falhar, as seguintes não executam e a causa fica difícil
    // de identificar no relatório. O aninhamento excessivo de .then() (Pyramid of Doom)
    // também reduz a legibilidade e dificulta a manutenção.

    it('0. Obter token de usuário, Cadastrar, Buscar, Editar e Excluir Produto - CRUD (Menos indicado)', () => {
      // 0. Pré-condição: Obter Token de Admin (via Custom Command)
      cy.obterTokenAdmin().then((auth) => {
        const authToken = auth.token;
        const idAdmin = auth.idUsuario;

        // 1. CADASTRAR PRODUTO (POST)
        const nomeProdutoUnico = `${loc.ServeRest.Produto.nome} ${Date.now()}`;
        const payloadProduto = { ...loc.ServeRest.Produto, nome: nomeProdutoUnico };

        cy.cadastrarProdutoApi(authToken, payloadProduto).then((resPost) => {

          const idProduto = resPost.body._id;

          cy.log(`✅ SUCESSO - Etapa 1: Produto criado com ID ${idProduto}`);

          // 2. BUSCAR PRODUTO POR ID (GET)
          cy.buscarProdutoPorIdApi(idProduto).then((resBusca) => {
            expect(resBusca.body.nome, 'O nome deve ser o que foi enviado no POST').to.eq(nomeProdutoUnico);
            cy.log('✅ SUCESSO - Etapa 2: Produto localizado e validado.');

            // 3. EDITAR PRODUTO (PUT)
            const payloadEditado = {
              ...loc.ServeRest.Produto_Edicao,
              nome: `${nomeProdutoUnico} Editado`
            };

            cy.editarProdutoApi(authToken, idProduto, payloadEditado).then(() => {

              cy.log('✅ SUCESSO - Etapa 3: Informações do produto alteradas.');

              // Validar edição via nova busca
              cy.buscarProdutoPorIdApi(idProduto).then((resValidar) => {
                expect(resValidar.body.nome, 'Nome do produto deve conter "Editado" após a alteração').to.contains('Editado');
                cy.log('✅ Edição confirmada no banco de dados.');

                // 4. EXCLUIR PRODUTO (DELETE)
                cy.excluirProdutoApi(authToken, idProduto).then(() => {

                  cy.log(`✅ SUCESSO - Etapa 4: Produto ${idProduto} removido.`);

                  // 5. LIMPEZA FINAL: Remover o usuário admin para manter a base limpa
                  cy.excluirUsuarioApi(idAdmin).then(() => {
                    cy.log(`✅ SUCESSO - Etapa 5: Admin ${idAdmin} removido.`);
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
    
    it('1. Cadastrar e Validar listagem de produto cadastrado (Mais indicado)', () => {
      // SETUP: Obtém token de admin e monta payload com nome único para evitar duplicidade
      cy.obterTokenAdmin().then((auth) => {
        const { token, idUsuario } = auth;
        const nomeProduto = `Produto Lista ${Date.now()}`;
        const payload = { ...loc.ServeRest.Produto, nome: nomeProduto };

        // AÇÃO: Cadastra o produto usando o token de autenticação
        cy.cadastrarProdutoApi(token, payload).then((resPost) => {
          const idProduto = resPost.body._id;

          // VALIDAÇÃO: Busca a lista completa e confirma que o produto recém-criado está presente
          cy.listarProdutosApi().then((resLista) => {
            const encontrado = resLista.body.produtos.some(p => p._id === idProduto);
            expect(encontrado, `✅ SUCESSO: O Produto ${idProduto} está na lista`).to.be.true;
            // LIMPEZA: Remove o produto e o usuário admin criados durante o teste
            cy.excluirProdutoApi(token, idProduto);
            cy.excluirUsuarioApi(idUsuario);
          });
        });
      });
    });

    it('2. Buscar produto por ID (Mais indicado)', () => {
      // SETUP: Obtém token de admin e monta payload com nome único
      cy.obterTokenAdmin().then((auth) => {
        const { token, idUsuario } = auth;
        const nomeProduto = `Produto Busca ${Date.now()}`;
        const payload = { ...loc.ServeRest.Produto, nome: nomeProduto };

        // AÇÃO: Cadastra o produto para ter um ID válido para buscar
        cy.cadastrarProdutoApi(token, payload).then((resPost) => {
          const idProduto = resPost.body._id;

          // VALIDAÇÃO: Busca o produto pelo ID e confirma que os dados retornados são os corretos
          cy.buscarProdutoPorIdApi(idProduto).then((resBusca) => {
            expect(resBusca.body._id, 'O ID retornado deve ser idêntico ao solicitado').to.eq(idProduto);
            expect(resBusca.body.nome, 'O nome deve corresponder ao cadastro original').to.eq(nomeProduto);
            cy.log('✅ Rastreabilidade: Dados do produto conferem na consulta individual.');
            // LIMPEZA: Remove o produto e o usuário admin criados durante o teste
            cy.excluirProdutoApi(token, idProduto);
            cy.excluirUsuarioApi(idUsuario);
          });
        });
      });
    });

    it('3. Editar produto existente (Mais indicado)', () => {
      // SETUP: Obtém token de admin e monta payloads de criação e edição
      cy.obterTokenAdmin().then((auth) => {
        const { token, idUsuario } = auth;
        const nomeOriginal = `Produto Original ${Date.now()}`;
        const payload = { ...loc.ServeRest.Produto, nome: nomeOriginal };

        // AÇÃO: Cadastra o produto e em seguida aplica a edição
        cy.cadastrarProdutoApi(token, payload).then((resPost) => {
          const idProduto = resPost.body._id;

          const payloadNovo = { ...loc.ServeRest.Produto_Edicao, nome: `${nomeOriginal} EDITADO` };

          cy.editarProdutoApi(token, idProduto, payloadNovo).then(() => {
            // VALIDAÇÃO: Busca o produto pelo ID e confirma que o nome foi alterado
            cy.buscarProdutoPorIdApi(idProduto).then((resValidar) => {
              expect(resValidar.body.nome, 'Nome deve refletir a edição realizada').to.eq(payloadNovo.nome);
              cy.log('✅ Edição de produto confirmada.');
              // LIMPEZA: Remove o produto e o usuário admin criados durante o teste
              cy.excluirProdutoApi(token, idProduto);
              cy.excluirUsuarioApi(idUsuario);
            });
          });
        });
      });
    });


    it('4. Excluir produto e validar remoção (Mais indicado)', () => {
      // SETUP: Obtém token de admin e cadastra um produto para ser excluído
      cy.obterTokenAdmin().then((auth) => {
        const { token, idUsuario } = auth;
        const payload = { ...loc.ServeRest.Produto, nome: `Produto Delete ${Date.now()}` };

        // AÇÃO: Cadastra o produto e em seguida realiza a exclusão
        cy.cadastrarProdutoApi(token, payload).then((resPost) => {
          const idProduto = resPost.body._id;

          cy.excluirProdutoApi(token, idProduto).then((resDel) => {
            expect(resDel.body.message, 'Mensagem de confirmação da exclusão').to.eq('Registro excluído com sucesso');

            // VALIDAÇÃO: Tenta buscar o produto excluído e confirma que a API retorna erro (não encontrado)
            cy.buscarProdutoPorIdNaoEncontradoApi(idProduto).then(() => {
              cy.log(`✅ Produto ${idProduto} removido com sucesso.`);
              // LIMPEZA: Remove o usuário admin criado durante o teste
              cy.excluirUsuarioApi(idUsuario);
            });
          });
        });
      });
    });


  });

  describe('Cenários Negativos', () => {

    // Os cenários abaixo validam que a API rejeita corretamente requisições inválidas.
    // Cada teste cobre um tipo diferente de erro: payload, autenticação e formato de ID.

    it('5. POST com campo obrigatório ausente deve retornar 400', () => {
      // SETUP: Token necessário para confirmar que o 400 é por payload, não por falta de auth
      cy.obterTokenAdmin().then((auth) => {
        const { token, idUsuario } = auth;

        // AÇÃO: Envia um produto sem o campo 'nome' (campo obrigatório)
        cy.cadastrarProdutoPayloadInvalidoApi(token, loc.ServeRest.Produto_Invalido).then((res) => {

          // VALIDAÇÃO: Confirma que a API retornou o erro específico do campo ausente
          expect(res.body.nome, 'Campo "nome" deve retornar mensagem de obrigatório').to.eq('nome é obrigatório');
          cy.log('✅ API rejeitou corretamente o payload sem campo obrigatório.');
          // LIMPEZA: Remove o usuário admin criado durante o teste
          cy.excluirUsuarioApi(idUsuario);
        });
      });
    });


    it('6. PUT com token inválido deve retornar 401', () => {
      // SETUP: Cria um produto real para garantir que o 401 vem da auth, não de recurso inexistente
      cy.obterTokenAdmin().then((auth) => {
        const { token, idUsuario } = auth;
        const payload = { ...loc.ServeRest.Produto, nome: `Produto Token Invalido ${Date.now()}` };

        cy.cadastrarProdutoApi(token, payload).then((resPost) => {
          const idProduto = resPost.body._id;

          // AÇÃO: Tenta editar o produto usando um token inválido no header
          cy.editarProdutoTokenInvalidoApi(idProduto, loc.ServeRest.Produto_Edicao).then(() => {
            cy.log('✅ API rejeitou corretamente a edição com token inválido.');
            // LIMPEZA: Remove o produto e o usuário admin criados durante o teste
            cy.excluirProdutoApi(token, idProduto);
            cy.excluirUsuarioApi(idUsuario);
          });
        });
      });
    });


    it('7. DELETE sem token deve retornar 401', () => {
      // SETUP: Cria um produto real para garantir que o 401 vem da auth, não de recurso inexistente
      cy.obterTokenAdmin().then((auth) => {
        const { token, idUsuario } = auth;
        const payload = { ...loc.ServeRest.Produto, nome: `Produto Sem Token ${Date.now()}` };

        cy.cadastrarProdutoApi(token, payload).then((resPost) => {
          const idProduto = resPost.body._id;

          // AÇÃO: Tenta excluir o produto sem informar nenhum token no header
          cy.excluirProdutoSemTokenApi(idProduto).then(() => {
            cy.log('✅ API rejeitou corretamente a exclusão sem token.');
            // LIMPEZA: Remove o produto e o usuário admin criados durante o teste
            cy.excluirProdutoApi(token, idProduto);
            cy.excluirUsuarioApi(idUsuario);
          });
        });
      });
    });


    it('8. GET com ID malformado deve retornar 400', () => {
      // Neste cenário não há SETUP de produto — o ID inválido é suficiente para disparar o erro.
      // Diferença em relação ao teste 4 ('buscarProdutoPorIdNaoEncontradoApi'):
      //   - Teste 4: ID com formato válido que não existe → API busca no banco → retorna { message: "Produto não encontrado" }
      //   - Teste 8: ID malformado → API rejeita na validação Joi (antes de buscar) → retorna { _id: "id deve ser um id mongo válido" }

      // AÇÃO: Envia uma string malformada como ID na URL
      cy.buscarProdutoPorIdMalformadoApi(loc.ServeRest.Strings.id_malformado).then(() => {
        cy.log('✅ API rejeitou corretamente a busca com ID malformado.');
      });
    });

  });


  // afterEach comentado pois impacta a performance — executa após cada teste mesmo quando não há dados para limpar.
  // A limpeza foi movida para o final de cada teste (inline), mantendo o controle direto sobre o que é deletado.
  //
  // EXEMPLO de como o afterEach funcionaria com arrays de produto e admin acumulados:
  //
  // beforeEach(() => {
  //   cy.wrap([]).as('produtosParaLimpar'); // Armazena { id, token } — token necessário para o DELETE de produto
  //   cy.wrap([]).as('idsAdminParaLimpar'); // Armazena IDs dos usuários admin criados
  // });
  //
  // it('exemplo de teste usando afterEach', () => {
  //   cy.obterTokenAdmin().then((auth) => {
  //     const { token, idUsuario } = auth;
  //     cy.get('@idsAdminParaLimpar').then((ids) => {
  //       ids.push(idUsuario); // Registra o admin
  //     });
  //     cy.cadastrarProdutoApi(token, payload).then((res) => {
  //       cy.get('@produtosParaLimpar').then((produtos) => {
  //         produtos.push({ id: res.body._id, token }); // Registra produto com token
  //       });
  //       // ... restante do teste sem se preocupar com limpeza ...
  //     });
  //   });
  // });
  //
  // afterEach(function() {
  //   cy.get('@produtosParaLimpar').then((produtos) => {
  //     produtos.forEach(prod => {
  //       cy.excluirProdutoApi(prod.token, prod.id); // Deleta produtos
  //     });
  //   });
  //   cy.get('@idsAdminParaLimpar').then((ids) => {
  //     ids.forEach(id => {
  //       cy.excluirUsuarioApi(id); // Deleta admins, mesmo se o teste falhou
  //     });
  //   });
  // });

});