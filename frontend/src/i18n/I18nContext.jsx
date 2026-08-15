import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("heart_kids_wear_lang") || "zh";
  });

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("heart_kids_wear_lang", newLang);
  };

  /**
   * Helper function t(key, params, fallback)
   */
  const t = (key, params = {}, fallback = "") => {
    const currentDict = translations[lang] || translations.zh;
    let text = currentDict[key] || translations.zh[key] || fallback || key;

    if (params && typeof params === "object") {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), params[paramKey]);
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
