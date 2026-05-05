import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader><CardTitle>Welcome back</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="mb-1.5 block">Email</Label><Input type="email" /></div>
            <div><Label className="mb-1.5 block">Password</Label><Input type="password" /></div>
            <Button className="w-full">Sign in</Button>
            <p className="text-sm text-center text-muted-foreground">
              No account? <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
