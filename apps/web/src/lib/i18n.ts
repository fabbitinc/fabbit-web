import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "@/locales/ko";

i18n.use(initReactI18next).init({
  resources: { ko },
  lng: "ko",
  fallbackLng: "ko",
  ns: ["common", "mapping"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
