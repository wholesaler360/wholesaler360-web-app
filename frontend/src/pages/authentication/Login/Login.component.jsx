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
import { useContext, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginContext } from "./Login.control";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/constants/countryCodes"; 

function LoginComponent({ className, ...props }) {
  const { submitLoginForm } = useContext(LoginContext);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("IN_+91"); // Default country code
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);

  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState("phone"); // "phone" or "otp"
  const [forgotPasswordMobile, setForgotPasswordMobile] = useState("");
  const [forgotPasswordCountryCode, setForgotPasswordCountryCode] =
    useState("IN_+91"); // Default for forgot password
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState(null);

  const extractPhoneCode = (combinedValue) => {
    return combinedValue.split("_")[1];
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setError(null);

    try {
      await submitLoginForm({
        mobile: extractPhoneCode(countryCode) + " " + mobile, // Extract and prepend country code
        password: password,
      });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending OTP for forgot password
  const handleSendOTP = () => {
    if (!forgotPasswordMobile) {
      setForgotPasswordError("Please enter your mobile number");
      return;
    }
    // Potentially validate forgotPasswordMobile as a number without country code here

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    // Simulating API call with country code
    console.log(
      "Sending OTP to:",
      extractPhoneCode(forgotPasswordCountryCode) + forgotPasswordMobile
    );
    setTimeout(() => {
      setForgotPasswordStep("otp");
      setForgotPasswordLoading(false);
    }, 1500);
  };

  // Handle verifying OTP
  const handleVerifyOTP = () => {
    // Check if any OTP digit is empty
    if (otpDigits.some((digit) => digit === "")) {
      setForgotPasswordError("Please enter the complete OTP");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    // Simulating API call
    setTimeout(() => {
      // Close the dialog and reset states
      setForgotPasswordOpen(false);
      setForgotPasswordStep("phone");
      setForgotPasswordMobile("");
      setForgotPasswordCountryCode("IN_+91"); // Reset country code
      setOtpDigits(["", "", "", "", "", ""]);
      setForgotPasswordLoading(false);

      // Show success message
      alert("Password reset link has been sent to your mobile number");
    }, 1500);
  };

  // Handle dialog close - reset states
  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordStep("phone");
    setForgotPasswordMobile("");
    setForgotPasswordCountryCode("IN_+91"); // Reset country code with combined format
    setOtpDigits(["", "", "", "", "", ""]);
    setForgotPasswordError(null);
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d*$/.test(value)) return;

    // Update the OTP digits array
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value.slice(0, 1); // Take only the first character
    setOtpDigits(newOtpDigits);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // Handle key down for backspace
  const handleKeyDown = (index, e) => {
    // If backspace is pressed and current input is empty, focus previous input
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  // Handle paste for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Only process if the pasted content seems like an OTP
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 6).split("");
      const newOtpDigits = [...otpDigits];

      // Fill in the OTP digits array
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtpDigits[index] = digit;
        }
      });

      setOtpDigits(newOtpDigits);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtpDigits.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        otpInputRefs.current[nextEmptyIndex].focus();
      } else {
        otpInputRefs.current[5].focus();
      }
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <div className="flex flex-col items-center justify-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-center">
              {"Wholesaler 360"}
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
                    <div className="flex gap-2">
                      <Select
                        value={countryCode}
                        onValueChange={setCountryCode}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="CC" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((c) => (
                            <SelectItem key={c.key} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="mobile"
                        type="text"
                        value={mobile}
                        onChange={(e) =>
                          setMobile(e.target.value.replace(/\D/g, ""))
                        } // Allow only digits
                        placeholder="Enter mobile number"
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-offset-0 flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setForgotPasswordOpen(true);
                        }}
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
            &copy; {new Date().getFullYear()} {"Wholesaler 360"}. All rights
            reserved.
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onOpenChange={handleForgotPasswordClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {forgotPasswordStep === "phone" ? "Forgot Password" : "Enter OTP"}
            </DialogTitle>
            <DialogDescription>
              {forgotPasswordStep === "phone"
                ? "Enter your registered mobile number to receive a verification code"
                : `Enter the 6-digit OTP sent to ${extractPhoneCode(
                    forgotPasswordCountryCode
                  )}${forgotPasswordMobile}`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {forgotPasswordStep === "phone" ? (
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="forgotPasswordMobile">Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="forgotPasswordMobile"
                      type="text"
                      value={forgotPasswordMobile}
                      onChange={(e) =>
                        setForgotPasswordMobile(
                          e.target.value.replace(/\D/g, "")
                        )
                      } // Allow only digits
                      placeholder="Enter mobile number"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Label htmlFor="otp">OTP</Label>
                <div
                  className="flex justify-between gap-2"
                  onPaste={handlePaste}
                >
                  {otpDigits.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      className="h-12 w-12 text-center text-lg font-semibold"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>
            )}

            {forgotPasswordError && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md mt-4">
                {forgotPasswordError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              onClick={
                forgotPasswordStep === "phone" ? handleSendOTP : handleVerifyOTP
              }
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading
                ? "Please wait..."
                : forgotPasswordStep === "phone"
                ? "Send OTP"
                : "Verify OTP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginComponent;
