import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { getSession } from "../../lib/auth";

export async function getServerSideProps({ req }) {
  const session = await getSession(req);

  if (!session) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  return { props: {} };
}

export default function NewTransaction() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    description: "",
    categoryId: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    recurrenceType: "",
    installmentTotal: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const filteredCategories = categories.filter(
    (c) => c.type === "both" || c.type === form.type
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function setType(type) {
    setForm((f) => ({ ...f, type, categoryId: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/transactions");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao salvar transação");
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">Nova Transação</h2>
            <p className="page-subtitle">Registre uma receita ou despesa</p>
          </div>
        </div>

        <div className="card form-card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${
                  form.type === "expense" ? "active expense" : ""
                }`}
                onClick={() => setType("expense")}
              >
                📉 Despesa
              </button>
              <button
                type="button"
                className={`type-btn ${
                  form.type === "income" ? "active income" : ""
                }`}
                onClick={() => setType("income")}
              >
                📈 Receita
              </button>
            </div>

            <div className="recurrence-toggle">
              <button
                type="button"
                className={`recurrence-btn ${form.recurrenceType === "" ? "active" : ""}`}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    recurrenceType: "",
                    installmentTotal: "",
                  }))
                }
              >
                🔄 Variável
              </button>
              <button
                type="button"
                className={`recurrence-btn ${form.recurrenceType === "installment" ? "active" : ""}`}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    recurrenceType: "installment",
                    installmentTotal: "2",
                  }))
                }
              >
                💳 Parcelada
              </button>
              <button
                type="button"
                className={`recurrence-btn ${form.recurrenceType === "fixed" ? "active" : ""}`}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    recurrenceType: "fixed",
                    installmentTotal: "",
                  }))
                }
              >
                📌 Fixa
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  {form.recurrenceType === "installment"
                    ? "Valor total da compra (R$)"
                    : "Valor (R$)"}
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0,00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {form.recurrenceType === "installment" && (
                <div className="form-group">
                  <label>Número de parcelas</label>
                  <input
                    type="number"
                    name="installmentTotal"
                    value={form.installmentTotal}
                    onChange={handleChange}
                    min="2"
                    max="48"
                    required
                  />
                </div>
              )}
            </div>

            {form.recurrenceType === "installment" &&
              form.amount &&
              parseInt(form.installmentTotal) >= 2 && (
                <div className="installment-preview">
                  {form.installmentTotal}x de{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(
                    parseFloat(form.amount) / parseInt(form.installmentTotal)
                  )}
                </div>
              )}

            <div className="form-group">
              <label>Descrição</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Ex: Aluguel, Supermercado, Salário..."
                required
              />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
              >
                <option value="">Sem categoria</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Observações (opcional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Alguma anotação adicional..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Transação"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
