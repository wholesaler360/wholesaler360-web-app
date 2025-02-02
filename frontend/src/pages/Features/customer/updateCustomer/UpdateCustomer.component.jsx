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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchCustomerDetails(customerMobileNo);
        setCustomerData(response);
        console.log(response);
        form.reset({
          ...response,
          newMobileNo: response.mobileNo, // Set newMobileNo same as mobileNo initially
        });
      } catch (error) {
        console.error("Failed to fetch customer details", error);
      }
    };
    if (customerMobileNo) {
      fetchData();
    }
  }, [customerMobileNo]);

  const onSubmit = async (values) => {
    try {
      await updateCustomer(values);
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
                        {["name", "address", "city", "state", "pincode"].map(
                          (field) => (
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
                          )
                        )}
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
                        {["name", "address", "city", "state", "pincode"].map(
                          (field) => (
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
                          )
                        )}
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
                      <img
                        src={customerData?.avatar}
                        alt="Current avatar"
                        className="h-full w-full object-cover"
                      />
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
