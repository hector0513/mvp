var name = jQuery("#Welcome-requeriments-refers").text();

jQuery("input[name = 'radio']").click(function() {
    if(jQuery("#radio0").is(':checked')) {
        $('#finance_daily').fadeIn('fast');
        $('#Welcome-requeriments-refers').text(name);
		$('#finance_daily').css('display', 'flex');
		$('#newrequirement').css('display', 'flex');
		$('#requeriments').hide();
		$('#refereds').hide();
    $('#todo_calendar').hide();
    $('#notices').hide();
    } else if(jQuery("#radio1").is(':checked')) {
        $('#requeriments').fadeIn('fast');
        $('#Welcome-requeriments-refers').text('Requerimientos');
		$('#requeriments').css('display', 'flex');
		$('#newrequirement').css('display', 'flex');
		$('#finance_daily').hide();
		$('#refereds').hide();
    $('#todo_calendar').hide();
    $('#notices').hide();
  } else if(jQuery("#radio2").is(':checked')) {
		$('#requeriments').hide();
        $('#Welcome-requeriments-refers').text('Referidos');
		$('#requeriments').css('display', 'none');
		$('#finance_daily').css('display', 'none');
		$('#newrequirement').css('display', 'none');
    $('#todo_calendar').hide();
		$('#finance_daily').hide();
		$('#refereds').fadeIn('fast');
    $('#notices').hide();
	} else if(jQuery("#radio3").is(':checked')){
    $('#todo_calendar').fadeIn('fast');
    $('#todo_calendar').css('display', 'flex');
		$('#requeriments').hide();
    $('#Welcome-requeriments-refers').text('TO DO');
		$('#requeriments').css('display', 'none');
		$('#finance_daily').css('display', 'none');
		$('#newrequirement').css('display', 'none');
    $('#refereds').hide();
		$('#finance_daily').hide();
    $('#notices').hide();
	} else {
    $('#notices').fadeIn('fast');
    $('#notices').css('display', 'flex');
    $('#requeriments').hide();
    $('#Welcome-requeriments-refers').text('Propuestas de Servicio');
    $('#requeriments').css('display', 'none');
    $('#finance_daily').css('display', 'none');
    $('#newrequirement').css('display', 'none');
    $('#refereds').hide();
    $('#finance_daily').hide();
    $('#todo_calendar').hide();
  }
});

jQuery("input[name = 'radio2']").click(function() {
    if(jQuery("#radio00").is(':checked')) {
        $('.all').show();
		$('.process').hide();
		$('.not_inicialised').hide();
		$('.cancel').hide();
		$('.completed').hide();
		$('.saver').hide();
    } else if(jQuery("#radio11").is(':checked')) {
        $('.all').hide();
		$('.process').show();
		$('.not_inicialised').hide();
		$('.cancel').hide();
		$('.completed').hide();
		$('.saver').hide();
    } else if(jQuery("#radio22").is(':checked')) {
        $('.all').hide();
		$('.process').hide();
		$('.not_inicialised').show();
		$('.cancel').hide();
		$('.completed').hide();
		$('.saver').hide();
    } else if(jQuery("#radio33").is(':checked')) {
        $('.all').hide();
		$('.process').hide();
		$('.not_inicialised').hide();
		$('.cancel').show();
		$('.completed').hide();
		$('.saver').hide();
    } else if(jQuery("#radio44").is(':checked')) {
        $('.all').hide();
		$('.process').hide();
		$('.not_inicialised').hide();
		$('.cancel').hide();
		$('.completed').show();
		$('.saver').hide();
    } else if(jQuery("#radio55").is(':checked')) {
        $('.all').hide();
		$('.process').hide();
		$('.not_inicialised').hide();
		$('.cancel').hide();
		$('.completed').hide();
		$('.saver').show();
    }
});

