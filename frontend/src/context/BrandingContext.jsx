import React, { createContext, useState, useContext } from "react";

const BrandingContext = createContext();

export function BrandingProvider({ children }) {
  const [logoUrl, setLogoUrl] = useState("/");
  const [faviconUrl, setFaviconUrl] = useState("/");

  const updateLogo = (url) => {
    setLogoUrl(url);
  };

  const updateFavicon = (url) => {
    setFaviconUrl(url);
    // Update favicon link element
    const linkElement = document.querySelector("link[rel*='icon']");
    if (linkElement) {
      linkElement.href = url;
    }
  };

  return (
    <BrandingContext.Provider
      value={{ logoUrl, faviconUrl, updateLogo, updateFavicon }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
