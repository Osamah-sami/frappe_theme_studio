frappe.ui.form.on('Theme Profile', {
    refresh(frm) {
        frm.add_custom_button(__('Preview'), () => { window.open(`/theme-studio-editor?profile=${frm.doc.name}`, '_blank'); });
        frm.add_custom_button(__('Duplicate'), () => {
            frappe.prompt('New Profile Name', (value) => {
                frappe.call({ method: 'frappe_theme_studio.api.duplicate_profile', args: { source: frm.doc.name, new_name: value },
                    callback(r) { if (r.message) { frappe.show_alert(__('Profile duplicated')); frappe.set_route('Form', 'Theme Profile', r.message); } }
                });
            });
        });
        frm.add_custom_button(__('Export JSON'), () => {
            const blob = new Blob([JSON.stringify(frm.doc, null, 2)], {type: 'application/json'});
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${frm.doc.profile_name}.json`; a.click();
        });
    }
});
