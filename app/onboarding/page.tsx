import { auth } from "@/auth";
import { dbQuery } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.operator_name) {
    redirect("/");
  }

  // Fetch existing operators to allow claiming
  const operatorsData = await dbQuery<{ OPERATOR_NAME: string, IS_CLAIMED: string | number }>(
    `SELECT 
        o.operator_name, 
        CASE WHEN u.email IS NOT NULL THEN 1 ELSE 0 END as IS_CLAIMED
     FROM operators o
     LEFT JOIN users u ON o.operator_name = u.operator_name`
  );

  const operators = operatorsData.map(op => ({
    name: op.OPERATOR_NAME,
    isClaimed: Boolean(Number(op.IS_CLAIMED))
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-2xl shadow-primary/20">
                <Image 
                    src="/logo.png" 
                    alt="InstaCRM Logo" 
                    fill
                    className="object-cover"
                />
            </div>
            <div className="space-y-1">
                <h1 className="text-4xl font-semibold">Establish Identity</h1>
                <p className="text-muted-foreground font-medium">Link your Google account to an outreach persona.</p>
            </div>
        </div>

        <Card className="border-primary/10 bg-card/40 backdrop-blur-xl border-2 rounded-3xl shadow-2xl shadow-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Operator Onboarding</CardTitle>
            <CardDescription>Select your team name or create a new one if you&apos;re new.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <OnboardingForm initialOperators={operators} />
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-50">
            System Identity Protocol v1.0
        </p>
      </div>
    </div>
  );
}