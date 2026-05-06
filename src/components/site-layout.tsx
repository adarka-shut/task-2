import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useRoles } from "@/lib/use-roles";
import { CalendarDays, Menu, Plus } from "lucide-react";

const navLinks = [{ to: "/explore", label: "Explore" }] as const;
const authedLinks = [
  { to: "/my-events", label: "My Events" },
  { to: "/tickets", label: "My Tickets" },
] as const;

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isHost, isCheckerOnly } = useRoles();
  const navigate = useNavigate();
  const isLoggedIn = !!user;
  const initial = (user?.user_metadata?.name || user?.email || "U").charAt(0).toUpperCase();
  const dashboardLabel = isCheckerOnly ? "Check-in" : "Dashboard";

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-secondary/40 bg-secondary text-secondary-foreground">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-secondary-foreground">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span>EventPass</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} activeProps={{ className: "text-primary font-semibold" }} className="text-secondary-foreground/80 hover:text-primary">
              {l.label}
            </Link>
          ))}
          {isLoggedIn && (
            <>
              {authedLinks.map((l) => (
                <Link key={l.to} to={l.to} activeProps={{ className: "text-primary font-semibold" }} className="text-secondary-foreground/80 hover:text-primary">
                  {l.label}
                </Link>
              ))}
              <Link to="/dashboard" activeProps={{ className: "text-primary font-semibold" }} className="text-secondary-foreground/80 hover:text-primary">
                {dashboardLabel}
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/events/new">
                <Plus className="h-4 w-4 mr-1" /> Create Event
              </Link>
            </Button>
          )}
          {!isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex text-secondary-foreground hover:bg-secondary/70 hover:text-primary">
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="hidden md:inline-flex">
                <Link to="/register">Register</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-secondary-foreground hover:bg-secondary/70">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{initial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/dashboard">{dashboardLabel}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/tickets">My Tickets</Link></DropdownMenuItem>
                {isHost && <DropdownMenuItem asChild><Link to="/my-events">My Events</Link></DropdownMenuItem>}
                {isHost && <DropdownMenuItem asChild><Link to="/host-settings">Host Settings</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-secondary-foreground hover:bg-secondary/70" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
              <nav className="flex flex-col gap-1 mt-6 px-4">
                <Link to="/explore" onClick={() => setOpen(false)} className="py-2 text-sm hover:text-primary">Explore</Link>
                {isLoggedIn ? (
                  <>
                    {isHost && <Link to="/my-events" onClick={() => setOpen(false)} className="py-2 text-sm hover:text-primary">My Events</Link>}
                    <Link to="/tickets" onClick={() => setOpen(false)} className="py-2 text-sm hover:text-primary">My Tickets</Link>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2 text-sm hover:text-primary">{dashboardLabel}</Link>
                    <Link to="/events/new" onClick={() => setOpen(false)} className="py-2 text-sm hover:text-primary">Create Event</Link>
                    <button onClick={() => { setOpen(false); handleLogout(); }} className="py-2 text-sm text-left hover:text-primary">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="py-2 text-sm hover:text-primary">Login</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="py-2 text-sm hover:text-primary">Register</Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-secondary/40 mt-16 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p>© 2025 EventPass</p>
        <div className="flex gap-6">
          <Link to="/explore" className="hover:text-primary">Explore</Link>
          <Link to="/about" className="hover:text-primary">About</Link>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
