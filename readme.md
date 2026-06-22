# 💳 Prova — Módulo 3: Sistema de Pagamento com Testes e Pipeline CI

Prova avaliativa do **Módulo 3** do curso PGATS, com a entrega final do módulo:
uma **pipeline de Integração Contínua (CI)** no **GitHub Actions** para um projeto
com testes automatizados.

---

## 📋 Sobre o Projeto

O projeto implementa a classe `ServicoDePagamento`, que registra pagamentos e consulta
o último realizado, cobrindo os seguintes cenários:

| Cenário                             | Comportamento esperado                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| Pagamento com dados válidos         | Registra e retorna o pagamento com todas as propriedades    |
| Valor zero ou negativo              | Lança erro: `"Valor do pagamento deve ser maior que zero."` |
| Valor acima de R$ 100,00            | Define a categoria do pagamento como `"cara"`               |
| Valor igual ou abaixo de R$ 100,00  | Define a categoria do pagamento como `"padrão"`             |
| Consulta sem pagamentos registrados | Lança erro: `"Nenhum pagamento registrado."`                |
| Múltiplos pagamentos                | Retorna sempre o último pagamento inserido                  |

---

## 📁 Estrutura do Projeto

```
prova-modulo-3/
├── .github/
│   └── workflows/
│       └── ci.yml                      # Pipeline de CI (GitHub Actions)
├── src/
│   └── ServicoDePagamento.js           # Classe com a lógica de pagamento
├── test/
│   └── ServicoDePagamento.test.js      # 28 testes (Mocha + node:assert)
├── package.json
├── package-lock.json
└── readme.md
```

---

## 🚀 Como Executar Localmente

**Pré-requisitos:** Node.js 18+ instalado.

```bash
# Instalar dependências
npm install

# Rodar os testes
npm test

# Rodar os testes gerando relatório HTML (Mochawesome)
npm run test:report

# Rodar os testes com relatório de cobertura (c8)
npm run coverage
```

---

## 🧪 Testes Automatizados

A suíte possui **28 testes** (23 ativos + 5 pendentes), todos no padrão **AAA**
(*Arrange, Action, Assert*) e comentados, organizados por **técnica de teste**:

- **Partição de Equivalência** — classes válidas (`"padrão"`/`"cara"`) e inválidas (zero e negativo).
- **Análise de Valor-Limite** — fronteiras `0` e `100` e seus vizinhos (`-0.01`, `0.01`, `99.99`, `100`, `100.01`).
- **Tabela de Decisão** — regras `R1` (erro), `R2` (padrão) e `R3` (cara), implementadas de forma *data-driven*.
- **MC/DC** — cada decisão (`valor > 100`, `valor <= 0`, lista vazia) exercitada como Verdadeira e Falsa.

Os **5 testes pendentes** (`it.skip`, prefixo `[BUG-Dx]`) documentam defeitos reais de
robustez do código (aceitação de `NaN`, `undefined` e strings; campos obrigatórios não
validados; vazamento da referência interna). Ficam *pending* (suíte verde) com a asserção
do comportamento **correto**, prontos como testes de regressão — basta remover o `.skip`
quando o código de produção for corrigido.

> **Cobertura de código:** 100% de statements, branches, functions e lines (medido com c8/Istanbul).

---

## ⚙️ Pipeline de Integração Contínua (GitHub Actions)

O arquivo [`.github/workflows/ci.yml`](.github/workflows/ci.yml) define a pipeline.
Ela contempla **todos os gatilhos exigidos**:

| Gatilho            | Configuração            | Quando dispara                                   |
| ------------------ | ----------------------- | ------------------------------------------------ |
| **Push**           | `on: push`              | A cada push em qualquer branch                   |
| **Pull Request**   | `on: pull_request`      | Em PRs direcionados à `main`                     |
| **Manual**         | `on: workflow_dispatch` | Botão *Run workflow* na aba **Actions**          |
| **Agendado**       | `on: schedule` (cron)   | Toda segunda-feira às `12:00 UTC` (`0 12 * * 1`) |

### Etapas (steps) da pipeline

1. **Checkout** do código (`actions/checkout@v4`).
2. **Setup do Node.js 20** com cache de dependências npm (`actions/setup-node@v4`).
3. **Instalação reprodutível** das dependências com `npm ci` (usa o `package-lock.json`).
4. **Execução dos testes** (`npm test`) — se algum teste falhar, a pipeline falha.
5. **Geração do relatório de testes** com Mochawesome (`npm run test:report`).
6. **Geração do relatório de cobertura** com c8 (`npm run coverage`).
7. **Publicação dos relatórios** como *artifact* (`actions/upload-artifact@v4`).

As etapas 5–7 usam `if: always()` para que os relatórios sejam gerados e publicados
**mesmo que algum teste falhe** — preservando a evidência de execução.

### 📦 Onde encontrar o relatório

Após cada execução, acesse **Actions → (execução) → Artifacts → `relatorios-de-testes`**.
O artifact contém:

- `mochawesome-report/` — relatório de testes em HTML (`mochawesome.html`) e JSON.
- `coverage/` — relatório de cobertura em HTML (`index.html`) e `lcov.info`.

---

## 🧠 Conceitos Aplicados

- **Integração Contínua (CI):** automatizar build, testes e relatórios a cada mudança,
  detectando regressões cedo. Aqui, todo push aciona a verificação automática.
- **Gatilhos de workflow:** `push`, `pull_request`, `workflow_dispatch` (manual) e
  `schedule` (cron) — cobrindo execução reativa, sob demanda e periódica.
- **Build reprodutível:** `npm ci` instala exatamente as versões travadas no
  `package-lock.json`, garantindo que CI e máquina local rodem o mesmo ambiente.
- **Cache de dependências:** acelera execuções reaproveitando o `~/.npm` entre runs.
- **Artifacts:** mecanismo do GitHub Actions para armazenar e disponibilizar arquivos
  gerados (os relatórios) ao final da execução.
- **`if: always()`:** garante a coleta de evidências mesmo em caso de falha de testes.
- **Princípio do menor privilégio:** `permissions: contents: read` limita o token do workflow.
- **Técnicas de teste:** partição de equivalência, valor-limite, tabela de decisão e MC/DC,
  estruturadas no padrão AAA.

---

## 🛠️ Tecnologias Utilizadas

- **JavaScript (ES Modules)** + **Node.js**
- **Mocha** — framework de testes
- **Mochawesome** — relatório de testes em HTML/JSON
- **c8** — relatório de cobertura de código
- **GitHub Actions** — pipeline de Integração Contínua

---

## 👨‍💻 Autor

**Gabriel Guimarães Nunes**
Desenvolvido como parte da prova avaliativa do curso **PGATS — Módulo 3**.
