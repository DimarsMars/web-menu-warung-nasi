import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Warung Nasi Barokah — Menu Hari Ini",
  description:
    "Cek menu terbaru dan ketersediaan menu Warung Nasi Barokah. Update realtime!",
  // Open Graph — preview cantik saat link di-share ke WhatsApp/social media
  openGraph: {
    title: "Warung Nasi Barokah — Menu Hari Ini",
    description:
      "Cek menu yang ready hari ini! Update langsung tanpa perlu tanya-tanya.",
    images: ["/og-image.png"],
    type: "website",
    locale: "id_ID",
  },
  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "Warung Nasi Barokah — Menu Hari Ini",
    description: "Cek menu yang ready hari ini!",
    images: ["/og-image.png"],
  },
  // Ikon PWA & favicon
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

// Warna tema browser di HP
export const viewport: Viewport = {
  themeColor: "#2A4B3A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
