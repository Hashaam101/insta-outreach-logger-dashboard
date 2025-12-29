import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-context";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Route Guard: Ensure authenticated and onboarding complete
  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.operator_name) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 border-r">
          <Sidebar session={session} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="lg:hidden flex h-16 items-center justify-between px-4 border-b bg-card/50 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-primary/20 shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="InstaCRM Logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold tracking-tight">InstaCRM</span>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-card/95 backdrop-blur-2xl border-r border-primary/10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Access the dashboard navigation links.
                </SheetDescription>
                <Sidebar session={session} />
              </SheetContent>
            </Sheet>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
