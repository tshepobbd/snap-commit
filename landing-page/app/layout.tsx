import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SnapCommit - AI-Powered Git Commits',
  description: 'Generate high-quality git commit messages instantly using AI. Save time and maintain consistent commit history.',
  keywords: 'git, commit, AI, CLI, tool, commit messages, generator, snapcommit',
  authors: [{ name: 'SnapCommit' }],
  creator: 'SnapCommit',
  publisher: 'SnapCommit',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}