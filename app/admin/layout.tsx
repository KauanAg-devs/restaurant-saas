import AccountMenu from "../AccountMenu";
import AdminActivationChecklist from "../AdminActivationChecklist";
import AdminOpeningHours from "../AdminOpeningHours";
import AdminPaymentMethods from "../AdminPaymentMethods";
import AdminRecoveryLink from "../AdminRecoveryLink";
import AppearancePalettes from "../AppearancePalettes";
import AppearancePatterns from "../AppearancePatterns";
import NewOrderNotifier from "../NewOrderNotifier";
import SessionGuard from "./SessionGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-route-shell">
      <SessionGuard>{children}</SessionGuard>
      <AccountMenu />
      <AdminPaymentMethods />
      <AdminOpeningHours />
      <AdminRecoveryLink />
      <AdminActivationChecklist />
      <NewOrderNotifier />
      <AppearancePalettes />
      <AppearancePatterns />
    </div>
  );
}