jQuery("input[name = 'radio4']").click(function() {
    if(jQuery("#radio000").is(':checked')) {
        $('#all_refers').attr("style", "display: flex !important");
		$('#client_refers').attr("style", "display: none !important");
		$('#partner_refers').attr("style", "display: none !important");
    } else if(jQuery("#radio111").is(':checked')) {
        $('#all_refers').attr("style", "display: none !important");
		$('#client_refers').attr("style", "display: flex !important");
		$('#partner_refers').attr("style", "display: none !important");
    } else if(jQuery("#radio222").is(':checked')) {
        $('#all_refers').attr("style", "display: none !important");
		$('#client_refers').attr("style", "display: none !important");
		$('#partner_refers').attr("style", "display: flex !important");
    }
});

//design input file and add text

;( function( $, window, document, undefined )
{
	$( '.inputfile' ).each( function()
	{
		var $input	 = $( this ),
			$label	 = $input.next( 'label' ),
			labelVal = $label.html();

		$input.on( 'change', function( e )
		{
			var fileName = '';

			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else if( e.target.value )
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName )
				$label.find( 'span' ).html( fileName );
			else
				$label.html( labelVal );
		});

		// Firefox bug fix
		$input
		.on( 'focus', function(){ $input.addClass( 'has-focus' ); })
		.on( 'blur', function(){ $input.removeClass( 'has-focus' ); });
	});
})( jQuery, window, document );

//Animation Form next steps
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

jQuery("button.steps1").click(function(){
	if(animating) return true;
	animating = true;

	current_fs = jQuery(this).parent();
	next_fs = jQuery(this).parent().next();

	//activate next step on progressbar using the index of next_fs
	jQuery("#progressbar li a").eq(jQuery("fieldset").index(next_fs)).removeClass("user_style_disallow");
	jQuery("#progressbar li a").eq(jQuery("fieldset").index(next_fs)).addClass("user_style");
	jQuery("#progressbar li a p").eq(jQuery("fieldset").index(next_fs)).css({ color: "#4444ff" });

	//show the next fieldset
	next_fs.show();
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
		'position': 'absolute',
		'width': '88%',
      });
			next_fs.css({'left': left, 'opacity': opacity});
		},
		duration: 800,
		complete: function(){
			current_fs.hide();
			animating = false;
		},
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

jQuery("button.return").click(function(){
	if(animating) return false;
	animating = true;

	current_fs = jQuery(this).parent();
	previous_fs = jQuery(this).parent().prev();

	//de-activate current step on progressbar
	jQuery("#progressbar li a").eq(jQuery("fieldset").index(current_fs)).addClass("user_style_disallow");
	jQuery("#progressbar li a p").eq(jQuery("fieldset").index(current_fs)).css({ color: "#d8d8d8" });

	//show the previous fieldset
	previous_fs.show();
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity, 'position': 'relative', 'width': 'auto'});
		},
		duration: 800,
		complete: function(){
			current_fs.hide();
			animating = false;
		},
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

$(".submit").click(function(){
	return false;
})

$("#workerBtn1").click(function() {

    // EL POST ESTA EN WALLET ROUTES PORQUE NO SE DONDE PONERLO. OBVIO NO VA AHI
    $.post("/api/users/changeWork")
    .done( function(data){

        location.reload();

    })
    .fail( function(xhr, textStatus, errorThrown){

        console.log(xhr.responseText)
        alert("Error guardando al usuario! " + xhr.responseText)

    });


});

$("#workerBtn2").click(function() {

    // EL POST ESTA EN WALLET ROUTES PORQUE NO SE DONDE PONERLO. OBVIO NO VA AHI
    $.post("/api/users/changeWork")
    .done( function(data){

        location.reload();

    })
    .fail( function(xhr, textStatus, errorThrown){

        console.log(xhr.responseText)
        alert("Error guardando al usuario! " + xhr.responseText)

    });


});

$('#wallet').click(function () {
	$('#Modal-wallet').modal('show');
});

$('#wallet2').click(function () {
	$('#Modal-wallet2').modal('show');
});



$("#inviteBtn").click(function() {

    var email = $("#inviteEmail").val();
    $.post("/client/inviteUser", {
      email
    })
    .done( function(data){

      alert("¡Invitación enviada!")

    })
    .fail( function(xhr, textStatus, errorThrown){

        console.log(xhr.responseText)
        alert("¡Error al invitar usuario! " + xhr.responseText)

    });


});
