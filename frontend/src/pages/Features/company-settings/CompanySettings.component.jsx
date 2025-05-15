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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/constants/countryCodes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  AlertTriangleIcon,
} from "lucide-react";

function CompanySettingsComponent() {
  const {
    companyDetailsSchema,
    bankDetailsSchema,
    taxSchema,
    isLoading,
    fetchCompanyData,
    updateCompany,
    updateBankDetails,
    uploadLogo,
    addSignature,
    removeSignature,
    fetchTaxes,
    addTax,
    updateTax,
    removeTax,
  } = useContext(CompanySettingsContext);

  const [companyData, setCompanyData] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [newLogo, setNewLogo] = useState(null);
  const [newSignature, setNewSignature] = useState(null);
  const [signatureName, setSignatureName] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [companyMobileCountryCode, setCompanyMobileCountryCode] =
    useState("IN_+91");
  const [taxes, setTaxes] = useState([]);
  const [isAddTaxDialogOpen, setIsAddTaxDialogOpen] = useState(false);
  const [isEditTaxDialogOpen, setIsEditTaxDialogOpen] = useState(false);
  const [isDeleteTaxDialogOpen, setIsDeleteTaxDialogOpen] = useState(false);
  const [currentTax, setCurrentTax] = useState(null);
  const [taxToDelete, setTaxToDelete] = useState(null);

  const companyForm = useForm({
    resolver: zodResolver(companyDetailsSchema),
  });

  const bankForm = useForm({
    resolver: zodResolver(bankDetailsSchema),
  });

  const addTaxForm = useForm({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: "",
      percent: 0,
    },
  });

  const editTaxForm = useForm({
    resolver: zodResolver(taxSchema),
  });

  const extractPhoneCode = (combinedValue) => {
    return combinedValue.split("_")[1];
  };

  const refreshData = async () => {
    try {
      const data = await fetchCompanyData();
      setCompanyData(data.company);
      setSignatures(data.signatures);

      if (data.company.mobileNo && data.company.mobileNo.includes(" ")) {
        const parts = data.company.mobileNo.split(" ");
        const code = parts[0].trim();
        const number = parts[1].trim();

        const foundCode = countryCodes.find((c) => c.value.endsWith(code));
        if (foundCode) {
          setCompanyMobileCountryCode(foundCode.value);
        }

        companyForm.reset({
          ...data.company,
          ...data.company.address,
          mobileNo: number,
        });
      } else {
        companyForm.reset({
          ...data.company,
          ...data.company.address,
        });
      }

      bankForm.reset(data.bank);

      // Fetch taxes
      const taxesData = await fetchTaxes();
      setTaxes(taxesData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleCompanySubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        mobileNo: `${extractPhoneCode(companyMobileCountryCode)} ${
          data.mobileNo
        }`,
      };

      await updateCompany(formattedData);
      await refreshData();
    } catch (error) {
      console.error("Error updating company details:", error);
    }
  };

  const handleBankSubmit = async (data) => {
    try {
      await updateBankDetails(data);
      await refreshData();
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
      await refreshData();
      setNewLogo(null);
    } catch (error) {
      console.error("Error updating logo:", error);
    }
  };

  const handleSignatureAdd = async () => {
    if (!newSignature || !signatureName) return;
    const formData = new FormData();
    formData.append("signature", newSignature);
    formData.append("name", signatureName);
    try {
      await addSignature(formData);
      await refreshData();
      setNewSignature(null);
      setSignatureName("");
    } catch (error) {
      console.error("Error adding signature:", error);
    }
  };

  const handleSignatureRemove = async (name) => {
    try {
      await removeSignature(name);
      await refreshData();
    } catch (error) {
      console.error("Error removing signature:", error);
    }
  };

  const handleAddTaxSubmit = async (data) => {
    try {
      await addTax(data);
      await refreshTaxes();
      setIsAddTaxDialogOpen(false);
      addTaxForm.reset({ name: "", percent: 0 });
    } catch (error) {
      console.error("Error adding tax:", error);
    }
  };

  const handleEditTaxSubmit = async (data) => {
    try {
      await updateTax(data);
      await refreshTaxes();
      setIsEditTaxDialogOpen(false);
      setCurrentTax(null);
    } catch (error) {
      console.error("Error updating tax:", error);
    }
  };

  const handleDeleteTax = async (name) => {
    try {
      await removeTax(name);
      await refreshTaxes();
      setIsDeleteTaxDialogOpen(false);
      setTaxToDelete(null);
    } catch (error) {
      console.error("Error removing tax:", error);
    }
  };

  const openEditTaxDialog = (tax) => {
    setCurrentTax(tax);
    editTaxForm.reset({
      name: tax.name,
      percent: tax.percent,
    });
    setIsEditTaxDialogOpen(true);
  };

  const openDeleteTaxDialog = (tax) => {
    setTaxToDelete(tax);
    setIsDeleteTaxDialogOpen(true);
  };

  const refreshTaxes = async () => {
    const taxesData = await fetchTaxes();
    setTaxes(taxesData);
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
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-[100px] w-full mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-video w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[100px]" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[120px]" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-8 w-full" />
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
        <h2 className="text-3xl font-bold tracking-tight">Company Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your company details, bank information, and signatures.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
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
                        <div className="flex gap-2">
                          <Select
                            value={companyMobileCountryCode}
                            onValueChange={setCompanyMobileCountryCode}
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
                              placeholder="Enter mobile number"
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
            </CardHeader>
            <CardContent>
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

              <div className="space-y-4 mt-4">
                <Label>Current Logo</Label>
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
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Add New Signature</h4>
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <Label>Signature Name</Label>
                      <Input
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Enter signature name"
                      />
                    </div>
                    <div className="space-y-4">
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

                <div className="space-y-4">
                  <Label>Existing Signatures</Label>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tax Management</CardTitle>
              <Dialog
                open={isAddTaxDialogOpen}
                onOpenChange={setIsAddTaxDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <PlusCircleIcon size={16} /> Add Tax
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Tax</DialogTitle>
                    <DialogDescription>
                      Create a new tax for your products.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addTaxForm}>
                    <form
                      onSubmit={addTaxForm.handleSubmit(handleAddTaxSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={addTaxForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter tax name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addTaxForm.control}
                        name="percent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Percentage</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter percentage"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddTaxDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Adding..." : "Add Tax"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isEditTaxDialogOpen}
                onOpenChange={setIsEditTaxDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Tax</DialogTitle>
                    <DialogDescription>
                      Update existing tax details.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...editTaxForm}>
                    <form
                      onSubmit={editTaxForm.handleSubmit(handleEditTaxSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={editTaxForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter tax name"
                                {...field}
                                disabled  
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editTaxForm.control}
                        name="percent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Percentage</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter percentage"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditTaxDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Updating..." : "Update Tax"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isDeleteTaxDialogOpen}
                onOpenChange={setIsDeleteTaxDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangleIcon className="h-5 w-5" /> Delete Tax
                    </DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the tax "
                      {taxToDelete?.name}"? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDeleteTaxDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleDeleteTax(taxToDelete?.name)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Deleting..." : "Delete Tax"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Percentage (%)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxes.length > 0 ? (
                    taxes.map((tax, index) => (
                      <TableRow key={index}>
                        <TableCell>{tax.name}</TableCell>
                        <TableCell>{tax.percent}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditTaxDialog(tax)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteTaxDialog(tax)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No taxes found. Add a tax to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CompanySettingsComponent;
