import { getSession } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    const {
      type,
      categoryId,
      from,
      to,
      limit = 50,
      skip = 0,
      recurrenceType,
    } = req.query;

    const where = { userId };
    if (type) {
      where.type = type;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (recurrenceType) {
      if (recurrenceType === "variable") {
        where.recurrenceType = null;
      } else {
        where.recurrenceType = recurrenceType;
      }
    }
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
    const {
      amount,
      description,
      type,
      categoryId,
      date,
      notes,
      recurrenceType,
      installmentTotal,
    } = req.body;

    if (!amount || !description || !type) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: valor, descrição e tipo" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Tipo inválido. Use 'income' ou 'expense'" });
    }

    const numInstallments = parseInt(installmentTotal) || 0;

    if (recurrenceType === "installment") {
      if (numInstallments < 2 || numInstallments > 48) {
        return res.status(400).json({
          error: "Número de parcelas deve ser entre 2 e 48.",
        });
      }
    }

    if (recurrenceType !== "installment") {
      const transaction = await prisma.transaction.create({
        data: {
          amount: parseFloat(amount),
          description,
          type,
          categoryId: categoryId || null,
          date: date ? new Date(date) : new Date(),
          notes: notes || null,
          recurrenceType: recurrenceType || null,
          userId,
        },
        include: { category: true },
      });

      return res.status(201).json(transaction);
    }

    const totalAmount = parseFloat(amount);
    const installmentAmount =
      Math.round((totalAmount / numInstallments) * 100) / 100;
    const lastInstallmentAmount =
      totalAmount - installmentAmount * (numInstallments - 1);
    const baseDate = date ? new Date(date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const parent = await tx.transaction.create({
        data: {
          amount: installmentAmount,
          description: `${description} (1/${numInstallments})`,
          type,
          categoryId: categoryId || null,
          date: baseDate,
          notes: notes || null,
          recurrenceType: "installment",
          installmentTotal: numInstallments,
          installmentNumber: 1,
          parentId: null,
          userId,
        },
      });

      const installments = [];
      for (let i = 2; i <= numInstallments; i++) {
        const installmentDate = new Date(baseDate);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

        const isLast = i === numInstallments;
        installments.push({
          amount: isLast ? lastInstallmentAmount : installmentAmount,
          description: `${description} (${i}/${numInstallments})`,
          type,
          categoryId: categoryId || null,
          date: installmentDate,
          notes: notes || null,
          recurrenceType: "installment",
          installmentTotal: numInstallments,
          installmentNumber: i,
          parentId: parent.id,
          userId,
        });
      }

      await tx.transaction.createMany({ data: installments });

      return parent;
    });

    const parentWithCategory = await prisma.transaction.findUnique({
      where: { id: result.id },
      include: { category: true },
    });

    return res.status(201).json({
      ...parentWithCategory,
      _installmentsCreated: numInstallments,
    });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
