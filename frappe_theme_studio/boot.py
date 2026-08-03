import frappe

def get_theme_for_session(bootinfo):
    try:
        from frappe_theme_studio.api import get_profile_for_user
        profile_name = frappe.cache().get_value("theme_studio:active_profile")
        if not profile_name: profile_name = get_profile_for_user(frappe.session.user)
        if not profile_name:
            settings = frappe.get_doc("Theme Studio Settings")
            if settings.default_profile: profile_name = settings.default_profile
        if profile_name:
            doc = frappe.get_doc("Theme Profile", profile_name)
            bootinfo.theme_studio = {
                "active_profile": profile_name,
                "variables": doc.get_css_variables(),
                "css": doc.generate_css()
            }
    except Exception: pass
