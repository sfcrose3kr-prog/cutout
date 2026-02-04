import * as React from "react";
import { useLocation } from "wouter";
import { Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const VALID_USERNAME = "ADMIN";
const VALID_PASSWORD = "8469";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

  const [isAdmin, setIsAdmin] = React.useState(() => {
    return sessionStorage.getItem("isAdmin") === "true";
  });

  const login = (asAdmin: boolean = false) => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("isAdmin", asAdmin ? "true" : "false");
    setIsLoggedIn(true);
    setIsAdmin(asAdmin);
  };

  const logout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("isAdmin");
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  return { isLoggedIn, isAdmin, login, logout };
}

export default function Login({ onLogin }: { onLogin: (isAdmin: boolean) => void }) {
  const { toast } = useToast();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      onLogin(true);
    } else {
      toast({
        title: "로그인 실패",
        description: "아이디 또는 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">재단1호기 재단현황</h1>
          <p className="text-muted-foreground">로그인이 필요합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="아이디 입력"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                data-testid="input-username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                data-testid="input-password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" data-testid="button-login">
            로그인
          </Button>
        </form>
      </Card>
    </div>
  );
}
