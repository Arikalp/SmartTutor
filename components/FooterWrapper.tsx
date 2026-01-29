'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Don't show footer on login and home/landing pages
  const hideFooter = pathname === '/login' || pathname === '/';
  
  if (hideFooter) {
    return null;
  }
  
  return <Footer />;
}
