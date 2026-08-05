import frappe

def apply_scheduled_themes():
    """Apply themes based on scheduled assignments"""
    now = frappe.utils.now()
    assignments = frappe.get_all("Theme Assignment", 
        filters={"is_active": 1, "schedule_from": ["<=", now], "schedule_to": [">=", now]},
        fields=["name", "theme_profile", "assignment_type", "user", "role", "company"]
    )
    for a in assignments:
        frappe.cache().set_value("theme_studio:active_profile", a.theme_profile)
