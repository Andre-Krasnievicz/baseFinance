import handler from "../../pages/api/categories";
import prisma from "../../lib/prisma";
import { getSession } from "../../lib/auth";

jest.mock("../../lib/prisma", () => ({
  __esModule: true,
  default: { category: { findMany: jest.fn() } },
}));
jest.mock("../../lib/auth", () => ({
  __esModule: true,
  getSession: jest.fn(),
}));

describe("GET /api/categories", () => {
  it("retorna 401 sem sessão", async () => {
    getSession.mockResolvedValue(null);
    const req = { method: "GET", headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("retorna categorias do usuário", async () => {
    getSession.mockResolvedValue({ user: { id: "1" } });
    const mockCategories = [{ id: "1", name: "Salário", type: "income" }];
    prisma.category.findMany.mockResolvedValue(mockCategories);

    const req = { method: "GET", headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await handler(req, res);
    expect(res.json).toHaveBeenCalledWith(mockCategories);
  });
});
