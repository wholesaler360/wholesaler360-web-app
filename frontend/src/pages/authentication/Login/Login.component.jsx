import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useContext, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginContext } from "./Login.control";
import { COMPANY_DATA_KEY } from "@/constants/globalConstants";
import { Separator } from "@/components/ui/separator";

function LoginComponent({ className, ...props }) {
  const { submitLoginForm } = useContext(LoginContext);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    // Try to get company data from localStorage
    const storedCompanyData = localStorage.getItem(COMPANY_DATA_KEY);
    if (storedCompanyData) {
      try {
        setCompanyData(JSON.parse(storedCompanyData));
      } catch (e) {
        console.error("Failed to parse company data", e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setError(null);

    try {
      await submitLoginForm({
        mobile: mobile,
        password: password,
      });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          {/* Company Branding */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {companyData?.logoUrl && (
              <div className="h-16 w-auto mb-2 overflow-hidden">
                <img
                  src={companyData.logoUrl}
                  alt={companyData.name || "Company Logo"}
                  className="h-full w-auto object-contain"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-center">
              {companyData?.name || "Wholesaler 360"}
            </h1>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter your mobile number"
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-offset-0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-offset-0"
                    />
                  </div>
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Please wait..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Login with Fingerprint
              </Button>
            </CardFooter>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            {companyData?.name || "Wholesaler 360"}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
