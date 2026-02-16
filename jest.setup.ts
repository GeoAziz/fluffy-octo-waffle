import '@testing-library/jest-dom';

// Add fetch & Response polyfill for Node environment
global.fetch = jest.fn();
// @ts-ignore Response is not defined in Node
global.Response = class Response {
  constructor(public body: any, public init?: ResponseInit) {}
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
  async text() {
    return String(this.body);
  }
};

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  __esModule: true,
  Heart: () => null,
  Share2: () => null,
  Flag: () => null,
  MapPin: () => null,
  DollarSign: () => null,
  TrendingUp: () => null,
  Check: () => null,
  AlertCircle: () => null,
  Loader2: () => null,
  Upload: () => null,
  X: () => null,
  Eye: () => null,
  Settings: () => null,
  Menu: () => null,
  MessageSquare: () => null,
  Star: () => null,
  Lock: () => null,
  Unlock: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null,
  ChevronRight: () => null,
  Search: () => null,
  Image: () => null,
  Phone: () => null,
  Mail: () => null,
  Home: () => null,
  Plus: () => null,
  Trash2: () => null,
  Edit2: () => null,
}));

// Mock Firebase Admin SDK
jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }),
      add: jest.fn(),
      where: jest.fn().mockReturnValue({
        get: jest.fn(),
        where: jest.fn().mockReturnValue({
          get: jest.fn(),
        }),
      }),
      orderBy: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn(),
        }),
        get: jest.fn(),
      }),
      limit: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
      get: jest.fn(),
    }),
  },
  adminStorage: {
    bucket: jest.fn().mockReturnValue({
      file: jest.fn().mockReturnValue({
        save: jest.fn(),
        delete: jest.fn(),
        getSignedUrl: jest.fn(),
      }),
      upload: jest.fn(),
    }),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

// Mock Firebase client SDK
jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

// Mock shadcn/ui components that use Radix UI primitives
jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => children,
  PopoverTrigger: ({ children }: any) => children,
  PopoverContent: ({ children }: any) => children,
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => children,
  TooltipTrigger: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => children,
  TooltipProvider: ({ children }: any) => children,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-storage-bucket';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-messaging-sender-id';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';

// Suppress console errors/warnings in tests unless explicitly checking for them
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  });

  console.warn = jest.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('useLayoutEffect') ||
        args[0].includes('findDOMNode'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
