import { getSession } from "../../lib/auth";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const userId = session.user.id;
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [allTotals, monthlyTotals, recentTransactions] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const totalIncome = allTotals.find((t) => t.type === "income")?._sum?.amount || 0;
  const totalExpenses = allTotals.find((t) => t.type === "expense")?._sum?.amount || 0;
  const monthlyIncome = monthlyTotals.find((t) => t.type === "income")?._sum?.amount || 0;
  const monthlyExpenses = monthlyTotals.find((t) => t.type === "expense")?._sum?.amount || 0;

  return res.json({
    balance: totalIncome - totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings: monthlyIncome - monthlyExpenses,
    recentTransactions,
  });
}
