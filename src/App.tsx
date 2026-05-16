import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import NotFound from "@/pages/not-found";

// FUXEL Club only
import ClubLanding from "@/pages/fuxel-club/landing";
import ClubHome from "@/pages/fuxel-club/home";
import ClubLeaderboard from "@/pages/fuxel-club/leaderboard";
import ShowHands from "@/pages/fuxel-club/show-hands";
import HowTo from "@/pages/fuxel-club/how-to";
import Deck from "@/pages/fuxel-club/deck";

function Redirect({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => navigate(to, { replace: true }), [navigate, to]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Root → club landing */}
      <Route path="/" component={() => <Redirect to="/club" />} />

      {/* FUXEL Club */}
      <Route path="/club" component={ClubLanding} />
      <Route path="/club/home" component={ClubHome} />
      <Route path="/club/board" component={ClubLeaderboard} />
      <Route path="/club/hands" component={ShowHands} />
      <Route path="/club/how" component={HowTo} />
      <Route path="/club/deck" component={Deck} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WalletProvider>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </WalletProvider>
  );
}

export default App;
