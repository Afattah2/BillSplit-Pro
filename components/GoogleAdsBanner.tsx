import React, { useEffect, useRef, useState } from 'react';

interface GoogleAdsBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  publisherId?: string;
}

const GoogleAdsBanner: React.FC<GoogleAdsBannerProps> = ({
  adSlot = 'YOUR_AD_SLOT_ID', // Replace with your actual ad slot ID
  adFormat = 'auto',
  style,
  className = '',
  publisherId = 'ca-pub-YOUR_PUBLISHER_ID' // Replace with your actual publisher ID
}) => {
  const adRef = useRef<HTMLElement>(null);
  const initialized = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Check if using test/invalid credentials - always show placeholder in that case
  const isTestMode = publisherId === 'ca-pub-YOUR_PUBLISHER_ID' || 
                     adSlot === 'YOUR_AD_SLOT_ID';
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    // In test mode, always show placeholder and don't try to load ads
    if (isTestMode) {
      setShowPlaceholder(true);
      return;
    }

    // Skip if already initialized
    if (initialized.current) {
      return;
    }

    // Check if this specific ad element already has ads initialized
    if (adRef.current && adRef.current.getAttribute('data-adsbygoogle-status')) {
      initialized.current = true;
      return;
    }

    // Load Google AdSense script if not already loaded
    const loadScript = () => {
      const existingScript = document.querySelector('script[src*="adsbygoogle"]');
      if (existingScript) {
        initializeAd();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        initializeAd();
      };

      script.onerror = () => {
        console.error('Failed to load Google AdSense script');
        // Keep placeholder visible if script fails to load
        setShowPlaceholder(true);
      };

      document.head.appendChild(script);
    };

    // Initialize this specific ad
    const initializeAd = () => {
      if (!adRef.current || initialized.current) {
        return;
      }

      // Check again if already initialized (in case of race condition)
      if (adRef.current.getAttribute('data-adsbygoogle-status')) {
        initialized.current = true;
        return;
      }

      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        initialized.current = true;
        // Check after a delay to see if ad loaded
        setTimeout(checkAdLoaded, 2000);
      } catch (err) {
        // Silently handle if ad is already initialized
        if (err instanceof Error && err.message.includes('already have ads')) {
          initialized.current = true;
          setTimeout(checkAdLoaded, 1000);
        } else {
          console.error('Error initializing Google Ads:', err);
          // Keep placeholder visible on error
          setShowPlaceholder(true);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadScript();
    }, 100);

    // Check if ad has loaded content
    const checkAdLoaded = () => {
      // Always show placeholder in test mode
      if (isTestMode) {
        setShowPlaceholder(true);
        return;
      }
      
      if (adRef.current) {
        const status = adRef.current.getAttribute('data-adsbygoogle-status');
        // Only hide placeholder if status is explicitly 'done' and there are children
        // Status can be 'unfilled' if no ad is available, so we keep showing placeholder
        const hasContent = status === 'done' && adRef.current.children.length > 0;
        
        setShowPlaceholder(!hasContent);
      } else {
        // If ref is not available yet, keep showing placeholder
        setShowPlaceholder(true);
      }
    };

    // Set up observer after a short delay to ensure ref is available
    const setupObserver = setTimeout(() => {
      if (adRef.current) {
        // Monitor ad loading
        const observer = new MutationObserver(() => {
          checkAdLoaded();
        });

        observer.observe(adRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-adsbygoogle-status']
        });

        observerRef.current = observer;

        // Initial check and periodic checks
        const checkInterval = setInterval(checkAdLoaded, 1000);
        intervalRef.current = checkInterval;
      }
    }, 200);

    // Initial check
    const initialCheck = setTimeout(checkAdLoaded, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(setupObserver);
      clearTimeout(initialCheck);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [publisherId, adSlot, isTestMode]);

  // Google AdSense banner specs: 320x50 (mobile), 320x100, 728x90 (leaderboard). Responsive uses full-width; min-height 50px.
  return (
    <div
      className={`google-ads-banner fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center w-full bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[max(0.5rem,env(safe-area-inset-bottom))] ${className}`}
      style={style}
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="w-full max-w-[728px] mx-auto flex justify-center items-center min-h-[50px] sm:min-h-[90px] px-2 py-2">
        <ins
          ref={adRef}
          className="adsbygoogle block text-center min-h-[50px] sm:min-h-[90px] w-full"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
        {showPlaceholder && (
          <div
            className={`absolute inset-0 flex justify-center items-center bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-sm font-medium pointer-events-none z-10 min-h-[50px] sm:min-h-[90px]`}
          >
            Google Ads
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAdsBanner;
