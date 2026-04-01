import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { getSession } from "../lib/auth";

export async function getServerSideProps({ req }) {
  const session = await getSession(req);

  if (!session) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  return {
    props: {
      user: JSON.parse(JSON.stringify(session.user)),
    },
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="page">
        <h2 className="page-title">Olá, {user.name}! 👋</h2>
        <p className="page-subtitle">
          Aqui está o resumo das suas finanças —{" "}
          {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        {loading ? (
          <div className="loading">Carregando dados...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <span className="stat-label">Saldo Total</span>
                  <span
                    className={`stat-value ${
                      (data?.balance ?? 0) >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {formatCurrency(data?.balance)}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <span className="stat-label">Receita do Mês</span>
                  <span className="stat-value positive">
                    {formatCurrency(data?.monthlyIncome)}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📉</div>
                <div className="stat-info">
                  <span className="stat-label">Gastos do Mês</span>
                  <span className="stat-value negative">
                    {formatCurrency(data?.monthlyExpenses)}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏦</div>
                <div className="stat-info">
                  <span className="stat-label">Economia do Mês</span>
                  <span
                    className={`stat-value ${
                      (data?.monthlySavings ?? 0) >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {formatCurrency(data?.monthlySavings)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Transações Recentes</h3>
                <Link href="/transactions" className="btn btn-sm btn-outline">
                  Ver todas
                </Link>
              </div>

              {data?.recentTransactions?.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma transação ainda.</p>
                  <Link href="/transactions/new" className="btn btn-primary">
                    + Adicionar primeira transação
                  </Link>
                </div>
              ) : (
                <div className="transaction-list">
                  {data?.recentTransactions?.map((t) => (
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
                        </span>
                      </div>
                      <span
                        className={`transaction-amount ${
                          t.type === "income" ? "positive" : "negative"
                        }`}
                      >
                        {t.type === "income" ? "+" : "−"}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
