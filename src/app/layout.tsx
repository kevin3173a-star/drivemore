import Providers from "./providers";
import "./globals.css";
import ToasterProvider from "@/components/ui/toaster-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (                                                          
    <html>
      <body className="min-h-screen flex items-start justify-center">
        <Providers>{children}</Providers>
        <ToasterProvider />
      </body>
    </html>
  );            
}
