'use client';
import Head from 'next/head';

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | Networkqy</title>
        <meta name="description" content="Privacy Policy for Networkqy services" />
      </Head>

      <div className="max-w-4xl mx-auto px-6 py-14 text-white relative z-10">
        <div className="absolute inset-0 -z-10 blur-2xl opacity-20 pointer-events-none bg-gradient-to-br from-violet-600/30 to-purple-700/20 rounded-xl" />

        <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-center italic text-sm text-zinc-400 mb-10">
            Last updated: May 8, 2025
          </p>

          {[
            {
              title: '1. Introduction',
              content: `At Networkqy, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your personal data when you use our platform.`,
            },
            {
              title: '2. Information We Collect',
              list: [
                'Personal Information: Your name, email, and other info provided when creating an account.',
                'Usage Data: How you interact with our platform—IP, device, usage patterns.',
                'Cookies & Tracking: Used to enhance experience and analyze usage.',
              ],
            },
            {
              title: '3. How We Use Your Information',
              list: [
                'Provide and improve services.',
                'Respond to inquiries and support.',
                'Send updates, newsletters, or promotions (if opted in).',
                'Analyze usage to improve experience.',
              ],
            },
            {
              title: '4. Data Security',
              content:
                'We implement physical, technical, and administrative measures to protect your information from unauthorized access or use.',
            },
            {
              title: '5. Sharing Your Information',
              content:
                'We do not sell or rent your personal data. Trusted providers may assist under confidentiality agreements.',
            },
            {
              title: '6. Your Rights',
              content:
                'You can access, update, or delete your information. To opt-out of marketing, contact us below.',
            },
            {
              title: '7. Changes to This Privacy Policy',
              content:
                'We may update this policy at any time. Revisions will be posted here with an updated date.',
            },
            {
              title: '8. Contact Information',
              content: 'Contact us at ',
              link: 'support@networkqy.com',
            },
          ].map((section, index) => (
            <section className="mb-10" key={index}>
              <h2 className="text-xl md:text-2xl font-semibold text-violet-300 mb-3">
                {section.title}
              </h2>

              {section.content && !section.link && (
                <p className="text-base leading-relaxed text-zinc-300">{section.content}</p>
              )}

              {section.list && (
                <ul className="list-disc list-inside text-zinc-300 space-y-2 text-base">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {section.link && (
                <p className="text-base leading-relaxed text-zinc-300">
                  {section.content}
                  <a
                    href={`mailto:${section.link}`}
                    className="text-violet-400 underline hover:text-purple-500 transition"
                  >
                    {section.link}
                  </a>{' '}
                  for questions or concerns.
                </p>
              )}
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
          <div className="bg-white/80 text-black dark:bg-zinc-800 dark:text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white dark:hover:bg-zinc-700 transition cursor-pointer">
            Powered by <span className="font-semibold text-violet-500">Networkqy</span>
          </div>
        </a>
      </div>
    </>
  );
};

export default PrivacyPolicy;
