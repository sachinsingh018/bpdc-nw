# AI Chatbot

A modern AI-powered chatbot built with Next.js, TypeScript, and various AI providers.

## Package Manager Support

This project **primarily uses pnpm** but also supports **npm** for local development. Production deployments continue to use pnpm as before.

### Using pnpm (Primary - Recommended)

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

### Using npm (Alternative)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd networkqy
   ```

2. **Install dependencies** (choose one):
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # OR using npm
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server** (choose one):
   ```bash
   # Using pnpm (recommended)
   pnpm dev
   
   # OR using npm
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Environment Variables for Production

For production deployment, make sure to set these environment variables:

```bash
# Required for Socket.IO and authentication
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Database
POSTGRES_URL=your-postgres-connection-string

# Authentication
NEXTAUTH_SECRET=your-secret-key

# Other required variables...
```

### Socket.IO Configuration

The app uses Socket.IO for real-time messaging. The Socket.IO server is automatically configured to:

- Use the current domain for connections
- Support both WebSocket and polling transports
- Handle CORS for production domains
- Automatically reconnect on connection errors

If you encounter Socket.IO connection errors in production:

1. Ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` are set correctly
2. Check that your hosting provider supports WebSocket connections
3. Verify that the `/api/socketio` endpoint is accessible

## Available Scripts

| Script | Description | pnpm | npm |
|--------|-------------|------|-----|
| `dev` | Start development server | `pnpm dev` | `npm run dev` |
| `build` | Build for production | `pnpm build` | `npm run build` |
| `start` | Start production server | `pnpm start` | `npm start` |
| `test` | Run tests | `pnpm test` | `npm test` |
| `lint` | Run linting | `pnpm lint` | `npm run lint` |
| `lint:fix` | Fix linting issues | `pnpm lint:fix` | `npm run lint:fix` |
| `format` | Format code | `pnpm format` | `npm run format` |

## Database Commands

| Command | Description | pnpm | npm |
|---------|-------------|------|-----|
| `db:generate` | Generate database migrations | `pnpm db:generate` | `npm run db:generate` |
| `db:migrate` | Run database migrations | `pnpm db:migrate` | `npm run db:migrate` |
| `db:studio` | Open database studio | `pnpm db:studio` | `npm run db:studio` |
| `db:push` | Push schema changes | `pnpm db:push` | `npm run db:push` |

## Production Deployment

**Important**: Production deployments continue to use pnpm as before. The npm support is only for local development flexibility.

- Production builds use `pnpm-lock.yaml` for exact dependency versions
- All CI/CD pipelines continue to work with pnpm
- No changes to production deployment process

## Switching Between Package Managers

If you want to switch from one package manager to another:

1. **Delete existing lock files and node_modules:**
   ```bash
   rm -rf node_modules
   rm pnpm-lock.yaml package-lock.json
   ```

2. **Install with your preferred package manager:**
   ```bash
   # For pnpm (recommended)
   pnpm install
   
   # OR for npm
   npm install
   ```

## Notes

- **pnpm is the primary package manager** - this ensures consistency with production
- **npm support is additive** - it doesn't break existing pnpm functionality
- All scripts work with both package managers
- The `.npmrc` file ensures npm compatibility
- Playwright tests use pnpm to maintain consistency with production

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **AI**: Various AI providers (OpenAI, Groq, Perplexity, etc.)
- **Testing**: Playwright
- **Linting**: ESLint + Biome
