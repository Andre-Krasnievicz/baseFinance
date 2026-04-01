import { getSession } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const { id } = req.query;
  const userId = session.user.id;

  const category = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!category) {
    return res.status(404).json({ error: "Categoria não encontrada" });
  }

  if (req.method === "PUT") {
    const { name, color, icon, type } = req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(type !== undefined && { type }),
      },
    });

    return res.json(updated);
  }

  if (req.method === "DELETE") {
    const count = await prisma.transaction.count({
      where: { categoryId: id, userId },
    });

    if (count > 0) {
      return res.status(400).json({
        error: `Não é possível excluir: categoria possui ${count} transação(ões)`,
      });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Método não permitido" });
}
