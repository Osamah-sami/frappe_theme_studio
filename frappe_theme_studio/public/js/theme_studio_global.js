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
                // Update active theme indicator in navbar if exists
                frappe.theme_studio.update_navbar_indicator(r.message.profile_name);
            }
        }
    });
};

frappe.theme_studio.update_navbar_indicator = function(profile_name) {
    if (!profile_name) return;
    let indicator = document.getElementById('ts-navbar-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'ts-navbar-indicator';
        indicator.style.cssText = 'display:flex;align-items:center;gap:6px;margin-left:12px;padding:2px 10px;background:rgba(255,255,255,0.15);border-radius:999px;font-size:11px;color:#fff;cursor:pointer;';
        indicator.title = 'Click to open Theme Gallery';
        indicator.onclick = function() { frappe.set_route('theme-studio-gallery'); };

        // Try to append to navbar
        let navbar = document.querySelector('.navbar-brand') || document.querySelector('.navbar');
        if (navbar) navbar.appendChild(indicator);
    }
    if (indicator) {
        indicator.innerHTML = '<i class="icon-palette" style="font-size:10px;"></i><span>' + profile_name + '</span>';
    }
};

$(document).on('app_ready', function() { 
    frappe.theme_studio.apply_theme(); 
});

frappe.realtime.on('theme_studio:refresh', function() { 
    frappe.theme_studio.apply_theme(); 
    frappe.show_alert(__('Theme updated by administrator'), 5); 
});
