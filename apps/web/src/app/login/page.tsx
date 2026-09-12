import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — TalentScore",
  description: "Accedé al panel de selección y recruiting inteligente.",
};

export default function LoginPage() {
  return <LoginForm />;
}
