import React, { createContext, useState, useContext } from "react";

const BrandingContext = createContext();

export function BrandingProvider({ children }) {
  const [logoUrl, setLogoUrl] = useState("/");

  const updateLogo = (url) => {
    setLogoUrl(url);
  };

  return (
    <BrandingContext.Provider value={{ logoUrl, updateLogo }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
