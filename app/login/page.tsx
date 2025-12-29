import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[380px] border-primary/10 bg-card/40 backdrop-blur-xl border-2 rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-primary/20 shadow-2xl shadow-primary/20">
              <Image 
                src="/logo.png" 
                alt="InstaCRM Logo" 
                fill
                className="object-cover"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            Sign in to access the outreach command center
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/" })
            }}
          >
            <Button type="submit" className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/10">
              Sign in with Google
            </Button>
          </form>

          {isDev && (
            <div className="space-y-6 pt-2">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">Dev Protocol</span>
                    </div>
                </div>

                <form
                    className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4"
                    action={async (formData: FormData) => {
                        "use server"
                        const email = formData.get("email") as string;
                        if (email) {
                            await signIn("dev-login", { email, redirectTo: "/" });
                        }
                    }}
                >
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <ShieldAlert className="h-3 w-3" />
                            Identity Spoofing
                        </label>
                        <Input 
                            name="email"
                            type="email"
                            required
                            placeholder="dev@example.com"
                            className="h-10 text-xs bg-background/50 border-amber-500/10 text-amber-500 placeholder:text-amber-500/30 font-mono rounded-xl"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        variant="outline" 
                        className="w-full h-9 border-amber-500/20 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 font-bold text-xs rounded-xl"
                    >
                        Bypass & Sign In
                    </Button>
                </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
