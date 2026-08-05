# Frappe Theme Studio

Visual drag-and-drop theme editor for Frappe/ERPNext built on the native Frappe Design System.

## Requirements

- **Frappe Framework >= v16.0.0**
- Python >= 3.14
- NodeJS >= 24

> **Note for v16:** Desk Page has been removed in Frappe v16. After installation, manually create a Workspace and add shortcuts to "Theme Gallery" and "Theme Editor" pages.

## Features

- **Theme Profiles**: Light, Dark, High Contrast, Frappe Default, Frappe v16 (Espresso), Blue Ocean, Orange Sunset, Custom
- **Visual Editor**: Live preview on Dashboard, Form, Table, and Login screens
- **Full Component Control**: Colors, Typography, Layout, Buttons, Sidebar, Navbar, Cards, Tables
- **Responsive Preview**: Desktop / Tablet / Mobile + Compare with Frappe Default
- **Assignment**: Site-wide, Per-User, Per-Role, Per-Company
- **Draft & Publish**: Save drafts, undo/redo, version history, backup & restore
- **Accessibility**: WCAG AA compliance, high contrast, large text, color-blind palettes
- **Developer Tools**: Custom CSS/JS, CSS variables, DocType rules, raw JSON
- **System Presets**: Built-in Frappe v16 (Espresso), Blue Ocean, Orange Sunset themes
- **Theme Gallery**: Visual gallery to browse, preview, apply, edit, duplicate and export themes

## Installation

```bash
bench get-app https://github.com/Osamah-sami/frappe_theme_studio
bench --site yoursite.com install-app frappe_theme_studio
bench --site yoursite.com migrate
bench build --app frappe_theme_studio
bench restart
```

## Post-Installation (v16 Required)

Since `Desk Page` is deprecated in v16, create a Workspace manually:

1. Go to **Workspace List** (or type "Workspace" in Awesome Bar)
2. Create a new Workspace named **"Theme Studio"**
3. Add Shortcuts:
   - Link to **Page**: `theme-studio-gallery` (label: "Theme Gallery")
   - Link to **Page**: `theme-studio-editor` (label: "Theme Editor")
   - Link to **DocType**: `Theme Profile`
   - Link to **DocType**: `Theme Assignment`
   - Link to **DocType**: `Theme Studio Settings`
4. Set the Workspace as **Public** so all users can access it

## Usage

### Theme Gallery
- Press `Ctrl+K` and search "Theme Gallery"
- Or navigate to `/desk/theme-studio-gallery`

### Theme Editor
- From the Gallery, click **Edit** on any theme
- Or navigate to `/desk/theme-studio-editor`

## Navigation

| Page | Route |
|------|-------|
| Theme Gallery | `/desk/theme-studio-gallery` |
| Theme Editor | `/desk/theme-studio-editor` |

## License

MIT
