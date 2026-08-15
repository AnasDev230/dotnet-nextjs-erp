import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ToastContainer } from "@/components/ui/toast-container";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ms-64">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
