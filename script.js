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

$.get('sample.json', function(d) {
  //data = JSON.parse(d);
  // loop through all books
  d.forEach(function(b) {
    // now you can put every book in your <div>
    $("#kartinas").append(`<figure class="card">
    <div class="card__hero">
        <img src="https://www.maxima.lv${b.Bilde}" alt="" class="card__img">
    </div>
    <h2 class="card__name">${b.Prece}</h2>
    <p class="card__detail">${b.Atlaide}</p>
    <p class="card__detail">${b.Cenalitra}</p>
    <div class="card__footer">
        <p class="card__price">${b.Euro}.${b.Centi} Eur</p>
    </div>
    </figure>`);
  });
});

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