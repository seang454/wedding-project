import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'ផ្ការំដួល — ប្រព័ន្ធគ្រប់គ្រងចំណងដៃ & ទទួលភ្ញៀវមង្គលការ',
  description: 'ប្រព័ន្ធគ្រប់គ្រងចំណងដៃ និងទទួលភ្ញៀវមង្គលការសម័យទំនើប គាំទ្ររូបិយប័ណ្ណពីរ និងផ្ទៀងផ្ទាត់បេឡាដោយស្វ័យប្រវត្តិ',
  icons: {
    icon: '/images/logo-flower-transparent.png',
    shortcut: '/images/logo-flower-transparent.png',
    apple: '/images/logo-flower-transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Moul&family=Moulpali&family=Koulen&family=Siemreap&family=Kantumruy+Pro:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
