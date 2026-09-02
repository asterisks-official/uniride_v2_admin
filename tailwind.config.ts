import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  // One glob over all of src. The scaffold listed pages/components/app only,
  // which silently dropped every class used exclusively inside src/features —
  // the feature folders are where most of the UI lives, so a large part of the
  // styling was simply never emitted.
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
      transitionTimingFunction: {
        // The one easing curve the landing page uses. Named rather than
        // written inline at each call site: an arbitrary `ease-[cubic-bezier()]`
        // value is ambiguous to Tailwind's parser (it warns), and three copies
        // of the same magic numbers drift the moment one of them is tweaked.
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        border: 'hsl(var(--border))',
        'primary-deep': 'hsl(var(--primary-deep))',
        'primary-wash': 'hsl(var(--primary-wash))',
        success: {
          DEFAULT: 'hsl(var(--success))',
          wash: 'hsl(var(--success-wash))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          wash: 'hsl(var(--warning-wash))',
        },
        shell: {
          DEFAULT: 'hsl(var(--shell))',
          foreground: 'hsl(var(--shell-foreground))',
          muted: 'hsl(var(--shell-muted))',
          hover: 'hsl(var(--shell-hover))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          wash: 'hsl(var(--destructive-wash))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
