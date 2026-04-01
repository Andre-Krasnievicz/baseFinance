import { getSession } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: { name: "asc" },
    });

    return res.json(categories);
  }

  if (req.method === "POST") {
    const { name, color, icon, type } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || "#6366f1",
        icon: icon || "📁",
        type: type || "both",
        userId,
      },
    });

    return res.status(201).json(category);
  }

  return res.status(405).json({ error: "Método não permitido" });
}
