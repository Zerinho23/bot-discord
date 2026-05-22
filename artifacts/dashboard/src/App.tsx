import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Login from "@/pages/index";
import Servers from "@/pages/servers/index";
import ServerOverview from "@/pages/servers/[guildId]/index";
import VerificationConfig from "@/pages/servers/[guildId]/verification";
import WelcomeConfig from "@/pages/servers/[guildId]/welcome";
import TicketConfig from "@/pages/servers/[guildId]/tickets";
import ModerationConfig from "@/pages/servers/[guildId]/moderation";
import InviteConfig from "@/pages/servers/[guildId]/invites";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/servers">
        {() => <ProtectedRoute component={Servers} />}
      </Route>
      <Route path="/servers/:guildId">
        {() => <ProtectedRoute component={ServerOverview} />}
      </Route>
      <Route path="/servers/:guildId/verification">
        {() => <ProtectedRoute component={VerificationConfig} />}
      </Route>
      <Route path="/servers/:guildId/welcome">
        {() => <ProtectedRoute component={WelcomeConfig} />}
      </Route>
      <Route path="/servers/:guildId/tickets">
        {() => <ProtectedRoute component={TicketConfig} />}
      </Route>
      <Route path="/servers/:guildId/moderation">
        {() => <ProtectedRoute component={ModerationConfig} />}
      </Route>
      <Route path="/servers/:guildId/invites">
        {() => <ProtectedRoute component={InviteConfig} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
