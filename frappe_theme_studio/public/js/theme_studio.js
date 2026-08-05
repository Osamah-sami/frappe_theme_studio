frappe.provide('frappe.theme_studio');

frappe.theme_studio.Editor = class ThemeStudioEditor {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.page = wrapper.page;
        this.profiles = [];
        this.current_profile = null;
        this.history = [];
        this.history_index = -1;
        this.preview_mode = 'desktop';
        this.profile_name = frappe.get_route()[1] || null;
        this.make();
    }

    make() {
        this.setup_page();
        this.setup_layout();
        this.load_profile(this.profile_name);
    }

    setup_page() {
        this.page.set_title(__('Theme Studio'));
        this.page.add_button(__('Back to Gallery'), () => {
            frappe.set_route('theme-studio-gallery');
        }, { icon: 'arrow-left' });
        this.page.set_primary_action(__('Publish'), () => this.publish(), 'check');
        this.page.set_secondary_action(__('Save Draft'), () => this.save_draft(), 'save');
        this.page.add_button(__('Undo'), () => this.undo(), { icon: 'undo' });
        this.page.add_button(__('Redo'), () => this.redo(), { icon: 'redo' });
        this.page.add_button(__('Reset'), () => this.reset(), { icon: 'refresh-cw' });
        this.page.add_button(__('Apply Preset'), () => this.apply_preset_dialog(), { icon: 'git-branch' });
        this.page.add_menu_item(__('Import Profile'), () => this.import_profile());
        this.page.add_menu_item(__('Export Profile'), () => this.export_profile());
    }

    setup_layout() {
        this.layout = $(`
            <div class="ts-editor-layout">
                <div class="ts-sidebar-panel"></div>
                <div class="ts-preview-panel">
                    <div class="ts-preview-toolbar">
                        <div class="ts-device-switcher">
                            <button data-device="desktop" class="active" title="Desktop"><i class="icon-monitor"></i></button>
                            <button data-device="tablet" title="Tablet"><i class="icon-tablet"></i></button>
                            <button data-device="mobile" title="Mobile"><i class="icon-smartphone"></i></button>
                        </div>
                        <span class="ts-preview-label">${__("Live Preview")}</span>
                        <span class="ts-preview-badge">${__("Virtual UI")}</span>
                    </div>
                    <div class="ts-preview-viewport">
                        <div class="ts-virtual-desk" id="ts-virtual-desk"></div>
                    </div>
                </div>
            </div>
        `).appendTo(this.wrapper);

        this.sidebar_panel = this.layout.find('.ts-sidebar-panel');
        this.preview_viewport = this.layout.find('.ts-preview-viewport');
        this.virtual_desk = this.layout.find('#ts-virtual-desk');

        this.layout.find('[data-device]').on('click', (e) => {
            const device = $(e.currentTarget).data('device');
            this.set_device(device);
        });

        this.setup_sidebar();
    }

    set_device(device) {
        this.preview_mode = device;
        const widths = { desktop: '100%', tablet: '768px', mobile: '375px' };
        this.virtual_desk.css('width', widths[device]);
        this.layout.find('[data-device]').removeClass('active');
        this.layout.find(`[data-device="${device}"]`).addClass('active');
    }

    setup_sidebar() {
        this.sidebar_panel.html(`
            <div class="ts-sidebar-header">
                <h5>${__("Theme Settings")}</h5>
                <div class="ts-profile-badge" style="display:none;">
                    <span class="badge badge-info"></span>
                </div>
            </div>
            <div class="ts-sidebar-sections">
                ${this.get_sidebar_sections()}
            </div>
        `);

        this.sidebar_panel.find('.ts-section-header').on('click', (e) => {
            const $section = $(e.currentTarget).closest('.ts-sidebar-section');
            $section.toggleClass('active').siblings().removeClass('active');
            this.load_section_controls($section.data('section'));
        });
    }

    get_sidebar_sections() {
        const sections = [
            { id: 'colors', label: __('Colors'), icon: 'color' },
            { id: 'navbar', label: __('Navbar & Sidebar'), icon: 'menu' },
            { id: 'typography', label: __('Typography'), icon: 'type' },
            { id: 'layout', label: __('Layout'), icon: 'maximize' },
            { id: 'components', label: __('Components'), icon: 'grid' },
            { id: 'login', label: __('Login & Branding'), icon: 'log-in' },
            { id: 'accessibility', label: __('Accessibility'), icon: 'eye' },
            { id: 'developer', label: __('Developer'), icon: 'code' }
        ];
        return sections.map((s, i) => `
            <div class="ts-sidebar-section ${i === 0 ? 'active' : ''}" data-section="${s.id}">
                <div class="ts-section-header">
                    <i class="icon-${s.icon}"></i>
                    <span>${s.label}</span>
                    <i class="icon-chevron-down ts-toggle-icon"></i>
                </div>
                <div class="ts-section-controls"></div>
            </div>
        `).join('');
    }

    load_section_controls(section) {
        const controls = this.get_controls_for_section(section);
        const $container = this.sidebar_panel.find('.ts-sidebar-section.active .ts-section-controls');
        $container.empty();
        controls.forEach(ctrl => {
            $container.append(this.render_control(ctrl));
        });
        this.bind_control_events();
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
                { fieldname: 'navbar_background', label: 'Navbar Background', fieldtype: 'Color' },
                { fieldname: 'navbar_text_color', label: 'Navbar Text Color', fieldtype: 'Color' },
                { fieldname: 'navbar_icon_color', label: 'Navbar Icon Color', fieldtype: 'Color' },
                { fieldname: 'navbar_active_color', label: 'Navbar Active Color', fieldtype: 'Color' },
                { fieldname: 'navbar_hover_color', label: 'Navbar Hover Color', fieldtype: 'Color' },
                { fieldname: 'sidebar_width', label: 'Sidebar Width (px)', fieldtype: 'Int' },
                { fieldname: 'sidebar_mode', label: 'Sidebar Mode', fieldtype: 'Select', options: ['Expanded', 'Collapsed', 'Auto'] },
                { fieldname: 'auto_collapse_sidebar', label: 'Auto Collapse', fieldtype: 'Check' },
                { fieldname: 'logo_placement', label: 'Logo Placement', fieldtype: 'Select', options: ['Navbar', 'Sidebar', 'Both'] }
            ],
            typography: [
                { fieldname: 'font_family', label: 'Font Family', fieldtype: 'Data' },
                { fieldname: 'base_font_size', label: 'Base Font Size (px)', fieldtype: 'Int' },
                { fieldname: 'heading_font_size', label: 'Heading Font Size (px)', fieldtype: 'Int' },
                { fieldname: 'label_font_size', label: 'Label Font Size (px)', fieldtype: 'Int' },
                { fieldname: 'table_font_size', label: 'Table Font Size (px)', fieldtype: 'Int' },
                { fieldname: 'font_weight', label: 'Font Weight', fieldtype: 'Select', options: ['300', '400', '500', '600', '700'] },
                { fieldname: 'line_height', label: 'Line Height', fieldtype: 'Float' }
            ],
            layout: [
                { fieldname: 'layout_mode', label: 'Layout Mode', fieldtype: 'Select', options: ['Full Width', 'Boxed'] },
                { fieldname: 'page_margin', label: 'Page Margin (px)', fieldtype: 'Int' },
                { fieldname: 'card_gap', label: 'Card Gap (px)', fieldtype: 'Int' },
                { fieldname: 'global_border_radius', label: 'Border Radius (px)', fieldtype: 'Int' },
                { fieldname: 'header_height', label: 'Header Height (px)', fieldtype: 'Int' },
                { fieldname: 'sticky_regions', label: 'Sticky Regions', fieldtype: 'Check' }
            ],
            components: [
                { fieldname: 'button_style', label: 'Button Style', fieldtype: 'Select', options: ['Rounded', 'Pill', 'Square'] },
                { fieldname: 'input_style', label: 'Input Style', fieldtype: 'Select', options: ['Outline', 'Filled', 'Flushed'] },
                { fieldname: 'checkbox_style', label: 'Checkbox Style', fieldtype: 'Select', options: ['Default', 'Switch', 'Custom'] },
                { fieldname: 'table_density', label: 'Table Density', fieldtype: 'Select', options: ['Comfortable', 'Compact'] },
                { fieldname: 'card_shadow', label: 'Card Shadow', fieldtype: 'Select', options: ['None', 'Small', 'Medium', 'Large'] },
                { fieldname: 'card_surface', label: 'Card Surface', fieldtype: 'Select', options: ['Flat', 'Elevated', 'Glass'] }
            ],
            login: [
                { fieldname: 'login_background_type', label: 'Background Type', fieldtype: 'Select', options: ['Color', 'Image', 'Gradient'] },
                { fieldname: 'login_background_gradient', label: 'Gradient CSS', fieldtype: 'Data' },
                { fieldname: 'login_card_opacity', label: 'Card Opacity', fieldtype: 'Float' },
                { fieldname: 'login_title', label: 'Login Title', fieldtype: 'Data' },
                { fieldname: 'login_subtitle', label: 'Login Subtitle', fieldtype: 'Data' },
                { fieldname: 'show_platform_credit', label: 'Show Platform Credit', fieldtype: 'Check' }
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
        const val = this.current_profile?.[ctrl.fieldname];
        let input = '';
        switch(ctrl.fieldtype) {
            case 'Color':
                input = `<input type="color" class="ts-color-input" data-fieldname="${ctrl.fieldname}" value="${val || '#171717'}">`;
                break;
            case 'Check':
                input = `<label class="ts-check-label"><input type="checkbox" class="ts-check-input" data-fieldname="${ctrl.fieldname}" ${val ? 'checked' : ''}> <span>${ctrl.label}</span></label>`;
                break;
            case 'Select':
                input = `<select class="ts-select-input" data-fieldname="${ctrl.fieldname}">${(ctrl.options || []).map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
                break;
            case 'Int':
                input = `<input type="number" class="ts-number-input" data-fieldname="${ctrl.fieldname}" value="${val || 0}">`;
                break;
            case 'Float':
                input = `<input type="number" step="0.1" class="ts-number-input" data-fieldname="${ctrl.fieldname}" value="${val || 1.0}">`;
                break;
            case 'Code':
                input = `<textarea class="ts-code-input" data-fieldname="${ctrl.fieldname}" rows="6">${val || ''}</textarea>`;
                break;
            default:
                input = `<input type="text" class="ts-text-input" data-fieldname="${ctrl.fieldname}" value="${val || ''}">`;
        }

        if (ctrl.fieldtype === 'Check') return $(`<div class="ts-control-group">${input}</div>`);

        return $(`
            <div class="ts-control-group">
                <label class="ts-control-label">${ctrl.label}</label>
                ${input}
            </div>
        `);
    }

    bind_control_events() {
        this.sidebar_panel.find('input, select, textarea').off('input change').on('input change', (e) => {
            const $el = $(e.currentTarget);
            const fieldname = $el.data('fieldname');
            let value = $el.val();
            if ($el.is(':checkbox')) value = $el.is(':checked') ? 1 : 0;
            if ($el.attr('type') === 'number') value = parseFloat(value) || 0;
            this.current_profile[fieldname] = value;
            this.push_history();
            this.apply_to_preview();
        });
    }

    push_history() {
        if (this.history_index < this.history.length - 1) {
            this.history = this.history.slice(0, this.history_index + 1);
        }
        this.history.push(JSON.parse(JSON.stringify(this.current_profile)));
        this.history_index++;
    }

    build_virtual_desk() {
        const p = this.current_profile || {};
        const brand = p.brand_color || '#171717';
        const accent = p.accent_color || '#2490EF';
        const pageBg = p.page_background || '#f4f5f6';
        const cardBg = p.card_background || '#ffffff';
        const text = p.text_color || '#1f272e';
        const link = p.link_color || '#2490EF';
        const border = p.border_color || '#e2e6e9';
        const navBg = p.navbar_background || '#ffffff';
        const navText = p.navbar_text_color || '#1f272e';
        const navIcon = p.navbar_icon_color || '#687178';
        const sidebarW = p.sidebar_width || 240;
        const font = p.font_family || 'Inter, sans-serif';
        const baseSize = p.base_font_size || 14;
        const headingSize = p.heading_font_size || 24;
        const radius = p.global_border_radius || 8;
        const headerH = p.header_height || 48;
        const margin = p.page_margin || 24;
        const gap = p.card_gap || 16;
        const btnRadius = p.button_style === 'Pill' ? '999px' : (p.button_style === 'Square' ? '0px' : `${radius}px`);
        const shadow = p.card_shadow === 'Large' ? '0 12px 40px rgba(0,0,0,0.15)' : (p.card_shadow === 'Small' ? '0 2px 8px rgba(0,0,0,0.08)' : (p.card_shadow === 'None' ? 'none' : '0 4px 16px rgba(0,0,0,0.1)'));
        const tableDensity = p.table_density === 'Compact' ? '8px' : '14px';

        const html = `
            <style id="ts-preview-style">
                .ts-vdesk { font-family: ${font}; font-size: ${baseSize}px; color: ${text}; background: ${pageBg}; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
                .ts-vdesk * { box-sizing: border-box; }
                .ts-vnav { height: ${headerH}px; background: ${navBg}; border-bottom: 1px solid ${border}; display: flex; align-items: center; padding: 0 16px; justify-content: space-between; }
                .ts-vnav-brand { display: flex; align-items: center; gap: 10px; color: ${navText}; font-weight: 600; }
                .ts-vnav-logo { width: 28px; height: 28px; background: ${brand}; border-radius: 6px; }
                .ts-vnav-actions { display: flex; gap: 12px; align-items: center; }
                .ts-vnav-icon { width: 18px; height: 18px; background: ${navIcon}; border-radius: 3px; opacity: 0.6; }
                .ts-vnav-avatar { width: 28px; height: 28px; background: ${accent}; border-radius: 50%; }
                .ts-vbody { display: flex; flex: 1; overflow: hidden; }
                .ts-vsidebar { width: ${sidebarW}px; background: ${navBg}; border-right: 1px solid ${border}; padding: 12px 0; display: flex; flex-direction: column; }
                .ts-vsidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 2px 8px; border-radius: ${radius}px; color: ${navIcon}; font-size: 13px; cursor: pointer; }
                .ts-vsidebar-item:hover { background: ${p.navbar_hover_color || '#f4f5f6'}; }
                .ts-vsidebar-item.active { background: ${brand}; color: #fff; }
                .ts-vsidebar-icon { width: 16px; height: 16px; background: currentColor; border-radius: 3px; opacity: 0.5; }
                .ts-vmain { flex: 1; padding: ${margin}px; overflow-y: auto; }
                .ts-vheader { margin-bottom: ${gap}px; }
                .ts-vheader h1 { margin: 0 0 6px 0; font-size: ${headingSize}px; font-weight: 600; color: ${text}; }
                .ts-vheader p { margin: 0; opacity: 0.6; font-size: ${baseSize}px; }
                .ts-vgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: ${gap}px; margin-bottom: ${gap}px; }
                .ts-vcard { background: ${cardBg}; border: 1px solid ${border}; border-radius: ${radius}px; padding: 16px; box-shadow: ${shadow}; transition: transform 0.2s; }
                .ts-vcard:hover { transform: translateY(-2px); }
                .ts-vcard-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .ts-vcard-title { font-weight: 600; font-size: ${baseSize + 2}px; margin: 0; }
                .ts-vcard-badge { background: ${brand}; color: #fff; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; }
                .ts-vcard-value { font-size: ${headingSize}px; font-weight: 700; color: ${brand}; margin: 8px 0; }
                .ts-vcard-desc { font-size: ${baseSize - 1}px; opacity: 0.6; margin: 0; }
                .ts-vform { background: ${cardBg}; border: 1px solid ${border}; border-radius: ${radius}px; padding: 20px; margin-bottom: ${gap}px; }
                .ts-vform-title { font-weight: 600; margin: 0 0 16px 0; font-size: ${baseSize + 2}px; }
                .ts-vform-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .ts-vfield label { display: block; font-size: ${p.label_font_size || 12}px; font-weight: 500; margin-bottom: 6px; color: ${text}; opacity: 0.8; }
                .ts-vfield input, .ts-vfield select { width: 100%; padding: 8px 12px; border: 1px solid ${border}; border-radius: ${p.input_style === 'Flushed' ? '0' : `${radius}px`}; background: ${p.input_style === 'Filled' ? pageBg : cardBg}; font-size: ${baseSize}px; color: ${text}; }
                .ts-vfield input:focus { outline: ${p.focus_outline ? `2px solid ${accent}` : 'none'}; border-color: ${accent}; }
                .ts-vbtn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: ${btnRadius}; font-size: ${baseSize}px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
                .ts-vbtn-primary { background: ${brand}; color: #fff; }
                .ts-vbtn-primary:hover { opacity: 0.9; }
                .ts-vbtn-secondary { background: transparent; color: ${text}; border: 1px solid ${border}; }
                .ts-vtable-wrap { background: ${cardBg}; border: 1px solid ${border}; border-radius: ${radius}px; overflow: hidden; }
                .ts-vtable { width: 100%; border-collapse: collapse; }
                .ts-vtable th { text-align: left; padding: ${tableDensity} 16px; background: ${pageBg}; font-size: ${p.table_font_size || 13}px; font-weight: 600; color: ${text}; border-bottom: 1px solid ${border}; }
                .ts-vtable td { padding: ${tableDensity} 16px; font-size: ${p.table_font_size || 13}px; border-bottom: 1px solid ${border}; }
                .ts-vtable tr:hover td { background: ${pageBg}; }
                .ts-vtable a { color: ${link}; text-decoration: none; }
                .ts-vtag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; }
                .ts-vtag-success { background: #dcfce7; color: #166534; }
                .ts-vtag-warning { background: #fef3c7; color: #92400e; }
                .ts-vprogress { height: 6px; background: ${pageBg}; border-radius: 3px; overflow: hidden; margin-top: 8px; }
                .ts-vprogress-bar { height: 100%; background: ${accent}; border-radius: 3px; }
                .ts-vcheck { display: inline-flex; align-items: center; gap: 6px; }
                .ts-vcheck-box { width: 16px; height: 16px; border: 2px solid ${border}; border-radius: ${p.checkbox_style === 'Switch' ? '999px' : '4px'}; background: ${cardBg}; }
                .ts-vcheck-box.checked { background: ${brand}; border-color: ${brand}; }
            </style>
            <div class="ts-vdesk">
                <div class="ts-vnav">
                    <div class="ts-vnav-brand">
                        <div class="ts-vnav-logo"></div>
                        <span>ERPNext</span>
                    </div>
                    <div class="ts-vnav-actions">
                        <div class="ts-vnav-icon"></div>
                        <div class="ts-vnav-icon"></div>
                        <div class="ts-vnav-avatar"></div>
                    </div>
                </div>
                <div class="ts-vbody">
                    <div class="ts-vsidebar">
                        <div class="ts-vsidebar-item active">
                            <div class="ts-vsidebar-icon"></div>
                            <span>Dashboard</span>
                        </div>
                        <div class="ts-vsidebar-item">
                            <div class="ts-vsidebar-icon"></div>
                            <span>Documents</span>
                        </div>
                        <div class="ts-vsidebar-item">
                            <div class="ts-vsidebar-icon"></div>
                            <span>Reports</span>
                        </div>
                        <div class="ts-vsidebar-item">
                            <div class="ts-vsidebar-icon"></div>
                            <span>Settings</span>
                        </div>
                    </div>
                    <div class="ts-vmain">
                        <div class="ts-vheader">
                            <h1>Sales Dashboard</h1>
                            <p>Overview of your sales performance and key metrics</p>
                        </div>
                        <div class="ts-vgrid">
                            <div class="ts-vcard">
                                <div class="ts-vcard-header">
                                    <span class="ts-vcard-title">Total Sales</span>
                                    <span class="ts-vcard-badge">+12%</span>
                                </div>
                                <div class="ts-vcard-value">$124,500</div>
                                <p class="ts-vcard-desc">Compared to last month</p>
                            </div>
                            <div class="ts-vcard">
                                <div class="ts-vcard-header">
                                    <span class="ts-vcard-title">Active Orders</span>
                                    <span class="ts-vcard-badge" style="background:${accent}">Live</span>
                                </div>
                                <div class="ts-vcard-value">1,248</div>
                                <p class="ts-vcard-desc">Across all warehouses</p>
                                <div class="ts-vprogress"><div class="ts-vprogress-bar" style="width:72%"></div></div>
                            </div>
                            <div class="ts-vcard">
                                <div class="ts-vcard-header">
                                    <span class="ts-vcard-title">Customers</span>
                                </div>
                                <div class="ts-vcard-value">892</div>
                                <p class="ts-vcard-desc">New this quarter</p>
                            </div>
                        </div>
                        <div class="ts-vform">
                            <h3 class="ts-vform-title">New Sales Order</h3>
                            <div class="ts-vform-row">
                                <div class="ts-vfield">
                                    <label>Customer</label>
                                    <input type="text" value="Acme Corporation" readonly>
                                </div>
                                <div class="ts-vfield">
                                    <label>Order Date</label>
                                    <input type="text" value="2026-08-06" readonly>
                                </div>
                            </div>
                            <div class="ts-vform-row">
                                <div class="ts-vfield">
                                    <label>Status</label>
                                    <select><option>Draft</option><option>Submitted</option></select>
                                </div>
                                <div class="ts-vfield">
                                    <label>Priority</label>
                                    <select><option>Normal</option><option>High</option></select>
                                </div>
                            </div>
                            <div style="display:flex;gap:10px;margin-top:8px;">
                                <button class="ts-vbtn ts-vbtn-primary">Save</button>
                                <button class="ts-vbtn ts-vbtn-secondary">Cancel</button>
                            </div>
                        </div>
                        <div class="ts-vtable-wrap">
                            <table class="ts-vtable">
                                <thead>
                                    <tr>
                                        <th><div class="ts-vcheck"><div class="ts-vcheck-box checked"></div></div></th>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><div class="ts-vcheck"><div class="ts-vcheck-box"></div></div></td>
                                        <td><a href="#">Wireless Mouse</a></td>
                                        <td>10</td>
                                        <td>$25.00</td>
                                        <td>$250.00</td>
                                        <td><span class="ts-vtag ts-vtag-success">Delivered</span></td>
                                    </tr>
                                    <tr>
                                        <td><div class="ts-vcheck"><div class="ts-vcheck-box"></div></div></td>
                                        <td><a href="#">Mechanical Keyboard</a></td>
                                        <td>5</td>
                                        <td>$89.00</td>
                                        <td>$445.00</td>
                                        <td><span class="ts-vtag ts-vtag-warning">Pending</span></td>
                                    </tr>
                                    <tr>
                                        <td><div class="ts-vcheck"><div class="ts-vcheck-box"></div></div></td>
                                        <td><a href="#">USB-C Hub</a></td>
                                        <td>20</td>
                                        <td>$45.00</td>
                                        <td>$900.00</td>
                                        <td><span class="ts-vtag ts-vtag-success">Delivered</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return html;
    }

    apply_to_preview() {
        if (!this.current_profile) return;
        const html = this.build_virtual_desk();
        this.virtual_desk.html(html);
    }

    load_profile(name) {
        if (!name) {
            this.virtual_desk.html(`
                <div class="ts-empty-editor">
                    <div style="text-align:center;padding:80px 20px;color:#687178;">
                        <i class="icon-palette" style="font-size:48px;opacity:0.5;display:block;margin-bottom:16px;"></i>
                        <h4 style="margin:0 0 8px 0;color:#1f272e;">${__("No theme selected")}</h4>
                        <p style="margin:0 0 16px 0;">${__("Go to Theme Gallery to select a theme.")}</p>
                        <button class="btn btn-primary" onclick="frappe.set_route('theme-studio-gallery')">${__("Go to Gallery")}</button>
                    </div>
                </div>
            `);
            return;
        }
        frappe.call({
            method: 'frappe_theme_studio.api.get_profile',
            args: { name: name },
            callback: (r) => {
                if (r.message) {
                    this.current_profile = r.message;
                    this.history = [JSON.parse(JSON.stringify(this.current_profile))];
                    this.history_index = 0;
                    this.sidebar_panel.find('.ts-profile-badge span').text(this.current_profile.profile_name).parent().show();
                    this.apply_to_preview();
                    this.load_section_controls('colors');
                }
            }
        });
    }

    undo() {
        if (this.history_index > 0) {
            this.history_index--;
            this.current_profile = JSON.parse(JSON.stringify(this.history[this.history_index]));
            this.apply_to_preview();
            this.refresh_controls();
        }
    }

    redo() {
        if (this.history_index < this.history.length - 1) {
            this.history_index++;
            this.current_profile = JSON.parse(JSON.stringify(this.history[this.history_index]));
            this.apply_to_preview();
            this.refresh_controls();
        }
    }

    refresh_controls() {
        const active_section = this.sidebar_panel.find('.ts-sidebar-section.active').data('section');
        this.load_section_controls(active_section);
    }

    reset() {
        frappe.confirm(__('Reset all changes?'), () => {
            this.load_profile(this.current_profile?.name);
        });
    }

    save_draft() {
        frappe.call({
            method: 'frappe_theme_studio.api.save_draft',
            args: { profile: this.current_profile },
            callback: () => frappe.show_alert(__('Draft saved'))
        });
    }

    publish() {
        frappe.confirm(__('Publish theme? This will update all active sessions.'), () => {
            frappe.call({
                method: 'frappe_theme_studio.api.publish_theme',
                args: { profile: this.current_profile },
                callback: () => {
                    frappe.show_alert(__('Theme published successfully'));
                    frappe.realtime.publish('theme_studio:refresh');
                }
            });
        });
    }

    export_profile() {
        const blob = new Blob([JSON.stringify(this.current_profile, null, 2)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.current_profile.profile_name}.json`;
        a.click();
    }

    import_profile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                frappe.call({
                    method: 'frappe_theme_studio.api.import_profile',
                    args: { json_data: event.target.result },
                    callback: (r) => {
                        if (r.message) {
                            frappe.show_alert(__('Profile imported'));
                            this.load_profile(r.message);
                        }
                    }
                });
            };
            reader.readAsText(file);
        };
        input.click();
    }

    apply_preset_dialog() {
        if (!this.current_profile || this.current_profile.is_system_preset) {
            frappe.msgprint(__('Please select a custom profile first. System Presets cannot be overwritten.'));
            return;
        }
        frappe.call({
            method: 'frappe_theme_studio.api.get_preset_list',
            callback: (r) => {
                const presets = r.message || [];
                const dialog = new frappe.ui.Dialog({
                    title: __('Apply Preset'),
                    fields: [{
                        fieldname: 'preset',
                        label: __('Select Preset'),
                        fieldtype: 'Select',
                        options: presets.join('\n'),
                        reqd: 1
                    }],
                    primary_action: (values) => {
                        frappe.call({
                            method: 'frappe_theme_studio.api.reset_to_preset',
                            args: {
                                profile_name: this.current_profile.name,
                                preset_name: values.preset
                            },
                            callback: (r) => {
                                if (r.message && r.message.success) {
                                    frappe.show_alert(__('Preset applied successfully'));
                                    this.load_profile(this.current_profile.name);
                                }
                            }
                        });
                        dialog.hide();
                    }
                });
                dialog.show();
            }
        });
    }
};

frappe.pages['theme-studio-editor'].on_page_load = function(wrapper) {
    frappe.theme_studio.editor = new frappe.theme_studio.Editor(wrapper);
};
