'use client';
import Head from 'next/head';
import Link from 'next/link';

const TermsOfUse = () => {
  return (
    <>
      <Head>
        <title>Terms of Use | Networkqy</title>
        <meta name="description" content="Terms of Use for Networkqy services" />
      </Head>

      <div className="max-w-4xl mx-auto px-6 py-14 text-white relative z-10">
        <div className="absolute inset-0 -z-10 blur-2xl opacity-20 pointer-events-none bg-gradient-to-br from-violet-600/30 to-purple-700/20 rounded-xl" />
        <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl">

          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Terms of Use
          </h1>
          <p className="text-center italic text-sm text-zinc-400 mb-10">
            Last updated: May 8, 2025
          </p>

          {[
            {
              title: '1. Acceptance of Terms',
              content:
                'By accessing or using Networkqy services, you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, you may not use Networkqy’s platform.',
            },
            {
              title: '2. Changes to Terms',
              content:
                'Networkqy reserves the right to update or modify these Terms of Use at any time. The latest version will be posted on this page. It is your responsibility to review these terms periodically.',
            },
            {
              title: '3. Use of Networkqy Services',
              content:
                'You agree to use Networkqy’s platform in compliance with all applicable laws. You are solely responsible for the content you upload or share, and you confirm you have the rights to such content.',
            },
            {
              title: '4. User Accounts',
              content:
                'To access certain features, you must create an account and provide accurate, up-to-date information. You are responsible for maintaining confidentiality and all activity on your account.',
            },
            {
              title: '5. Privacy Policy',
              content:
                'Your use of the Networkqy platform is also governed by our ',
              link: '/privacy-policy',
              linkLabel: 'Privacy Policy',
            },
            {
              title: '6. Limitation of Liability',
              content:
                'In no event shall Networkqy be liable for indirect or consequential damages including data loss, profit loss, or goodwill resulting from use or inability to use the platform.',
            },
            {
              title: '7. Governing Law',
              content:
                'These Terms are governed by applicable laws of the United Arab Emirates, and any disputes shall be resolved in Dubai courts.',
            },
            {
              title: '8. Contact Information',
              content:
                'For questions or concerns, email us at ',
              mail: 'support@networkqy.com',
            },
          ].map((section, idx) => (
            <section className="mb-10" key={idx}>
              <h2 className="text-xl md:text-2xl font-semibold text-violet-300 mb-3">
                {section.title}
              </h2>
              <p className="text-base leading-relaxed text-zinc-300">
                {section.content}
                {section.link && (
                  <>
                    <Link
                      href={section.link}
                      className="text-violet-400 underline hover:text-purple-500 transition ml-1"
                    >
                      {section.linkLabel}
                    </Link>.
                  </>
                )}
                {section.mail && (
                  <a
                    href={`mailto:${section.mail}`}
                    className="text-violet-400 underline hover:text-purple-500 transition ml-1"
                  >
                    {section.mail}
                  </a>
                )}
              </p>
            </section>
          ))}
        </div>

        {/* Powered by Badge */}
        <a
          href="https://www.networkqy.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50"
        >
          <div className="bg-white/80 dark:bg-zinc-900/80 text-black dark:text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white dark:hover:bg-zinc-800 transition cursor-pointer">
            Powered by <span className="font-semibold text-violet-500">Networkqy</span>
          </div>
        </a>
      </div>
    </>
  );
};

export default TermsOfUse;
