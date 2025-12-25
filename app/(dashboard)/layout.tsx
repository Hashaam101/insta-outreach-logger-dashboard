import { Sidebar } from "@/components/sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // 2. Gatekeeper Check (Operator Name)
  if (!session.user.operator_name) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/30">
      <div className="fixed inset-y-0 hidden lg:block w-64">
        <Sidebar />
      </div>
      <div className="flex flex-col w-full lg:pl-64">
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" expand={false} richColors />
    </div>
  );
}
