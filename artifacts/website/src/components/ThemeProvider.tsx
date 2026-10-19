import { useEffect } from "react";
import { useGetSiteSettings } from "@workspace/api-client-react";
import { DEFAULT_THEME, applyTheme, type ThemeColors } from "@/lib/theme";

/** Reads site settings and applies theme colours as CSS vars. No flash-safe guarantee needed for admin-first change. */
export default function ThemeProvider() {
  const { data: settings } = useGetSiteSettings();

  useEffect(() => {
    if (!settings) return;
    applyTheme({
      themePrimary: settings.themePrimary ?? undefined,
      themePrimaryDark: settings.themePrimaryDark ?? undefined,
      themeBackground: settings.themeBackground ?? undefined,
      themeSurface: settings.themeSurface ?? undefined,
      themeText: settings.themeText ?? undefined,
      themeMuted: settings.themeMuted ?? undefined,
      themeBorder: settings.themeBorder ?? undefined,
    });
  }, [settings]);

  return null;
}
