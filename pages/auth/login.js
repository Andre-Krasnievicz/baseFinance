import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signIn } from "../../lib/auth-client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await signIn.email({ email, password });

    if (authError) {
      setError(authError.message || "Email ou senha inválidos");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>BaseFinance</h1>
          <p>Controle suas finanças pessoais</p>
        </div>

        <h2>Entrar na conta</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-link">
          Não tem conta?{" "}
          <Link href="/auth/register">Cadastre-se gratuitamente</Link>
        </p>
      </div>
    </div>
  );
}
