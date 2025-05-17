import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { UpdateUserContext } from "./UpdateUser.control";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/custom/FileUpload";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { countryCodes } from "@/constants/countryCodes";

function UpdateUserComponent() {
  const {
    userSchema,
    roles,
    isLoading,
    isInitialLoading,
    fetchRoles,
    updateUserDetails,
    updateUserAvatar,
    userData,
    setUserData,
  } = useContext(UpdateUserContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [croppedImage, setCroppedImage] = useState(null);
  const [mobileCountryCode, setMobileCountryCode] = useState("IN_+91"); // Default country code
  const [newMobileCountryCode, setNewMobileCountryCode] = useState("IN_+91"); // Default country code for new mobile

  const extractPhoneCode = (combinedValue) => {
    return combinedValue.split("_")[1];
  };

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNo: "",
      newMobileNo: "",
      role: "",
    },
  });

  useEffect(() => {
    // Fetch roles when component mounts
    fetchRoles();
  }, [fetchRoles]);

  // Update form when userData is available
  useEffect(() => {
    if (userData) {
      // Extract country code from mobileNo if available
      if (userData.mobileNo && userData.mobileNo.includes(" ")) {
        const parts = userData.mobileNo.split(" ");
        const code = parts[0].trim();
        const number = parts[1].trim();

        // Find the country code in our list
        const foundCode = countryCodes.find((c) => c.value.endsWith(code));
        if (foundCode) {
          setMobileCountryCode(foundCode.value);
          setNewMobileCountryCode(foundCode.value); // Also set for new mobile
        }

        form.reset({
          name: userData.name,
          email: userData.email,
          mobileNo: userData.mobileNo,
          newMobileNo: number, // Just the number part without code
          role: userData.role.name,
        });
      } else {
        form.reset({
          name: userData.name,
          email: userData.email,
          mobileNo: userData.mobileNo,
          newMobileNo: userData.mobileNo,
          role: userData.role.name,
        });
      }
    }
  }, [userData, form]);

  const onSubmit = async (values) => {
    try {
      // Format the new mobile number with country code
      const formattedValues = {
        ...values,
        newMobileNo: `${extractPhoneCode(newMobileCountryCode)} ${
          values.newMobileNo
        }`,
      };

      const updatedUser = await updateUserDetails(formattedValues);
      setUserData(updatedUser);
      navigate("/users");
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!croppedImage || !userData?.mobileNo) return;

    try {
      const formData = new FormData();
      formData.append("mobileNo", userData.mobileNo);

      const imageFile = new File([croppedImage], "avatar.jpg", {
        type: "image/jpeg",
      });
      formData.append("avatar", imageFile);

      await updateUserAvatar(formData);
      navigate("/users");
    } catch (error) {
      console.error("Avatar update error:", error);
    }
  };

  // Loading skeleton
  if (isInitialLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px] mt-2" />
          </div>
        </div>
        <Separator />
        <div className="max-w-2xl">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              {/* Avatar Section Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-5 w-[120px]" />
                <div className="mt-4 flex items-center gap-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-[140px]" />
                  </div>
                </div>
              </div>
              <Separator className="my-6" />

              {/* Form Skeleton */}
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <div className="space-y-2" key={idx}>
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Skeleton className="h-10 w-[80px]" />
                  <Skeleton className="h-10 w-[120px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/users")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Update User</h2>
          <p className="text-sm text-muted-foreground">
            Update user account details
          </p>
        </div>
      </div>

      <Separator />

      {/* Form Content */}
      <div className="max-w-2xl">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            {/* Avatar Section */}
            <div className="mb-6">
              <Label className="text-base font-semibold">Profile Picture</Label>
              <div className="mt-4 flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  {croppedImage || userData?.avatar ? (
                    <AvatarImage
                      src={
                        croppedImage
                          ? URL.createObjectURL(croppedImage)
                          : userData?.avatar
                      }
                      alt="Preview"
                    />
                  ) : (
                    <AvatarFallback>
                      {userData?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col gap-4">
                  <FileUpload
                    onImageCropped={setCroppedImage}
                    aspectRatio={1}
                  />
                  {croppedImage && (
                    <Button
                      type="button"
                      onClick={handleAvatarUpdate}
                      disabled={isLoading}
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Avatar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* User Details Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Current mobile number"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newMobileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Mobile Number</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            value={newMobileCountryCode}
                            onValueChange={setNewMobileCountryCode}
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
                          <FormControl>
                            <Input
                              placeholder="Enter new mobile number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="flex-1"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role._id} value={role.name}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/users")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "min-w-[120px]",
                      isLoading && "animate-pulse"
                    )}
                  >
                    {isLoading ? "Updating..." : "Update User"}
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

export default UpdateUserComponent;
