import { Metadata } from 'next';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Utility from './components/Utility';
import AuraQY from './components/AuraQY';
import Tokenomics from './components/Tokenomics';
import Roadmap from './components/Roadmap';
import HowToBuy from './components/HowToBuy';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { TOKEN_CONFIG } from './config';

export const metadata: Metadata = {
    title: `${TOKEN_CONFIG.name} ($${TOKEN_CONFIG.symbol}) — ${TOKEN_CONFIG.status}`,
    description: 'The utility token powering Networkqy\'s AI-driven professional networking. Read the whitepaper and get notified for launch.',
    openGraph: {
        title: `${TOKEN_CONFIG.name} ($${TOKEN_CONFIG.symbol}) — ${TOKEN_CONFIG.status}`,
        description: 'The utility token powering Networkqy\'s AI-driven professional networking. Read the whitepaper and get notified for launch.',
        images: ['/token/og-image.png'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${TOKEN_CONFIG.name} ($${TOKEN_CONFIG.symbol}) — ${TOKEN_CONFIG.status}`,
        description: 'The utility token powering Networkqy\'s AI-driven professional networking. Read the whitepaper and get notified for launch.',
        images: ['/token/og-image.png'],
    },
};

export default function TokenPage() {
    return (
        <div className="min-h-screen bg-[#0B0B10] text-white overflow-hidden">
            {/* Skip to content link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-md"
            >
                Skip to main content
            </a>

            <main id="main-content" className="relative">
                <Hero />
                <Stats />
                <Utility />
                <AuraQY />
                <Tokenomics />
                <Roadmap />
                <HowToBuy />
                <FAQ />
                <CTA />
                <Footer />
            </main>

            {/* Structured data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": TOKEN_CONFIG.name,
                        "description": "The utility token powering Networkqy's AI-driven professional networking platform",
                        "brand": {
                            "@type": "Brand",
                            "name": "Networkqy"
                        },
                        "category": "Cryptocurrency Token",
                        "url": "https://networkqy.com/token"
                    })
                }}
            />
        </div>
    );
}
