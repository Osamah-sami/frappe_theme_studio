
frappe.provide('frappe.theme_studio');
frappe.theme_studio.apply_theme = function() {
    frappe.call({
        method: 'frappe_theme_studio.api.get_active_theme_css',
        callback: function(r) {
            if (r.message && r.message.css) {
                let style = document.getElementById('frappe-theme-studio-style');
                if (!style) { style = document.createElement('style'); style.id = 'frappe-theme-studio-style'; document.head.appendChild(style); }
                style.textContent = r.message.css;
                if (r.message.variables) {
                    Object.entries(r.message.variables).forEach(([key, val]) => { document.documentElement.style.setProperty(key, val); });
                }
            }
        }
    });
};
$(document).on('app_ready', function() { frappe.theme_studio.apply_theme(); });
frappe.realtime.on('theme_studio:refresh', function() { frappe.theme_studio.apply_theme(); frappe.show_alert(__('Theme updated by administrator'), 5); });
