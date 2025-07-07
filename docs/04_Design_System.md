# Design System

## Overview

CryptoTrader Pro uses a comprehensive design system built on modern CSS technologies, ensuring consistency, accessibility, and maintainability across the entire platform.

## Design Tokens

### Color Palette

#### Primary Colors (HSL Values)
```css
:root {
  /* Primary Brand Colors */
  --primary: 245 92% 53%;           /* Electric Blue #2563eb */
  --primary-foreground: 0 0% 98%;   /* Near White #fafafa */
  --primary-glow: 245 100% 70%;     /* Lighter Blue #4285f4 */
  
  /* Secondary Colors */
  --secondary: 210 40% 10%;         /* Dark Blue #0f172a */
  --secondary-foreground: 210 40% 98%; /* Light Blue #f8fafc */
  
  /* Accent Colors */
  --accent: 270 95% 75%;            /* Purple #a855f7 */
  --accent-foreground: 270 100% 10%; /* Dark Purple #1a0b2e */
}
```

#### Crypto-Specific Colors
```css
:root {
  /* Trading Colors */
  --crypto-success: 142 76% 36%;    /* Green #10b981 */
  --crypto-danger: 0 84% 60%;       /* Red #ef4444 */
  --crypto-warning: 38 92% 50%;     /* Orange #f59e0b */
  --crypto-info: 199 89% 48%;       /* Blue #0ea5e9 */
  
  /* Market Colors */
  --crypto-buy: 142 76% 36%;        /* Green for buy orders */
  --crypto-sell: 0 84% 60%;         /* Red for sell orders */
  --crypto-neutral: 215 28% 17%;    /* Gray for neutral states */
}
```

#### Background & Surface Colors
```css
:root {
  /* Background System */
  --background: 222 84% 5%;         /* Deep Dark #020817 */
  --foreground: 210 40% 98%;        /* Light Text #f8fafc */
  
  /* Card System */
  --card: 222 47% 11%;              /* Card Background #1e293b */
  --card-foreground: 210 40% 98%;   /* Card Text #f8fafc */
  
  /* Muted Elements */
  --muted: 215 28% 17%;             /* Muted Background #334155 */
  --muted-foreground: 215 20% 65%;  /* Muted Text #64748b */
  
  /* Borders */
  --border: 215 28% 17%;            /* Border Color #334155 */
  --input: 215 28% 17%;             /* Input Background #334155 */
  --ring: 245 92% 53%;              /* Focus Ring #2563eb */
}
```

### Gradients

#### Crypto Card Gradient
```css
.crypto-card-gradient {
  background: linear-gradient(
    135deg,
    hsl(var(--card)) 0%,
    hsl(var(--card) / 0.8) 50%,
    hsl(var(--primary) / 0.1) 100%
  );
  border: 1px solid hsl(var(--border));
  backdrop-filter: blur(8px);
}
```

#### Success/Danger Gradients
```css
.success-gradient {
  background: linear-gradient(
    135deg,
    hsl(var(--crypto-success) / 0.1) 0%,
    hsl(var(--crypto-success) / 0.05) 100%
  );
}

.danger-gradient {
  background: linear-gradient(
    135deg,
    hsl(var(--crypto-danger) / 0.1) 0%,
    hsl(var(--crypto-danger) / 0.05) 100%
  );
}
```

### Typography

#### Font Families
```css
:root {
  /* Primary Font Stack */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* Monospace for Numbers */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  
  /* Heading Font */
  --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
}
```

#### Font Sizes & Weights
```css
/* Font Size Scale */
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */

/* Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Spacing System

#### Base Spacing Scale
```css
/* Spacing Scale (rem units) */
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
```

#### Component Spacing
```css
/* Card Padding */
.card-padding-sm { padding: var(--spacing-4); }      /* 16px */
.card-padding-md { padding: var(--spacing-6); }      /* 24px */
.card-padding-lg { padding: var(--spacing-8); }      /* 32px */

/* Section Spacing */
.section-spacing { margin-bottom: var(--spacing-12); } /* 48px */
.component-spacing { margin-bottom: var(--spacing-6); } /* 24px */
```

### Shadows & Effects

#### Shadow System
```css
/* Shadow Levels */
--shadow-sm: 0 1px 2px 0 hsl(0 0% 0% / 0.05);
--shadow-md: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.06);
--shadow-lg: 0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -2px hsl(0 0% 0% / 0.05);
--shadow-xl: 0 20px 25px -5px hsl(0 0% 0% / 0.1), 0 10px 10px -5px hsl(0 0% 0% / 0.04);

