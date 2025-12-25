import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getExistingOperators } from "./actions";
import { OnboardingForm } from "./onboarding-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

import Image from "next/image";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // @ts-ignore
  if (session.user.operator_name) {
    redirect("/");
  }

  const operators = await getExistingOperators();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[450px] space-y-8 relative z-10">
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-2xl shadow-primary/20">
                <Image 
                  src="/logo.png" 
                  alt="InstaCRM Logo" 
                  fill
                  className="object-cover"
                />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Identity Setup</h1>
                <p className="text-muted-foreground mt-2">Establish your operator profile to continue</p>
            </div>
        </div>

        <Card className="border-primary/10 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle>Welcome, {session.user.name?.split(' ')[0] || 'Operator'}</CardTitle>
            <CardDescription>
              Select your name from the directory or create a new one if you are a new team member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm initialOperators={operators} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
            Identity claims are logged and monitored for security.
        </p>
      </div>
    </div>
  );
}
