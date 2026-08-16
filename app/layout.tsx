import type { Metadata } from 'next';
import AdminPaymentMethods from './AdminPaymentMethods';
import './globals.css';
import './polish.css';
import './admin-shortcut.css';
import './admin-premium.css';
import './menu-editor.css';
import './product-images.css';
import './settings-admin.css';
import './payment-methods.css';
import './onboarding.css';
import './store-loading.css';
import './account.css';
import './account-mobile.css';

export const metadata: Metadata = {
  title: 'MesaFlow',
  description: 'Plataforma white-label de pedidos para restaurantes',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}<AdminPaymentMethods/></body></html>;
}
