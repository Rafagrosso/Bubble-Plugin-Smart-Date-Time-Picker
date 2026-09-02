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
        instance.data.bordercolor = properties.bordercolor || "#e2e4e9";
        instance.data.backgroundcolor = properties.backgroundcolor || "#ffffff";
        instance.data.selectedcolor = properties.selectedcolor || "#007BFF";
        instance.data.hovercolor = properties.hovercolor || "#f0f2f5";
        instance.data.borderradius = (properties.borderradius != null) ? properties.borderradius : 12;
        instance.data.borderwidth = (properties.borderwidth != null) ? properties.borderwidth : 1;
        instance.data.fontcolor = properties.fontcolor || "#1a1c22";
        instance.data.fontsize = (properties.fontsize != null) ? properties.fontsize : 14;
        instance.data.selectionpadding = (properties.selectionpadding != null) ? properties.selectionpadding
                                         : (properties.popuppadding != null) ? properties.popuppadding
                                         : (instance.data.selectionpadding != null ? instance.data.selectionpadding : 10);
    } else {
        // temas prontos: zera custom para usar os defaults do tema
        instance.data.bordercolor = null;
        instance.data.backgroundcolor = null;
        instance.data.selectedcolor = null;
        instance.data.hovercolor = null;
        instance.data.borderradius = null;
        instance.data.borderwidth = null;
        instance.data.fontcolor = null;
        instance.data.fontsize = null;
        instance.data.selectionpadding = null;
    }

    // Fonte premium só do popup (UI nossa). O input NÃO leva fonte forçada:
    // ele deve respeitar o que estiver configurado no editor do Bubble
    // (Appearance Settings: App Font, tamanho, cor).
    var FONT_STACK = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

    try {
        var inputEl = document.getElementById(instance.data.inputid);
        if (inputEl) {
            // sincroniza o tipo do input caso o formato mude
            if (inputEl.type !== instance.data.format) {
                try { inputEl.type = instance.data.format; } catch(e){}
            }
        }

        var popup = document.getElementById(instance.data.popupid);
        if (popup) popup.style.setProperty('font-family', FONT_STACK, 'important');

        // o estilo do popup é centralizado no initialize (applyPopupStyle)
        if (typeof instance.data.applyPopupStyle === 'function') instance.data.applyPopupStyle();
        // se o popup estiver aberto, re-renderiza para refletir novas propriedades
        if (typeof instance.data.refreshPopup === 'function') instance.data.refreshPopup();

    } catch (err) {
        console.warn('update apply popup style error', err);
    }

}
