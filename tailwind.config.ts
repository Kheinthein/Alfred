import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Zone d'écriture (Papier ancien)
        parchment: {
          bg: '#F5F1E8', // Fond principal beige crème
          editor: '#FAF8F3', // Fond éditeur blanc cassé
          border: '#D4C5B0', // Bordures beige grisé
          shadow: '#E8DCC6', // Ombres sépia léger
          text: '#3D2817', // Texte brun sépia foncé
          textDark: '#2C2C2C', // Texte noir charbon
        },
        // Zone IA (Moderne)
        ai: {
          primary: '#6B46C1', // Violet moderne
          primaryAlt: '#3B82F6', // Bleu électrique
          accent: '#06B6D4', // Cyan
          accentAlt: '#EC4899', // Magenta
          bg: '#F9FAFB', // Fond panel gris très clair
          bgPure: '#FFFFFF', // Blanc pur
          text: '#374151', // Texte gris foncé
        },
        // Actions et états
        action: {
          success: '#166534', // Vert forêt
          error: '#991B1B', // Rouge brique
          warning: '#D97706', // Orange ambré
          link: '#4F46E5', // Bleu indigo
        },
        // Couleurs neutres
        neutral: {
          bg: '#FAF9F7', // Fond général beige très clair
          bgSecondary: '#FFFEF9', // Fond secondaire crème
          text: '#1F1B16', // Texte principal brun foncé
          textSecondary: '#5C4A37', // Texte secondaire brun moyen
          border: '#D4C5B0', // Bordures beige grisé
        },
        // Chat IA
        chat: {
          user: '#F5E6D3', // Bulles utilisateur beige clair
          ai: '#A78BFA', // Bulles IA violet clair
          aiAlt: '#93C5FD', // Bulles IA bleu clair
        },
        // Variables CSS pour compatibilité
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        // Zone d'écriture - Serif élégante
        writing: ['Georgia', 'Merriweather', 'Lora', 'Crimson Text', 'serif'],
        // Zone IA et interface - Sans-serif moderne
        interface: ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
