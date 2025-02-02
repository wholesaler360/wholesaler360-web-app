import React from "react";

const vendorContext = createContext({});

function VendorController({ children }) {
  return <vendorContext.Provider value={{}}>{children}</vendorContext.Provider>;
}

export default VendorController;
