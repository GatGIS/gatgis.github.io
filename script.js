// global variable
var data;

$.get('sample.json', function(d) {
	d.forEach(function(b) {
		$("#kartinas").append(`<figure class="card">
		<div class="card__hero">
			<img src="https://www.maxima.lv${b.Bilde}" alt="" class="card__img">
			<div class="discount-icon">
				<span class="discount-icon" style="background-image: url('https://www.maxima.lv/uploads/sale/empty-4613.png')">${b.Atlaide}</span>
			</div>
			<div class="price-icon">
				<span class="block" style="price-icon">${b.Euro}.${b.Centi} €</span>
			</div>
			<div class="volume-price">
				<span class="volume-price">${b.Cenalitra}</span>
			</div>
		</div>
		<h2 class="card__name">${b.Prece}</h2>
		</figure>`);
	});
});
/*
$.get('sample.json', function(d) {
	var $card, $hero, $name, $discount, $volumePrice, $footer;
	$card = $('<figure class="card"></figure>');
	$hero = $('<div class="cardhero"><img src="https://www.maxima.lv/$%7Bb.Bilde%7D" alt="" class="cardimg"></div>');
	$name = $('<h2 class="cardname">${b.Prece}</h2>');
	$discount = $('<p class="carddetail">${b.Atlaide}</p>');
	$volumePrice = $('<p class="carddetail">${b.Cenalitra}</p>');
	$footer = $('<div class="cardfooter"><p class="card__price">${b.Euro}.${b.Centi} Eur</p></div>');

	$card
		.append($hero)
		.append($name);

	if (...) {
		$card
			.append($discount);
	}

	$card
		.append($volumePrice)
		.append($footer);

	d.forEach(function(b) {
		// now you can put every book in your <div>
		$("#kartinas").append($card);
	});

});
*/
//
//$(function() {                                                                                                                                                                                                                                 
//  function createStatusCard(name,callStatus,handlingTime) {                                                                                                                                                                                    
//    var status_class_map = {                                                                                                                                                                                                                   
//      "On Call" : "active",                                                                                                                                                                                                                    
//      "Idle" : "idle"                                                                                                                                                                                                                          
//    };                                                                                                                                                                                                                                         
//    var $content = $("<div/>").addClass("status-card").addClass(function(){                                                                                                                                                                    
//      return status_class_map[callStatus] || "away";                                                                                                                                                                                           
//    });                                                                                                                                                                                                                                        
//    $content.html('<div class="agent-details">' +                                                                                                                                                                                              
//      '<span class="agent-name">' + name + '</span>' +                                                                                                                                                                                         
//      '<span class="handling-state">' + callStatus + '</span>' +                                                                                                                                                                               
//      '<span class="handling-time">' + handlingTime + '</span>' +                                                                                                                                                                              
//      '</div>' +                                                                                                                                                                                                                               
//      '<div class="status-indicator"></div>');                                                                                                                                                                                                 
//    return $content;                                                                                                                                                                                                                           
//  }                                                                                                                                                                                                                                            
//  $.getJSON('agents.json', function(a) {                                                                                                                                                                                                       
//    $.each(a.agents, function(b, c) {                                                                                                                                                                                                          
//      $("#left").append(createStatusCard(c.name,c.callStatus,c.handlingTime));                                                                                                                                                                 
//    });                                                                                                                                                                                                                                        
//  });                                                                                                                                                                                                                                          
//}); 
//
//var d1 = document.getElementById('one');
//d1.insertAdjacentHTML('beforeend', '<div id="two">two</div>');
//