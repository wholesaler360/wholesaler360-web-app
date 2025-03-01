import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateVendorContext } from "./UpdateVendor.control";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/custom/FileUpload";
import { Skeleton } from "@/components/ui/skeleton";

const statesList = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function UpdateVendorComponent() {
  const [vendorData, setVendorData] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    vendorSchema,
    isLoading,
    fetchVendorDetails,
    updateVendor,
    updateVendorAvatar,
  } = useContext(UpdateVendorContext);

  const navigate = useNavigate();
  const location = useLocation();
  const vendorMobileNo = location.state?.mobileNo;

  const form = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendorData,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchVendorDetails(vendorMobileNo);
        setVendorData(response);
        form.reset({
          ...response,
          newMobileNo: response.mobileNo,
        });
      } catch (error) {
        console.error("Failed to fetch vendor details", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    if (vendorMobileNo) {
      fetchData();
    }
  }, [vendorMobileNo, fetchVendorDetails, form]);

  const onSubmit = async (values) => {
    try {
      await updateVendor(values);
      if (croppedImage) {
        const formData = new FormData();
        formData.append("mobileNo", values.mobileNo);
        formData.append("avatar", croppedImage);
        await updateVendorAvatar(formData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleImageUpdate = async () => {
    try {
      if (!croppedImage) return;
      const formData = new FormData();
      formData.append("mobileNo", vendorData.mobileNo);
      formData.append("avatar", croppedImage);
      const result = await updateVendorAvatar(formData);
      if (result.success) {
        setCroppedImage(null);
        const updatedVendor = await fetchVendorDetails(vendorData.mobileNo);
        setVendorData(updatedVendor);
      }
    } catch (error) {
      console.error("Image update error:", error);
    }
  };

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

        <div className="container mx-auto max-w-[1200px]">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              {/* Basic Details Skeleton */}
              <section className="mb-8">
                <div className="mb-4">
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-4 w-[250px] mt-2" />
                </div>
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Address Skeleton */}
              <section>
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Bank Details Skeleton */}
              <section className="mt-8">
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
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
              </section>

              {/* Form Actions Skeleton */}
              <div className="flex justify-end gap-4 mt-8">
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[150px]" />
              </div>
            </CardContent>
          </Card>

          {/* Image Management Skeleton */}
          <div className="mt-8">
            <Skeleton className="h-6 w-[150px] mb-4" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Skeleton className="h-6 w-[120px] mb-4" />
                      <Skeleton className="aspect-square w-full max-w-md" />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-[120px]" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/vendors")}
          className="hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Update Vendor</h2>
          <p className="text-sm text-muted-foreground">
            Update vendor details and avatar
          </p>
        </div>
      </div>

      <Separator />

      <div className="container mx-auto max-w-[1200px]">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Basic Details */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Vendor Details</h3>
                  </div>
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter vendor name"
                                  {...field}
                                />
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
                                  placeholder="Enter mobile number"
                                  disabled
                                  {...field}
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
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter email address"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gstin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GSTIN (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter GSTIN" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Address Details */}
                <section>
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="address.addressLine1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter address line 1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address.addressLine2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2 (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter address line 2"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                                >
                                  <option value="">Select State</option>
                                  {statesList.map((state) => (
                                    <option key={state} value={state}>
                                      {state}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address.pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter pincode" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address.country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Bank Details */}
                <section>
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="bankDetails.accountHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Holder Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter account holder name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bankDetails.bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter bank name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bankDetails.accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter account number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bankDetails.ifsc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IFSC Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter IFSC code"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/vendors")}
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
                    {isLoading ? "Updating..." : "Update Vendor"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Image Management Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Vendor Image</h3>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-4">
                      Current Image
                    </Label>
                    <div className="mt-2 aspect-square w-full max-w-md overflow-hidden rounded-lg border">
                      {vendorData?.imageUrl ? (
                        <img
                          src={vendorData.imageUrl}
                          alt="Customer"
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
                      onImageCropped={(croppedImg) => {
                        setCroppedImage(croppedImg);
                      }}
                      aspectRatio={1}
                    />
                  </div>

                  {/* Image Update Button */}
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

            {/* Preview Card - Only shows when there's a new image */}
            {croppedImage && (
              <div className="lg:sticky lg:top-6">
                <Card className="border-none shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-lg font-semibold">
                      New Image Preview
                    </h3>
                    <div className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
                      <div className="aspect-square">
                        <img
                          src={URL.createObjectURL(croppedImage)}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateVendorComponent;
