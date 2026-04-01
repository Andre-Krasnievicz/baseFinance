import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { getSession } from "../../lib/auth";

export async function getServerSideProps({ req }) {
  const session = await getSession(req);

  if (!session) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  return { props: {} };
}

const COLORS = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#06b6d4", "#22c55e",
  "#f97316", "#94a3b8",
];

const ICONS = [
  "📁", "🏠", "🍕", "🚗", "💊", "📚", "🎮", "👕",
  "💼", "💻", "📈", "💰", "🛒", "✈️", "🎬", "🏋️",
  "🐕", "💇", "⚡", "📱", "🎵", "🏖️",
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    icon: "📁",
    color: "#6366f1",
    type: "both",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", icon: "📁", color: "#6366f1", type: "both" });
      setShowForm(false);
      loadCategories();
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao salvar");
    }

    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Deseja excluir esta categoria?")) return;

    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao excluir");
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">Categorias</h2>
            <p className="page-subtitle">Organize suas transações por categoria</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancelar" : "+ Nova Categoria"}
          </button>
        </div>

        {showForm && (
          <div className="card form-card">
            <h3>Nova Categoria</h3>
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ex: Alimentação, Salário..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  <option value="both">Receita e Despesa</option>
                  <option value="income">Somente Receita</option>
                  <option value="expense">Somente Despesa</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ícone</label>
                <div className="icon-picker">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-btn ${form.icon === icon ? "selected" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Cor</label>
                <div className="color-picker">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-btn ${form.color === color ? "selected" : ""}`}
                      style={{ background: color }}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma categoria ainda. Crie a primeira!</p>
            </div>
          ) : (
            <div className="category-grid">
              {categories.map((cat) => (
                <div key={cat.id} className="category-card">
                  <div
                    className="category-icon"
                    style={{
                      background: cat.color + "20",
                      color: cat.color,
                    }}
                  >
                    {cat.icon}
                  </div>

                  <div className="category-info">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-meta">
                      {cat._count?.transactions || 0} transação(ões) •{" "}
                      {cat.type === "income"
                        ? "Receita"
                        : cat.type === "expense"
                        ? "Despesa"
                        : "Ambos"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="btn-icon btn-danger"
                    title={
                      cat._count?.transactions > 0
                        ? "Categoria com transações não pode ser excluída"
                        : "Excluir"
                    }
                    disabled={cat._count?.transactions > 0}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
