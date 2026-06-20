function(instance, properties, context) {

    instance.data.iconsize = properties.iconsize || 18;
    instance.data.iconurl = properties.iconurl || "";

    try {
        var popup = document.getElementById(instance.data.popupid);
        var styleEl = document.getElementById(instance.data.styleid);

        var css = `
            #${instance.data.popupid} {
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 6px;
                color: #000;
                font-size: 14px;
                padding: 10px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.12);
                overflow: hidden;
            }
            #${instance.data.popupid} .dp-timecols {
                display: flex;
                gap: 8px;
                justify-content: center;
            }
            #${instance.data.popupid} .dp-hours, 
            #${instance.data.popupid} .dp-mins {
                max-height: 200px;
                overflow-y: auto;
                scrollbar-width: none;
            }
            #${instance.data.popupid} .dp-hours::-webkit-scrollbar, 
            #${instance.data.popupid} .dp-mins::-webkit-scrollbar {
                display: none;
            }
        `;

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = instance.data.styleid;
            document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = css;

        var inputEl = document.getElementById(instance.data.inputid);
        if (inputEl) {
            inputEl.style.textAlign = "center";
            inputEl.style.lineHeight = "normal";
        }

    } catch (e) {
        console.warn("update error", e);
    }
}
