import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cazador de Ofertas",
  description: "Las mejores ofertas de tecnología en Perú",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
