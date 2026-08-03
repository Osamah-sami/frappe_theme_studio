app_name = "frappe_theme_studio"
app_title = "Frappe Theme Studio"
app_publisher = "Your Name"
app_description = "Visual Theme Studio for Frappe/ERPNext"
app_email = "your@email.com"
app_license = "MIT"

app_include_js = "/assets/frappe_theme_studio/js/theme_studio_global.js"
app_include_css = "/assets/frappe_theme_studio/css/theme_studio_global.css"

boot_session = "frappe_theme_studio.boot.get_theme_for_session"
update_website_context = "frappe_theme_studio.website_context.update_context"
clear_cache = "frappe_theme_studio.cache.clear_theme_cache"

scheduler_events = {
    "daily": ["frappe_theme_studio.tasks.apply_scheduled_themes"]
}
