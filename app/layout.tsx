import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Stack-AI-gdrive-file-picker",
  description: "A file picker to get knowledge base from Google Drive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
