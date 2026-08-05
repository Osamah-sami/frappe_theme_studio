# Frappe Theme Studio

Visual drag-and-drop theme editor for Frappe/ERPNext built on the native Frappe Design System.

## Features
- **Theme Profiles**: Light, Dark, High Contrast, Frappe Default, Custom
- **Visual Editor**: Live preview on Dashboard, Form, Table, and Login screens
- **Full Component Control**: Colors, Typography, Layout, Buttons, Sidebar, Navbar, Cards, Tables
- **Responsive Preview**: Desktop / Tablet / Mobile + Compare with Frappe Default
- **Assignment**: Site-wide, Per-User, Per-Role, Per-Company
- **Draft & Publish**: Save drafts, undo/redo, version history, backup & restore
- **Accessibility**: WCAG AA compliance, high contrast, large text, color-blind palettes
- **Developer Tools**: Custom CSS/JS, CSS variables, DocType rules, raw JSON

## Installation

```bash
bench get-app https://github.com/Osamah-sami/frappe_theme_studio
bench --site yoursite.com install-app frappe_theme_studio
bench build --app frappe_theme_studio
bench restart
```

## Usage

Open Theme Studio from the desk:
- Press `Ctrl+K` and search "Theme Studio"
- Or navigate to `/app/theme-studio`

## License
MIT
