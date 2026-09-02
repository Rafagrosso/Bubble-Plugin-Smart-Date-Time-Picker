function(instance, context) { 

    // ids únicos
    instance.data.divid = "datetimediv" + Math.floor(Math.random() * 1000000).toString();
    instance.data.inputid = "datetimeinput" + Math.floor(Math.random() * 1000000).toString();
    instance.data.popupid = "dpopup-" + instance.data.divid;
    instance.data.styleid = "dpopup-style-" + instance.data.divid;

    // defaults para não quebrar
    if (instance.data.selectionpadding == null) instance.data.selectionpadding = 10;
    if (instance.data.iconsize == null) instance.data.iconsize = 18;
    instance.data.iconid = "dateicon-" + instance.data.divid;

    $(document).ready(function () {

        // ---------- INPUT ----------
        var myDiv = '<input id="' + instance.data.inputid + '" type="' + instance.data.format + '" style="background-color: transparent; border: none; box-sizing: border-box; width:100%; cursor:pointer; outline:none;">';
        instance.canvas.append(myDiv);

        // garante posição relativa para o ícone absoluto
        try { instance.canvas.css("position", "relative"); } catch(e){}

        // ---------- ÍCONE (SVG moderno; URL customizada continua suportada) ----------
        try {
            var iconHtml = '';
            var isz = instance.data.iconsize;
            if (instance.data.iconurl && instance.data.iconurl.trim() !== '') {
                iconHtml = '<img id="' + instance.data.iconid + '" src="' + instance.data.iconurl + '" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); pointer-events:auto; user-select:none; cursor:pointer; width:' + isz + 'px; height:' + isz + 'px; opacity:.85;">';
            } else {
                var svg;
                if (instance.data.format === 'time') {
                    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + isz + '" height="' + isz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>';
                } else {
                    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + isz + '" height="' + isz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
                }
                iconHtml = '<span id="' + instance.data.iconid + '" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); display:flex; align-items:center; pointer-events:auto; user-select:none; cursor:pointer; opacity:.7; color:inherit; transition:opacity .15s;">' + svg + '</span>';
            }
            instance.canvas.append(iconHtml);
        } catch(e){}

        const canvas = instance.canvas;
        if (instance.data.fitwidthtocontent == true) {
            canvas.css("width", "max-content");
        } else {
            canvas.css("width", "100%");
        }
        if (instance.data.fitheighttocontent == true) {
            canvas.css("height", "max-content");
        } else {
            canvas.css("height", "100%");
        }
        if (instance.data.vcenter) {
            canvas.css("display", "flex");
            canvas.css("justifyContent", "center");
            canvas.css("alignItems", "center");
        }

        var input = document.getElementById(instance.data.inputid);

        // força preenchimento e centralização do input
        try {
            input.style.width = (instance.data.input_width != null) ? (instance.data.input_width + 'px') : '100%';
            input.style.height = (instance.data.input_height != null) ? (instance.data.input_height + 'px') : '100%';
            input.style.boxSizing = 'border-box';
            input.style.textAlign = 'center';
            input.style.padding = (instance.data.input_padding != null) ? (instance.data.input_padding + 'px') : '0';
            requestAnimationFrame(function(){
                try {
                    var h = window.getComputedStyle(input).height;
                    if (h && h !== 'auto') input.style.lineHeight = h;
                } catch(e){}
            });
        } catch(e){}

        // previne popup nativo: readonly, abrimos o nosso
        try { input.setAttribute('readonly', 'readonly'); input.setAttribute('inputmode', 'none'); } catch (e) {}

        // ---------- HELPERS ----------
        function pad(n){ return (n<10 ? '0'+n : ''+n); }
        function toDateString(d){ return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
        function toTimeString(d){ return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
        function toDateTimeLocalString(d){ return toDateString(d) + 'T' + toTimeString(d); }

        var MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        var MESES_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        var SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

        // ---------- REGISTRO GLOBAL: apenas um picker aberto por vez ----------
        window.__smartDTP = window.__smartDTP || {};
        function closeOthers(){
            for (var k in window.__smartDTP) {
                if (k !== instance.data.popupid) { try { window.__smartDTP[k](); } catch(e){} }
            }
        }

        // ---------- POPUP ----------
        // Portal para <html>, NÃO para <body>: apps costumam aplicar
        // filter/backdrop-filter no <body> (ou num wrapper interno) quando um
        // popup deles abre, para borrar o fundo. Um filter em um ancestral borra
        // TODOS os descendentes, não importa z-index — só quem está FORA dessa
        // árvore escapa. <html> é irmão de <body>, nunca descendente dele.
        var portalRoot = document.documentElement;
        function ensurePopup() {
            var existing = document.getElementById(instance.data.popupid);
            if (existing) return existing;
            var p = document.createElement('div');
            p.id = instance.data.popupid;
            // position:fixed + z-index máximo: fica acima de popups/greyout/blur do Bubble
            p.style.position = 'fixed';
            p.style.zIndex = '2147483647';
            p.style.display = 'none';
            // isolation:isolate cria stacking context próprio — nada de fora "vaza" pra cima dele
            p.style.isolation = 'isolate';
            // blindagem: nunca deixa um seletor genérico (ex.: "body.popup-open *")
            // aplicar blur no próprio popup, mesmo que ele acabe dentro do body
            p.style.setProperty('filter', 'none', 'important');
            p.style.setProperty('backdrop-filter', 'none', 'important');
            p.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            p.setAttribute('data-open','false');
            // cliques internos não se propagam ao documento (evita fechamento indevido)
            p.addEventListener('click', function(e){ e.stopPropagation(); });
            portalRoot.appendChild(p);
            return p;
        }

        var popup = ensurePopup();
        window.__smartDTP[instance.data.popupid] = function(){ closePopup(); };

        // ---------- GUARDA DE EMPILHAMENTO ----------
        // Bubble pode injetar seus próprios popups/greyout (blur) DEPOIS que nosso
        // popup já existe no DOM. Em caso de z-index empatado, quem vem depois no
        // DOM vence — por isso mantemos nosso popup sempre como o último filho do
        // portal (fora do <body>) enquanto ele estiver aberto, e vigiamos novas
        // inserções tanto no portal quanto no <body> (caso algo tente nos mover).
        var bodyGuard = null;
        function bringToFront() {
            if (popup.parentNode !== portalRoot || portalRoot.lastElementChild !== popup) {
                portalRoot.appendChild(popup); // move (não clona) o node existente
            }
        }
        function startBodyGuard() {
            if (bodyGuard || typeof MutationObserver === 'undefined') return;
            bodyGuard = new MutationObserver(function(){ bringToFront(); });
            bodyGuard.observe(portalRoot, { childList: true });
            bodyGuard.observe(document.body, { childList: true });
        }
        function stopBodyGuard() {
            if (bodyGuard) { bodyGuard.disconnect(); bodyGuard = null; }
        }

        function closePopup() {
            popup.style.display = 'none';
            popup.setAttribute('data-open','false');
            stopBodyGuard();
            document.removeEventListener('click', onDocClick);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', positionPopup);
            window.removeEventListener('scroll', positionPopup, true);
        }

        function onDocClick(e){
            var el = e.target;
            if (!el) return;
            if (el === input || input.contains(el)) return;
            var ic = document.getElementById(instance.data.iconid);
            if (ic && (el === ic || ic.contains(el))) return;
            if (popup.contains(el)) return;
            closePopup();
        }

        function onKeyDown(e){
            if (e.key === 'Escape') closePopup();
        }

        function positionPopup() {
            var rect = input.getBoundingClientRect();
            var pw = popup.offsetWidth, ph = popup.offsetHeight;
            var margin = 8;
            var dir = instance.data.popup_direction || 'down';
            var spaceBelow = window.innerHeight - rect.bottom;
            var spaceAbove = rect.top;
            // flip automático quando não há espaço na direção escolhida
            if (dir === 'up'   && spaceAbove < ph + margin && spaceBelow > spaceAbove) dir = 'down';
            if (dir === 'down' && spaceBelow < ph + margin && spaceAbove > spaceBelow) dir = 'up';
            var top = (dir === 'up') ? rect.top - ph - 6 : rect.bottom + 6;
            top = Math.max(margin, Math.min(top, window.innerHeight - ph - margin));
            var left = rect.left;
            left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin));
            popup.style.top = top + 'px';
            popup.style.left = left + 'px';
            if (instance.data.enforce_min_width_for_popup) {
                popup.style.minWidth = rect.width + 'px';
            } else {
                popup.style.minWidth = '';
            }
        }

        // ---------- ESTADO INTERNO DO PICKER ----------
        var view = 'days';          // days | months | years
        var viewYear, viewMonth;
        var selDate = null;         // Date (parte da data) selecionada
        var selHour = null, selMin = null;

        // lê o valor atual do input (parse local, sem bug de fuso horário)
        function parseInputValue(){
            var fmt = instance.data.format;
            var v = input.value;
            selDate = null; selHour = null; selMin = null;
            if (!v) return;
            try {
                var p, t;
                if (fmt === 'time') {
                    p = v.split(':'); selHour = Number(p[0]); selMin = Number(p[1]);
                } else if (fmt === 'month') {
                    p = v.split('-'); selDate = new Date(Number(p[0]), Number(p[1]) - 1, 1);
                } else if (fmt === 'date') {
                    p = v.split('-'); selDate = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
                } else { // datetime-local
                    var dt = v.split('T');
                    p = dt[0].split('-');
                    selDate = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
                    if (dt[1]) { t = dt[1].split(':'); selHour = Number(t[0]); selMin = Number(t[1]); }
                }
            } catch(e){ selDate = null; selHour = null; selMin = null; }
        }

        // ---------- LIMITES MIN/MAX ----------
        function parseLimit(val){
            if (val == null || val === '') return null;
            if (typeof val === 'string' && /^\s*\d{1,2}:\d{2}\s*$/.test(val)) {
                var p = val.trim().split(':');
                return { time: Number(p[0]) * 60 + Number(p[1]) };
            }
            var d = new Date(val);
            return isNaN(d.getTime()) ? null : { date: d };
        }
        function getLimits(){
            var mn = parseLimit(instance.data.min), mx = parseLimit(instance.data.max);
            return {
                minDay:  (mn && mn.date) ? new Date(mn.date.getFullYear(), mn.date.getMonth(), mn.date.getDate()).getTime() : null,
                maxDay:  (mx && mx.date) ? new Date(mx.date.getFullYear(), mx.date.getMonth(), mx.date.getDate()).getTime() : null,
                minTime: mn ? (mn.time != null ? mn.time : (mn.date ? mn.date.getHours()*60 + mn.date.getMinutes() : null)) : null,
                maxTime: mx ? (mx.time != null ? mx.time : (mx.date ? mx.date.getHours()*60 + mx.date.getMinutes() : null)) : null
            };
        }
        function dayDisabled(y,m,d){
            var L = getLimits();
            var t = new Date(y,m,d).getTime();
            return (L.minDay != null && t < L.minDay) || (L.maxDay != null && t > L.maxDay);
        }
        function monthDisabled(y,m){
            var L = getLimits();
            var first = new Date(y,m,1).getTime();
            var last  = new Date(y,m+1,0).getTime();
            return (L.minDay != null && last < L.minDay) || (L.maxDay != null && first > L.maxDay);
        }
        function yearDisabled(y){
            var L = getLimits();
            var first = new Date(y,0,1).getTime();
            var last  = new Date(y,11,31).getTime();
            return (L.minDay != null && last < L.minDay) || (L.maxDay != null && first > L.maxDay);
        }
        function hourDisabled(h){
            if (instance.data.format !== 'time') return false;
            var L = getLimits();
            return (L.minTime != null && (h*60 + 59) < L.minTime) || (L.maxTime != null && h*60 > L.maxTime);
        }
        function minuteDisabled(h, mi){
            if (instance.data.format !== 'time' || h == null) return false;
            var L = getLimits();
            var t = h*60 + mi;
            return (L.minTime != null && t < L.minTime) || (L.maxTime != null && t > L.maxTime);
        }

        // ---------- PUBLICAÇÃO DE VALOR ----------
        function publishSelection(dateObj){
            instance.publishState("date", dateObj);
            instance.publishState("date_string", input.value.toString());
            instance.triggerEvent('dateready');
        }
        function applyValueFromDate(d){
            var fmt = instance.data.format || 'datetime-local';
            if (fmt === 'date') {
                input.value = toDateString(d);
                publishSelection(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
            } else if (fmt === 'month') {
                input.value = toDateString(d).slice(0, 7);
                publishSelection(new Date(d.getFullYear(), d.getMonth(), 1));
            } else if (fmt === 'time') {
                input.value = toTimeString(d);
                var t = new Date(); t.setHours(d.getHours(), d.getMinutes(), 0, 0);
                publishSelection(t);
            } else {
                input.value = toDateTimeLocalString(d);
                var dt = new Date(d.getTime()); dt.setSeconds(0,0);
                publishSelection(dt);
            }
        }
        function clearValue(){
            input.value = '';
            selDate = null; selHour = null; selMin = null;
            instance.publishState("date", null);
            instance.publishState("date_string", "");
            instance.triggerEvent('reset');
        }

        // ---------- RENDERERS ----------
        function renderHeader(title, titleClickable){
            return '<div class="dp-header">' +
                   '<button type="button" class="dp-nav dp-prev" aria-label="Anterior">&#8249;</button>' +
                   '<button type="button" class="dp-title' + (titleClickable ? ' dp-title-btn' : '') + '">' + title + '</button>' +
                   '<button type="button" class="dp-nav dp-next" aria-label="Próximo">&#8250;</button>' +
                   '</div>';
        }

        function renderDays() {
            var y = viewYear, m = viewMonth;
            var firstDay = new Date(y, m, 1).getDay();
            var daysInMonth = new Date(y, m + 1, 0).getDate();
            var today = new Date();
            var html = renderHeader(MESES[m] + ' ' + y, true);
            html += '<div class="dp-weeknames">';
            for (var w=0; w<7; w++) html += '<div>' + SEMANA[w] + '</div>';
            html += '</div><div class="dp-days">';
            for (var i=0; i<firstDay; i++) html += '<div class="dp-day empty"></div>';
            for (var d=1; d<=daysInMonth; d++){
                var cls = 'dp-day';
                if (selDate && selDate.getFullYear() === y && selDate.getMonth() === m && selDate.getDate() === d) cls += ' dp-selected';
                else if (today.getFullYear() === y && today.getMonth() === m && today.getDate() === d) cls += ' dp-today';
                if (dayDisabled(y,m,d)) cls += ' dp-disabled';
                html += '<div class="' + cls + '" data-day="' + d + '">' + d + '</div>';
            }
            html += '</div>';
            return html;
        }

        function renderMonths() {
            var html = renderHeader(String(viewYear), true);
            html += '<div class="dp-months">';
            for (var m=0; m<12; m++){
                var cls = 'dp-month';
                if (selDate && selDate.getFullYear() === viewYear && selDate.getMonth() === m) cls += ' dp-selected';
                if (monthDisabled(viewYear, m)) cls += ' dp-disabled';
                html += '<div class="' + cls + '" data-month="' + m + '">' + MESES_ABREV[m] + '</div>';
            }
            html += '</div>';
            return html;
        }

        function renderYears() {
            var start = viewYear - (viewYear % 12);
            var html = renderHeader(start + ' – ' + (start + 11), false);
            html += '<div class="dp-years">';
            for (var y=start; y<start+12; y++){
                var cls = 'dp-year';
                if (selDate && selDate.getFullYear() === y) cls += ' dp-selected';
                if (yearDisabled(y)) cls += ' dp-disabled';
                html += '<div class="' + cls + '" data-year="' + y + '">' + y + '</div>';
            }
            html += '</div>';
            return html;
        }

        function renderTimeSelector() {
            var step = instance.data.step || 1;
            var html = '<div class="dp-timecols"><div class="dp-hours"><div class="dp-coltitle"><span>Hora</span></div>';
            for (var h=0; h<24; h++){
                var cls = 'dp-timeitem';
                if (selHour === h) cls += ' dp-selected';
                if (hourDisabled(h)) cls += ' dp-disabled';
                html += '<div class="' + cls + '" data-hour="' + h + '">' + pad(h) + '</div>';
            }
            html += '</div><div class="dp-mins"><div class="dp-coltitle"><span>Min</span></div>';
            for (var mm=0; mm<60; mm += step){
                var cls2 = 'dp-timeitem';
                if (selMin === mm) cls2 += ' dp-selected';
                if (minuteDisabled(selHour, mm)) cls2 += ' dp-disabled';
                html += '<div class="' + cls2 + '" data-min="' + mm + '">' + pad(mm) + '</div>';
            }
            html += '</div></div>';
            return html;
        }

        function renderFooter() {
            var fmt = instance.data.format || 'datetime-local';
            var mainLabel = (fmt === 'time' || fmt === 'datetime-local') ? 'Agora' : (fmt === 'month' ? 'Este mês' : 'Hoje');
            return '<div class="dp-footer">' +
                   '<button type="button" class="dp-btn dp-btn-clear">Limpar</button>' +
                   '<button type="button" class="dp-btn dp-btn-now">' + mainLabel + '</button>' +
                   '</div>';
        }

        function render() {
            var fmt = instance.data.format || 'datetime-local';
            var core;
            if (fmt === 'time') {
                core = renderTimeSelector();
            } else if (view === 'months') {
                core = renderMonths();
            } else if (view === 'years') {
                core = renderYears();
            } else if (fmt === 'datetime-local') {
                core = '<div class="dp-datetime-grid"><div class="dp-left">' + renderDays() + '</div><div class="dp-right">' + renderTimeSelector() + '</div></div>';
            } else {
                core = renderDays();
            }
            popup.innerHTML = core + renderFooter();
            bindHandlers();
        }

        function scrollTimeIntoView() {
            ['.dp-hours', '.dp-mins'].forEach(function(sel){
                var col = popup.querySelector(sel);
                if (!col) return;
                var target = col.querySelector('.dp-selected');
                if (!target && sel === '.dp-hours') {
                    target = col.querySelector('[data-hour="' + new Date().getHours() + '"]');
                }
                if (target) col.scrollTop = Math.max(0, target.offsetTop - col.clientHeight/2 + target.offsetHeight/2);
            });
        }

        // ---------- COMMIT ----------
        function tryCommitTime() {
            if (selHour == null || selMin == null) return false;
            var fmt = instance.data.format || 'datetime-local';
            if (fmt === 'time') {
                var d = new Date(); d.setHours(selHour, selMin, 0, 0);
                applyValueFromDate(d);
            } else {
                var base = selDate || new Date();
                applyValueFromDate(new Date(base.getFullYear(), base.getMonth(), base.getDate(), selHour, selMin));
            }
            closePopup();
            return true;
        }

        // ---------- BINDINGS ----------
        function bindHandlers() {
            var fmt = instance.data.format || 'datetime-local';
            var prev = popup.querySelector('.dp-prev');
            var next = popup.querySelector('.dp-next');
            var title = popup.querySelector('.dp-title');

            function navigate(dir){
                if (view === 'days') {
                    viewMonth += dir;
                    if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
                    if (viewMonth > 11) { viewMonth = 0;  viewYear++; }
                } else if (view === 'months') {
                    viewYear += dir;
                } else if (view === 'years') {
                    viewYear += 12 * dir;
                }
                render();
            }

            if (prev) prev.addEventListener('click', function(){ navigate(-1); });
            if (next) next.addEventListener('click', function(){ navigate(1); });
            if (title && title.classList.contains('dp-title-btn')) {
                title.addEventListener('click', function(){
                    if (view === 'days') view = 'months';
                    else if (view === 'months') view = 'years';
                    render();
                });
            }

            popup.querySelectorAll('.dp-day').forEach(function(el){
                if (el.classList.contains('empty') || el.classList.contains('dp-disabled')) return;
                el.addEventListener('click', function(){
                    var d = Number(this.getAttribute('data-day'));
                    selDate = new Date(viewYear, viewMonth, d);
                    if (fmt === 'date') {
                        applyValueFromDate(selDate);
                        closePopup();
                    } else { // datetime-local: marca o dia e mantém aberto até escolher a hora
                        popup.querySelectorAll('.dp-day').forEach(function(x){ x.classList.remove('dp-selected'); });
                        this.classList.add('dp-selected');
                        tryCommitTime();
                    }
                });
            });

            popup.querySelectorAll('.dp-month').forEach(function(el){
                if (el.classList.contains('dp-disabled')) return;
                el.addEventListener('click', function(){
                    var m = Number(this.getAttribute('data-month'));
                    if (fmt === 'month') {
                        selDate = new Date(viewYear, m, 1);
                        applyValueFromDate(selDate);
                        closePopup();
                    } else {
                        viewMonth = m;
                        view = 'days';
                        render();
                    }
                });
            });

            popup.querySelectorAll('.dp-year').forEach(function(el){
                if (el.classList.contains('dp-disabled')) return;
                el.addEventListener('click', function(){
                    viewYear = Number(this.getAttribute('data-year'));
                    view = 'months';
                    render();
                });
            });

            popup.querySelectorAll('.dp-hours .dp-timeitem').forEach(function(el){
                if (el.classList.contains('dp-disabled')) return;
                el.addEventListener('click', function(){
                    popup.querySelectorAll('.dp-hours .dp-timeitem').forEach(function(x){ x.classList.remove('dp-selected'); });
                    this.classList.add('dp-selected');
                    selHour = Number(this.getAttribute('data-hour'));
                    // atualiza minutos desabilitados conforme a hora (formato time)
                    popup.querySelectorAll('.dp-mins .dp-timeitem').forEach(function(x){
                        var mi = Number(x.getAttribute('data-min'));
                        x.classList.toggle('dp-disabled', minuteDisabled(selHour, mi));
                    });
                    tryCommitTime();
                });
            });

            popup.querySelectorAll('.dp-mins .dp-timeitem').forEach(function(el){
                el.addEventListener('click', function(){
                    if (this.classList.contains('dp-disabled')) return;
                    popup.querySelectorAll('.dp-mins .dp-timeitem').forEach(function(x){ x.classList.remove('dp-selected'); });
                    this.classList.add('dp-selected');
                    selMin = Number(this.getAttribute('data-min'));
                    tryCommitTime();
                });
            });

            var btnClear = popup.querySelector('.dp-btn-clear');
            if (btnClear) btnClear.addEventListener('click', function(){ clearValue(); closePopup(); });
            var btnNow = popup.querySelector('.dp-btn-now');
            if (btnNow) btnNow.addEventListener('click', function(){ applyValueFromDate(new Date()); closePopup(); });
        }

        // ---------- ABERTURA ----------
        function openPopupForFormat() {
            closeOthers();
            if (popup.getAttribute('data-open') === 'true') { positionPopup(); return; }

            parseInputValue();
            var base = selDate;
            if (!base && instance.data.initialdate) {
                var d0 = new Date(instance.data.initialdate);
                if (!isNaN(d0.getTime())) base = d0;
            }
            if (!base) base = new Date();
            viewYear = base.getFullYear();
            viewMonth = base.getMonth();
            view = (instance.data.format === 'month') ? 'months' : 'days';

            applyPopupStyle();
            render();

            bringToFront(); // garante que nenhum overlay/blur criado antes fique acima
            popup.style.display = 'block';
            popup.setAttribute('data-open','true');
            positionPopup();
            scrollTimeIntoView();
            startBodyGuard(); // protege contra overlays criados DEPOIS de abrir

            setTimeout(function(){
                document.addEventListener('click', onDocClick);
                document.addEventListener('keydown', onKeyDown);
            }, 10);
            window.addEventListener('resize', positionPopup);
            window.addEventListener('scroll', positionPopup, true);
        }

        // ---------- ESTILO (moderno) ----------
        function applyPopupStyle() {
            var styleEl = document.getElementById(instance.data.styleid);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = instance.data.styleid;
                document.head.appendChild(styleEl);
            }

            var scheme = instance.data.colorscheme || 'light';
            var bg, border, hover, selected, fontc, fsize;
            if (scheme === 'customized') {
                bg = instance.data.backgroundcolor || '#ffffff';
                border = instance.data.bordercolor || '#e2e4e9';
                hover = instance.data.hovercolor || '#f0f2f5';
                selected = instance.data.selectedcolor || '#007BFF';
                fontc = instance.data.fontcolor || '#1a1c22';
                fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
            } else if (scheme === 'dark') {
                bg = '#212227'; border = '#3a3c44'; hover = '#31333b'; selected = '#4f8cff'; fontc = '#f2f3f5'; fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
            } else if (scheme === 'normal') {
                bg = '#f9fafb'; border = '#d9dce1'; hover = '#eceef1'; selected = '#007BFF'; fontc = '#1a1c22'; fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
            } else { // light / revert
                bg = '#ffffff'; border = '#e2e4e9'; hover = '#f0f2f5'; selected = '#007BFF'; fontc = '#1a1c22'; fsize = (instance.data.fontsize != null) ? instance.data.fontsize + 'px' : '14px';
            }

            var radius = (instance.data.borderradius != null) ? instance.data.borderradius : 12;
            var borderw = (instance.data.borderwidth != null) ? instance.data.borderwidth : 1;
            var selPad = (instance.data.selectionpadding != null) ? instance.data.selectionpadding : 10;
            var r2 = Math.max(4, radius - 4);
            var anim = 'dpfade-' + instance.data.divid;

            var css = `
                #${instance.data.inputid}::-webkit-calendar-picker-indicator { display:none; -webkit-appearance:none; opacity:0; }
                #${instance.data.iconid}:hover { opacity:1 !important; }

                @keyframes ${anim} {
                    from { opacity:0; transform: translateY(-6px) scale(.98); }
                    to   { opacity:1; transform: none; }
                }

                #${instance.data.popupid} {
                    position: fixed !important;
                    z-index: 2147483647 !important;
                    filter: none !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                    width: max-content;
                    max-width: calc(100vw - 16px);
                    max-height: calc(100vh - 16px);
                    background: ${bg};
                    border: ${borderw}px solid ${border};
                    border-radius: ${radius}px;
                    padding: 12px;
                    box-shadow: 0 12px 32px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08);
                    color: ${fontc};
                    font-size: ${fsize};
                    font-family: inherit;
                    user-select: none;
                    -webkit-user-select: none;
                    overflow: auto;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    animation: ${anim} .18s cubic-bezier(.2,.9,.3,1);
                }
                #${instance.data.popupid}::-webkit-scrollbar { display:none; width:0; height:0; }

                #${instance.data.popupid} .dp-header { display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:8px; }
                #${instance.data.popupid} .dp-nav {
                    width:30px; height:30px; display:flex; align-items:center; justify-content:center;
                    border:none; background:transparent; color:inherit; font-size:20px; line-height:1;
                    border-radius:${r2}px; cursor:pointer; transition:background .15s; padding:0 0 3px 0; font-family:inherit;
                }
                #${instance.data.popupid} .dp-nav:hover { background:${hover}; }
                #${instance.data.popupid} .dp-title {
                    border:none; background:transparent; color:inherit; font-weight:600; font-size:1em;
                    padding:5px 10px; border-radius:${r2}px; cursor:default; font-family:inherit; white-space:nowrap;
                }
                #${instance.data.popupid} .dp-title-btn { cursor:pointer; transition:background .15s; }
                #${instance.data.popupid} .dp-title-btn:hover { background:${hover}; }

                #${instance.data.popupid} .dp-weeknames {
                    display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:4px; text-align:center;
                    font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; opacity:.55;
                }
                #${instance.data.popupid} .dp-weeknames div { padding:2px 0; }

                #${instance.data.popupid} .dp-days { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
                #${instance.data.popupid} .dp-day {
                    padding:${selPad}px; min-width:32px; text-align:center; border-radius:${r2}px;
                    cursor:pointer; box-sizing:border-box; transition:background .12s, color .12s, transform .06s;
                }
                #${instance.data.popupid} .dp-day.empty { background:transparent; cursor:default; }
                #${instance.data.popupid} .dp-day:not(.empty):not(.dp-disabled):not(.dp-selected):hover { background:${hover}; }
                #${instance.data.popupid} .dp-day:not(.empty):not(.dp-disabled):active { transform:scale(.94); }
                #${instance.data.popupid} .dp-day.dp-today { box-shadow: inset 0 0 0 1.5px ${selected}; font-weight:600; }
                #${instance.data.popupid} .dp-day.dp-selected { background:${selected}; color:#ffffff; font-weight:600; }

                #${instance.data.popupid} .dp-months, #${instance.data.popupid} .dp-years {
                    display:grid; grid-template-columns:repeat(3,1fr); gap:6px; min-width:224px;
                }
                #${instance.data.popupid} .dp-month, #${instance.data.popupid} .dp-year {
                    padding:${selPad + 2}px 4px; text-align:center; border-radius:${r2}px; cursor:pointer;
                    box-sizing:border-box; transition:background .12s, color .12s;
                }
                #${instance.data.popupid} .dp-month:not(.dp-disabled):not(.dp-selected):hover,
                #${instance.data.popupid} .dp-year:not(.dp-disabled):not(.dp-selected):hover { background:${hover}; }
                #${instance.data.popupid} .dp-month.dp-selected, #${instance.data.popupid} .dp-year.dp-selected { background:${selected}; color:#ffffff; font-weight:600; }

                #${instance.data.popupid} .dp-disabled { opacity:.32; pointer-events:none; }

                #${instance.data.popupid} .dp-datetime-grid { display:flex; gap:14px; align-items:stretch; }
                #${instance.data.popupid} .dp-datetime-grid .dp-left { flex:1 1 auto; min-width:230px; }
                #${instance.data.popupid} .dp-datetime-grid .dp-right { flex:0 0 auto; border-left:1px solid ${border}; padding-left:14px; display:flex; }

                #${instance.data.popupid} .dp-timecols { display:flex; gap:6px; }
                #${instance.data.popupid} .dp-hours, #${instance.data.popupid} .dp-mins {
                    position:relative; height:264px; min-width:52px; overflow-y:auto;
                    -ms-overflow-style:none; scrollbar-width:none; scroll-behavior:smooth;
                }
                #${instance.data.popupid} .dp-hours::-webkit-scrollbar,
                #${instance.data.popupid} .dp-mins::-webkit-scrollbar { display:none; width:0; height:0; }
                #${instance.data.popupid} .dp-coltitle {
                    position:sticky; top:0; z-index:2; background:${bg}; text-align:center; padding:2px 0 6px 0;
                    font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.05em;
                }
                #${instance.data.popupid} .dp-coltitle span { opacity:.55; }
                #${instance.data.popupid} .dp-timeitem {
                    padding:${Math.max(6, selPad - 2)}px 4px; margin:0 2px; text-align:center; cursor:pointer;
                    border-radius:${r2}px; box-sizing:border-box; transition:background .12s, color .12s;
                }
                #${instance.data.popupid} .dp-timeitem:not(.dp-disabled):not(.dp-selected):hover { background:${hover}; }
                #${instance.data.popupid} .dp-timeitem.dp-selected { background:${selected}; color:#ffffff; font-weight:600; }

                #${instance.data.popupid} .dp-footer {
                    display:flex; justify-content:space-between; align-items:center;
                    margin-top:10px; padding-top:8px; border-top:1px solid ${border};
                }
                #${instance.data.popupid} .dp-btn {
                    border:none; background:transparent; font-family:inherit; font-size:.92em; font-weight:600;
                    padding:6px 10px; border-radius:${r2}px; cursor:pointer; transition:background .15s; color:${selected};
                }
                #${instance.data.popupid} .dp-btn:hover { background:${hover}; }
                #${instance.data.popupid} .dp-btn-clear { color:${fontc}; opacity:.65; }
            `;
            styleEl.innerHTML = css;
        }

        // expõe para o update.js
        instance.data.applyPopupStyle = applyPopupStyle;
        instance.data.refreshPopup = function(){
            if (popup.getAttribute('data-open') === 'true') {
                applyPopupStyle();
                render();
                positionPopup();
            }
        };

        // ---------- ABRIR ----------
        input.addEventListener('focus', function(e){ e.preventDefault(); openPopupForFormat(); });
        input.addEventListener('click', function(e){ e.preventDefault(); openPopupForFormat(); });

        try {
            var iconEl = document.getElementById(instance.data.iconid);
            if (iconEl) {
                iconEl.addEventListener('click', function(e){
                    e.stopPropagation();
                    openPopupForFormat();
                    try { input.focus(); } catch(ex){}
                });
            }
        } catch(e){}

        input.addEventListener('keydown', function(e){
            if (e.key === 'Escape') closePopup();
        });

        // ---------- VALOR INICIAL ----------
        function formatAndSetInitial() {
            if (!instance.data.initialdate) return;
            var d = new Date(instance.data.initialdate);
            if (isNaN(d.getTime())) return;
            var fmt = instance.data.format;
            if (fmt === 'date') {
                input.value = toDateString(d);
                instance.publishState("date", new Date(d.getFullYear(), d.getMonth(), d.getDate()));
            } else if (fmt === 'month') {
                input.value = toDateString(d).slice(0, 7);
                instance.publishState("date", new Date(d.getFullYear(), d.getMonth(), 1));
            } else if (fmt === 'datetime-local') {
                input.value = toDateTimeLocalString(d);
                var dt = new Date(d.getTime()); dt.setSeconds(0,0);
                instance.publishState("date", dt);
            } else if (fmt === 'time') {
                input.value = toTimeString(d);
                var t = new Date(); t.setHours(d.getHours(), d.getMinutes(), 0, 0);
                instance.publishState("date", t);
            }
            instance.publishState("date_string", input.value.toString());
        }
        try { formatAndSetInitial(); } catch(e){}

        // ---------- CLEANUP ----------
        var cleanupFn = function(){
            try { closePopup(); } catch(e){}
            try { delete window.__smartDTP[instance.data.popupid]; } catch(e){}
            try { var s = document.getElementById(instance.data.styleid); if (s) s.parentNode.removeChild(s);} catch(e){}
            try { var p = document.getElementById(instance.data.popupid); if (p) p.parentNode.removeChild(p);} catch(e){}
            try { var ic = document.getElementById(instance.data.iconid); if (ic) ic.parentNode.removeChild(ic);} catch(e){}
        };

        if (typeof instance.on === 'function') {
            instance.on('unload', cleanupFn);
        } else {
            window.addEventListener('unload', cleanupFn);
        }

    }); // document ready end
}
