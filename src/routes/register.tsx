import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader><CardTitle>Create your account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="mb-1.5 block">Name</Label><Input /></div>
            <div><Label className="mb-1.5 block">Email</Label><Input type="email" /></div>
            <div><Label className="mb-1.5 block">Password</Label><Input type="password" /></div>
            <Button className="w-full">Sign up</Button>
            <p className="text-sm text-center text-muted-foreground">
              Want to host events? <a href="#" className="text-primary hover:underline">Register as Host</a>
            </p>
            <p className="text-sm text-center text-muted-foreground">
              Already a member? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
