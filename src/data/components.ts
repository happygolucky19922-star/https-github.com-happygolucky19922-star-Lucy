
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  MousePointer2, 
  Table, 
  CheckSquare, 
  BarChart, 
  Calendar,
  Layers,
  Zap,
  Shield,
  Search,
  MessageCircle,
  Database
} from 'lucide-react';

export interface ForgeComponent {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'Structure' | 'Input' | 'Display' | 'Logic' | 'Module';
  prompt: string;
}

export const FORGE_COMPONENTS: ForgeComponent[] = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Impactful header with large text and CTA.',
    icon: Layout,
    category: 'Structure',
    prompt: 'Add a high-impact Hero section with a modern title, description, and an primary action button using Tailwind and motion.'
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    description: 'Display key highlights in a bento-style grid.',
    icon: Layers,
    category: 'Structure',
    prompt: 'Implement a Feature Grid with cards showing icons, titles, and descriptions. Style with subtle glassmorphism.'
  },
  {
    id: 'auth-form',
    name: 'Auth Module',
    description: 'Complete login/signup form logic.',
    icon: Shield,
    category: 'Module',
    prompt: 'Build a secure, client-side Auth form with validation for Email and Password fields.'
  },
  {
    id: 'data-table',
    name: 'Smart Table',
    description: 'Dynamic table with search and filters.',
    icon: Table,
    category: 'Display',
    prompt: 'Generate a dynamic Data Table with sorting, filtering, and a search header.'
  },
  {
    id: 'analytics-card',
    name: 'Analytics Card',
    description: 'Visual data representation with sparklines.',
    icon: BarChart,
    category: 'Display',
    prompt: 'Create an Analytics Card showing a metric, a percentage change indicator, and a small area chart using Recharts or SVG.'
  },
  {
    id: 'chat-interface',
    name: 'Chat Console',
    description: 'Interactive messaging window component.',
    icon: MessageCircle,
    category: 'Module',
    prompt: 'Develop an interactive Chat Console with message history, bot replies simulation, and a sticky input bar.'
  },
  {
     id: 'ai-search',
     name: 'AI Search Bar',
     description: 'Intelligent search with suggestions.',
     icon: Search,
     category: 'Logic',
     prompt: 'Implement an AI-powered Search Bar with autocomplete suggestions and recent search history.'
  },
  {
     id: 'cloud-db',
     name: 'Sovereign DB',
     description: 'Local persistence layer for states.',
     icon: Database,
     category: 'Logic',
     prompt: 'Set up a local persistence layer using localStorage that syncs application state across sessions automatically.'
  }
];
