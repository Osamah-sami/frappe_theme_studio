import frappe

def on_login(login_manager):
    frappe.theme_studio.apply_theme()
