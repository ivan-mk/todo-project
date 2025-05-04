import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header"; // Import Header
import Footer from "@/components/Footer"; // Import Footer
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider

export const metadata: Metadata = {
  title: "Todo App | Manage Your Tasks",
  description: "A modern todo application to help you stay organized and productive",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header /> {/* Add Header */}
          <main className="flex-grow px-4">{children}</main> {/* Added px-4 for padding on small screens */}
          <Footer /> {/* Add Footer */}
        </AuthProvider>
      </body>
    </html>
  );
}