/* Crypto-specific Glows */
--glow-success: 0 0 20px hsl(var(--crypto-success) / 0.3);
--glow-danger: 0 0 20px hsl(var(--crypto-danger) / 0.3);
--glow-primary: 0 0 20px hsl(var(--primary) / 0.3);
```

#### Border Radius
```css
/* Border Radius Scale */
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Fully rounded */
```

## UI Guidelines

### Button System

#### Primary Buttons
```css
.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Trading Buttons
```css
.btn-buy {
  background: hsl(var(--crypto-success));
  color: white;
  border: 1px solid hsl(var(--crypto-success));
}

.btn-sell {
  background: hsl(var(--crypto-danger));
  color: white;
  border: 1px solid hsl(var(--crypto-danger));
}
```

### Card Components

#### Standard Cards
```css
.card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.crypto-card {
  background: linear-gradient(
    135deg,
    hsl(var(--card)) 0%,
    hsl(var(--primary) / 0.05) 100%
  );
  border: 1px solid hsl(var(--border));
  backdrop-filter: blur(8px);
}
```

### Form Elements

#### Input Fields
```css
.input {
  background: hsl(var(--input));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  color: hsl(var(--foreground));
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
}
```

#### Select Dropdowns
```css
.select {
  background: hsl(var(--input));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  position: relative;
}

.select-content {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 50;
}
```

## Component Library

### Navigation Components

#### Header Navigation
- **Design**: Fixed top navigation with logo, tab menu, and user profile
- **Spacing**: 16px vertical padding, 24px horizontal padding
- **Background**: Translucent with backdrop blur
- **States**: Active tab highlight with primary color

#### Tab Navigation
- **Design**: Horizontal tab strip with active state indicators
- **Spacing**: 12px vertical padding, 20px horizontal padding per tab
- **Active State**: Bottom border in primary color
- **Hover State**: Background color change with transition

### Data Display Components

#### Charts and Graphs
- **Color Scheme**: Success green for positive, danger red for negative
- **Grid Lines**: Subtle gray with 0.1 opacity
- **Axes**: Clean sans-serif labels
- **Tooltips**: Dark background with white text

#### Tables
- **Header**: Semi-bold text with bottom border
- **Rows**: Alternating background for better readability
- **Hover States**: Subtle background color change
- **Sorting**: Arrow indicators for sortable columns

### Trading-Specific Components

#### Price Display
- **Large Numbers**: Monospace font for alignment
- **Color Coding**: Green for gains, red for losses
- **Percentage Changes**: Parentheses with +/- indicators
- **Animations**: Smooth transitions for price updates

#### Trading Forms
- **Input Groups**: Labeled inputs with validation states
- **Button Groups**: Buy/sell button pairs with appropriate colors
- **Sliders**: Custom-styled range inputs
- **Toggles**: Switch components for settings

## Accessibility Standards

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio for normal text
- **Large Text**: Minimum 3:1 contrast ratio for 18px+ text
- **Interactive Elements**: Minimum 3:1 contrast ratio for focus states
- **Graphics**: Important graphics maintain 3:1 contrast ratio

### Keyboard Navigation
- **Tab Order**: Logical focus flow through interactive elements
- **Focus Indicators**: Clear visual focus states on all interactive elements
- **Skip Links**: Navigation shortcuts for screen readers
- **Escape Routes**: Ability to close modals and overlays with ESC key

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **ARIA Labels**: Descriptive labels for complex interactive elements
- **Alt Text**: Meaningful alternative text for images and icons
- **Live Regions**: Announcements for dynamic content updates

### Responsive Design
- **Mobile First**: Design starts with mobile constraints
- **Breakpoints**: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- **Touch Targets**: Minimum 44px for interactive elements
- **Viewport**: Proper viewport meta tag configuration

## Implementation Guidelines

### CSS Organization
```
styles/
├── globals.css           # Global styles and CSS variables
├── components/           # Component-specific styles
├── utilities/            # Utility classes
└── themes/              # Theme variations
```

### Class Naming Convention
- **Components**: PascalCase for React components
- **CSS Classes**: kebab-case for custom CSS classes
- **Utility Classes**: Tailwind CSS naming convention
- **State Classes**: is- prefix for state classes (is-active, is-disabled)

### Performance Considerations
- **CSS Purging**: Remove unused styles in production
- **Critical CSS**: Inline critical styles for above-the-fold content
- **Font Loading**: Optimize font loading with font-display: swap
- **Color Functions**: Use CSS custom properties for dynamic theming

### Theme Customization
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        'crypto-success': 'hsl(var(--crypto-success))',
        'crypto-danger': 'hsl(var(--crypto-danger))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

---

*This design system serves as the foundation for all UI development in CryptoTrader Pro, ensuring consistency and maintainability across the platform.*