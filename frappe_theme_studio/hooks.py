app_name = "frappe_theme_studio"
app_title = "Frappe Theme Studio"
app_publisher = "Your Name"
app_description = "Visual Theme Studio for Frappe/ERPNext"
app_email = "your@email.com"
app_license = "MIT"

# App branding
app_logo_url = "/assets/frappe_theme_studio/images/app_logo.png"
app_icon = "palette"

app_include_js = "/assets/frappe_theme_studio/js/theme_studio_global.js"
app_include_css = "/assets/frappe_theme_studio/css/theme_studio_global.css"

page_js = {
    "theme-studio-editor": "public/js/theme_studio.js",
    "theme-studio-gallery": "public/js/theme_gallery.js"
}

page_css = {
    "theme-studio-editor": "public/css/theme_studio.css",
    "theme-studio-gallery": "public/css/theme_studio.css"
}

boot_session = "frappe_theme_studio.boot.get_theme_for_session"
update_website_context = "frappe_theme_studio.website_context.update_context"
clear_cache = "frappe_theme_studio.cache.clear_theme_cache"

scheduler_events = {
    "daily": ["frappe_theme_studio.tasks.apply_scheduled_themes"]
}

# Create system presets on install and migrate
after_install = "frappe_theme_studio.presets.create_system_presets"
after_migrate = "frappe_theme_studio.presets.create_system_presets"

# Note: Desk Page is deprecated in Frappe v16.
# After installation, manually create a Workspace with shortcuts to:
#   - theme-studio-gallery (Theme Gallery)
#   - theme-studio-editor (Theme Editor)
#   - DocType: Theme Profile
#   - DocType: Theme Assignment
#   - DocType: Theme Studio Settings
