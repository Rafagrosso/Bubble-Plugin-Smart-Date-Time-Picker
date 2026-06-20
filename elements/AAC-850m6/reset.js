function(instance, context) {

    var input = document.getElementById(instance.data.inputid);

    input.value = "";
    instance.publishState("date");
    instance.publishState("date_string", "");

            function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }

        function formatDate(date) {
            return (
                [
                    date.getFullYear(),
                    padTo2Digits(date.getMonth() + 1),
                    padTo2Digits(date.getDate()),
                ].join('-') +
                ' ' + [
                    padTo2Digits(date.getHours()),
                    padTo2Digits(date.getMinutes()),
                    //                      padTo2Digits(date.getSeconds()),
                ].join(':')
            );
        }
    
       if (instance.data.initialdate && instance.data.format == "date") {

                    input.value = new Date(instance.data.initialdate).toISOString().split('T')[0];
                    instance.publishState("date", input.value);
                    instance.publishState("date_string", input.value.toString());

                } else if (instance.data.initialdate && instance.data.format == "month") {

                    var month = new Date(instance.data.initialdate).toISOString().split('T')[0];
                    input.value = month.slice(0, -3);
                    instance.publishState("date", input.value);
                    instance.publishState("date_string", input.value.toString());

                } else if (instance.data.initialdate && instance.data.format == "datetime-local") {

                    const [date, time] = formatDate(new Date(instance.data.initialdate)).split(' ');
                    input.value = date + 'T' + time;
                    instance.publishState("date", input.value);
                    instance.publishState("date_string", input.value.toString());

                } else if (instance.data.initialdate && instance.data.format == "time") {
                    const [date, time] = formatDate(new Date(instance.data.initialdate)).split(' ');
                    input.value = time;
                    instance.publishState("date", date + 'T' + time);
                    instance.publishState("date_string", input.value.toString());

                }
        
    
    
}