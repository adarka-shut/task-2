import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { isLoggedIn } from "@/lib/placeholder-data";
import { CalendarDays } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span>EventPass</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/explore" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
            Explore
          </Link>
          <Link to="/my-events" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
            My Events
          </Link>
          <Link to="/tickets" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
            My Tickets
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/tickets">My Tickets</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/my-events">My Events</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© 2025 EventPass</p>
        <div className="flex gap-6">
          <Link to="/explore" className="hover:text-foreground">Explore</Link>
          <a href="#" className="hover:text-foreground">About</a>
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
