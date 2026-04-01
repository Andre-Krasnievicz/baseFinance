import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "../lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [session, isPending, router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        color: "white",
        fontSize: "18px",
      }}
    >
      💰 Carregando...
    </div>
  );
}
