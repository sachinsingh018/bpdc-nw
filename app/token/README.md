# Networkqy Token ($NQY) Landing Page

This directory contains the production-ready token landing page for Networkqy ($NQY) with premium design, 3D animations, and comprehensive token information.

## 🚀 Features

- **3D Hero Scene**: Interactive Three.js scene with rotating $NQY coin
- **Premium Design**: Glassmorphism cards, subtle animations, and modern UI
- **Mobile-First**: Fully responsive design for all devices
- **SEO Optimized**: Meta tags, structured data, and OpenGraph support
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Performance**: Optimized animations and lazy loading

## 📁 File Structure

```
app/token/
├── page.tsx                 # Main landing page
├── config.ts               # Token configuration
├── components/             # React components
│   ├── Hero.tsx           # Hero section with 3D scene
│   ├── Stats.tsx          # Token statistics
│   ├── Utility.tsx        # Token utility features
│   ├── AuraQY.tsx         # Trust layer explanation
│   ├── Tokenomics.tsx     # Token distribution & economics
│   ├── Roadmap.tsx        # Development timeline
│   ├── HowToBuy.tsx       # Purchase instructions
│   ├── FAQ.tsx            # Frequently asked questions
│   ├── CTA.tsx            # Call to action section
│   ├── Footer.tsx         # Footer with links
│   └── Scene3D.tsx        # Three.js 3D scene
└── README.md              # This file
```

## 🎨 Design System

### Colors
- **Primary**: `#7C3AED` (Purple)
- **Accent**: `#22D3EE` (Cyan)
- **Warning**: `#F59E0B` (Amber)
- **Background**: `#0B0B10` (True Black)

### Typography
- **Headings**: Space Grotesk (via next/font)
- **Body**: Inter (via next/font)

### Components
- **Cards**: Glassmorphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Animations**: Framer Motion for smooth transitions

## 🛠️ Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **3D Graphics**: Three.js + @react-three/fiber
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🚀 Getting Started

1. **Install Dependencies**: The required packages are already installed
2. **Configure**: Update `config.ts` with your token details
3. **Customize**: Replace placeholder content with actual whitepaper text
4. **Deploy**: Build and deploy to your hosting platform

## 📝 Content Placeholders

The following placeholders need to be replaced with actual whitepaper content:

- `<<<UTILITY_INTRO_FROM_WHITEPAPER>>>`
- `<<<UTILITY_BULLETS_FROM_WHITEPAPER>>>`
- `<<<AURAQY_EXCERPT_FROM_WHITEPAPER>>>`
- `<<<TOKENOMICS_OVERVIEW_FROM_WHITEPAPER>>>`
- `<<<UNLOCK_SCHEDULE_FROM_WHITEPAPER>>>`
- `<<<ROADMAP_M0_NOW_FROM_WHITEPAPER>>>`
- `<<<ROADMAP_M1_FROM_WHITEPAPER>>>`
- `<<<ROADMAP_M2_FROM_WHITEPAPER>>>`
- `<<<ROADMAP_M3_FROM_WHITEPAPER>>>`
- `<<<FAQ_ANSWERS_FROM_WHITEPAPER>>>`

## 🔧 Configuration

Update `config.ts` to customize:
- Token name and symbol
- Blockchain network
- Social media links
- Tokenomics data
- Roadmap milestones

## 📊 Performance

- **Lighthouse Score**: Target ≥90 (Mobile)
- **Accessibility**: Target ≥95
- **Best Practices**: Target ≥95
- **SEO**: Target ≥90

## 🎯 SEO Features

- Meta tags for social sharing
- OpenGraph images
- Structured data (JSON-LD)
- Semantic HTML
- Alt text for images
- Skip-to-content links

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Reduced motion support
- Focus indicators

## 🚀 Deployment

1. Build the project: `pnpm build`
2. Test locally: `pnpm start`
3. Deploy to your preferred platform (Vercel, Netlify, etc.)

## 📞 Support

For questions or issues:
- Check the FAQ section
- Review component documentation
- Contact the development team

## 📄 License

This project is part of the Networkqy ecosystem. See the main project license for details.
