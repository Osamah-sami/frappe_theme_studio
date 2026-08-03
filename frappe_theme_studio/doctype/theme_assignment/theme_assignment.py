import frappe
from frappe.model.document import Document
class ThemeAssignment(Document):
    def validate(self):
        if self.assignment_type == "Site" and self.user: frappe.throw("User should not be set for Site-wide assignment")
        if self.assignment_type == "User" and not self.user: frappe.throw("User is required")
        if self.assignment_type == "Role" and not self.role: frappe.throw("Role is required")
        if self.assignment_type == "Company" and not self.company: frappe.throw("Company is required")
    def on_update(self): frappe.cache().delete_key("theme_studio:assignments")
    def on_trash(self): frappe.cache().delete_key("theme_studio:assignments")
