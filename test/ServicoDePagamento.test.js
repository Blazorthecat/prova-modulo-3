import assert from "node:assert";
import { ServicoDePagamento } from "../src/ServicoDePagamento.js";

describe("ServicoDePagamento", () => {
  let servicoDePagamento;

  beforeEach(() => {
    servicoDePagamento = new ServicoDePagamento();
  });

  describe("Testes da função de pagar", () => {
    it("deve registrar um pagamento com os dados corretos", () => {
      servicoDePagamento.pagar("0987-7656-3475", "Samar", 156.87);
      const ultimo = servicoDePagamento.consultarUltimoPagamento();

      assert.strictEqual(ultimo.codigoBarras, "0987-7656-3475");
      assert.strictEqual(ultimo.empresa, "Samar");
      assert.strictEqual(ultimo.valor, 156.87);
    });

    it("deve lançar um erro quando o valor for zero ou negativo", () => {
      assert.throws(() => {
        servicoDePagamento.pagar("1234-5678-9012", "Empresa D", 0);
      }, /Valor do pagamento deve ser maior que zero/);
    });

    it('deve definir categoria como "cara" quando valor for maior que 100', () => {
      servicoDePagamento.pagar("1111-2222-3333", "Empresa A", 150.0);
      const ultimo = servicoDePagamento.consultarUltimoPagamento();

      assert.strictEqual(ultimo.categoria, "cara");
    });

    it('deve definir categoria como "padrão" quando valor for menor que 100', () => {
      servicoDePagamento.pagar("4444-5555-6666", "Empresa B", 99.99);
      const ultimo = servicoDePagamento.consultarUltimoPagamento();

      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it('deve definir categoria como "padrão" quando valor for exatamente 100', () => {
      servicoDePagamento.pagar("7777-8888-9999", "Empresa C", 100.0);
      const ultimo = servicoDePagamento.consultarUltimoPagamento();

      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it("deve permitir múltiplos pagamentos", () => {
      servicoDePagamento.pagar("0001", "Empresa X", 50.0);
      servicoDePagamento.pagar("0002", "Empresa Y", 200.0);
      const ultimo = servicoDePagamento.consultarUltimoPagamento();

      assert.strictEqual(ultimo.codigoBarras, "0002");
    });
  });

  describe("testes da função de consultarUltimoPagamento", () => {
    it("deve lançar um erro quando não houver pagamentos", () => {
      assert.throws(() => {
        servicoDePagamento.consultarUltimoPagamento();
      }, /Nenhum pagamento registrado/);
    });

    it("deve retornar o último pagamento realizado", () => {
      servicoDePagamento.pagar("0001", "Empresa X", 50.0);
      servicoDePagamento.pagar("0002", "Empresa Y", 200.0);
      servicoDePagamento.pagar("0003", "Empresa Z", 75.0);

      const ultimo = servicoDePagamento.consultarUltimoPagamento();

      assert.strictEqual(ultimo.codigoBarras, "0003");
      assert.strictEqual(ultimo.empresa, "Empresa Z");
      assert.strictEqual(ultimo.valor, 75.0);
      assert.strictEqual(ultimo.categoria, "padrão");
    });

    it("deve retornar um objeto com todas as propriedades esperadas", () => {
      servicoDePagamento.pagar("0987-7656-3475", "Samar", 156.87);
      const ultimo = servicoDePagamento.consultarUltimoPagamento();

      assert.ok(Object.hasOwn(ultimo, "codigoBarras"));
      assert.ok(Object.hasOwn(ultimo, "empresa"));
      assert.ok(Object.hasOwn(ultimo, "valor"));
      assert.ok(Object.hasOwn(ultimo, "categoria"));
    });
  });
});
