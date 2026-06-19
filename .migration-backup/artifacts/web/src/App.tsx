import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import RegisterIndex from "@/pages/register";
import RegisterPartner from "@/pages/register/partner";
import RegisterInfluencer from "@/pages/register/influencer";

import AdminDashboard from "@/pages/admin/dashboard";
import PartnerDashboard from "@/pages/partner/dashboard";
import InfluencerDashboard from "@/pages/influencer/dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/register" component={RegisterIndex} />
      <Route path="/register/partner" component={RegisterPartner} />
      <Route path="/register/influencer" component={RegisterInfluencer} />
      
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      <Route path="/partner">
        <ProtectedRoute component={PartnerDashboard} allowedRoles={["partner"]} />
      </Route>
      <Route path="/influencer">
        <ProtectedRoute component={InfluencerDashboard} allowedRoles={["influencer"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
