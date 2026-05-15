import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { PromoBar } from "@/components/PromoBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { CheckoutSheetProvider } from "@/components/CheckoutSheet";
import { CartDrawerProvider } from "@/components/CartDrawer";
import { supabase } from "@/integrations/supabase/client";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-7xl">404</h1>
        <p className="mt-2 text-muted-foreground">This page wandered off.</p>
        <Link to="/" className="mt-6 inline-block text-gold underline underline-offset-4">Return home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-4 py-2 bg-primary text-primary-foreground text-sm">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Z Shaikh Perfumes — Premium Fragrances Inspired by Urdu Legends" },
      { name: "description", content: "Hand-crafted luxury perfumes named after iconic Urdu novel characters. Cash on delivery across Pakistan. 25% off this season." },
      { property: "og:title", content: "Z Shaikh Perfumes — Premium Fragrances Inspired by Urdu Legends" },
      { property: "og:description", content: "Hand-crafted luxury perfumes named after iconic Urdu novel characters. Cash on delivery across Pakistan. 25% off this season." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/images/hero-banner.jpg" },
      { name: "twitter:title", content: "Z Shaikh Perfumes — Premium Fragrances Inspired by Urdu Legends" },
      { name: "twitter:description", content: "Hand-crafted luxury perfumes named after iconic Urdu novel characters. Cash on delivery across Pakistan. 25% off this season." },
      { name: "twitter:image", content: "/images/hero-banner.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "icon", href: "/images/logo.png" }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <CheckoutSheetProvider>
            <CartDrawerProvider>
              <div className="flex flex-col min-h-screen">
                <PromoBar />
                <SiteHeader />
                <main className="flex-1"><Outlet /></main>
                <SiteFooter />
              </div>
              <WhatsAppFab />
              <Toaster position="top-center" richColors />
            </CartDrawerProvider>
          </CheckoutSheetProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
