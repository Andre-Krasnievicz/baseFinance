import { getSession } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const { id } = req.query;
  const userId = session.user.id;

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) {
    return res.status(404).json({ error: "Transação não encontrada" });
  }

  if (req.method === "GET") {
    return res.json(transaction);
  }

  if (req.method === "PUT") {
    const { amount, description, type, categoryId, date, notes } = req.body;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: { category: true },
    });

    return res.json(updated);
  }

  if (req.method === "DELETE") {
    const { deleteScope = "single" } = req.query;

    if (
      deleteScope === "remaining" &&
      transaction.recurrenceType === "installment"
    ) {
      const groupParentId = transaction.parentId || transaction.id;

      await prisma.transaction.deleteMany({
        where: {
          userId,
          OR: [
            {
              id: groupParentId,
              installmentNumber: { gte: transaction.installmentNumber },
            },
            {
              parentId: groupParentId,
              installmentNumber: { gte: transaction.installmentNumber },
            },
          ],
        },
      });
    } else {
      await prisma.transaction.delete({ where: { id } });
    }
    return res.status(204).end();
  }

  return res.status(405).json({
    error: "Método não autorizado!",
  });
}
