import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppSettingsContext } from "./AppSettings.control";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function AppSettingsComponent() {
  const {
    emailSettingsSchema,
    isLoading,
    fetchEmailSettings,
    updateEmailSettings,
  } = useContext(AppSettingsContext);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const emailForm = useForm({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      email: "",
      credential: "",
      smtpHost: "",
      smtpPort: 0,
    },
  });

  const refreshData = async () => {
    try {
      const data = await fetchEmailSettings();
      if (data) {
        // Reset form with fresh data
        emailForm.reset({
          email: data.email || "",
          credential: data.credential || "",
          smtpHost: data.smtpHost || "",
          smtpPort: data.smtpPort || 0,
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleEmailSettingsSubmit = async (data) => {
    try {
      await updateEmailSettings(data);
      await refreshData(); // Refresh after update
    } catch (error) {
      console.error("Error updating email settings:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[400px] mt-2" />
        </div>

        <Separator />

        <div className="grid gap-6">
          {/* Email Settings Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">App Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your application email settings and configurations.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* Email Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(handleEmailSettingsSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="credential"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Credential</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter email credential"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SMTP host" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter SMTP port"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Email Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AppSettingsComponent;
