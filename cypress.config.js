const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    env: {
      apiUrl: "https://serverest.dev",
    },
    baseUrl: "https://front.serverest.dev",
    setupNodeEvents(on, config) {
      // aqui você pode adicionar outros listeners de node/task do projeto

      // registrar plugin do mochawesome para coletar screenshots e adicionar metadados
      require('cypress-mochawesome-reporter/plugin')(on);

      // é importante retornar a configuração atualizada
      return config;
    },

    trashAssetsBeforeRuns: false, // evita erro de limpeza de screenshots no Windows

    // Define o tempo máximo (em ms) que o Cypress aguarda um elemento aparecer no DOM.
    // Substitui o { timeout: 10000 } que seria necessário em cada cy.get() dos testes.
    // Para casos específicos que precisam de mais tempo, ainda é possível sobrescrever
    // pontualmente: cy.get('[data-testid="x"]', { timeout: 30000 })
    defaultCommandTimeout: 10000,

    // Define o tamanho padrão da janela do navegador para todos os testes.
    // Substitui o cy.viewport(1366, 768) que seria necessário no beforeEach de cada teste.
    viewportWidth: 1366,
    viewportHeight: 768,

    // relatórios multi-reporters (mochawesome + junit)
    chromeWebSecurity: true,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'cypress-mochawesome-reporter, mocha-junit-reporter',
      mochaJunitReporterReporterOptions: {
        mochaFile: 'cypress/reports/junit/results-[hash].xml'
      },
      cypressMochawesomeReporterReporterOptions: {
        charts: true,
        reportPageTitle: 'Relatório de testes',
        embeddedScreenshots: true,
        inlineAssets: true,
        saveAllAttempts: false
      }
    }
  },
});
