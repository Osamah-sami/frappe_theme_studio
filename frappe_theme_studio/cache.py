import frappe

def clear_theme_cache():
    frappe.cache().delete_key("theme_studio:active_profile")
    frappe.cache().delete_key("theme_studio:css:*")
