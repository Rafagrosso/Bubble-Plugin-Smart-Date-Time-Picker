function(instance, properties, context) {

    instance.data.fitwidthtocontent = properties.fitwidth || false;
    instance.data.fitheighttocontent = properties.fitheight || false;
    instance.data.vcenter = properties.vcenter || false;

    instance.data.input_width   = (properties.input_width != null) ? properties.input_width : instance.data.input_width;
    instance.data.input_height  = (properties.input_height != null) ? properties.input_height : instance.data.input_height;
    instance.data.input_padding = (properties.input_padding != null) ? properties.input_padding : instance.data.input_padding;

    instance.data.popup_direction = properties.popup_direction || instance.data.popup_direction || "down";

    instance.data.colorscheme = properties.colorscheme || 'light';
    instance.data.step = properties.step || 1;
    instance.data.min = properties.min;
    instance.data.max = properties.max;

    if (properties.format == 'date') {
        instance.data.format = 'date';
    } else if (properties.format == 'time') {
        instance.data.format = 'time';
    } else if (properties.format == 'month') {
        instance.data.format = 'month';
    } else {
        instance.data.format = 'datetime-local';
    }

    if (properties.initial) {
        instance.data.initialdate = properties.initial;
    }

    instance.data.iconsize = (properties.iconsize != null) ? properties.iconsize : (instance.data.iconsize != null ? instance.data.iconsize : 18);
    instance.data.iconurl = properties.iconurl || instance.data.iconurl || "";

    if (properties.colorscheme === "customized") {
        instance.data.bordercolor = properties.bordercolor || "#cccccc";
        instance.data.backgroundcolor = properties.backgroundcolor || "#ffffff";
        instance.data.selectedcolor = properties.selectedcolor || "#007BFF";
        instance.data.hovercolor = properties.hovercolor || "#e6f0ff";
        instance.data.borderradius = (properties.borderradius != null) ? properties.borderradius : 6;
        instance.data.borderwidth = (properties.borderwidth != null) ? properties.borderwidth : 1;
        instance.data.fontcolor = properties.fontcolor || "#000000";
        instance.data.fontsize = (properties.fontsize != null) ? properties.fontsize : 14;
        instance.data.selectionpadding = (properties.selectionpadding != null) ? properties.selectionpadding
                                         : (properties.popuppadding != null) ? properties.popuppadding
                                         : (instance.data.selectionpadding != null ? instance.data.selectionpadding : 10);
    } else {
        instance.data.bordercolor = instance.data.bordercolor || null;
        instance.data.backgroundcolor = instance.data.backgroundcolor || null;
        instance.data.selectedcolor = instance.data.selectedcolor || null;
        instance.data.hovercolor = instance.data.hovercolor || null;
        instance.data.borderradius = instance.data.borderradius || null;
        instance.data.borderwidth = instance.data.borderwidth || null;
        instance.data.fontcolor = instance.data.fontcolor || null;
        instance.data.fontsize = instance.data.fontsize || null;
        instance.data.selectionpadding = instance.data.selectionpadding || null;
    }

    try {
        var popup = document.getElementById(instance.data.popupid);
        var styleEl = document.getElementById(instance.data.styleid);

        var scheme = instance.data.colorscheme || 'light';
        var bg, border, hover, selected, fontc, fsize;
        if (scheme === 'customized') {
            bg = instance.data.backgroundcolor || '#ffffff';
            border = instance.data.bordercolor || '#cccccc';
            hover = instance.data.hovercolor || '#f0f0f0';
            selected = instance.data.selectedcolor || '#007BFF';
            fontc = instance.data.fontcolor || '#000000';
            fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
        } else if (scheme === 'dark') {
            bg = '#2c2c2c'; border = '#444'; hover = '#3a3a3a'; selected = '#1a73e8'; fontc = '#f2f2f2'; fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
        } else if (scheme === 'normal') {
            bg = '#f9f9f9'; border = '#ccc'; hover = '#eaeaea'; selected = '#007BFF'; fontc = '#000'; fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
        } else {
            bg = '#ffffff'; border = '#cccccc'; hover = '#f0f0f0'; selected = '#007BFF'; fontc = '#000000'; fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
        }

        var radius = (instance.data.borderradius != null) ? instance.data.borderradius : 6;
        var borderw = (instance.data.borderwidth != null) ? instance.data.borderwidth : 1;
        var selPad = (instance.data.selectionpadding != null) ? instance.data.selectionpadding : 10;

        var css = `
            #${instance.data.popupid} {
                width: max-content;
                max-width: calc(100vw - 20px);
                background: ${bg};
                border: ${borderw}px solid ${border};
                border-radius: ${radius}px;
                padding: 10px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.12);
                color: ${fontc};
                font-size: ${fsize};
                font-family: inherit;
                max-height: 300px;
                min-height: 250px;
                overflow-y: auto;
                overflow-x: hidden;
            }
        `;

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = instance.data.styleid;
            document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = css;

        if (popup) popup.style.fontFamily = 'inherit';

        var inputEl2 = document.getElementById(instance.data.inputid);
        if (inputEl2) inputEl2.style.fontFamily = 'inherit';

        if (typeof instance.data.applyPopupStyle === 'function') instance.data.applyPopupStyle();

    } catch (err) {
        console.warn('update apply popup style error', err);
    }

}
