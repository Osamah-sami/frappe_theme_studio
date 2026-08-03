import frappe
from frappe.utils import now

def apply_scheduled_themes():
    assignments = frappe.get_all("Theme Assignment", filters={
        "is_active": 1, "schedule_from": ["<=", now()], "schedule_to": [">=", now()]
    }, fields=["name", "theme_profile"])
    for assignment in assignments:
        frappe.cache().set_value("theme_studio:active_profile", assignment.theme_profile)
        frappe.publish_realtime('theme_studio:refresh', {})
