import frappe

def clear_theme_cache():
    frappe.cache().delete_key("theme_studio:active_profile")
    frappe.cache().delete_key("theme_studio:assignments")
    keys = frappe.cache().get_keys("theme_studio:css:*")
    for key in keys: frappe.cache().delete_key(key)
    keys = frappe.cache().get_keys("theme_studio:profile:*")
    for key in keys: frappe.cache().delete_key(key)
