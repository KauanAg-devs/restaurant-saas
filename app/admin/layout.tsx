import AccountMenu from '../AccountMenu';

export default function AdminLayout({children}:{children:React.ReactNode}){
  return <div className="admin-route-shell">{children}<AccountMenu/></div>;
}
