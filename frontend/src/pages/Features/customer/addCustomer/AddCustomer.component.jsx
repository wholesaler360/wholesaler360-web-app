import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ImagePlus } from "lucide-react";
import { AddCustomerContext } from "./AddCustomer.control";
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
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/custom/FileUpload";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/constants/countryCodes";


function AddCustomerComponent() {
  const { customerSchema, isLoading, createCustomer } =
    useContext(AddCustomerContext);
  const navigate = useNavigate();
  const [croppedImage, setCroppedImage] = useState(null);
  const [countryCode, setCountryCode] = useState("IN_+91");

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      mobileNo: "",
      email: "",
      gstin: "",
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      },
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      },
      bankDetails: {
        accountName: "",
        ifscCode: "",
        accountNo: "",
        bankName: "",
      },
      avatar: null,
    },
  });

  const extractPhoneCode = (combinedValue) => {
    return combinedValue.split("_")[1];
  };

  const onSubmit = async (data) => {
    try {
      console.log("Starting form submission...");
      if (!data) {
        console.error("Form data is empty");
        return;
      }

      const formattedData = {
        ...data,
        mobileNo: extractPhoneCode(countryCode) + " " + data.mobileNo,
      };

      console.log("Form data:", formattedData);

      if (!createCustomer) {
        console.error("createCustomer function is not defined");
        return;
      }

      const result = await createCustomer(formattedData);
      console.log("Submission result:", result);

      // If successful, navigate to customers list
      if (result) {
        navigate("/customers");
      }
    } catch (error) {
      console.error("Form submission error details:", {
        message: error.message,
        stack: error.stack,
        data: error.response?.data,
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/customers")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Customer</h2>
          <p className="text-sm text-muted-foreground">
            Create a new customer profile with details
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
                {/* Image Upload Section */}
                <div className="flex justify-start mb-8">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            onImageCropped={(croppedImg) => {
                              setCroppedImage(croppedImg);
                              field.onChange(croppedImg);
                            }}
                            aspectRatio={1}
                            formData={{
                              customerName: form.watch("name"),
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Sections */}
                <div className="grid gap-8">
                  {/* Basic Details */}
                  <section>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">Basic Details</h3>
                      <p className="text-sm text-muted-foreground">
                        Add customer's basic information
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

                          {/* Mobile Number with Country Code */}
                          <FormItem className="flex flex-col space-y-2.5">
                            <FormLabel>Mobile Number</FormLabel>
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
                              <FormField
                                control={form.control}
                                name="mobileNo"
                                render={({ field }) => (
                                  <FormControl>
                                    <Input
                                      placeholder="Enter mobile number"
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

                          {/* Rest of the fields */}
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

                  {/* Addresses Section */}
                  <section>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">
                        Address Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage billing and shipping addresses
                      </p>
                    </div>
                    <div className="grid gap-8 lg:grid-cols-2">
                      {/* Billing Address Card */}
                      <Card className="border shadow-sm">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Billing Address</h4>
                          </div>
                          <div className="space-y-4">
                            {/* Billing address fields */}
                            <FormField
                              control={form.control}
                              name="billingAddress.addressLine1"
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
                              name="billingAddress.addressLine2"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>
                                    Address Line 2 (Optional)
                                  </FormLabel>
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
                              name="billingAddress.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter city"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingAddress.state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter state"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingAddress.pincode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pincode</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter pincode"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingAddress.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter country"
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
                                form.setValue(
                                  "shippingAddress",
                                  billingAddress
                                );
                              }}
                            >
                              Same as Billing
                            </Button>
                          </div>
                          <div className="space-y-4">
                            {/* Shipping address fields */}
                            <FormField
                              control={form.control}
                              name="shippingAddress.addressLine1"
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
                              name="shippingAddress.addressLine2"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>
                                    Address Line 2 (Optional)
                                  </FormLabel>
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
                              name="shippingAddress.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter city"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="shippingAddress.state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter state"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="shippingAddress.pincode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pincode</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter pincode"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="shippingAddress.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter country"
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
                    </div>
                  </section>

                  {/* Bank Details Section */}
                  <section>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">Bank Details</h3>
                      <p className="text-sm text-muted-foreground">
                        Add customer's banking information
                      </p>
                    </div>
                    <Card className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Bank details fields */}
                          <FormField
                            control={form.control}
                            name="bankDetails.accountName"
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
                            name="bankDetails.accountNo"
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
                            name="bankDetails.ifscCode"
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
                </div>

                <Separator className="my-8" />

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
                    className="min-w-[120px]"
                  >
                    {isLoading ? "Creating..." : "Create Customer"}
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

export default AddCustomerComponent;
