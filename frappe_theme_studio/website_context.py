import frappe

def update_context(context):
    try:
        profile_name = frappe.cache().get_value("theme_studio:active_profile")
        if not profile_name:
            profile_name = frappe.db.get_value("Theme Assignment", {"assignment_type": "Site", "is_active": 1}, "theme_profile")
        if profile_name:
            doc = frappe.get_doc("Theme Profile", profile_name)
            context.theme_studio = {
                "login_logo": doc.login_logo, "login_background_type": doc.login_background_type,
                "login_background_image": doc.login_background_image, "login_background_gradient": doc.login_background_gradient,
                "login_card_opacity": doc.login_card_opacity, "login_title": doc.login_title,
                "login_subtitle": doc.login_subtitle, "login_footer": doc.login_footer,
                "show_platform_credit": doc.show_platform_credit, "variables": doc.get_css_variables()
            }
    except Exception: pass
