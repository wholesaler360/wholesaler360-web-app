import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosGet } from "@/constants/api-context";
import { FetchVendor } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, BookIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ButtonV2 } from "@/components/ui/button-v2";

function VendorDetails() {
  const { mobileNo } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosGet(`${FetchVendor}/${mobileNo}`);
        if (response?.data?.success) {
          setVendor(response.data.value);
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch vendor details"
          );
        }
      } catch (error) {
        showNotification.error(
          error.response?.data?.message || "Failed to load vendor details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (mobileNo) {
      fetchVendorDetails();
    }
  }, [mobileNo]);

  const getInitials = (name) => {
    if (!name) return "XX";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Vendor not found</h2>
        <Button onClick={() => navigate("/vendors")}>
          Back to Vendors
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
            onClick={() => navigate("/vendors")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Vendor Details
            </h1>
            <p className="text-sm text-muted-foreground">
              View details for {vendor.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ButtonV2
            variant="outline"
            effect="ringHover"
            onClick={() => navigate(`/vendor/ledger/${vendor._id}`)}
            permissionModule="vendor"
            permissionAction="read"
          >
            <BookIcon className="mr-2 h-4 w-4" />
            View Ledger
          </ButtonV2>
          <Button
            variant="outline"
            onClick={() => navigate(`/vendor/edit/`, { state: { mobileNo: vendor.mobileNo } })}
            permissionModule="vendor"
            permissionAction="update"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Vendor
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 bg-muted/20 p-6">
          {vendor.imageUrl ? (
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={vendor.imageUrl}
                alt={vendor.name}
              />
              <AvatarFallback className="text-lg">
                {getInitials(vendor.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(vendor.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl">{vendor.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {vendor.mobileNo && <span>{vendor.mobileNo}</span>}
              {vendor.email && <span>• {vendor.email}</span>}
              {vendor.gstin && <span>• GSTIN: {vendor.gstin}</span>}
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
                Balance Amount
              </div>
              <div className={`mt-1 text-2xl font-bold ${
                vendor.payableBalance > 0 ? "text-red-600" : "text-green-600"
              }`}>
                ₹{vendor.payableBalance?.toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {vendor.payableBalance > 0 
                  ? "Amount payable to vendor" 
                  : vendor.payableBalance < 0 
                    ? "Amount receivable from vendor" 
                    : "No outstanding balance"}
              </div>
            </div>
            
            {vendor.gstin && (
              <div>
                <p className="text-sm text-muted-foreground">GSTIN</p>
                <p className="font-medium">{vendor.gstin}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.mobileNo && (
              <div>
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-medium">{vendor.mobileNo}</p>
              </div>
            )}
            {vendor.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{vendor.email}</p>
              </div>
            )}
            {vendor.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {vendor.address.addressLine1}
                  {vendor.address.addressLine2 && `, ${vendor.address.addressLine2}`}
                  {vendor.address.city && `, ${vendor.address.city}`}
                  {vendor.address.state && `, ${vendor.address.state}`}
                  {vendor.address.pincode && ` - ${vendor.address.pincode}`}
                  {vendor.address.country && `, ${vendor.address.country}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {vendor.bankDetails && (
          vendor.bankDetails.bankName || 
          vendor.bankDetails.accountNumber || 
          vendor.bankDetails.ifsc || 
          vendor.bankDetails.accountHolderName
        ) && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.bankDetails.bankName && (
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{vendor.bankDetails.bankName}</p>
                </div>
              )}
              {vendor.bankDetails.accountHolderName && (
                <div>
                  <p className="text-sm text-muted-foreground">Account Holder Name</p>
                  <p className="font-medium">{vendor.bankDetails.accountHolderName}</p>
                </div>
              )}
              {vendor.bankDetails.accountNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">{vendor.bankDetails.accountNumber}</p>
                </div>
              )}
              {vendor.bankDetails.ifsc && (
                <div>
                  <p className="text-sm text-muted-foreground">IFSC Code</p>
                  <p className="font-medium">{vendor.bankDetails.ifsc}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default VendorDetails;
