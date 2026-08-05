frappe.provide('frappe.theme_studio');

frappe.theme_studio.Gallery = class ThemeGallery {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.page = wrapper.page;
        this.profiles = [];
        this.active_profile = null;
        this.make();
    }

    make() {
        this.setup_page();
        this.load_active_theme();
        this.load_profiles();
    }

    setup_page() {
        this.page.set_title(__('Theme Gallery'));
        this.page.set_primary_action(__('New Theme'), () => this.create_new_theme(), 'plus');
        this.page.add_button(__('Refresh'), () => { this.load_active_theme(); this.load_profiles(); }, { icon: 'refresh-cw' });

        // Active theme indicator
        this.active_indicator = $(`
            <div class="ts-active-theme-bar">
                <div class="ts-active-info">
                    <span class="ts-label">${__("Active Theme")}:</span>
                    <span class="ts-active-name">${__("Loading...")}</span>
                    <span class="ts-active-badge">${__("System")}</span>
                </div>
                <div class="ts-active-colors">
                    <span class="ts-color-dot ts-brand" title="${__("Brand Color")}"></span>
                    <span class="ts-color-dot ts-accent" title="${__("Accent Color")}"></span>
                </div>
            </div>
        `).appendTo(this.wrapper);

        // Gallery container
        this.gallery = $(`<div class="ts-theme-gallery"></div>`).appendTo(this.wrapper);
    }

    load_active_theme() {
        frappe.call({
            method: 'frappe_theme_studio.api.get_active_theme',
            callback: (r) => {
                if (r.message) {
                    this.active_profile = r.message;
                    this.render_active_theme();
                } else {
                    this.active_indicator.find('.ts-active-name').text(__('None'));
                    this.active_indicator.find('.ts-active-badge').hide();
                }
            }
        });
    }

    render_active_theme() {
        const p = this.active_profile;
        this.active_indicator.find('.ts-active-name').text(p.profile_name);
        this.active_indicator.find('.ts-active-badge')
            .toggle(p.is_system_preset == 1)
            .text(p.is_system_preset ? __('System Preset') : __('Custom'));
        this.active_indicator.find('.ts-brand').css('background-color', p.brand_color || '#171717');
        this.active_indicator.find('.ts-accent').css('background-color', p.accent_color || '#2490EF');
    }

    load_profiles() {
        frappe.call({
            method: 'frappe_theme_studio.api.get_profiles',
            callback: (r) => {
                this.profiles = r.message || [];
                this.render_gallery();
            }
        });
    }

    render_gallery() {
        this.gallery.empty();

        if (this.profiles.length === 0) {
            this.gallery.html(`
                <div class="ts-empty-state">
                    <i class="icon-palette"></i>
                    <h4>${__("No themes found")}</h4>
                    <p>${__("Create your first theme or install system presets.")}</p>
                </div>
            `);
            return;
        }

        const grid = $(`<div class="ts-theme-grid"></div>`).appendTo(this.gallery);

        this.profiles.forEach(profile => {
            const isActive = this.active_profile && this.active_profile.name === profile.name;
            const card = this.render_theme_card(profile, isActive);
            grid.append(card);
        });
    }

    render_theme_card(profile, isActive) {
        const brand = profile.brand_color || '#171717';
        const accent = profile.accent_color || '#2490EF';
        const preset_label = profile.base_preset || profile.profile_name;

        const card = $(`
            <div class="ts-theme-card ${isActive ? 'ts-active' : ''}" data-name="${profile.name}">
                <div class="ts-card-preview">
                    <div class="ts-preview-navbar" style="background: ${brand}">
                        <div class="ts-preview-logo"></div>
                        <div class="ts-preview-icons">
                            <span></span><span></span>
                        </div>
                    </div>
                    <div class="ts-preview-sidebar" style="background: ${brand}">
                        <div class="ts-preview-menu-item active" style="background: ${accent}"></div>
                        <div class="ts-preview-menu-item"></div>
                        <div class="ts-preview-menu-item"></div>
                    </div>
                    <div class="ts-preview-content">
                        <div class="ts-preview-card" style="border-top: 3px solid ${accent}">
                            <div class="ts-preview-line"></div>
                            <div class="ts-preview-line short"></div>
                        </div>
                        <div class="ts-preview-card">
                            <div class="ts-preview-line"></div>
                            <div class="ts-preview-line short"></div>
                        </div>
                    </div>
                </div>
                <div class="ts-card-body">
                    <div class="ts-card-header">
                        <h5 class="ts-card-title">${profile.profile_name}</h5>
                        ${isActive ? `<span class="ts-badge ts-badge-active">${__("ACTIVE")}</span>` : ''}
                        ${profile.is_system_preset ? `<span class="ts-badge ts-badge-system">${__("SYSTEM")}</span>` : ''}
                    </div>
                    <div class="ts-card-colors">
                        <div class="ts-color-swatch" style="background: ${brand}" title="${__("Brand")}: ${brand}"></div>
                        <div class="ts-color-swatch" style="background: ${accent}" title="${__("Accent")}: ${accent}"></div>
                        <span class="ts-preset-name">${preset_label}</span>
                    </div>
                    <div class="ts-card-actions">
                        <button class="btn btn-xs btn-primary ts-btn-apply" data-name="${profile.name}">
                            <i class="icon-check"></i> ${isActive ? __('Applied') : __('Apply')}
                        </button>
                        <button class="btn btn-xs btn-default ts-btn-edit" data-name="${profile.name}">
                            <i class="icon-edit"></i> ${__('Edit')}
                        </button>
                        <div class="ts-dropdown">
                            <button class="btn btn-xs btn-default ts-btn-more">
                                <i class="icon-more-horizontal"></i>
                            </button>
                            <div class="ts-dropdown-menu">
                                <a class="ts-dropdown-item ts-btn-duplicate" data-name="${profile.name}">
                                    <i class="icon-copy"></i> ${__('Duplicate')}
                                </a>
                                <a class="ts-dropdown-item ts-btn-export" data-name="${profile.name}">
                                    <i class="icon-download"></i> ${__('Export JSON')}
                                </a>
                                ${!profile.is_system_preset ? `
                                <a class="ts-dropdown-item ts-btn-delete" data-name="${profile.name}">
                                    <i class="icon-trash-2"></i> ${__('Delete')}
                                </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Bind events
        card.find('.ts-btn-apply').on('click', (e) => {
            e.stopPropagation();
            this.apply_theme(profile.name);
        });

        card.find('.ts-btn-edit').on('click', (e) => {
            e.stopPropagation();
            this.edit_theme(profile.name);
        });

        card.find('.ts-btn-duplicate').on('click', (e) => {
            e.stopPropagation();
            this.duplicate_theme(profile.name);
        });

        card.find('.ts-btn-export').on('click', (e) => {
            e.stopPropagation();
            this.export_theme(profile.name);
        });

        card.find('.ts-btn-delete').on('click', (e) => {
            e.stopPropagation();
            this.delete_theme(profile.name, profile.profile_name);
        });

        // Dropdown toggle
        card.find('.ts-btn-more').on('click', (e) => {
            e.stopPropagation();
            const menu = card.find('.ts-dropdown-menu');
            $('.ts-dropdown-menu').not(menu).hide();
            menu.toggle();
        });

        // Card click to preview
        card.on('click', () => {
            this.preview_theme(profile.name);
        });

        return card;
    }

    apply_theme(name) {
        frappe.confirm(__('Apply this theme? All users will see the change.'), () => {
            frappe.call({
                method: 'frappe_theme_studio.api.set_active_theme',
                args: { profile_name: name },
                callback: (r) => {
                    if (r.message && r.message.success) {
                        frappe.show_alert({
                            message: __('Theme "{0}" applied successfully', [r.message.profile_name]),
                            indicator: 'green'
                        });
                        this.load_active_theme();
                        this.load_profiles();
                    }
                }
            });
        });
    }

    edit_theme(name) {
        frappe.set_route('theme-studio-editor', name);
    }

    preview_theme(name) {
        // Show preview dialog
        const dialog = new frappe.ui.Dialog({
            title: __('Theme Preview'),
            size: 'large',
            fields: [
                { fieldname: 'preview_html', fieldtype: 'HTML' }
            ]
        });

        frappe.call({
            method: 'frappe_theme_studio.api.get_profile',
            args: { name: name },
            callback: (r) => {
                if (r.message) {
                    const p = r.message;
                    const html = `
                        <div class="ts-preview-dialog">
                            <div class="ts-preview-frame" style="background:${p.page_background || '#f4f5f6'};padding:20px;border-radius:8px;">
                                <div style="background:${p.navbar_background || '#fff'};padding:12px 16px;border-radius:${p.global_border_radius || 8}px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-weight:600;color:${p.navbar_text_color || '#1f272e'};font-family:${p.font_family || 'Inter'};">Navbar</div>
                                    <div style="display:flex;gap:8px;">
                                        <span style="width:20px;height:20px;border-radius:50%;background:${p.accent_color || '#2490EF'};"></span>
                                        <span style="width:20px;height:20px;border-radius:50%;background:${p.brand_color || '#171717'};"></span>
                                    </div>
                                </div>
                                <div style="background:${p.card_background || '#fff'};padding:16px;border-radius:${p.global_border_radius || 8}px;border:1px solid ${p.border_color || '#e2e6e9'};margin-bottom:12px;">
                                    <h4 style="color:${p.text_color || '#1f272e'};font-family:${p.font_family || 'Inter'};margin:0 0 8px 0;">Card Title</h4>
                                    <p style="color:${p.text_color || '#1f272e'};opacity:0.7;margin:0;font-family:${p.font_family || 'Inter'};font-size:${p.base_font_size || 14}px;">This is how your content will look with this theme.</p>
                                    <a href="#" style="color:${p.link_color || '#2490EF'};text-decoration:none;">Sample Link</a>
                                </div>
                                <button style="background:${p.brand_color || '#171717'};color:#fff;border:none;padding:8px 16px;border-radius:${p.button_style === 'Pill' ? '999px' : (p.global_border_radius || 8) + 'px'};font-family:${p.font_family || 'Inter'};cursor:pointer;">Primary Button</button>
                            </div>
                        </div>
                    `;
                    dialog.fields_dict.preview_html.$wrapper.html(html);
                }
            }
        });

        dialog.show();
    }

    duplicate_theme(name) {
        frappe.prompt([
            { fieldname: 'new_name', label: __('New Theme Name'), fieldtype: 'Data', reqd: 1 }
        ], (values) => {
            frappe.call({
                method: 'frappe_theme_studio.api.duplicate_profile',
                args: { source: name, new_name: values.new_name },
                callback: (r) => {
                    if (r.message) {
                        frappe.show_alert(__('Theme duplicated'));
                        this.load_profiles();
                    }
                }
            });
        }, __('Duplicate Theme'));
    }

    export_theme(name) {
        frappe.call({
            method: 'frappe_theme_studio.api.get_profile',
            args: { name: name },
            callback: (r) => {
                if (r.message) {
                    const blob = new Blob([JSON.stringify(r.message, null, 2)], {type: 'application/json'});
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${r.message.profile_name}.json`;
                    a.click();
                }
            }
        });
    }

    delete_theme(name, display_name) {
        frappe.confirm(__('Are you sure you want to delete "{0}"?', [display_name]), () => {
            frappe.call({
                method: 'frappe.client.delete',
                args: { doctype: 'Theme Profile', name: name },
                callback: () => {
                    frappe.show_alert(__('Theme deleted'));
                    this.load_profiles();
                }
            });
        });
    }

    create_new_theme() {
        frappe.prompt([
            { fieldname: 'profile_name', label: __('Theme Name'), fieldtype: 'Data', reqd: 1 },
            { fieldname: 'base_preset', label: __('Base Preset'), fieldtype: 'Select', options: '\nFrappe v16 (Espresso)\nBlue Ocean\nOrange Sunset\nLight\nDark\nHigh Contrast', default: 'Frappe v16 (Espresso)' }
        ], (values) => {
            // Create from preset
            frappe.call({
                method: 'frappe_theme_studio.api.get_preset_list',
                callback: (r) => {
                    const presets = r.message || [];
                    if (presets.includes(values.base_preset)) {
                        // Duplicate preset
                        frappe.call({
                            method: 'frappe_theme_studio.api.duplicate_profile',
                            args: { source: values.base_preset, new_name: values.profile_name },
                            callback: (r2) => {
                                if (r2.message) {
                                    frappe.show_alert(__('Theme created'));
                                    this.load_profiles();
                                    this.edit_theme(r2.message);
                                }
                            }
                        });
                    } else {
                        // Create blank
                        frappe.call({
                            method: 'frappe.client.insert',
                            args: {
                                doc: {
                                    doctype: 'Theme Profile',
                                    profile_name: values.profile_name,
                                    base_preset: values.base_preset
                                }
                            },
                            callback: (r2) => {
                                if (r2.message) {
                                    frappe.show_alert(__('Theme created'));
                                    this.load_profiles();
                                    this.edit_theme(r2.message.name);
                                }
                            }
                        });
                    }
                }
            });
        }, __('Create New Theme'));
    }
};

// Close dropdowns on click outside
$(document).on('click', () => {
    $('.ts-dropdown-menu').hide();
});

frappe.pages['theme-studio-gallery'].on_page_load = function(wrapper) {
    frappe.theme_studio.gallery = new frappe.theme_studio.Gallery(wrapper);
};
