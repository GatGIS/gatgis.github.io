$.get('sample.json', function(d) {
	let currentID;
	currentID = 0;
	d.forEach(function(b) {
		if (b.Atlaide == "None") {$AtlaideExist = "hidden"} else {$AtlaideExist = "active"}
		if (b.Cenalitra == "None") {$ClExist = "hidden"} else {$ClExist = "active"}
		if (b.Centi == "None") {$CenaOut = '-' + b.Euro+ '%'} else {$CenaOut = b.Euro+'.'+b.Centi+'€'}
		if (b.Veikals == "Maxima") {$Veikals = "maxima"}
  
		var $card = $(`<figure class="card">
		<div class="card__hero">
			<img src="https://www.maxima.lv${b.Bilde}" alt="" class="card__img">
			<div class="discount-icon-${$AtlaideExist}">
				<span class="discount-icon" style="background-image: url('/data/img/blue-block.png')">${b.Atlaide}</span>
			</div>
			<div class="price-icon">
				<span class="block" style="price-icon">${$CenaOut}</span>
			</div>
			<div class="volume-price-${$ClExist}">
				<span class="volume-price-active">${b.Cenalitra}</span>
			</div>
			<div class="shop-${$Veikals}-icon" data-id="${currentID}"></div>
			<div class="infotext" data-id="${currentID}">
				<span class="infotext2">${b.Info}</span>
			</div>
		</div>
		<h2 class="card__name">${b.Prece}</h2>
		</figure>`);
  
		$("#kartinas").append($card);
  
	$card.find(`.shop-${$Veikals}-icon`).hover(
		function() {$card.find('.infotext').show(100);
	},
		function() {$card.find('.infotext').hide(100);
	}
	);
  
		currentID+=1
	});
  
  });
