import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  image?: string;
};

const AuthLayoutComponent = ({
  children,
  image = "/auth-image1.jpg",
}: AuthLayoutProps) => (
  <main className="flex h-screen flex-col lg:flex-row">
    {/* Left side - Form Content */}
    <div className="flex flex-1 flex-col bg-background">
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo - positioned to the left on web, centered on mobile */}
          <div className="flex justify-center lg:justify-start">
            <Link href="/">
              <img
                alt="Pukpara Logo"
                className="-ml-2 lg:ml-4"
                height={55}
                src="/pukpara-logo.png"
                width={149}
              />
            </Link>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Footer Links */}
      <footer className="flex-shrink-0 p-4 text-center text-muted-foreground text-xs">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap justify-center gap-4">
            <li>
              <Link
                className="hover:underline focus:underline focus:outline-none"
                href="/"
                tabIndex={0}
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                className="hover:underline focus:underline focus:outline-none"
                href="/"
                tabIndex={0}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                className="hover:underline focus:underline focus:outline-none"
                href="/"
                tabIndex={0}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    </div>

    {/* Right side - Image */}
    <div className="relative hidden lg:flex lg:flex-1">
      <img
        alt="Authentication background"
        className="h-full w-full object-cover"
        src={image}
      />
    </div>
  </main>
);

export default AuthLayoutComponent;
