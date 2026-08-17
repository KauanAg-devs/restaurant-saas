import type { Metadata } from 'next';
import AdminPaymentMethods from './AdminPaymentMethods';
import AdminOpeningHours from './AdminOpeningHours';
import AdminRecoveryLink from './AdminRecoveryLink';
import AdminActivationChecklist from './AdminActivationChecklist';
import NewOrderNotifier from './NewOrderNotifier';
import AppearancePatterns from './AppearancePatterns';
import AppearancePalettes from './AppearancePalettes';
import StorePatternApplier from './StorePatternApplier';
import StoreOpenState from './StoreOpenState';
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
import './activation-mobile-fix.css';
import './patterns.css';
import './palettes.css';
import './order-actions.css';
import './order-flow-cleanup.css';
import './production-readiness.css';
import './first-customer.css';
import './whatsapp-order.css';

export const metadata: Metadata = {
  title: 'MesaFlow',
  description: 'Plataforma white-label de pedidos para restaurantes',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}<AdminPaymentMethods/><AdminOpeningHours/><AdminRecoveryLink/><AdminActivationChecklist/><NewOrderNotifier/><AppearancePalettes/><AppearancePatterns/><StorePatternApplier/><StoreOpenState/></body></html>;
}
