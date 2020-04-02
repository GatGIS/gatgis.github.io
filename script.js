//// global variable
//var data;
//
//$.get('books.json', function(d) {
//  //data = JSON.parse(d);
//  // loop through all books
//  d.books.forEach(function(b) {
//    // now you can put every book in your <div>
//    $("#books").append(`<div><h2>${b.title}</h2><p>${b.author}</p></div>`);
//  });
//});

// global variable
var data;

$.get('books.json', function(d) {
  //data = JSON.parse(d);
  // loop through all books
  d.books.forEach(function(b) {
    // now you can put every book in your <div>
    $("#books").append(`<figure class="card">
    <div class="card__hero">
        <img src="data/img/macbook-pro-15.jpg" alt="" class="card__img">
    </div>
    <h2 class="card__name">${b.title}</h2>
    <p class="card__detail"><span class="emoji-left">🖥</span> 15-inch Retina display</p>
    <p class="card__detail"><span class="emoji-left">🧮</span> 6-core Intel i7, 8th generation</p>
    <div class="card__footer">
        <p class="card__price">$3199</p>
        <a href="laptop.html" class="card__link">Check it out <span class="emoji-right">👉</span></a>
    </div>
    </figure>`);
  });
});

