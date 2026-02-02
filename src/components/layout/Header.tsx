import { useState, useEffect, forwardRef } from 'react';
import { Menu, X, Globe, Calculator, MessageCircleQuestion, TvMinimalPlay, FileText, Flame, ListPlus } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import logo from '/assets/logos/shi4gud-light.svg';

interface HeaderProps {
  isSticky: boolean;
}

const Header = forwardRef<HTMLElement, HeaderProps>(({ isSticky }, ref) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(target.getAttribute('href')!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  const launchAppUrl = import.meta.env.VITE_APP_LAUNCH_URL || "https://app.shi4gud.com";
  const listingEnabled = import.meta.env.VITE_LISTING_ENABLED === 'true';

  const navLinks = [
    { href: '/bank', text: 'Banks', icon: <Flame className="w-4 h-4" /> },
    { href: '/faq', text: 'FAQ', icon: <MessageCircleQuestion className="w-4 h-4" /> },
    { href: '/how-to', text: 'How To', icon: <TvMinimalPlay className="w-4 h-4" /> },
    ...(listingEnabled ? [{ href: '/listing', text: 'Listing', icon: <ListPlus className="w-4 h-4" /> }] : []),
    { href: 'https://docs.shi4gud.com', text: 'Docs', icon: <FileText className="w-4 h-4" /> },
    { href: 'https://shinatoken.com', text: '$SHI', icon: <Globe className="w-4 h-4" /> },
    { href: 'https://shinatools.com', text: 'Tools', icon: <Calculator className="w-4 h-4" /> },
  ];

  const socialLinks = [
    { href: 'https://x.com/SHI4GUD', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
      </svg>
    )},
    { href: 'https://github.com/shi4gud', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )}
  ];

  return (
    <header ref={ref} className={`py-2 z-[1000] w-full transition-all duration-300 ease-in-out ${isSticky ? 'fixed top-0 bg-[#1a1a2e]/90 shadow-lg' : 'relative'}`}>
      <nav className="max-w-[1200px] mx-auto px-5 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white no-underline">
          <img src={logo} alt="SHI4GUD" className="h-12 lg:h-16" />
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-5 py-3">
          <ul className="flex gap-5">
            {navLinks.map(link => (
              <li key={link.href}>
                <a 
                  href={link.href} 
                  {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} 
                  className={`no-underline font-medium transition-colors duration-300 ease-in-out hover:text-[#ff6b6b] flex items-center gap-2 group ${location.pathname === link.href || location.pathname.startsWith(link.href + '/') ? 'text-[#ff6b6b]' : 'text-white'}`}
                >
                  {link.icon}
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff6b6b] transition-colors duration-300">
                {link.icon}
              </a>
            ))}
          </div>
          <a href={launchAppUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] py-3 px-6 rounded-[25px] no-underline text-white font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(255,107,107,0.3)]">Launch App</a>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 rounded-md text-gray-100 focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`
          lg:hidden absolute top-full left-0 right-0 z-40 w-full shadow-lg 
          bg-[#1a1a2e] overflow-hidden 
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'max-h-96 opacity-100 p-8' : 'max-h-0 opacity-0 p-0'}
        `}
      >
        <ul className="flex flex-col items-center gap-4 text-white">
          {navLinks.map(link => (
            <li key={link.href}>
              <a 
                href={link.href} 
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} 
                className={`no-underline font-medium transition-colors duration-300 ease-in-out hover:text-[#ff6b6b] flex items-center gap-2 group ${location.pathname === link.href || location.pathname.startsWith(link.href + '/') ? 'text-[#ff6b6b]' : 'text-white'}`}
              >
                {link.icon}
                {link.text}
              </a>
            </li>
          ))}
          <div className="flex items-center gap-4 mt-1 mb-3">
            {socialLinks.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff6b6b] transition-colors duration-300">
                {link.icon}
              </a>
            ))}
          </div>
          <li><a href={launchAppUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] py-3 px-6 rounded-[25px] no-underline text-white font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(255,107,107,0.3)]">Launch App</a></li>
        </ul>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;