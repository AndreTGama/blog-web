import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./constants";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});
