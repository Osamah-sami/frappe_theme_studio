import frappe

def on_user_login(login_manager):
    from frappe_theme_studio.api import get_profile_for_user
    profile = get_profile_for_user(frappe.session.user)
    if profile: frappe.cache().set_value(f"theme_studio:user:{frappe.session.user}", profile)
