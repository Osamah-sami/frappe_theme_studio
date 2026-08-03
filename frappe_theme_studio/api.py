import frappe
from frappe import _
import json

@frappe.whitelist()
def get_profiles():
    return frappe.get_all("Theme Profile", fields=["name", "profile_name", "is_default", "base_preset", "modified"])

@frappe.whitelist()
def get_profile(name):
    return frappe.get_doc("Theme Profile", name).as_dict()

@frappe.whitelist()
def save_draft(profile):
    if isinstance(profile, str): profile = frappe.parse_json(profile)
    doc = frappe.get_doc("Theme Profile", profile.get("name"))
    for key, value in profile.items():
        if hasattr(doc, key) and key not in ["name", "creation", "modified", "modified_by", "owner"]:
            setattr(doc, key, value)
    doc.save(ignore_permissions=True)
    return doc.name

@frappe.whitelist()
def publish_theme(profile):
    if isinstance(profile, str): profile = frappe.parse_json(profile)
    name = save_draft(profile)
    create_theme_backup(name)
    frappe.cache().set_value("theme_studio:active_profile", name)
    doc = frappe.get_doc("Theme Profile", name)
    css = doc.generate_css()
    frappe.cache().set_value(f"theme_studio:css:{name}", css)
    frappe.publish_realtime('theme_studio:refresh', {}, after_commit=True)
    return {"success": True, "profile": name}

@frappe.whitelist()
def get_active_theme_css():
    profile_name = frappe.cache().get_value("theme_studio:active_profile")
    if not profile_name: profile_name = get_profile_for_user(frappe.session.user)
    if not profile_name:
        settings = frappe.get_doc("Theme Studio Settings")
        if settings.default_profile: profile_name = settings.default_profile
    if not profile_name: return {"css": "", "variables": {}}
    css = frappe.cache().get_value(f"theme_studio:css:{profile_name}")
    if not css:
        doc = frappe.get_doc("Theme Profile", profile_name)
        css = doc.generate_css()
        frappe.cache().set_value(f"theme_studio:css:{profile_name}", css)
    doc = frappe.get_doc("Theme Profile", profile_name)
    return {"css": css, "variables": doc.get_css_variables()}

@frappe.whitelist()
def duplicate_profile(source, new_name):
    source_doc = frappe.get_doc("Theme Profile", source)
    new_doc = frappe.copy_doc(source_doc)
    new_doc.profile_name = new_name; new_doc.is_default = 0; new_doc.is_system_preset = 0
    new_doc.insert()
    return new_doc.name

@frappe.whitelist()
def import_profile(json_data):
    data = frappe.parse_json(json_data)
    doc = frappe.get_doc({"doctype": "Theme Profile", **data})
    doc.is_system_preset = 0; doc.insert()
    return doc.name

def get_profile_for_user(user):
    assignment = frappe.db.get_value("Theme Assignment", {"assignment_type": "User", "user": user, "is_active": 1}, "theme_profile")
    if assignment: return assignment
    roles = frappe.get_roles(user)
    for role in roles:
        assignment = frappe.db.get_value("Theme Assignment", {"assignment_type": "Role", "role": role, "is_active": 1}, "theme_profile")
        if assignment: return assignment
    company = frappe.db.get_value("Employee", {"user_id": user}, "company")
    if company:
        assignment = frappe.db.get_value("Theme Assignment", {"assignment_type": "Company", "company": company, "is_active": 1}, "theme_profile")
        if assignment: return assignment
    assignment = frappe.db.get_value("Theme Assignment", {"assignment_type": "Site", "is_active": 1}, "theme_profile")
    return assignment

def create_theme_backup(profile_name):
    backup = frappe.get_doc({
        "doctype": "Theme Profile Backup",
        "theme_profile": profile_name,
        "backup_data": frappe.as_json(frappe.get_doc("Theme Profile", profile_name).as_dict()),
        "created_by": frappe.session.user
    })
    backup.insert(ignore_permissions=True)
    frappe.db.commit()
