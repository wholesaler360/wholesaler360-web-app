import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosGet } from "@/constants/api-context";
import { FetchCustomer } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { ChevronLeft, Edit, BookIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BadgeIndianRupee } from "lucide-react";
import { ButtonV2 } from "@/components/ui/button-v2";
import { Skeleton } from "@/components/ui/skeleton";

const CustomerDetails = () => {
  const { mobileNo } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axiosGet(`${FetchCustomer}/${mobileNo}`);
        if (response.data.success) {
          setCustomer(response.data.value);
        } else {
          throw new Error(response.data.message || "Failed to fetch customer details");
        }
      } catch (error) {
        showNotification.error(error.response?.data?.message || "Error loading customer details");
      } finally {
        setIsLoading(false);
      }
    };

    if (mobileNo) {
      fetchCustomerDetails();
    }
  }, [mobileNo]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button onClick={() => navigate("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/customers")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Customer Details
            </h1>
            <p className="text-sm text-muted-foreground">
              View details for {customer.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ButtonV2
            variant="outline"
            effect="ringHover"
            onClick={() => navigate(`/customer/ledger/${customer._id}`)}
            permissionModule="customer"
            permissionAction="write"
          >
            <BookIcon className="mr-2 h-4 w-4" />
            View Ledger
          </ButtonV2>
          <Button
            variant="outline"
            onClick={() => 
              navigate("/customer/edit", {
                state: { mobileNo: customer.mobileNo },
              })
            }
            permissionModule="customer"
            permissionAction="update"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 bg-muted/20 p-6">
          {customer.avatar ? (
            <Avatar className="h-20 w-20">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="text-lg">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl">{customer.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {customer.mobileNo && <span>{customer.mobileNo}</span>}
              {customer.email && <span>• {customer.email}</span>}
              {customer.gstin && <span>• GSTIN: {customer.gstin}</span>}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Receivable Balance
              </div>
              <div className={`mt-1 text-2xl font-bold ${
                customer.receivableBalance > 0 ? "text-red-600" : "text-green-600"
              }`}>
                ₹{customer.receivableBalance.toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {customer.receivableBalance > 0 
                  ? "Amount to be received from customer" 
                  : "Amount to be paid to customer"}
              </div>
            </div>
            
            {customer.gstin && (
              <div>
                <p className="text-sm text-muted-foreground">GSTIN</p>
                <p className="font-medium">{customer.gstin}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.mobileNo && (
              <div>
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-medium">{customer.mobileNo}</p>
              </div>
            )}
            {customer.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {customer.billingAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {customer.billingAddress.addressLine1}
                  {customer.billingAddress.addressLine2 && `, ${customer.billingAddress.addressLine2}`}
                  {customer.billingAddress.city && `, ${customer.billingAddress.city}`}
                  {customer.billingAddress.state && `, ${customer.billingAddress.state}`}
                  {customer.billingAddress.pincode && ` - ${customer.billingAddress.pincode}`}
                  {customer.billingAddress.country && `, ${customer.billingAddress.country}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {customer.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {customer.shippingAddress.addressLine1}
                  {customer.shippingAddress.addressLine2 && `, ${customer.shippingAddress.addressLine2}`}
                  {customer.shippingAddress.city && `, ${customer.shippingAddress.city}`}
                  {customer.shippingAddress.state && `, ${customer.shippingAddress.state}`}
                  {customer.shippingAddress.pincode && ` - ${customer.shippingAddress.pincode}`}
                  {customer.shippingAddress.country && `, ${customer.shippingAddress.country}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {customer.bankDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.bankDetails.accountName && (
                <div>
                  <p className="text-sm text-muted-foreground">Account Holder Name</p>
                  <p className="font-medium">{customer.bankDetails.accountName}</p>
                </div>
              )}
              {customer.bankDetails.bankName && (
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{customer.bankDetails.bankName}</p>
                </div>
              )}
              {customer.bankDetails.accountNo && (
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">{customer.bankDetails.accountNo}</p>
                </div>
              )}
              {customer.bankDetails.ifscCode && (
                <div>
                  <p className="text-sm text-muted-foreground">IFSC Code</p>
                  <p className="font-medium">{customer.bankDetails.ifscCode}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
