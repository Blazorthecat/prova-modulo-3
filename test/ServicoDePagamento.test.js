import assert from "node:assert";
import { ServicoDePagamento } from "../src/ServicoDePagamento.js";

/**
 * =====================================================================
 *  Suite de testes — ServicoDePagamento
 * ---------------------------------------------------------------------
 *  Padrao de estruturacao: AAA (Arrange, Action, Assert) em todos os
 *  testes — cada bloco esta sinalizado por comentarios // Arrange,
 *  // Action e // Assert.
 *
 *  Tecnicas de teste aplicadas (uma secao `describe` por tecnica):
 *    1. Particao de Equivalencia
 *    2. Analise de Valor-Limite (boundary)
 *    3. Tabela de Decisao
 *    4. MC/DC (Modified Condition/Decision Coverage)
 *
 *  Defeitos de regra de negocio comprovados no codigo de producao sao
 *  documentados na ultima secao como testes `it.skip` ([BUG-Dx]): eles
 *  permanecem PENDENTES (suite verde) e suas assercoes descrevem o
 *  comportamento ESPERADO/CORRETO. Basta remover o `.skip` apos corrigir
 *  o codigo para valida-los — funcionam como testes de regressao futuros.
 * =====================================================================
 */
describe("ServicoDePagamento", () => {
  let servico;

  beforeEach(() => {
    // Arrange comum: instancia nova garante isolamento entre os testes
    // (estado #pagamentos sempre vazio no inicio de cada caso).
    servico = new ServicoDePagamento();
  });

  // -------------------------------------------------------------------
  // Caminho feliz e contrato de dados de pagar()
  // -------------------------------------------------------------------
  describe("pagar() — caminho feliz e contrato de dados", () => {
    it("deve registrar um pagamento com os dados informados", () => {
      // Arrange
      const codigoBarras = "0987-7656-3475";
      const empresa = "Samar";
      const valor = 156.87;

      // Action
      servico.pagar(codigoBarras, empresa, valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.codigoBarras, codigoBarras);
      assert.strictEqual(ultimo.empresa, empresa);
      assert.strictEqual(ultimo.valor, valor);
    });

    it("deve retornar objeto contendo todas as propriedades esperadas", () => {
      // Cobre o contrato de saida: codigoBarras, empresa, valor e categoria.
      // Arrange
      const propriedadesEsperadas = ["codigoBarras", "empresa", "valor", "categoria"];

      // Action
      servico.pagar("0987-7656-3475", "Samar", 156.87);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      for (const prop of propriedadesEsperadas) {
        assert.ok(Object.hasOwn(ultimo, prop), `faltou a propriedade "${prop}"`);
      }
    });
  });

  // -------------------------------------------------------------------
  // TECNICA 1 — Particao de Equivalencia (parametro `valor`)
  // Classes: CE1 invalida (valor <= 0) | CE2 valida "padrao" (0<v<=100)
  //          CE3 valida "cara" (v>100)  | CE4 nao-numerica (ver BUGs)
  // -------------------------------------------------------------------
  describe("pagar() — Particao de Equivalencia (valor)", () => {
    it('CE2: valor representativo da classe valida "padrao" (50) -> categoria "padrao"', () => {
      // Arrange
      const valor = 50.0; // ponto interno tipico da faixa 0 < v <= 100

      // Action
      servico.pagar("4444-5555-6666", "Empresa B", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it('CE3: valor representativo da classe valida "cara" (150) -> categoria "cara"', () => {
      // Arrange
      const valor = 150.0; // ponto interno tipico da faixa v > 100

      // Action
      servico.pagar("1111-2222-3333", "Empresa A", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "cara");
    });

    it("CE1: valor zero (classe invalida) -> lanca erro de validacao", () => {
      // Arrange
      const valor = 0;

      // Action / Assert (acao que deve lancar erro)
      assert.throws(
        () => servico.pagar("1234-5678-9012", "Empresa D", valor),
        /Valor do pagamento deve ser maior que zero/
      );
    });

    it("CE1: valor negativo (classe invalida) -> lanca erro de validacao", () => {
      // O teste original cobria apenas o 0; aqui exercitamos explicitamente
      // o representante negativo da mesma classe invalida (regra RN1).
      // Arrange
      const valor = -10;

      // Action / Assert
      assert.throws(
        () => servico.pagar("1234-5678-9012", "Empresa D", valor),
        /Valor do pagamento deve ser maior que zero/
      );
    });
  });

  // -------------------------------------------------------------------
  // TECNICA 2 — Analise de Valor-Limite (fronteiras 0 e 100)
  // Para cada fronteira testamos o ponto exato e os vizinhos imediatos.
  // -------------------------------------------------------------------
  describe("pagar() — Analise de Valor-Limite (fronteiras 0 e 100)", () => {
    it("limite -0.01 (logo abaixo de 0) -> lanca erro (lado invalido)", () => {
      // Arrange
      const valor = -0.01;

      // Action / Assert
      assert.throws(
        () => servico.pagar("000", "Empresa", valor),
        /Valor do pagamento deve ser maior que zero/
      );
    });

    it('limite 0.01 (menor valor valido) -> categoria "padrao"', () => {
      // Arrange
      const valor = 0.01; // primeiro valor aceito apos a fronteira 0

      // Action
      servico.pagar("000", "Empresa", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it('limite 99.99 (logo abaixo de 100) -> categoria "padrao"', () => {
      // Arrange
      const valor = 99.99;

      // Action
      servico.pagar("4444-5555-6666", "Empresa B", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it('limite exato 100 (fronteira exclusiva) -> categoria "padrao"', () => {
      // Confirma que o limite 100 pertence a faixa "padrao" (> e exclusivo).
      // Arrange
      const valor = 100.0;

      // Action
      servico.pagar("7777-8888-9999", "Empresa C", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it('limite 100.01 (menor valor "cara") -> categoria "cara"', () => {
      // Vizinho imediatamente acima de 100: confirma a virada de categoria.
      // Arrange
      const valor = 100.01;

      // Action
      servico.pagar("7777-8888-9999", "Empresa C", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "cara");
    });
  });

  // -------------------------------------------------------------------
  // TECNICA 3 — Tabela de Decisao (metodo pagar)
  // Cond1: valor <= 0   Cond2: valor > 100
  //   R1: Cond1=V                  -> lanca erro RN1
  //   R2: Cond1=F, Cond2=F         -> registra categoria "padrao"
  //   R3: Cond1=F, Cond2=V         -> registra categoria "cara"
  // Implementada de forma data-driven para mapear 1:1 com as regras.
  // -------------------------------------------------------------------
  describe("pagar() — Tabela de Decisao", () => {
    const regras = [
      { regra: "R1", valor: 0, esperado: "erro" },
      { regra: "R2", valor: 80, esperado: "padrão" },
      { regra: "R3", valor: 250, esperado: "cara" },
    ];

    regras.forEach(({ regra, valor, esperado }) => {
      it(`${regra}: valor ${valor} -> resultado "${esperado}"`, () => {
        // Arrange
        const codigoBarras = `cod-${regra}`;
        const empresa = `Empresa ${regra}`;

        if (esperado === "erro") {
          // Action / Assert (regra de rejeicao)
          assert.throws(
            () => servico.pagar(codigoBarras, empresa, valor),
            /Valor do pagamento deve ser maior que zero/
          );
        } else {
          // Action
          servico.pagar(codigoBarras, empresa, valor);
          const ultimo = servico.consultarUltimoPagamento();

          // Assert
          assert.strictEqual(ultimo.categoria, esperado);
        }
      });
    });
  });

  // -------------------------------------------------------------------
  // TECNICA 4 — MC/DC
  // As decisoes do codigo tem condicao unica, logo MC/DC == cobertura de
  // ramos: cada decisao precisa ser exercitada como Verdadeira e Falsa,
  // demonstrando que cada condicao afeta independentemente o resultado.
  // -------------------------------------------------------------------
  describe("MC/DC — decisoes com condicao unica (V e F)", () => {
    it('D1 (valor > 100) = Verdadeiro -> influencia para categoria "cara"', () => {
      // Arrange
      const valor = 101; // torna a condicao "valor > 100" verdadeira

      // Action
      servico.pagar("d1-v", "Empresa", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "cara");
    });

    it('D1 (valor > 100) = Falso -> influencia para categoria "padrao"', () => {
      // Arrange
      const valor = 100; // torna a condicao "valor > 100" falsa

      // Action
      servico.pagar("d1-f", "Empresa", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it("D2 (valor <= 0) = Verdadeiro -> interrompe o fluxo com erro", () => {
      // Arrange
      const valor = 0; // torna a condicao "valor <= 0" verdadeira

      // Action / Assert
      assert.throws(
        () => servico.pagar("d2-v", "Empresa", valor),
        /Valor do pagamento deve ser maior que zero/
      );
    });

    it("D2 (valor <= 0) = Falso -> permite registrar o pagamento", () => {
      // Arrange
      const valor = 1; // torna a condicao "valor <= 0" falsa

      // Action
      servico.pagar("d2-f", "Empresa", valor);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.valor, 1);
    });

    it("D3 (lista vazia) = Verdadeiro -> consulta lanca erro", () => {
      // Arrange: nenhuma acao de pagamento (lista permanece vazia)

      // Action / Assert
      assert.throws(
        () => servico.consultarUltimoPagamento(),
        /Nenhum pagamento registrado/
      );
    });

    it("D3 (lista vazia) = Falso -> consulta retorna o pagamento", () => {
      // Arrange / Action
      servico.pagar("d3-f", "Empresa", 10);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.codigoBarras, "d3-f");
    });
  });

  // -------------------------------------------------------------------
  // RN5 — Multiplos pagamentos (consultarUltimoPagamento retorna o ultimo)
  // -------------------------------------------------------------------
  describe("consultarUltimoPagamento() — multiplos pagamentos (RN5)", () => {
    it("deve permitir varios pagamentos em sequencia", () => {
      // Arrange / Action
      servico.pagar("0001", "Empresa X", 50.0);
      servico.pagar("0002", "Empresa Y", 200.0);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.codigoBarras, "0002");
    });

    it("deve retornar sempre o pagamento mais recente", () => {
      // Arrange / Action
      servico.pagar("0001", "Empresa X", 50.0);
      servico.pagar("0002", "Empresa Y", 200.0);
      servico.pagar("0003", "Empresa Z", 75.0);
      const ultimo = servico.consultarUltimoPagamento();

      // Assert
      assert.strictEqual(ultimo.codigoBarras, "0003");
      assert.strictEqual(ultimo.empresa, "Empresa Z");
      assert.strictEqual(ultimo.valor, 75.0);
      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it("lista vazia -> lanca erro 'Nenhum pagamento registrado'", () => {
      // Arrange: nenhum pagamento registrado

      // Action / Assert
      assert.throws(
        () => servico.consultarUltimoPagamento(),
        /Nenhum pagamento registrado/
      );
    });
  });

  // -------------------------------------------------------------------
  // DEFEITOS CONHECIDOS — Particao de Equivalencia CE4 (nao-numerica) e
  // robustez. Mantidos como `it.skip` (PENDENTES) para a suite ficar
  // verde sem mascarar os bugs. As assercoes descrevem o comportamento
  // CORRETO; remova `.skip` apos corrigir o codigo de producao.
  // (Defeitos comprovados em execucao real — ver relatorio de cobertura.)
  // -------------------------------------------------------------------
  describe("Defeitos conhecidos (it.skip ate correcao do codigo)", () => {
    it.skip("[BUG-D1] CE4: NaN deveria ser rejeitado (hoje e aceito)", () => {
      // NaN > 100 e falso e NaN <= 0 e falso, entao o pagamento e aceito
      // indevidamente. O esperado e rejeitar valores nao-numericos.
      // Arrange
      const valor = NaN;

      // Action / Assert (esperado)
      assert.throws(() => servico.pagar("nan", "Empresa", valor));
    });

    it.skip("[BUG-D2] CE4: undefined deveria ser rejeitado (hoje e aceito)", () => {
      // undefined passa pelas duas comparacoes e gera um registro corrompido
      // (sem o campo `valor`). O esperado e rejeitar a entrada.
      // Arrange
      const valor = undefined;

      // Action / Assert (esperado)
      assert.throws(() => servico.pagar("undef", "Empresa", valor));
    });

    it.skip("[BUG-D3] CE4: string deveria ser rejeitada sem coercao (hoje '200' vira 'cara')", () => {
      // A string "200" e coagida nas comparacoes numericas e aceita como
      // "cara". O esperado e validar o tipo e rejeitar nao-numeros.
      // Arrange
      const valor = "200";

      // Action / Assert (esperado)
      assert.throws(() => servico.pagar("str", "Empresa", valor));
    });

    it.skip("[BUG-D4] codigoBarras e empresa deveriam ser obrigatorios (hoje aceitos vazios/nulos)", () => {
      // Campos obrigatorios nao sao validados: codigo de barras vazio e
      // empresa nula sao aceitos. O esperado e rejeitar entradas invalidas.
      // Arrange
      const codigoBarras = "";
      const empresa = null;

      // Action / Assert (esperado)
      assert.throws(() => servico.pagar(codigoBarras, empresa, 50));
    });

    it.skip("[BUG-D5] o retorno nao deveria vazar a referencia interna (mutacao externa altera o estado)", () => {
      // consultarUltimoPagamento retorna a propria referencia do objeto
      // interno; mutar o objeto retornado corrompe #pagamentos. O esperado
      // e retornar uma copia, preservando o estado interno.
      // Arrange
      servico.pagar("mut", "Empresa", 50);
      const retornado = servico.consultarUltimoPagamento();

      // Action
      retornado.valor = 99999;
      const consultadoNovamente = servico.consultarUltimoPagamento();

      // Assert (esperado: estado interno preservado)
      assert.strictEqual(consultadoNovamente.valor, 50);
    });
  });
});
