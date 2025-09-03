import React, { useContext, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import { AddPurchaseContext } from "./addPurchase.control";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import WeighingPanel from "@/components/custom/WeighScale";

function AddPurchaseComponent() {
  const {
    purchaseSchema,
    isLoading,
    createPurchase,
    fetchVendors,
    fetchProducts,
    vendors,
    products,
  } = useContext(AddPurchaseContext);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      purchaseDate: new Date(),  // Changed to Date object
      vendorId: "",
      products: [{ id: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
      transactionType: "credit",
      paymentMode: "cash",
      initialPayment: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const watchTransactionType = form.watch("transactionType");
  const selectedProductIds = form.watch("products").map(product => product.id).filter(Boolean);
  const [showWeighPanel, setShowWeighPanel] = useState(false);
  const [weighProductIndex, setWeighProductIndex] = useState(null);
  const [capturedWeightForWeighPanel, setCapturedWeightForWeighPanel] = useState(0);

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, [fetchVendors, fetchProducts]);

  // Watch products array for changes and update quantity defaults
  useEffect(() => {
    const productsInForm = form.getValues("products");
    productsInForm.forEach((product, index) => {
      const selectedProduct = products.find(p => p.id === product.id);
      const quantityType = selectedProduct?.quantityType || "PCS";
      const rawQuantity = product.quantity;

      // Set default quantity based on quantityType
      if (selectedProduct) {
        if (quantityType === "KG" && rawQuantity !== 0) {
          form.setValue(`products.${index}.quantity`, 0);
        }
        if (quantityType !== "KG" && rawQuantity !== 1) {
          form.setValue(`products.${index}.quantity`, 1);
        }
      }
    });
    // eslint-disable-next-line
  }, [form.watch("products"), products]);

  // Validate quantity before submit (PCS: >=1, KG: >0)
  const validateQuantity = (index, value) => {
    const productId = form.getValues(`products.${index}.id`);
    const selectedProduct = products.find(p => p.id === productId);
    const quantityType = selectedProduct?.quantityType || "PCS";
    const quantity = Number(value);

    if (quantityType === "PCS" && quantity < 1) {
      form.setError(`products.${index}.quantity`, {
        type: "manual",
        message: "Quantity must be at least 1 for PCS products",
      });
      return false;
    }
    if (quantityType === "KG" && quantity <= 0) {
      form.setError(`products.${index}.quantity`, {
        type: "manual",
        message: "Quantity must be greater than 0 for KG products",
      });
      return false;
    }
    form.clearErrors(`products.${index}.quantity`);
    return true;
  };

  const onSubmit = async (values) => {
    // Validate all product quantities before sending request
    const invalidQuantity = values.products.some(
      (product, index) => !validateQuantity(index, product.quantity)
    );
    if (invalidQuantity) return;

    try {
      // Convert string values to numbers for the products array
      const formattedValues = {
        ...values,
        products: values.products.map(product => ({
          ...product,
          quantity: Number(product.quantity),
          unitPrice: Number(product.unitPrice),
          taxRate: Number(product.taxRate),
        })),
        initialPayment: Number(values.initialPayment),
      };
      await createPurchase(formattedValues);
    } catch (error) {
      // Error is handled in createPurchase
    }
  };

  // Handler to open weigh panel for a specific product row
  const handleOpenWeighPanel = (index) => {
    const selectedProductId = form.watch(`products.${index}.id`);
    const selectedProduct = products.find(p => p.id === selectedProductId);
    const quantityType = selectedProduct?.quantityType || "PCS";
    // For KG products, initialize capturedWeight with current quantity (default 0)
    if (quantityType === "KG") {
      const currentQty = parseFloat(form.watch(`products.${index}.quantity`)) || 0;
      setWeighProductIndex(index);
      setCapturedWeightForWeighPanel(currentQty); // new state for capturedWeight
      setShowWeighPanel(true);
    } else {
      setWeighProductIndex(index);
      setCapturedWeightForWeighPanel(null);
      setShowWeighPanel(true);
    }
  };

  // Handler to set quantity from weigh panel
  const handleWeighSave = (capturedWeight) => {
    form.setValue(`products.${weighProductIndex}.quantity`, capturedWeight);
    setShowWeighPanel(false);
    setWeighProductIndex(null);
    setCapturedWeightForWeighPanel(0);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/purchases")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Purchase</h2>
          <p className="text-sm text-muted-foreground">
            Create a new purchase entry
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
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor._id} value={vendor._id}>
                                {vendor.name} ({vendor.mobileNo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="credit">Credit</SelectItem>
                            <SelectItem value="debit">Debit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchTransactionType === "debit" && (
                    <>
                      <FormField
                        control={form.control}
                        name="paymentMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Mode</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="initialPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Payment</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter initial payment"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === "" ? 0 : Number(value));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                {/* Products Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Products</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          id: "",
                          quantity: 1,
                          unitPrice: 0,
                          taxRate: 0
                        })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50/50 dark:bg-zinc-800/50">
                          <th className="p-3 text-left font-medium">Product</th>
                          <th className="p-3 text-left font-medium">Quantity</th>
                          <th className="p-3 text-left font-medium">Price</th>
                          <th className="p-3 text-left font-medium">PER</th>
                          <th className="p-3 text-left font-medium">Tax Rate (%)</th>
                          <th className="p-3 text-left font-medium">Total Amount</th>
                          <th className="p-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, index) => {
                          const selectedProductId = form.watch(`products.${index}.id`);
                          const selectedProduct = products.find(p => p.id === selectedProductId);
                          const quantityType = selectedProduct?.quantityType || "PCS";
                          const isKG = quantityType === "KG";
                          let rawQuantity = form.watch(`products.${index}.quantity`);

                          const quantity = isKG
                            ? parseFloat(rawQuantity || 0)
                            : parseInt(rawQuantity || 1, 10);
                          const unitPrice = form.watch(`products.${index}.unitPrice`) || 0;
                          const taxRate = form.watch(`products.${index}.taxRate`) || 0;
                          const subtotal = quantity * unitPrice;
                          const taxAmount = (subtotal * taxRate) / 100;
                          const total = subtotal + taxAmount;

                          return (
                            <tr key={field.id} className="border-b">
                              <td className="p-3">
                                <FormField
                                  control={form.control}
                                  name={`products.${index}.id`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        onValueChange={value => {
                                          field.onChange(value);
                                          const selected = products.find(p => p.id === value);
                                          if (selected?.quantityType === "KG") {
                                            form.setValue(`products.${index}.quantity`, 0);
                                          } else {
                                            form.setValue(`products.${index}.quantity`, 1);
                                          }
                                        }}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {products
                                            .filter(product => !selectedProductIds.includes(product.id) || product.id === field.value)
                                            .map((product) => (
                                              <SelectItem
                                                key={product.id}
                                                value={product.id}
                                              >
                                                {product.name} ({product.skuCode})
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="p-3 flex items-center gap-2">
                                <FormField
                                  control={form.control}
                                  name={`products.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type={isKG ? "number" : "number"}
                                          step={isKG ? "0.001" : "1"}
                                          placeholder="Qty"
                                          {...field}
                                          value={isKG ? (field.value || 0) : (field.value || 1)}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(
                                              value === ""
                                                ? (isKG ? 0 : 1)
                                                : isKG
                                                  ? parseFloat(value)
                                                  : parseInt(value, 10)
                                            );
                                          }}
                                          className="w-24"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                {isKG && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleOpenWeighPanel(index)}
                                  >
                                    Weight
                                  </Button>
                                )}
                              </td>
                              <td className="p-3">
                                <FormField
                                  control={form.control}
                                  name={`products.${index}.unitPrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="Price"
                                          {...field}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? "" : parseFloat(value));
                                          }}
                                          className="w-28"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              {/* PER column - uneditable, auto-filled */}
                              <td className="p-1 w-16">
                                <Input
                                  value={quantityType}
                                  disabled
                                  className="text-center"
                                />
                              </td>
                              <td className="p-3">
                                <FormField
                                  control={form.control}
                                  name={`products.${index}.taxRate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="Tax %"
                                          {...field}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? "" : parseFloat(value));
                                          }}
                                          className="w-24"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={total.toFixed(2)}
                                  disabled
                                  className="w-32 bg-gray-50 dark:bg-zinc-800"
                                />
                              </td>
                              <td className="p-3 text-right">
                                {fields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Grand Total and Form Actions */}
                <div className="flex items-center justify-between">
                  <Card className="w-fit">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">
                        Grand Total: ₹
                        {form.watch('products').reduce((sum, product) => {
                          const quantity = product.quantity || 0;
                          const unitPrice = product.unitPrice || 0;
                          const taxRate = product.taxRate || 0;
                          const subtotal = quantity * unitPrice;
                          const taxAmount = (subtotal * taxRate) / 100;
                          return sum + subtotal + taxAmount;
                        }, 0).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/purchases")}
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
                      {isLoading ? "Creating..." : "Create Purchase"}
                    </Button>
                  </div>
                </div>
                
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Weigh Panel Modal */}
      {showWeighPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
            <WeighingPanel
              onSave={handleWeighSave}
              initialCapturedWeight={capturedWeightForWeighPanel}
            />
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => {
                setShowWeighPanel(false);
                setWeighProductIndex(null);
                setCapturedWeightForWeighPanel(0);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPurchaseComponent;
