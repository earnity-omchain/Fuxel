import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import NotFound from "@/pages/not-found";

// FUXEL Club (fuxel.club game) — ONLY imports
import ClubLanding from "@/pages/fuxel-club/landing";
import ClubHome from "@/pages/fuxel-club/home";
import ClubLeaderboard from "@/pages/fuxel-club/leaderboard";
import ShowHands from "@/pages/fuxel-club/show-hands";
import HowTo from "@/pages/fuxel-club/how-to";
import Deck from "@/pages/fuxel-club/deck";

function Router() {
  return (
    <Switch>
      {/* FUXEL Club */}
      <Route path="/club" component={ClubLanding} />
      <Route path="/club/home" component={ClubHome} />
      <Route path="/club/board" component={ClubLeaderboard} />
      <Route path="/club/hands" component={ShowHands} />
      <Route path="/club/how" component={HowTo} />
      <Route path="/club/deck" component={Deck} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WalletProvider>
      <TooltipProvider>
        <WouterRouter base="">
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </WalletProvider>
  );
}

export default App;
