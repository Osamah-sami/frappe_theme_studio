
frappe.provide('frappe.theme_studio');
frappe.theme_studio.Editor = class ThemeStudioEditor {
    constructor(wrapper) {
        this.wrapper = wrapper; this.page = wrapper.page; this.profiles = []; this.current_profile = null;
        this.history = []; this.history_index = -1; this.preview_mode = 'desktop'; this.preview_scene = 'dashboard';
        this.make();
    }
    make() {
        this.setup_page(); this.load_profiles(); this.setup_sidebar(); this.setup_preview();
    }
    setup_page() {
        this.page.set_title(__('Theme Studio'));
        this.page.set_primary_action(__('Publish'), () => this.publish(), 'check');
        this.page.set_secondary_action(__('Save Draft'), () => this.save_draft(), 'save');
        this.page.add_button(__('Undo'), () => this.undo(), { icon: 'undo' });
        this.page.add_button(__('Redo'), () => this.redo(), { icon: 'redo' });
        this.page.add_button(__('Reset'), () => this.reset(), { icon: 'refresh-cw' });
        this.page.add_menu_item(__('Import Profile'), () => this.import_profile());
        this.page.add_menu_item(__('Export Profile'), () => this.export_profile());
        this.page.add_menu_item(__('Compare with Default'), () => this.compare_default());
    }
    setup_sidebar() {
        this.sidebar = $(`
            <div class="theme-studio-sidebar">
                <div class="sidebar-search"><input type="text" placeholder="${__("Search controls...")}" class="form-control"></div>
                <div class="sidebar-sections">${this.get_sidebar_sections()}</div>
            </div>
        `).appendTo(this.wrapper);
        this.bind_sidebar_events();
    }
    get_sidebar_sections() {
        const sections = [
            { id: 'colors', label: __('Main Colours'), icon: 'color' },
            { id: 'navbar', label: __('Navbar & Sidebar'), icon: 'menu' },
            { id: 'buttons', label: __('Buttons & Fields'), icon: 'mouse-pointer' },
            { id: 'typography', label: __('Typography'), icon: 'type' },
            { id: 'cards', label: __('Cards, Lists & Tables'), icon: 'grid' },
            { id: 'workspace', label: __('Workspace & Dashboard'), icon: 'layout' },
            { id: 'login', label: __('Login & Branding'), icon: 'log-in' },
            { id: 'layout', label: __('Layout'), icon: 'maximize' },
            { id: 'accessibility', label: __('Accessibility'), icon: 'eye' },
            { id: 'developer', label: __('Developer Options'), icon: 'code' }
        ];
        return sections.map((s, i) => `
            <div class="sidebar-section ${i === 0 ? 'active' : ''}" data-section="${s.id}">
                <div class="section-header"><span class="section-number">${String(i + 1).padStart(2, '0')}</span><span class="section-label">${s.label}</span></div>
                <div class="section-controls"></div>
            </div>
        `).join('');
    }
    bind_sidebar_events() {
        this.sidebar.find('.section-header').on('click', (e) => {
            const $section = $(e.currentTarget).closest('.sidebar-section');
            $section.toggleClass('active').siblings().removeClass('active');
            this.load_section_controls($section.data('section'));
        });
    }
    load_section_controls(section) {
        const controls = this.get_controls_for_section(section);
        const $container = this.sidebar.find('.sidebar-section.active .section-controls');
        $container.empty();
        controls.forEach(ctrl => { $container.append(this.render_control(ctrl)); });
    }
    get_controls_for_section(section) {
        const map = {
            colors: [
                { fieldname: 'brand_color', label: 'Brand Color', fieldtype: 'Color' },
                { fieldname: 'accent_color', label: 'Accent Color', fieldtype: 'Color' },
                { fieldname: 'page_background', label: 'Page Background', fieldtype: 'Color' },
                { fieldname: 'card_background', label: 'Card Background', fieldtype: 'Color' },
                { fieldname: 'text_color', label: 'Text Color', fieldtype: 'Color' },
                { fieldname: 'link_color', label: 'Link Color', fieldtype: 'Color' },
                { fieldname: 'border_color', label: 'Border Color', fieldtype: 'Color' }
            ],
            navbar: [
                { fieldname: 'navbar_background', label: 'Background', fieldtype: 'Color' },
                { fieldname: 'navbar_text_color', label: 'Text Color', fieldtype: 'Color' },
                { fieldname: 'sidebar_width', label: 'Sidebar Width', fieldtype: 'Int' },
                { fieldname: 'sidebar_mode', label: 'Sidebar Mode', fieldtype: 'Select', options: ['Expanded', 'Collapsed', 'Auto'] },
                { fieldname: 'auto_collapse_sidebar', label: 'Auto Collapse', fieldtype: 'Check' }
            ],
            typography: [
                { fieldname: 'font_family', label: 'Font Family', fieldtype: 'Data' },
                { fieldname: 'base_font_size', label: 'Base Size (px)', fieldtype: 'Int' },
                { fieldname: 'heading_font_size', label: 'Heading Size (px)', fieldtype: 'Int' },
                { fieldname: 'font_weight', label: 'Weight', fieldtype: 'Select', options: ['300', '400', '500', '600', '700'] },
                { fieldname: 'line_height', label: 'Line Height', fieldtype: 'Float' }
            ],
            layout: [
                { fieldname: 'layout_mode', label: 'Layout Mode', fieldtype: 'Select', options: ['Full Width', 'Boxed'] },
                { fieldname: 'page_margin', label: 'Page Margin (px)', fieldtype: 'Int' },
                { fieldname: 'card_gap', label: 'Card Gap (px)', fieldtype: 'Int' },
                { fieldname: 'global_border_radius', label: 'Border Radius (px)', fieldtype: 'Int' },
                { fieldname: 'header_height', label: 'Header Height (px)', fieldtype: 'Int' }
            ],
            accessibility: [
                { fieldname: 'wcag_compliance', label: 'WCAG Level', fieldtype: 'Select', options: ['None', 'AA', 'AAA'] },
                { fieldname: 'high_contrast', label: 'High Contrast', fieldtype: 'Check' },
                { fieldname: 'large_text', label: 'Large Text', fieldtype: 'Check' },
                { fieldname: 'focus_outline', label: 'Focus Outlines', fieldtype: 'Check' },
                { fieldname: 'color_blind_palette', label: 'Color Blind Palette', fieldtype: 'Select', options: ['None', 'Deuteranopia', 'Protanopia', 'Tritanopia'] }
            ],
            developer: [
                { fieldname: 'custom_css', label: 'Custom CSS', fieldtype: 'Code' },
                { fieldname: 'custom_js', label: 'Custom JS', fieldtype: 'Code' },
                { fieldname: 'css_variables', label: 'CSS Variables (JSON)', fieldtype: 'Code' }
            ]
        };
        return map[section] || [];
    }
    render_control(ctrl) {
        let input = '';
        switch(ctrl.fieldtype) {
            case 'Color': input = `<input type="color" class="form-control" data-field="${ctrl.fieldname}" value="#2490EF">`; break;
            case 'Check': input = `<input type="checkbox" data-field="${ctrl.fieldname}">`; break;
            case 'Select': input = `<select class="form-control" data-field="${ctrl.fieldname}">${ctrl.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`; break;
            case 'Int': input = `<input type="number" class="form-control" data-field="${ctrl.fieldname}" value="0">`; break;
            case 'Float': input = `<input type="number" step="0.1" class="form-control" data-field="${ctrl.fieldname}" value="1.5">`; break;
            case 'Code': input = `<textarea class="form-control" data-field="${ctrl.fieldname}" rows="4"></textarea>`; break;
            default: input = `<input type="text" class="form-control" data-field="${ctrl.fieldname}">`;
        }
        return $(`<div class="control-item"><label>${ctrl.label}</label>${input}</div>`);
    }
    setup_preview() {
        this.preview = $(`
            <div class="theme-studio-preview">
                <div class="preview-toolbar">
                    <span class="preview-label">${__("Live Preview")}</span>
                    <div class="preview-devices">
                        <button class="btn btn-xs btn-default" data-device="desktop">Desktop</button>
                        <button class="btn btn-xs btn-default" data-device="tablet">Tablet</button>
                        <button class="btn btn-xs btn-default" data-device="mobile">Mobile</button>
                    </div>
                </div>
                <div class="preview-frame-container">
                    <iframe id="theme-preview-frame" src="/app" frameborder="0"></iframe>
                </div>
            </div>
        `).appendTo(this.wrapper);
        this.preview.find('[data-device]').on('click', (e) => this.set_device($(e.currentTarget).data('device')));
    }
    load_profiles() {
        frappe.call({ method: 'frappe_theme_studio.api.get_profiles', callback: (r) => { this.profiles = r.message || []; } });
    }
    set_device(device) {
        this.preview_mode = device;
        const widths = { desktop: '100%', tablet: '768px', mobile: '375px' };
        $('#theme-preview-frame').css('width', widths[device]);
        this.preview.find('[data-device]').removeClass('active');
        this.preview.find(`[data-device="${device}"]`).addClass('active');
    }
    undo() { if (this.history_index > 0) { this.history_index--; this.current_profile = JSON.parse(JSON.stringify(this.history[this.history_index])); this.apply_to_preview(); } }
    redo() { if (this.history_index < this.history.length - 1) { this.history_index++; this.current_profile = JSON.parse(JSON.stringify(this.history[this.history_index])); this.apply_to_preview(); } }
    reset() { frappe.confirm(__('Reset all changes?'), () => { this.load_profile(this.current_profile?.name); }); }
    save_draft() {
        frappe.call({ method: 'frappe_theme_studio.api.save_draft', args: { profile: this.current_profile }, callback: () => frappe.show_alert(__('Draft saved')) });
    }
    publish() {
        frappe.confirm(__('Publish theme? This will update all active sessions.'), () => {
            frappe.call({ method: 'frappe_theme_studio.api.publish_theme', args: { profile: this.current_profile },
                callback: () => { frappe.show_alert(__('Theme published successfully')); frappe.realtime.publish('theme_studio:refresh'); }
            });
        });
    }
    export_profile() {
        const blob = new Blob([JSON.stringify(this.current_profile, null, 2)], {type: 'application/json'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${this.current_profile.profile_name}.json`; a.click();
    }
    apply_to_preview() {
        if (!this.current_profile) return;
        const css = this.generate_preview_css(this.current_profile);
        const frame = document.getElementById('theme-preview-frame');
        if (frame && frame.contentDocument) {
            let style = frame.contentDocument.getElementById('theme-studio-preview-style');
            if (!style) { style = frame.contentDocument.createElement('style'); style.id = 'theme-studio-preview-style'; frame.contentDocument.head.appendChild(style); }
            style.textContent = css;
        }
    }
    generate_preview_css(profile) {
        return `
            :root {
                --brand-color: ${profile.brand_color || '#171717'};
                --accent-color: ${profile.accent_color || '#2490EF'};
                --page-bg: ${profile.page_background || '#f4f5f6'};
                --card-bg: ${profile.card_background || '#ffffff'};
                --text-color: ${profile.text_color || '#1f272e'};
                --sidebar-width: ${profile.sidebar_width || 240}px;
                --font-family: ${profile.font_family || 'Inter, sans-serif'};
                --base-size: ${profile.base_font_size || 14}px;
                --radius: ${profile.global_border_radius || 8}px;
            }
            body { background: var(--page-bg) !important; font-family: var(--font-family) !important; }
            .layout-main-section { background: var(--card-bg) !important; }
        `;
    }
};
frappe.pages['theme-studio-editor'].on_page_load = function(wrapper) {
    frappe.theme_studio.editor = new frappe.theme_studio.Editor(wrapper);
};
