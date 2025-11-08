import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterPayment from "@/pages/RegisterPayment";
import RegisterSuccess from "@/pages/RegisterSuccess";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Analytics from "@/pages/Analytics";
import Pricing from "@/pages/Pricing";
import Subscribe from "@/pages/Subscribe";
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import SocialMedia from "@/pages/SocialMedia";
import Advertisement from "@/pages/Advertisement";
import Marketplace from "@/pages/Marketplace";
import Royalties from "@/pages/Royalties";
import Studio from "@/pages/Studio";
import Distribution from "@/pages/Distribution";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/register/payment/:tier" component={RegisterPayment} />
      <Route path="/register/success" component={RegisterSuccess} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/social-media" component={SocialMedia} />
      <Route path="/advertising" component={Advertisement} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/royalties" component={Royalties} />
      <Route path="/studio" component={Studio} />
      <Route path="/distribution" component={Distribution} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/subscribe/:tier" component={Subscribe} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
