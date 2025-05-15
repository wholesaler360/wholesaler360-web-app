import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { UpdateCustomerContext } from "./UpdateCustomer.control";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/custom/FileUpload";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/constants/countryCodes";

// State list from AddCustomer
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

function UpdateCustomerComponent() {
  const [customerData, setCustomerData] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [countryCode, setCountryCode] = useState("IN_+91");
  const [mobileWithoutCode, setMobileWithoutCode] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("IN_+91");

  const {
    customerSchema,
    isLoading,
    fetchCustomerDetails,
    updateCustomer,
    updateCustomerImage,
  } = useContext(UpdateCustomerContext);

  const navigate = useNavigate();
  const location = useLocation();
  const customerMobileNo = location.state?.mobileNo;

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: customerData,
  });

  // Extract phone code from combined country code value
  const extractPhoneCode = (combinedValue) => {
    return combinedValue.split("_")[1];
  };

  // Parse mobile number to separate country code and number
  const parseMobileNumber = (fullNumber) => {
    if (!fullNumber) return { code: "IN_+91", number: "" };

    // Try to match the country code pattern
    for (const cc of countryCodes) {
      const code = cc.value.split("_")[1];
      if (fullNumber.startsWith(code)) {
        return {
          code: cc.value,
          number: fullNumber.substring(code.length).trim(),
        };
      }
    }

    // Default if no match found
    return { code: "IN_+91", number: fullNumber };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchCustomerDetails(customerMobileNo);
        setCustomerData(response);

        // Parse the mobile number to get country code and number
        const { code, number } = parseMobileNumber(response.mobileNo);
        setCountryCode(code);
        setNewCountryCode(code);
        setMobileWithoutCode(number);

        form.reset({
          ...response,
          mobileNo: response.mobileNo,
          newMobileNo: number,
        });
      } catch (error) {
        console.error("Failed to fetch customer details", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    if (customerMobileNo) {
      fetchData();
    }
  }, [customerMobileNo, fetchCustomerDetails, form]);

  const onSubmit = async (values) => {
    try {
      // Format the new mobile number with country code
      const updatedValues = {
        ...values,
        mobileNo: values.mobileNo, // Keep original with country code
        newMobileNo: extractPhoneCode(newCountryCode) +  " " + values.newMobileNo,
      };

      await updateCustomer(updatedValues);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleImageUpdate = async () => {
    try {
      if (!croppedImage) return;

      const formData = new FormData();
      formData.append("mobileNo", customerData.mobileNo);
      const imageFile = new File([croppedImage], "avatar.jpg", {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });
      formData.append("avatar", imageFile);

      const result = await updateCustomerImage(formData);
      if (result.success) {
        setCroppedImage(null);
        const updatedCustomer = await fetchCustomerDetails(
          customerData.mobileNo
        );
        setCustomerData(updatedCustomer);
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
                <div className="grid gap-4 md:grid-cols-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Address Skeleton */}
              <section className="mb-8">
                <div className="mb-4">
                  <Skeleton className="h-6 w-[180px]" />
                  <Skeleton className="h-4 w-[280px] mt-2" />
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="border shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <Skeleton className="h-6 w-[120px]" />
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Bank Details Skeleton */}
              <section>
                <div className="mb-4">
                  <Skeleton className="h-6 w-[130px]" />
                  <Skeleton className="h-4 w-[260px] mt-2" />
                </div>
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
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/customers")}
          className="hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Update Customer</h2>
          <p className="text-sm text-muted-foreground">
            Update customer details and image
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
                {/* Basic Details Section */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Basic Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Update customer's basic information
                    </p>
                  </div>
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Name Field */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter customer name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Mobile Number Fields */}
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

                        {/* New Mobile Number with Country Code */}
                        <FormItem className="flex flex-col space-y-2.5">
                          <FormLabel>New Mobile Number</FormLabel>
                          <div className="flex gap-2">
                            <Select
                              value={newCountryCode}
                              onValueChange={setNewCountryCode}
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
                            <FormField
                              control={form.control}
                              name="newMobileNo"
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    placeholder="Enter new mobile number"
                                    className="flex-1"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value.replace(/\D/g, "")
                                      )
                                    }
                                  />
                                </FormControl>
                              )}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>

                        {/* Email Field */}
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

                        {/* GSTIN Field */}
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

                {/* Addresses Section */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Address Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Update billing and shipping addresses
                    </p>
                  </div>
                  <div className="grid gap-8 lg:grid-cols-2">
                    {/* Billing Address Card */}
                    <Card className="border shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <h4 className="font-medium">Billing Address</h4>
                        {/* Billing Address Fields */}
                        {[
                          "addressLine1",
                          "addressLine2",
                          "city",
                          "state",
                          "pincode",
                        ].map((field) => (
                          <FormField
                            key={field}
                            control={form.control}
                            name={`billingAddress.${field}`}
                            render={({ field: fieldProps }) => (
                              <FormItem>
                                <FormLabel>
                                  {field.charAt(0).toUpperCase() +
                                    field.slice(1)}
                                </FormLabel>
                                <FormControl>
                                  {field === "state" ? (
                                    <select
                                      {...fieldProps}
                                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                                    >
                                      <option value="">Select State</option>
                                      {statesList.map((state) => (
                                        <option key={state} value={state}>
                                          {state}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <Input
                                      placeholder={`Enter ${field}`}
                                      {...fieldProps}
                                    />
                                  )}
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </CardContent>
                    </Card>

                    {/* Shipping Address Card */}
                    <Card className="border shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Shipping Address</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const billingAddress =
                                form.getValues("billingAddress");
                              form.setValue("shippingAddress", billingAddress);
                            }}
                          >
                            Same as Billing
                          </Button>
                        </div>
                        {/* Shipping Address Fields */}
                        {[
                          "addressLine1",
                          "addressLine2",
                          "city",
                          "state",
                          "pincode",
                        ].map((field) => (
                          <FormField
                            key={field}
                            control={form.control}
                            name={`shippingAddress.${field}`}
                            render={({ field: fieldProps }) => (
                              <FormItem>
                                <FormLabel>
                                  {field.charAt(0).toUpperCase() +
                                    field.slice(1)}
                                </FormLabel>
                                <FormControl>
                                  {field === "state" ? (
                                    <select
                                      {...fieldProps}
                                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                                    >
                                      <option value="">Select State</option>
                                      {statesList.map((state) => (
                                        <option key={state} value={state}>
                                          {state}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <Input
                                      placeholder={`Enter ${field}`}
                                      {...fieldProps}
                                    />
                                  )}
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Bank Details Section */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Bank Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Update customer's banking information
                    </p>
                  </div>
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Bank Details Fields */}
                        {[
                          { name: "accountName", label: "Account Holder Name" },
                          { name: "bankName", label: "Bank Name" },
                          { name: "accountNo", label: "Account Number" },
                          { name: "ifscCode", label: "IFSC Code" },
                        ].map((field) => (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={`bankDetails.${field.name}`}
                            render={({ field: fieldProps }) => (
                              <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    {...fieldProps}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/customers")}
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
                    {isLoading ? "Updating..." : "Update Customer"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Image Management Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Customer Image</h3>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-4">
                      Current Image
                    </Label>
                    <div className="mt-2 aspect-square w-full max-w-md overflow-hidden rounded-lg border">
                      {customerData?.avatar ? (
                        <img
                          src={customerData.avatar}
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

            {/* Preview Card */}
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

export default UpdateCustomerComponent;
