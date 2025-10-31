import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Lenis from 'lenis';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Prevent zoom on mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
    }

    return () => {
      lenis.destroy();
    };
  }, []);

  return <Component {...pageProps} />;
}
