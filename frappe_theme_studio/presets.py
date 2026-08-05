import frappe

def get_system_presets():
    return {
        "Frappe v16 (Espresso)": {
            "profile_name": "Frappe v16 (Espresso)",
            "is_system_preset": 1,
            "is_default": 1,
            "design_system": "Frappe v15+ (Vue)",
            "base_preset": "Frappe v16 (Espresso)",
            "brand_color": "#171717",
            "accent_color": "#2490EF",
            "page_background": "#f4f5f6",
            "card_background": "#ffffff",
            "text_color": "#1f272e",
            "link_color": "#2490EF",
            "border_color": "#e2e6e9",
            "navbar_background": "#ffffff",
            "navbar_text_color": "#1f272e",
            "navbar_icon_color": "#687178",
            "navbar_active_color": "#171717",
            "navbar_hover_color": "#f4f5f6",
            "sidebar_width": 240,
            "sidebar_mode": "Expanded",
            "auto_collapse_sidebar": 0,
            "logo_placement": "Sidebar",
            "font_family": "Inter, sans-serif",
            "base_font_size": 14,
            "heading_font_size": 24,
            "label_font_size": 12,
            "table_font_size": 13,
            "font_weight": "400",
            "line_height": 1.5,
            "layout_mode": "Full Width",
            "page_margin": 24,
            "card_gap": 16,
            "global_border_radius": 8,
            "header_height": 48,
            "sticky_regions": 1,
            "button_style": "Rounded",
            "input_style": "Outline",
            "checkbox_style": "Default",
            "table_density": "Comfortable",
            "card_shadow": "Medium",
            "card_surface": "Elevated",
            "login_background_type": "Color",
            "login_card_opacity": 1.0,
            "show_platform_credit": 1,
            "wcag_compliance": "AA",
            "high_contrast": 0,
            "large_text": 0,
            "focus_outline": 1,
            "color_blind_palette": "None",
            "custom_css": "",
            "custom_js": "",
            "css_variables": "",
            "raw_json": ""
        },
        "Blue Ocean": {
            "profile_name": "Blue Ocean",
            "is_system_preset": 1,
            "is_default": 0,
            "design_system": "Frappe v15+ (Vue)",
            "base_preset": "Blue Ocean",
            "brand_color": "#1e40af",
            "accent_color": "#3b82f6",
            "page_background": "#eff6ff",
            "card_background": "#ffffff",
            "text_color": "#1e293b",
            "link_color": "#2563eb",
            "border_color": "#dbeafe",
            "navbar_background": "#1e3a8a",
            "navbar_text_color": "#ffffff",
            "navbar_icon_color": "#93c5fd",
            "navbar_active_color": "#60a5fa",
            "navbar_hover_color": "#1d4ed8",
            "sidebar_width": 240,
            "sidebar_mode": "Expanded",
            "auto_collapse_sidebar": 0,
            "logo_placement": "Sidebar",
            "font_family": "Inter, sans-serif",
            "base_font_size": 14,
            "heading_font_size": 24,
            "label_font_size": 12,
            "table_font_size": 13,
            "font_weight": "400",
            "line_height": 1.5,
            "layout_mode": "Full Width",
            "page_margin": 24,
            "card_gap": 16,
            "global_border_radius": 8,
            "header_height": 48,
            "sticky_regions": 1,
            "button_style": "Rounded",
            "input_style": "Outline",
            "checkbox_style": "Default",
            "table_density": "Comfortable",
            "card_shadow": "Medium",
            "card_surface": "Elevated",
            "login_background_type": "Gradient",
            "login_background_gradient": "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            "login_card_opacity": 0.95,
            "show_platform_credit": 1,
            "wcag_compliance": "AA",
            "high_contrast": 0,
            "large_text": 0,
            "focus_outline": 1,
            "color_blind_palette": "None",
            "custom_css": "",
            "custom_js": "",
            "css_variables": "",
            "raw_json": ""
        },
        "Orange Sunset": {
            "profile_name": "Orange Sunset",
            "is_system_preset": 1,
            "is_default": 0,
            "design_system": "Frappe v15+ (Vue)",
            "base_preset": "Orange Sunset",
            "brand_color": "#c2410c",
            "accent_color": "#f97316",
            "page_background": "#fff7ed",
            "card_background": "#ffffff",
            "text_color": "#431407",
            "link_color": "#ea580c",
            "border_color": "#fed7aa",
            "navbar_background": "#9a3412",
            "navbar_text_color": "#ffffff",
            "navbar_icon_color": "#fdba74",
            "navbar_active_color": "#fb923c",
            "navbar_hover_color": "#7c2d12",
            "sidebar_width": 240,
            "sidebar_mode": "Expanded",
            "auto_collapse_sidebar": 0,
            "logo_placement": "Sidebar",
            "font_family": "Inter, sans-serif",
            "base_font_size": 14,
            "heading_font_size": 24,
            "label_font_size": 12,
            "table_font_size": 13,
            "font_weight": "400",
            "line_height": 1.5,
            "layout_mode": "Full Width",
            "page_margin": 24,
            "card_gap": 16,
            "global_border_radius": 10,
            "header_height": 48,
            "sticky_regions": 1,
            "button_style": "Rounded",
            "input_style": "Outline",
            "checkbox_style": "Default",
            "table_density": "Comfortable",
            "card_shadow": "Medium",
            "card_surface": "Elevated",
            "login_background_type": "Gradient",
            "login_background_gradient": "linear-gradient(135deg, #c2410c 0%, #f97316 100%)",
            "login_card_opacity": 0.95,
            "show_platform_credit": 1,
            "wcag_compliance": "AA",
            "high_contrast": 0,
            "large_text": 0,
            "focus_outline": 1,
            "color_blind_palette": "None",
            "custom_css": "",
            "custom_js": "",
            "css_variables": "",
            "raw_json": ""
        }
    }


def create_system_presets():
    """Create or update system preset themes on install/migrate"""
    presets = get_system_presets()

    for name, data in presets.items():
        if not frappe.db.exists("Theme Profile", name):
            doc = frappe.get_doc({
                "doctype": "Theme Profile",
                **data
            })
            doc.insert(ignore_permissions=True)
            frappe.db.commit()
        else:
            doc = frappe.get_doc("Theme Profile", name)
            changed = False
            for key, value in data.items():
                if hasattr(doc, key) and getattr(doc, key) != value:
                    setattr(doc, key, value)
                    changed = True
            if changed:
                doc.save(ignore_permissions=True)
                frappe.db.commit()

    if not frappe.db.get_value("Theme Profile", {"is_default": 1}, "name"):
        frappe.db.set_value("Theme Profile", "Frappe v16 (Espresso)", "is_default", 1)
        frappe.db.commit()


def reset_to_preset(profile_name):
    """Reset a profile to its original preset values"""
    presets = get_system_presets()
    if profile_name not in presets:
        frappe.throw(f"Preset '{profile_name}' not found")

    data = presets[profile_name]
    return data
