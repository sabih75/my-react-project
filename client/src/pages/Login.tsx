import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login attempt:", { username, password });
    setLocation("/role-selection");
  };

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading">BIIT FYP Monitor</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Project Progress Tracking System
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>

            <Button
              className="w-full h-12"
              onClick={handleLogin}
              data-testid="button-login"
            >
              Sign In
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Demo mockup - All data is simulated
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
