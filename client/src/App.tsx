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

export const AuthContext = React.createContext<{ isAdmin: boolean }>({ isAdmin: false });

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

  const [isAdmin, setIsAdmin] = React.useState(() => {
    return sessionStorage.getItem("isAdmin") === "true";
  });

  const handleLogin = (admin: boolean) => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("isAdmin", admin ? "true" : "false");
    setIsLoggedIn(true);
    setIsAdmin(admin);
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
        <AuthContext.Provider value={{ isAdmin }}>
          <Toaster />
          <Router />
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
