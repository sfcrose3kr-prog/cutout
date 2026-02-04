import * as React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import ImportExcel from "@/pages/ImportExcel";
import Login from "@/pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/import" component={ImportExcel} />
      <Route component={NotFound} />
    </Switch>
  );
}

export const AuthContext = React.createContext<{ isAdmin: boolean; logout: () => void }>({ isAdmin: false, logout: () => {} });

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [isAdmin, setIsAdmin] = React.useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  const handleLogin = (admin: boolean) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAdmin", admin ? "true" : "false");
    setIsLoggedIn(true);
    setIsAdmin(admin);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Login onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ isAdmin, logout: handleLogout }}>
          <Toaster />
          <Router />
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
