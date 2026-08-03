import frappe
from frappe import _
def get_context(context):
    context.no_header = True; context.no_sidebar = True; context.title = _("Theme Studio")
    context.profiles = frappe.get_all("Theme Profile", fields=["name", "profile_name", "is_default", "base_preset"])
    context.active_profile = frappe.cache().get_value("theme_studio:active_profile") or "Frappe Default"
    return context
