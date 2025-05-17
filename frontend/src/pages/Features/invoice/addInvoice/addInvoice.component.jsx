import React, { useContext, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  PlusCircle,
  Trash2,
  CalendarIcon,
  ImageIcon,
  Check,
} from "lucide-react";
import { AddInvoiceContext } from "./addInvoice.control";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";

// Add a helper function to compute the weighted average price from batches
function getWeightedAveragePrice(product, quantity) {
  if (!product || !product.batches || quantity <= 0) return 0;
  let remainingQty = quantity;
  let totalCost = 0;

  for (const batch of product.batches) {
    if (remainingQty <= 0) break;
    const availableInBatch = batch.currentQuantity || 0;
    const usedQty = Math.min(remainingQty, availableInBatch);
    totalCost += usedQty * batch.salePrice;
    remainingQty -= usedQty;
  }

  return (totalCost / quantity).toFixed(2);
}

function AddInvoiceComponent() {
  const {
    invoiceSchema,
    isLoading,
    createInvoice,
    fetchCustomers,
    fetchProducts,
    fetchBankDetails,
    fetchSignatures,
    customers,
    products,
    bankDetails,
    signatures,
  } = useContext(AddInvoiceContext);
  const navigate = useNavigate();
  // Add state to track if we should print after creation
  const [shouldPrintAfterCreate, setShouldPrintAfterCreate] = useState(false);

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceDate: new Date(),
      invoiceDueDate: addDays(new Date(), 15), // Default due date is 15 days from today
      customerId: "",
      products: [
        { id: "", quantity: 1, unitPrice: 0, taxRate: 0, totalAvailable: 0 },
      ],
      transactionType: "credit",
      paymentMode: "cash",
      initialPayment: 0,
      bankDetails: "",
      signature: "",
      isRoundedOff: true,
      description: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const watchTransactionType = form.watch("transactionType");
  const selectedProductIds = form
    .watch("products")
    .map((product) => product.id)
    .filter(Boolean);

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Filter customers by name or phone
  const filteredCustomers = customers.filter((customer) =>
    (customer.name + customer.mobileNo)
      .toLowerCase()
      .includes(customerSearch.toLowerCase())
  );

  // Filter products by name or SKU
  const filteredProducts = products.filter((prod) =>
    (prod.name + prod.skuCode)
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchBankDetails();
    fetchSignatures();
  }, [fetchCustomers, fetchProducts, fetchBankDetails, fetchSignatures]);

  // Auto-fill bank details when available
  useEffect(() => {
    if (bankDetails?._id && form.getValues("bankDetails") === "") {
      form.setValue("bankDetails", bankDetails._id);
    }
  }, [bankDetails, form]);

  // Update product details when selected
  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find(
      (product) => product.id === productId
    );
    if (selectedProduct) {
      // Get the first batch's sale price as default or 0 if no batches
      const defaultPrice = selectedProduct.batches?.[0]?.salePrice || 0;
      const defaultTaxRate = selectedProduct.taxRate || 0;

      form.setValue(`products.${index}.unitPrice`, defaultPrice);
      form.setValue(`products.${index}.taxRate`, defaultTaxRate);
      form.setValue(
        `products.${index}.totalAvailable`,
        selectedProduct.totalQuantity
      );
    }
  };

  const validateQuantity = (index, value) => {
    const totalAvailable =
      form.getValues(`products.${index}.totalAvailable`) || 0;
    const quantity = Number(value);

    if (quantity > totalAvailable) {
      form.setError(`products.${index}.quantity`, {
        type: "manual",
        message: `Only ${totalAvailable} units available in stock`,
      });
      return false;
    }

    // Compute average price if quantity does not exceed stock
    if (quantity <= totalAvailable) {
      const productId = form.getValues(`products.${index}.id`);
      const selectedProd = products.find((p) => p.id === productId);
      const avgPrice = getWeightedAveragePrice(selectedProd, quantity);
      form.setValue(`products.${index}.unitPrice`, avgPrice);
    }

    form.clearErrors(`products.${index}.quantity`);
    return true;
  };

  // Function to handle "Create and Print" action
  const handleCreateAndPrint = () => {
    console.log("Create and Print clicked");
    // Force state to true
    setShouldPrintAfterCreate(true);

    // Use a separate submit function to ensure state is updated
    const submitForm = async () => {
      try {
        // Get current form values
        const values = form.getValues();

        // Validate quantities against available stock
        const invalidQuantity = values.products.some(
          (product, index) => !validateQuantity(index, product.quantity)
        );

        if (invalidQuantity) return;

        // Format data for API with print flag explicitly set
        const formattedValues = {
          ...values,
          // Force the print flag to true
          _printAfterCreate: true,
          products: values.products.map((product) => ({
            id: product.id,
            quantity: Number(product.quantity),
            unitPrice: Number(product.unitPrice),
            taxRate: Number(product.taxRate),
          })),
          initialPayment: Number(values.initialPayment),
        };

        console.log(
          "Creating invoice with print flag:",
          formattedValues._printAfterCreate
        );
        const response = await createInvoice(formattedValues);
        console.log("Print-and-create response:", response);

        if (response?.success) {
          console.log("Redirecting to view invoice:", response.value._id);
          navigate(`/invoice/view/${response.value._id}?print=true`);
        }
      } catch (error) {
        console.error("Error in create-and-print:", error);
        setShouldPrintAfterCreate(false);
      }
    };

    // Wait a moment for state update then submit
    setTimeout(submitForm, 10);
  };

  // The standard onSubmit function for the regular "Create Invoice" button
  const onSubmit = async (values) => {
    try {
      // Only proceed if this is NOT a print-after-create submission
      // The print-after-create uses its own submission path
      if (shouldPrintAfterCreate) {
        console.log("Ignoring regular submit for create & print");
        return;
      }

      // Validate quantities against available stock
      const invalidQuantity = values.products.some(
        (product, index) => !validateQuantity(index, product.quantity)
      );

      if (invalidQuantity) return;

      // Format data for API - explicitly marking this as NOT print-after-create
      const formattedValues = {
        ...values,
        _printAfterCreate: false,
        products: values.products.map((product) => ({
          id: product.id,
          quantity: Number(product.quantity),
          unitPrice: Number(product.unitPrice),
          taxRate: Number(product.taxRate),
        })),
        initialPayment: Number(values.initialPayment),
      };

      console.log("Standard submission, will navigate to invoices");
      await createInvoice(formattedValues);
    } catch (error) {
      console.error("Error in submit:", error);
    }
  };

  // Calculate grand total
  const grandTotal = form.watch("products").reduce((sum, product) => {
    const quantity = Number(product.quantity) || 0;
    const unitPrice = Number(product.unitPrice) || 0;
    const taxRate = Number(product.taxRate) || 0;
    const subtotal = quantity * unitPrice;
    const taxAmount = (subtotal * taxRate) / 100;
    return sum + subtotal + taxAmount;
  }, 0);

  // Round off total if enabled
  const finalTotal = form.watch("isRoundedOff")
    ? Math.round(grandTotal)
    : grandTotal;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/invoices")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
          <p className="text-sm text-muted-foreground">
            Create a new invoice for a customer
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
                {/* Basic Invoice Details */}
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Date</FormLabel>
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
                                date > new Date() ||
                                date < new Date("1900-01-01")
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
                    name="invoiceDueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
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
                              disabled={(date) => date < new Date("1900-01-01")}
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
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search by name or number..."
                                value={customerSearch}
                                onChange={(e) =>
                                  setCustomerSearch(e.target.value)
                                }
                              />
                            </div>
                            {filteredCustomers.map((customer) => (
                              <SelectItem
                                key={customer._id}
                                value={customer._id}
                              >
                                {customer.name} ({customer.mobileNo})
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                  {watchTransactionType === "credit" && (
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
                                  field.onChange(
                                    value === "" ? 0 : Number(value)
                                  );
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

                {/* Bank and Signature Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bankDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Details</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank details" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bankDetails && (
                              <SelectItem value={bankDetails._id}>
                                {bankDetails.bankName} -{" "}
                                {bankDetails.accountNumber}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {bankDetails && field.value && (
                          <div className="pt-2 text-xs text-muted-foreground">
                            <p>
                              Account Holder: {bankDetails.accountHolderName}
                            </p>
                            <p>IFSC: {bankDetails.ifsc}</p>
                            {bankDetails.upiId && (
                              <p>UPI: {bankDetails.upiId}</p>
                            )}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select signature" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {signatures.map((sig) => (
                              <SelectItem key={sig._id} value={sig._id}>
                                <div className="flex items-center gap-2">
                                  <span>{sig.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.value &&
                          signatures.find((sig) => sig._id === field.value) && (
                            <div className="pt-2">
                              <img
                                src={
                                  signatures.find(
                                    (sig) => sig._id === field.value
                                  )?.signatureUrl
                                }
                                alt="Signature"
                                className="max-h-24 object-contain"
                              />
                            </div>
                          )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Round off and Description */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Note</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes for this invoice"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Products Section */}
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50/50 dark:bg-zinc-800/50">
                          <th className="p-3 text-left font-medium">Product</th>
                          <th className="p-3 text-left font-medium">
                            Quantity
                          </th>
                          <th className="p-3 text-left font-medium">
                            Unit Price
                          </th>
                          <th className="p-3 text-left font-medium">
                            Tax Rate (%)
                          </th>
                          <th className="p-3 text-left font-medium">
                            Total Amount
                          </th>
                          <th className="p-3 text-right font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, index) => {
                          const quantity =
                            form.watch(`products.${index}.quantity`) || 0;
                          const unitPrice =
                            form.watch(`products.${index}.unitPrice`) || 0;
                          const taxRate =
                            form.watch(`products.${index}.taxRate`) || 0;

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
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          handleProductChange(index, value);
                                        }}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <div className="p-2">
                                            <Input
                                              placeholder="Search by name or SKU..."
                                              value={productSearch}
                                              onChange={(e) =>
                                                setProductSearch(e.target.value)
                                              }
                                            />
                                          </div>
                                          {filteredProducts
                                            .filter(
                                              (product) =>
                                                !selectedProductIds.includes(
                                                  product.id
                                                ) || product.id === field.value
                                            )
                                            .map((product) => (
                                              <SelectItem
                                                key={product.id}
                                                value={product.id}
                                                disabled={
                                                  product.totalQuantity <= 0
                                                }
                                              >
                                                {product.name} (
                                                {product.skuCode})
                                                {product.totalQuantity <= 0 &&
                                                  " - Out of stock"}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="p-3">
                                <FormField
                                  control={form.control}
                                  name={`products.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Qty"
                                          {...field}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(
                                              value === ""
                                                ? ""
                                                : parseInt(value, 10)
                                            );
                                            if (value)
                                              validateQuantity(index, value);
                                          }}
                                          className="w-24"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                      {form.getValues(
                                        `products.${index}.totalAvailable`
                                      ) > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          Available:{" "}
                                          {form.getValues(
                                            `products.${index}.totalAvailable`
                                          )}
                                        </p>
                                      )}
                                    </FormItem>
                                  )}
                                />
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
                                            field.onChange(
                                              value === ""
                                                ? ""
                                                : parseFloat(value)
                                            );
                                          }}
                                          className="w-28"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
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
                                            field.onChange(
                                              value === ""
                                                ? ""
                                                : parseFloat(value)
                                            );
                                          }}
                                          className="w-24"
                                          disabled // disable the tax rate
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
                          taxRate: 0,
                          totalAvailable: 0,
                        })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </div>

                {/* Grand Total and Form Actions */}
                <div className="space-y-4">
                  {/* Totals and Actions Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      {/* Total Tax Card */}
                      <Card className="w-fit">
                        <CardContent className="p-4">
                          <div className="text-lg font-semibold">
                            Total Tax: ₹
                            {form
                              .watch("products")
                              .reduce((sum, product) => {
                                const quantity = Number(product.quantity) || 0;
                                const unitPrice =
                                  Number(product.unitPrice) || 0;
                                const taxRate = Number(product.taxRate) || 0;
                                const subtotal = quantity * unitPrice;
                                const taxAmount = (subtotal * taxRate) / 100;
                                return sum + taxAmount;
                              }, 0)
                              .toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Grand Total Card */}
                      <Card className="w-fit">
                        <CardContent className="p-4">
                          <div className="text-lg font-semibold">
                            Grand Total: ₹
                            {form.watch("isRoundedOff")
                              ? Math.round(grandTotal).toFixed(2)
                              : grandTotal.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {form.watch("isRoundedOff") &&
                              grandTotal !== Math.round(grandTotal) &&
                              `Rounded from ₹${grandTotal.toFixed(2)}`}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Initial Payment Card (shows only for credit transaction) */}
                      {watchTransactionType === "credit" && (
                        <Card className="w-fit">
                          <CardContent className="p-4">
                            <div className="text-lg font-semibold">
                              Initial Payment: ₹
                              {form.watch("initialPayment").toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Round Off Switch */}
                      <FormField
                        control={form.control}
                        name="isRoundedOff"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormLabel className="mt-1.5">Round Off</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/invoices")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCreateAndPrint}
                        disabled={isLoading}
                        className={cn(
                          "min-w-[160px]",
                          isLoading && "animate-pulse"
                        )}
                      >
                        {isLoading ? "Creating..." : "Create & Print"}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          "min-w-[120px]",
                          isLoading && "animate-pulse"
                        )}
                      >
                        {isLoading ? "Creating..." : "Create Invoice"}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddInvoiceComponent;
