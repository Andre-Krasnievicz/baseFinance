import { render, screen } from "@testing-library/react";
import Layout from "../../components/Layout";

// Mock do useSession do better-auth
jest.mock("../../lib/auth-client", () => ({
  useSession: () => ({
    data: { user: { name: "André", email: "andre@test.com" } },
    isPending: false,
  }),
  signOut: jest.fn(),
}));

// Mock do next/router
jest.mock("next/router", () => ({
  useRouter: () => ({ pathname: "/dashboard", push: jest.fn() }),
}));

describe("Layout", () => {
  it("renderiza o nome do app na sidebar", () => {
    render(
      <Layout>
        <div>conteúdo</div>
      </Layout>,
    );
    expect(screen.getByText("BaseFinance")).toBeInTheDocument();
  });

  it("renderiza links de navegação", () => {
    render(
      <Layout>
        <div>conteúdo</div>
      </Layout>,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Transações")).toBeInTheDocument();
    expect(screen.getByText("Categorias")).toBeInTheDocument();
  });

  it("exibe o nome do usuário", () => {
    render(
      <Layout>
        <div>conteúdo</div>
      </Layout>,
    );
    expect(screen.getByText("André")).toBeInTheDocument();
  });
});
