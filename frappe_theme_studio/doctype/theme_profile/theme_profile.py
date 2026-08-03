import frappe
from frappe.model.document import Document

class ThemeProfile(Document):
    def validate(self):
        if self.is_default:
            frappe.db.sql("UPDATE `tabTheme Profile` SET is_default = 0 WHERE name != %s", self.name)
    def on_update(self): self.clear_theme_cache()
    def on_trash(self): self.clear_theme_cache()
    def clear_theme_cache(self):
        frappe.cache().delete_key("theme_studio:active_profile")
        frappe.cache().delete_key(f"theme_studio:profile:{self.name}")
    def get_css_variables(self):
        variables = {
            "--brand-color": self.brand_color or "#171717",
            "--accent-color": self.accent_color or "#2490EF",
            "--page-background": self.page_background or "#f4f5f6",
            "--card-background": self.card_background or "#ffffff",
            "--text-color": self.text_color or "#1f272e",
            "--link-color": self.link_color or "#2490EF",
            "--border-color": self.border_color or "#e2e6e9",
            "--navbar-background": self.navbar_background or "#ffffff",
            "--navbar-text-color": self.navbar_text_color or "#1f272e",
            "--sidebar-width": f"{self.sidebar_width or 240}px",
            "--font-family": self.font_family or "Inter, sans-serif",
            "--base-font-size": f"{self.base_font_size or 14}px",
            "--global-border-radius": f"{self.global_border_radius or 8}px",
            "--header-height": f"{self.header_height or 48}px",
        }
        if self.css_variables:
            try: variables.update(frappe.parse_json(self.css_variables))
            except: pass
        return variables
    def generate_css(self):
        vars_css = "\n".join([f"{k}: {v};" for k, v in self.get_css_variables().items()])
        return f"""
:root {{ {vars_css} }}
body {{ font-family: var(--font-family); font-size: var(--base-font-size); background-color: var(--page-background); color: var(--text-color); }}
.navbar {{ background-color: var(--navbar-background) !important; color: var(--navbar-text-color) !important; height: var(--header-height); }}
.sidebar {{ width: var(--sidebar-width); }}
.btn-primary {{ background-color: var(--brand-color); border-color: var(--brand-color); }}
{self.custom_css or ''}
        """
