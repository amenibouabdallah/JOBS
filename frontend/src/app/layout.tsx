import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const montserrat = localFont({
  src: [
    {
      path: "../../public/fonts/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Montserrat-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Montserrat-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Jobs 2K26 - Séminaire des Junior Entreprises",
  description: "Le séminaire annuel des Junior Entreprises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${montserrat.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          defaultTheme="light"
          storageKey="vite-ui-theme"
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
