import { getSession } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    const { type, categoryId, from, to, limit = 50, skip = 0 } = req.query;

    const where = { userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        take: parseInt(limit),
        skip: parseInt(skip),
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({ transactions, total });
  }

  if (req.method === "POST") {
    const { amount, description, type, categoryId, date, notes } = req.body;

    if (!amount || !description || !type) {
      return res.status(400).json({ error: "Campos obrigatórios: valor, descrição e tipo" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ error: "Tipo inválido. Use 'income' ou 'expense'" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        categoryId: categoryId || null,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
        userId,
      },
      include: { category: true },
    });

    return res.status(201).json(transaction);
  }

  return res.status(405).json({ error: "Método não permitido" });
}
