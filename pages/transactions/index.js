import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { getSession } from "../../lib/auth";

export async function getServerSideProps({ req }) {
  const session = await getSession(req);

  if (!session) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  return { props: {} };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState({ type: "", categoryId: "" });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.type) params.set("type", filter.type);
    if (filter.categoryId) params.set("categoryId", filter.categoryId);

    setLoading(true);
    fetch(`/api/transactions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setTransactions(d.transactions || []);
        setTotal(d.total || 0);
        setLoading(false);
      });
  }, [filter]);

  async function handleDelete(id) {
    if (!confirm("Deseja excluir esta transação?")) return;

    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => prev - 1);
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">Transações</h2>
            <p className="page-subtitle">{total} registro(s) encontrado(s)</p>
          </div>
          <Link href="/transactions/new" className="btn btn-primary">
            + Nova Transação
          </Link>
        </div>

        <div className="filters">
          <select
            value={filter.type}
            onChange={(e) =>
              setFilter((f) => ({ ...f, type: e.target.value }))
            }
            className="filter-select"
          >
            <option value="">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <select
            value={filter.categoryId}
            onChange={(e) =>
              setFilter((f) => ({ ...f, categoryId: e.target.value }))
            }
            className="filter-select"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma transação encontrada.</p>
              <Link href="/transactions/new" className="btn btn-primary">
                + Adicionar transação
              </Link>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((t) => (
                <div key={t.id} className="transaction-item">
                  <div
                    className="transaction-icon"
                    style={{
                      background: t.category?.color
                        ? t.category.color + "20"
                        : "#f1f5f9",
                      color: t.category?.color || "#64748b",
                    }}
                  >
                    {t.category?.icon || (t.type === "income" ? "📈" : "📉")}
                  </div>

                  <div className="transaction-info">
                    <span className="transaction-desc">{t.description}</span>
                    <span className="transaction-meta">
                      {t.category?.name || "Sem categoria"} •{" "}
                      {formatDate(t.date)}
                      {t.notes && ` • ${t.notes}`}
                    </span>
                  </div>

                  <div className="transaction-right">
                    <span
                      className={`transaction-amount ${
                        t.type === "income" ? "positive" : "negative"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {formatCurrency(t.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="btn-icon btn-danger"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
