import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountSettingsContext } from "./AccountSettings.control";
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
import { FileUpload } from "@/components/custom/FileUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function AccountSettingsComponent() {
  const {
    profileSchema,
    passwordSchema,
    isLoading,
    fetchProfile,
    updateProfile,
    updateAvatar,
    updatePassword,
  } = useContext(AccountSettingsContext);

  const [profileData, setProfileData] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profileData,
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfileData(data);
        profileForm.reset(data);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  const handleProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
      const updatedProfile = await fetchProfile();
      setProfileData(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePasswordSubmit = async (data) => {
    try {
      await updatePassword(data);
      passwordForm.reset();
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleImageUpdate = async () => {
    try {
      if (!croppedImage) return;

      const formData = new FormData();
      formData.append("avatar", croppedImage);

      await updateAvatar(formData);
      const updatedProfile = await fetchProfile();
      setProfileData(updatedProfile);
      setCroppedImage(null);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences here.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* Profile Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="mobileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Security and Image Section - Side by side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Image Section */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg border">
                    {profileData?.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        No image set
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Update Image
                  </Label>
                  <FileUpload
                    onImageCropped={(croppedImg) => setCroppedImage(croppedImg)}
                    aspectRatio={1}
                  />
                </div>

                {croppedImage && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleImageUpdate}
                      disabled={isLoading}
                      className={cn(
                        "min-w-[120px]",
                        isLoading && "animate-pulse"
                      )}
                    >
                      {isLoading ? "Updating..." : "Update Image"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password Section */}
          <div className="lg:self-start">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-base mb-1">
                      Change Password
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Make sure your password is strong and unique
                    </p>
                  </div>

                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter current password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter new password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirm new password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={cn("w-full", isLoading && "animate-pulse")}
                      >
                        {isLoading ? "Updating..." : "Change Password"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettingsComponent;
