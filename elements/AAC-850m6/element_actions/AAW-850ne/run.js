function(instance, properties, context) {

    var input = document.getElementById(instance.data.inputid);
    if (!input) return;

    input.value = "";
    instance.publishState("date", null);
    instance.publishState("date_string", "");

    instance.triggerEvent('reset');

}
