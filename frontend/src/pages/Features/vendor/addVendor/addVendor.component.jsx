import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AddVendorContext } from "./addVendor.control";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/constants/countryCodes";

function AddVendorComponent() {
  const { vendorSchema, isLoading, createVendor } =
    useContext(AddVendorContext);
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("IN_+91");

  const form = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNo: "",
      gstin: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      accountHolderName: "",
      payableBalance: 0,
      avatar: null,
    },
  });

  const extractPhoneCode = (combinedValue) => {
    return combinedValue.split("_")[1];
  };

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      mobileNo: extractPhoneCode(countryCode) + " " + data.mobileNo,
    };

    createVendor(formattedData);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/vendors")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Vendor</h2>
          <p className="text-sm text-muted-foreground">
            Create a new vendor profile with details
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
                              field.onChange(croppedImg);
                            }}
                            aspectRatio={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Basic Details */}
                <section>
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
                          name="addressLine1"
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
                          name="addressLine2"
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
                          name="city"
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
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter state" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="pincode"
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
                          name="country"
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
                          name="accountHolderName"
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
                          name="bankName"
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
                          name="accountNumber"
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
                          name="ifsc"
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
                    {isLoading ? "Creating..." : "Create Vendor"}
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

export default AddVendorComponent;
