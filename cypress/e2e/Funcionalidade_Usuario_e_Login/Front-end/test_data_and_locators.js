/// <reference types="cypress" />

export const test_data_and_locators = {
  WEB: {
    serverest: {

      rotas: {
        cadastro: '/cadastrarusuarios'
      },
      login: {
        email: '[data-testid="email"]',
        senha: '[data-testid="senha"]',
        btn_entrar: '[data-testid="entrar"]',
        btn_ir_para_cadastro: '[data-testid="cadastrar"]'
      },
      cadastro: {
        nome: '[data-testid="nome"]',
        email: '[data-testid="email"]',
        senha: '[data-testid="password"]',
        btn_finalizar_cadastro: '[data-testid="cadastrar"]'
      },
      dashboard: {
        btn_listar_usuarios: '[data-testid="listarUsuarios"]',
        // '.table' é usado pois a tabela da aplicação ServeRest não possui data-testid.
        // O elemento renderizado é <table class="table table-striped">.
        // Preferência seria [data-testid="..."], mas como não está disponível, usamos a classe CSS.
        tabela: '.table'
      },
      comum: {
        // '.alert' é usado pois o componente ErrorAlert da aplicação ServeRest não expõe data-testid.
        // O elemento renderizado é <div class="alert alert-secondary alert-dismissible">.
        // Preferência seria [data-testid="..."], mas como não está disponível, usamos a classe CSS.
        alertas: '.alert'
      },
      // --- MENSAGENS DO SISTEMA PARA VALIDAÇÃO ---
      mensagens: {
        erro: {
          nome_obrigatorio: 'Nome é obrigatório',
          email_obrigatorio: 'Email é obrigatório',
          senha_obrigatorio: 'Password é obrigatório',
          login_invalido: 'Email e/ou senha inválidos'
        }
      },
      // --- MASSA DE DADOS PARA INPUTS (.type) ---
      massa: {
        nome_padrao: 'Usuario Teste Front',
        login_invalido: {
          email: 'usuario_inexistente@teste.com'
        }
      }
    }
  }
};
