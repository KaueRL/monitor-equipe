import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monitor de Equipe & Alertas WhatsApp',
  description: 'Sistema automatizado de monitoramento e alertas de rotinas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
