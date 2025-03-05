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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function UpdateUserComponent() {
  const {
    userSchema,
    roles,
    isLoading,
    fetchRoles,
    updateUserDetails,
    updateUserAvatar,
    userData,
    setUserData,
  } = useContext(UpdateUserContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [croppedImage, setCroppedImage] = useState(null);

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

    // Set form values when userData is available
    if (userData) {
      form.reset({
        name: userData.name,
        email: userData.email,
        mobileNo: userData.mobileNo,
        newMobileNo: userData.mobileNo, // Initialize with current mobile
        role: userData.role, // Role name is now directly available
      });
    }
  }, [fetchRoles, userData, form]);

  const onSubmit = async (values) => {
    try {
      const updatedUser = await updateUserDetails(values);
      setUserData(updatedUser);
      navigate("/users");
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!croppedImage || !userData?.mobileNo) return;

    try {
      const imageFile = new File([croppedImage], "avatar.jpg", {
        type: "image/jpeg",
      });
      await updateUserAvatar(userData.mobileNo, imageFile);
      navigate("/users");
    } catch (error) {
      console.error("Avatar update error:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/users")}
          className="hover:bg-gray-100"
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
                  {(croppedImage || userData?.avatar) ? (
                    <AvatarImage
                      src={croppedImage ? URL.createObjectURL(croppedImage) : userData?.avatar}
                      alt="Preview"
                    />
                  ) : (
                    <AvatarFallback>{userData?.name?.[0]?.toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col gap-4">
                  <FileUpload
                    onImageCropped={setCroppedImage}
                    cropAspectRatio={1}
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <FormControl>
                          <Input 
                            placeholder="Enter new mobile number" 
                            {...field}
                          />
                        </FormControl>
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
