function(instance, context) {

    var input = document.getElementById(instance.data.inputid);
    if (!input) return;

    input.value = "";
    instance.publishState("date", null);
    instance.publishState("date_string", "");

    function pad(n){ return (n < 10 ? '0' + n : '' + n); }

    // reaplica o valor inicial (formatação local — sem deslocamento de fuso horário)
    if (instance.data.initialdate) {
        var d = new Date(instance.data.initialdate);
        if (!isNaN(d.getTime())) {
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
        }
    }

}
