import type { Metadata } from 'next';
import './globals.css';
import './polish.css';
import './admin-shortcut.css';
import './admin-premium.css';

export const metadata: Metadata = {
  title: 'MesaFlow',
  description: 'Plataforma white-label de pedidos para restaurantes',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
