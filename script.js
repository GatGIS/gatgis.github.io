// global variable
var data;

$.get('books.json', function(d) {
  //data = JSON.parse(d);
  // loop through all books
  d.books.forEach(function(b) {
    // now you can put every book in your <div>
    $("#books").append(`<div><h2>${b.title}</h2><p>${b.author}</p></div>`);
  });
});