import AccountMenu from '../AccountMenu';
import SessionGuard from './SessionGuard';

export default function AdminLayout({children}:{children:React.ReactNode}){
  return <div className="admin-route-shell"><SessionGuard>{children}</SessionGuard><AccountMenu/></div>;
}
