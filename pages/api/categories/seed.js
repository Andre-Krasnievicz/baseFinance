import { getSession } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Moradia", icon: "🏠", color: "#6366f1", type: "expense" },
  { name: "Alimentação", icon: "🍕", color: "#f59e0b", type: "expense" },
  { name: "Transporte", icon: "🚗", color: "#3b82f6", type: "expense" },
  { name: "Saúde", icon: "💊", color: "#ef4444", type: "expense" },
  { name: "Educação", icon: "📚", color: "#8b5cf6", type: "expense" },
  { name: "Lazer", icon: "🎮", color: "#ec4899", type: "expense" },
  { name: "Roupas", icon: "👕", color: "#14b8a6", type: "expense" },
  { name: "Salário", icon: "💼", color: "#10b981", type: "income" },
  { name: "Freelance", icon: "💻", color: "#06b6d4", type: "income" },
  { name: "Investimentos", icon: "📈", color: "#22c55e", type: "income" },
  { name: "Outros", icon: "📁", color: "#94a3b8", type: "both" },
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const userId = session.user.id;

  const count = await prisma.category.count({ where: { userId } });
  if (count > 0) {
    return res.json({ message: "Categorias já existem" });
  }

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId })),
  });

  return res.status(201).json({ message: "Categorias padrão criadas" });
}
