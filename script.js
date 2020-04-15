$.get('sample.json', function(d) {
	let currentID;
	currentID = 0;
	d.forEach(function(b) {
		if (b.Atlaide == "None") {$AtlaideExist = "hidden"} else {$AtlaideExist = "active"}
		if (b.Cenalitra == "None") {$ClExist = "hidden"} else {$ClExist = "active"}
		if (b.Centi == "None") {$CenaOut = '-' + b.Euro+ '%'} else {$CenaOut = b.Euro+'.'+b.Centi+'€'}
		if (b.Veikals == "Maxima") {$Veikals = "maxima"} else if(b.Veikals == "Rimi") {$Veikals = "rimi"}
		if (b.Veikals == "Maxima") {$imgsrc = "https://www.maxima.lv" + b.Bilde} else if(b.Veikals == "Rimi") {$imgsrc = b.Bilde}
		if (b.Bilde == "None") {$imgsrc = "/data/img/no-img-placehold.png"}
		if (b.Info == "Vecā cena: None") {$infotxt = ""} else {$infotxt = b.Info}
  
		var $card = $(`<figure class="card">
		<div class="card__hero">
			<img src="${$imgsrc}" alt="/data/img/no-img-placehold.png" class="card__img">
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
				<span class="infotext2">${$infotxt}</span>
			</div>
		</div>
		<h2 class="card__name">${b.Prece}</h2>
		</figure>`);
  
		$("#kartinas").append($card);
  
	$card.find(`.shop-${$Veikals}-icon`).hover(
		function() {$card.find('.infotext').show(200);
		$(this).animate({opacity: 0.6}, 200);
	},
		function() {$card.find('.infotext').hide(200);
		$(this).animate({opacity: 1}, 200);
	}
	);
  
		currentID+=1
	});
  
  });
//search baram
function search() {
	var inputvalue, productcard, productname, i;
	inputvalue = document.getElementById("product-search").value.toLocaleLowerCase();
	productcard = document.getElementsByClassName("card");
	for (i=0; i<productcard.length;i++){
		productname = productcard[i].innerText.toLocaleLowerCase();
		if (productname.indexOf(inputvalue) != -1){
			productcard[i].style.display = "";
		} else{
			productcard[i].style.display = "none";
		}
	}
}
/*
const productlist=document.querySelector('cards-container');
const searchBar=document.forms['product-search'].querySelector('input');
searchBar.addEventListener('keyup', function(e){
	const searchtext = e.target.value.toLowerCase();
	const preces = productlist.getElementsByTagName('h2');
	Array.from(preces).forEach(function(Arrayprece){
		const Arraynosaukums = Arrayprece.firstElementChild.textContent;
		if(Arraynosaukums.toLowerCase().indexOf(searchtext)!= -1) {
			Arrayprece.style.display = 'block';
		} else {
			Arrayprece.style.display = 'none';
		}
	})
})
*/