export class ServicoDePagamento {
  #pagamentos = [];

  pagar(codigoBarras, empresa, valor) {
    const categoria = valor > 100 ? "cara" : "padrão";

    const pagamento = {
      codigoBarras,
      empresa,
      valor,
      categoria,
    };

    if (valor <= 0) {
      throw new Error("Valor do pagamento deve ser maior que zero.");
    }

    this.#pagamentos.push(pagamento);
  }

  consultarUltimoPagamento() {
    if (this.#pagamentos.length === 0) {
      throw new Error("Nenhum pagamento registrado.");
    }
    return this.#pagamentos[this.#pagamentos.length - 1];
  }
}
