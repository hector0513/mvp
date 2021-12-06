jQuery("input[name = 'switch_2']").click(function() {
    if(jQuery("#switch_left").is(':checked')) {
        $('#client').show(); 
        $('#partner').hide();
    } else {  
        $('#partner').show();
        $('#client').hide();  
    }
});

jQuery("input[name = 'radio']").click(function() {
    if(jQuery("#radio0").is(':checked')) {
        $('#accordion0').show(); 
        $('#accordion1').hide();
        $('#accordion2').hide();
    } else if(jQuery("#radio1").is(':checked')) {
        $('#accordion0').hide(); 
        $('#accordion1').show();
        $('#accordion2').hide();  
    } else {
        $('#accordion0').hide(); 
        $('#accordion1').hide();
        $('#accordion2').show();
    }
});

jQuery('#tabs3-l_tab0 a').click(function (e) {
    e.preventDefault()
    jQuery(this).tab('show')
})