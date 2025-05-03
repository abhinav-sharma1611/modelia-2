
import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Using Geist instead of Geist_Mono for body
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { ProductProvider } from '@/context/ProductContext'; // Import ProductProvider
import Header from '@/components/ui/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed Geist_Mono as it wasn't explicitly used in body className

export const metadata: Metadata = {
  title: 'Product Asset Uploader', // Updated title
  description: 'Upload and manage product assets easily.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Updated body className to only use geistSans */}
      <body className={`${geistSans.variable} antialiased`}>
        <ProductProvider> {/* Wrap children with ProductProvider */}
          {children}
          <Header/>
          <Toaster /> {/* Add Toaster component */}
        </ProductProvider>
      </body>
    </html>
  );
}
