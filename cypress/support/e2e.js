// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// registra o plugin de reporter mochawesome para capturar screenshots automáticas
import 'cypress-mochawesome-reporter/register';

/**
 * --- CONFIGURAÇÃO DE LIMPEZA DE LOG (VISUAL) ---
 *
 * PROBLEMA:
 * O Test Runner do Cypress exibe nativamente todas as requisições de rede (XHR/Fetch),
 * como chamadas de analytics, pixels e carregamento de recursos. Isso polui o log
 * visual ("lixo"), dificultando a visualização dos passos do teste e dos asserts.
 *
 * SOLUÇÃO:
 * O código abaixo injeta uma tag <style> no HTML do próprio Test Runner para ocultar
 * via CSS (display: none) as linhas referentes a requisições de rede.
 * Nota: As requisições continuam ocorrendo, apenas não são mostradas visualmente.
 */
const app = window.top;
if (app && app.document && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = `
    .command-name-request,
    .command-name-xhr {
      display: none;
    }
  `;
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

/**
 * --- TRATAMENTO DE EXCEÇÕES NÃO CAPTURADAS ---
 *
 * PROPÓSITO:
 * Alguns navegadores e bibliotecas de terceiros geram erros que não afetam realmente
 * a funcionalidade dos testes. Esta whitelist evita falsos positivos, permitindo que
 * apenas erros REAIS interrompam o teste.
 *
 * COMO USAR:
 * 1. Se um erro "ruidoso" aparecer, análise-o com cuidado
 * 2. Se não afetar a funcionalidade testada, adicione à lista abaixo
 * 3. Sempre prefira falhar em erros desconhecidos (segurança)
 */
const ERROS_ESPERADOS = [
  "Cannot read properties of null (reading 'document')",
  "ResizeObserver loop limit exceeded",
  "Non-Error promise rejection caught",
];

Cypress.on('uncaught:exception', (err, runnable) => {
  const ehErroEsperado = ERROS_ESPERADOS.some(e => err.message.includes(e));

  if (ehErroEsperado) {
    // console.warn em vez de cy.log: este handler é síncrono e cy.log (assíncrono)
    // não pode ser usado aqui — causaria comportamento imprevisível na fila de comandos.
    console.warn(`⚠️ Erro esperado (ignorado): ${err.message}`);
    return false; // Não falha o teste
  }

  // Erros desconhecidos falham o teste
  console.error(`❌ Erro inesperado detectado: ${err.message}`);
  return true; // Falha o teste
});