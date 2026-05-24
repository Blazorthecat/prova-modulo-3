# 💳 Prova — Módulo 3: Sistema de Pagamento com Testes

Prova avaliativa do **Módulo 3** do curso PGATS.

---

## 📋 Sobre a Prova

O objetivo foi construir uma classe de serviço de pagamento em JavaScript que registra pagamentos e consulta o último realizado, cobrindo os seguintes cenários:

| Cenário                             | Comportamento esperado                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| Pagamento com dados válidos         | Registra e retorna o pagamento com todas as propriedades    |
| Valor zero ou negativo              | Lança erro: `"Valor do pagamento deve ser maior que zero."` |
| Valor acima de R$ 100,00            | Define a categoria do pagamento como `"cara"`               |
| Valor igual ou abaixo de R$ 100,00  | Define a categoria do pagamento como `"padrão"`             |
| Consulta sem pagamentos registrados | Lança erro: `"Nenhum pagamento registrado."`                |
| Múltiplos pagamentos                | Retorna sempre o último pagamento inserido                  |

---

## 🧠 Pensamento Computacional

O pensamento computacional aplicado nesta atividade pode ser dividido em quatro pilares:

### 1. Decomposição

O problema de "realizar e consultar pagamentos" foi quebrado em partes menores e independentes:

- Validar se o **valor é maior que zero** antes de registrar
- Determinar a **categoria** do pagamento com base no valor
- **Armazenar** o pagamento em uma lista interna privada
- **Consultar** o último elemento da lista, tratando o caso de lista vazia

### 2. Reconhecimento de Padrões

Percebeu-se que tanto o método `pagar` quanto o `consultarUltimoPagamento` seguem o mesmo padrão de defesa: verificam uma condição de falha e **interrompem o fluxo** com `throw new Error(...)` antes de executar a lógica principal. Isso garantiu uniformidade no tratamento de erros em toda a classe.

### 3. Abstração

Os pagamentos foram encapsulados em uma lista privada (`#pagamentos`) dentro da classe `ServicoDePagamento`, simulando um repositório em memória. Toda a complexidade de validação, categorização e armazenamento fica oculta de quem consome a classe, que interage apenas com dois métodos públicos.

### 4. Algoritmos

O fluxo de cada método segue uma sequência lógica e ordenada:

**`pagar(codigoBarras, empresa, valor)`:**

1. Calcular a categoria com base no valor (`> 100` → `"cara"`, caso contrário `"padrão"`)
2. Montar o objeto de pagamento
3. Se o valor for `<= 0` → lançar erro
4. Adicionar o pagamento à lista interna

**`consultarUltimoPagamento()`:**

1. Verificar se a lista está vazia → lançar erro
2. Retornar o último elemento da lista

---

## 📁 Estrutura do Projeto

```
prova-modulo-3/
├── src/
│   └── ServicoDePagamento.js   # Classe com a lógica de pagamento
├── test/
│   └── ServicoDePagamento.test.js  # 9 testes com Mocha e Node:assert
├── package.json
└── package-lock.json
```

---

## 🚀 Como Executar

**Pré-requisitos:** Node.js instalado.

```bash
# Instalar dependências
npm install

# Rodar os testes
npx mocha

# Rodar os testes com relatótrio HTML (Mochawesome)
npx mocha --reporter mochawesome
```

---

## 🧪 Testes

Foram escritos **9 testes** utilizando [Mocha](https://mochajs.org/) e o módulo nativo `node:assert`, organizados em dois grupos:

**Testes da função `pagar`:**

1. ✅ **Dados corretos** — registra pagamento com código de barras, empresa e valor válidos
2. ❌ **Valor inválido** — lança erro ao tentar pagar com valor zero ou negativo
3. 💰 **Categoria "cara"** — classifica corretamente pagamentos acima de R$ 100,00
4. 🏷️ **Categoria "padrão"** — classifica corretamente pagamentos abaixo de R$ 100,00
5. 🎯 **Valor exato de R$ 100,00** — confirma que o limite é exclusivo (categoria `"padrão"`)
6. 🔁 **Múltiplos pagamentos** — aceita vários pagamentos em sequência

**Testes da função `consultarUltimoPagamento`:**

7. ⚠️ **Lista vazia** — lança erro quando nenhum pagamento foi registrado
8. 🔍 **Último pagamento** — retorna corretamente o pagamento mais recente
9. 📦 **Estrutura do objeto** — valida que o retorno possui todas as propriedades esperadas (`codigoBarras`, `empresa`, `valor`, `categoria`)

---

## 🛠️ Tecnologias Utilizadas

- **JavaScript (ES Modules)**
- **Node.js**
- **Mocha** — framework de testes
- **Mochawesome** — gerador de relatórios de testes

---

## 👨‍💻 Autor

**Gabriel Guimarães Nunes**
---
Desenvolvido como parte da prova avaliativa do curso **PGATS — Módulo 3**.
