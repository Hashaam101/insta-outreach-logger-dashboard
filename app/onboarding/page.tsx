import { auth } from "@/auth";
import { dbQuerySingle, dbQuery } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // 1. Check if I already exist
  const myOperator = await dbQuerySingle<{ OPR_NAME: string, OPR_EMAIL: string }>(
    `SELECT OPR_NAME, OPR_EMAIL FROM OPERATORS WHERE OPR_EMAIL = :email`,
    { email: session.user.email }
  );

  // If signup is already done, skip onboarding
  if (myOperator) {
      redirect("/");
  }

  // 2. Fetch all names taken by OTHER emails to prevent collision
  // We don't need full operator objects, just the list of forbidden names
  const takenNamesData = await dbQuery<{ OPR_NAME: string }>(
    `SELECT OPR_NAME FROM OPERATORS WHERE OPR_EMAIL != :email`,
    { email: session.user.email }
  );

  const unavailableNames = takenNamesData.map(op => op.OPR_NAME);

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
                <p className="text-muted-foreground font-medium">
                    Link your Google account to an outreach persona.
                </p>
            </div>
        </div>

        <Card className="border-primary/10 bg-card/40 backdrop-blur-xl border-2 rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden">
          <CardHeader className="pb-4 border-b border-primary/5 bg-primary/5">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {session.user.name?.[0] || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <CardTitle className="text-xl">Operator Onboarding</CardTitle>
                    <CardDescription className="text-xs leading-none">
                        Confirm your identity to access the dashboard.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <OnboardingForm 
                unavailableNames={unavailableNames}
                googleName={session.user.name || ""} 
                googleEmail={session.user.email}
            />
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-50">
            System Identity Protocol v1.0
        </p>
      </div>
    </div>
  );
}