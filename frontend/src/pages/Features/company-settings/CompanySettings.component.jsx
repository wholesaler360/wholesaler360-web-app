import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanySettingsContext } from "./CompanySettings.control";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/custom/FileUpload";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function CompanySettingsComponent() {
  const {
    companyDetailsSchema,
    bankDetailsSchema,
    isLoading,
    fetchCompanyData,
    updateCompany,
    updateBankDetails,
    uploadLogo,
    uploadFavicon,
    addSignature,
    removeSignature,
  } = useContext(CompanySettingsContext);

  const [companyData, setCompanyData] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [newLogo, setNewLogo] = useState(null);
  const [newFavicon, setNewFavicon] = useState(null);
  const [newSignature, setNewSignature] = useState(null);
  const [signatureName, setSignatureName] = useState("");

  const companyForm = useForm({
    resolver: zodResolver(companyDetailsSchema),
  });

  const bankForm = useForm({
    resolver: zodResolver(bankDetailsSchema),
  });

  const refreshData = async () => {
    try {
      const data = await fetchCompanyData();
      setCompanyData(data.company);
      setSignatures(data.signatures);

      // Reset forms with fresh data
      companyForm.reset({
        ...data.company,
        ...data.company.address,
      });
      bankForm.reset(data.bank);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleCompanySubmit = async (data) => {
    try {
      await updateCompany(data);
      await refreshData(); // Refresh after update
    } catch (error) {
      console.error("Error updating company details:", error);
    }
  };

  const handleBankSubmit = async (data) => {
    try {
      await updateBankDetails(data);
      await refreshData(); // Refresh after update
    } catch (error) {
      console.error("Error updating bank details:", error);
    }
  };

  const handleLogoUpdate = async () => {
    if (!newLogo) return;
    const formData = new FormData();
    formData.append("logo", newLogo);
    try {
      await uploadLogo(formData);
      await refreshData(); // Refresh after update
      setNewLogo(null);
    } catch (error) {
      console.error("Error updating logo:", error);
    }
  };

  const handleFaviconUpdate = async () => {
    if (!newFavicon) return;
    const formData = new FormData();
    formData.append("favicon", newFavicon);
    try {
      await uploadFavicon(formData);
      await refreshData(); // Refresh after update
      setNewFavicon(null);
    } catch (error) {
      console.error("Error updating favicon:", error);
    }
  };

  const handleSignatureAdd = async () => {
    if (!newSignature || !signatureName) return;
    const formData = new FormData();
    formData.append("signature", newSignature);
    formData.append("name", signatureName);
    try {
      await addSignature(formData);
      await refreshData(); // Refresh after update
      setNewSignature(null);
      setSignatureName("");
    } catch (error) {
      console.error("Error adding signature:", error);
    }
  };

  const handleSignatureRemove = async (name) => {
    try {
      await removeSignature(name);
      await refreshData(); // Refresh after update
    } catch (error) {
      console.error("Error removing signature:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Company Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your company details, bank information, and signatures.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* Company Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...companyForm}>
              <form
                onSubmit={companyForm.handleSubmit(handleCompanySubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={companyForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
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
                  <FormField
                    control={companyForm.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter GSTIN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
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
                    control={companyForm.control}
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
                    control={companyForm.control}
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
                    control={companyForm.control}
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
                    control={companyForm.control}
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
                    control={companyForm.control}
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
                <FormField
                  control={companyForm.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms and Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter terms and conditions"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Company Details"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Bank Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...bankForm}>
              <form
                onSubmit={bankForm.handleSubmit(handleBankSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={bankForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
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
                    control={bankForm.control}
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
                    control={bankForm.control}
                    name="ifsc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter IFSC code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
                    name="upiId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter UPI ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Bank Details"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Logo and Favicon Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                  {companyData?.logoUrl ? (
                    <img
                      src={companyData.logoUrl}
                      alt="Company Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No logo uploaded
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-4">
                  <Label>Update Logo</Label>
                  <FileUpload
                    onImageCropped={(image) => setNewLogo(image)}
                    aspectRatio={16 / 9}
                  />
                  {newLogo && (
                    <div className="space-y-4">
                      <Button
                        onClick={handleLogoUpdate}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Updating..." : "Update Logo"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Favicon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                    {companyData?.faviconUrl ? (
                      <img
                        src={companyData.faviconUrl}
                        alt="Favicon"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No favicon
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Current favicon displayed in browser tab
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <Label>Update Favicon</Label>
                  <FileUpload
                    onImageCropped={(image) => setNewFavicon(image)}
                    aspectRatio={1}
                  />
                  {newFavicon && (
                    <div className="space-y-4">
                      <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={URL.createObjectURL(newFavicon)}
                          alt="New Favicon Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <Button
                        onClick={handleFaviconUpdate}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Updating..." : "Update Favicon"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signatures Section */}
        <Card>
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Existing Signatures */}
              {signatures.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  {signatures.map((sig, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg border p-4 space-y-2"
                    >
                      <div className="aspect-video w-full overflow-hidden rounded-lg border">
                        <img
                          src={sig.signatureUrl}
                          alt={sig.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="text-sm font-medium">{sig.name}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleSignatureRemove(sig.name)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Signature */}
              <div className="space-y-4">
                <h4 className="font-medium">Add New Signature</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Signature Name</Label>
                    <Input
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Enter signature name"
                    />
                  </div>
                  <div>
                    <Label>Signature Image</Label>
                    <FileUpload
                      onImageCropped={(image) => setNewSignature(image)}
                      aspectRatio={16 / 9}
                    />
                    {newSignature && signatureName && (
                      <Button
                        onClick={handleSignatureAdd}
                        disabled={isLoading}
                        className="w-full mt-4"
                      >
                        {isLoading ? "Adding..." : "Add Signature"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CompanySettingsComponent;
