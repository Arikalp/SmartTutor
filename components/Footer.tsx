'use client';
import Link from 'next/link';
import { FaHome, FaBook, FaBrain, FaChartLine, FaUser, FaGithub, FaTwitter, FaLinkedin, FaHeart } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { icon: <FaHome />, label: 'Dashboard', href: '/dashboard' },
    { icon: <FaBook />, label: 'Quick Learn', href: '/learn' },
    { icon: <FaBrain />, label: 'Deep Learn', href: '/deep-learn' },
    { icon: <FaChartLine />, label: 'Progress', href: '/progress' },
    { icon: <FaUser />, label: 'Profile', href: '/profile' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FaBrain className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Smart Tutor AI</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your AI-powered learning companion. Master any topic with personalized lessons and interactive quizzes.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Navigation</h4>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-xs">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Getting Started
                </Link>
              </li>
              <li>
                <Link 
                  href="/learn"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Learning Guide
                </Link>
              </li>
              <li>
                <Link 
                  href="/progress"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Track Progress
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label="GitHub"
          >
            <FaGithub className="text-xl" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label="Twitter"
          >
            <FaTwitter className="text-xl" />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedin className="text-xl" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            Developed by <span className="font-semibold text-indigo-600 dark:text-indigo-400">Sankalp</span> with 
            <FaHeart className="text-red-500 animate-pulse" /> 
            <span className="ml-1">© {currentYear}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
