import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { data: user, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  if (isLoading) return null;

  if (user) {
    return <Redirect to="/servers" />;
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden text-foreground dark">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-border shadow-2xl relative z-10">
        <CardHeader className="space-y-4 items-center text-center pb-8 pt-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Nexus Control</CardTitle>
          <CardDescription className="text-muted-foreground text-base max-w-sm mx-auto">
            Professional moderation and community management suite.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 flex justify-center">
          <Button 
            size="lg" 
            className="w-full max-w-[280px] bg-[#5865F2] hover:bg-[#4752C4] text-white gap-2 font-medium"
            onClick={() => window.location.href = "/api/auth/discord"}
          >
            Login with Discord
          </Button>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-8 text-sm text-muted-foreground">
        Secure authentication via Discord OAuth2
      </div>
    </div>
  );
}