function(instance, properties, context) {

    var input = document.getElementById(instance.data.inputid);
    if (!input || !properties.date) return;

    var d = new Date(properties.date);
    if (isNaN(d.getTime())) return;

    function pad(n){ return (n < 10 ? '0' + n : '' + n); }

    // formatação local — sem deslocamento de fuso horário (toISOString causava off-by-one)
    var ds = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    var ts = pad(d.getHours()) + ':' + pad(d.getMinutes());

    if (instance.data.format == "date") {

        input.value = ds;
        instance.publishState("date", new Date(d.getFullYear(), d.getMonth(), d.getDate()));

    } else if (instance.data.format == "month") {

        input.value = ds.slice(0, 7);
        instance.publishState("date", new Date(d.getFullYear(), d.getMonth(), 1));

    } else if (instance.data.format == "datetime-local") {

        input.value = ds + 'T' + ts;
        var dt = new Date(d.getTime()); dt.setSeconds(0, 0);
        instance.publishState("date", dt);

    } else if (instance.data.format == "time") {

        input.value = ts;
        var t = new Date(); t.setHours(d.getHours(), d.getMinutes(), 0, 0);
        instance.publishState("date", t);

    }

    instance.publishState("date_string", input.value.toString());

    if (properties.triggerevent) {
        instance.triggerEvent('dateready');
    }

}
