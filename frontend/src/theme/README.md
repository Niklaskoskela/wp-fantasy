# Theme System Documentation

## Overview

This project uses a comprehensive Material-UI theme system designed specifically for the Water Polo Fantasy application. The theme provides consistent styling, colors, typography, and component customizations.

## Features

- **Water Polo Inspired Colors**: Custom color palette reflecting water sports aesthetics
- **Light/Dark Mode**: Seamless theme switching with context-based management
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Custom Components**: Enhanced Material-UI components with application-specific styling
- **Typography Scale**: Carefully crafted text hierarchy for readability
- **Consistent Spacing**: Systematic spacing using 8px base unit

## Usage

### Basic Theme Usage

```tsx
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
      }}
    >
      Content
    </Box>
  );
}
```

### Theme Toggle

```tsx
import { useThemeContext } from '../theme';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Button onClick={toggleTheme}>
      Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
    </Button>
  );
}
```

### Using Theme Constants

```tsx
import { spacing, waterPoloColors, borderRadius } from '../theme';

function PlayerCard() {
  return (
    <Card
      sx={{
        p: spacing.md,
        borderRadius: borderRadius.lg,
        borderLeft: `4px solid ${waterPoloColors.positions.goalkeeper}`,
      }}
    >
      <CardContent>Player Content</CardContent>
    </Card>
  );
}
```

## Color Palette

### Primary Colors

- **Primary**: `#0066cc` (Water Blue) - Main brand color
- **Secondary**: `#00b8d4` (Cyan) - Accent color
- **Success**: `#2e7d32` (Green) - Positive actions/stats
- **Warning**: `#f57c00` (Orange) - Warnings
- **Error**: `#d32f2f` (Red) - Errors/negative stats

### Water Polo Specific Colors

- **Goalkeeper**: `#ff6b35` (Orange-Red)
- **Defender**: `#004e89` (Navy Blue)
- **Midfielder**: `#1a659e` (Ocean Blue)
- **Attacker**: `#f77b55` (Coral)

## Layout Constants

The theme includes predefined width constraints for consistent layout:

### Width Constants
```typescript
// Maximum width for navigation bar content
export const navMaxWidth = 1300;

// Maximum width for main content areas
export const contentMaxWidth = 1100;
```

### Usage
These constants are automatically applied:
- **Navigation Bar**: Uses `navMaxWidth` (1300px) to constrain the toolbar content
- **Main Container**: Uses `contentMaxWidth` (1100px) via MUI Container theme override
- **Custom Hook**: Available via `useAppLayout()` hook for manual application

```tsx
import { useAppLayout } from '../theme';

function MyComponent() {
  const { contentMaxWidth, navMaxWidth, pageContainerSx } = useAppLayout();
  
  return (
    <Box sx={pageContainerSx}>
      {/* Content automatically constrained to contentMaxWidth */}
    </Box>
  );
}
```

## Typography

The theme uses Roboto font family with the following hierarchy:

- **H1-H6**: Various heading sizes with consistent weight (600)
- **Body1**: Primary body text (1rem, line-height: 1.6)
- **Body2**: Secondary body text (0.875rem, line-height: 1.5)
- **Button**: Transformed text with medium weight (500)

## Component Customizations

### Cards

- Rounded corners (12px)
- Subtle shadows with hover effects
- Smooth transitions

### Buttons

- No text transformation
- Consistent padding and border radius
- Hover effects with elevated shadows

### Navigation

- Custom drawer styling
- Enhanced list item buttons
- Smooth theme transitions

## Responsive Breakpoints

- **xs**: 0px (Mobile)
- **sm**: 600px (Small tablets)
- **md**: 900px (Tablets)
- **lg**: 1200px (Desktop)
- **xl**: 1536px (Large screens)

## File Structure

```
src/theme/
├── index.ts          # Main exports
├── theme.ts          # Theme definitions
├── ThemeProvider.tsx # Context provider
├── constants.ts      # Theme constants
└── README.md         # This documentation
```

## Best Practices

1. **Use theme values**: Always use theme spacing, colors, and breakpoints instead of hardcoded values
2. **Consistent patterns**: Follow established patterns for component styling
3. **Responsive design**: Use theme breakpoints for responsive behavior
4. **Semantic colors**: Use appropriate semantic colors (success, error, warning)
5. **Theme context**: Leverage the theme context for dynamic theme switching

## Examples

Check the `ThemeDemo.tsx` component for live examples of theme usage and visual representations of the color palette and typography scale.
