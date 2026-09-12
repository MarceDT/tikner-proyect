import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentScore — Asistente de Selección & ATS Inteligente",
  description:
    "Evalúa candidatos, compara métricas técnicas y emite ofertas salariales con aprobación humana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var saved = localStorage.getItem("talentscore_theme");
                if (saved === "dark" || saved === "light") {
                  document.documentElement.setAttribute("data-theme", saved);
                } else {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              } catch(e) {
                document.documentElement.setAttribute("data-theme", "light");
              }
            })();`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
