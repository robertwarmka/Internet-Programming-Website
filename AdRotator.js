// When the range input changes, it will update the corresponding readonly text field
function registerSlider() {
  $("#radius-slider").change(function() {
    $("#display-radius").val(this.value);
  })
}

// Find and display a Google Direction and an InfoWindow for a marker from the nearbylocations markers search
function addMarkerDirectionsListener(marker, infowindow) {
  marker.addListener('click', function() {
    if(prevWindow != null) {
      prevWindow.close();
    }
    var key = "AIzaSyBA_Vgmm5pYza-B9DNCIddKGvonDHI9_vk";
    var originLat = $("#places-lat").val();
    var originLon = $("#places-lon").val();
    var origin = new google.maps.LatLng(originLat, originLon);
    var dest = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
    directionsService.route({
      origin: origin,
      destination: dest,
      travelMode: google.maps.TravelMode.TRANSIT
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
    infowindow.open(map,marker);
    prevWindow = infowindow;
  });
}

// Prevent the form from submitting itself by default, and make the submit into a POST request to my PHP server
function submitPlaces() {
  $("#map-form").submit(function(e) {
    e.preventDefault();
    if(queryMarker != null) {
      if(prevMarkers.length > 0) {
        for(var i = 0; i < prevMarkers.length; i++) {
          prevMarkers[i].setMap(null);
        }
        prevMarkers = [];
        directionsDisplay.set('directions', null);
      }
      var category = $('input[name=category]:checked').val();
      var radius = $("#radius-slider").val();
      var lat = $("#places-lat").val();
      var lon = $("#places-lon").val();

      $.ajax({
        type: 'POST',
        url: 'http://www-users.cselabs.umn.edu/~warm0086/warm0086places.php',
        data: {'category': category,
               'radius': radius,
               'lat' : lat,
               'lon': lon
              },
        success: function(result) {
          handlePlacesResults(result);
        }
      });
    }
  });
}

// Handle the places results from the places request made by my PHP server to find nearby locations
function handlePlacesResults(result) {
  var placesArray = JSON.parse(result);
  for(var i = 0; i < placesArray.length; i++) {
    var subplaces = placesArray[i];
    var marker, infowindow, resultsArray = subplaces.results;
    for(var i = 0; i < resultsArray.length; i++) {
      var location = resultsArray[i].geometry.location;
      var name = resultsArray[i].name;
      var iconUrl = resultsArray[i].icon;
      var icon = {
        url: iconUrl,
        scaledSize: new google.maps.Size(20, 20),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0, 0)
      };
      var contentString = name + "<br>" + location.lat + "<br>" + location.lng;
      infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      prevMarkers[i] = marker = new google.maps.Marker({
        position: location,
        map: map,
        title: name,
        icon: icon
      });
      addMarkerDirectionsListener(marker, infowindow);
    }
  }
}

// Variable for if mouse leaves the paragraph element before the div and img get created
var left = 0;

// Make a jQuery AJAX request to a PHP server to get the correct hall's filename
function mouseOverHall(hall, mouse) {
  var hallName = getHall(hall[0].innerHTML);
  left = 0;
  $.ajax({
    type: 'POST',
    url: 'http://www-users.cselabs.umn.edu/~warm0086/warm0086pictures.php',
    data: { 'picture': hallName },
    success: function(result) {
      var div = document.createElement("div");
      div.id = "picture";
      div.innerHTML = "<span class=\"helper\"></span><img src=\"" + result + "\" alt=\"" + hall[0].innerHTML + "\">";
      div.addEventListener("mouseout", function() {
        div.parentElement.removeChild(div);
      });
      hall[0].parentElement.appendChild(div);
      var X = mouse.pageX + 50;
      var Y = mouse.pageY + 10;
      $('#picture').css("left", X+"px");
      $('#picture').css("top", Y+"px");
      if(left ==  1) {
        hall[0].parentElement.removeChild(div);
        left = 0;
      }
    }
  });
}

// Get a full hallname based on a hall. This is used internally in mouseOverHall
function getHall(name) {
  var hallName;
  name = name.toLowerCase();
  if(~name.indexOf("anderson")) {
    hallName = "andersonhall";
  } else if(~name.indexOf("keller")) {
    hallName = "kellerhall";
  } else if(~name.indexOf("fraser")) {
    hallName = "fraserhall";
  } else if(~name.indexOf("ferguson")) {
    hallName = "fergusonhall";
  } else if(~name.indexOf("bruininks")) {
    hallName = "bruininkshall";
  } else {
    console.log("This should never execute.");
    console.log("We've somehow run into a picture that isn't one of our five. Returning Keller Hall");
    hallName = "kellerhall";
  }
  return hallName;
}

// Function to remove a picture when the mouse leaves a hall paragraph element
function removePicture() {
  var hallPicture = document.getElementById("picture");
  if(hallPicture != null) {
    hallPicture.parentElement.removeChild(hallPicture);
  } else {
    left = 1;
  }
}

// Function used to get all paragraph elements containing hall names where I have class, and give them "mouseover" event listeners
function loadHallMouseovers() {
  $(".picture").mouseenter(function(e) {
    mouseOverHall($(this), e);
  });
  $(".picture").mouseleave(function () {
    removePicture();
  });
  $(".picture").mousemove(function(e) {
    var X = e.pageX + 50;
    var Y = e.pageY + 10;
    $('#picture').css("left", X+"px");
    $('#picture').css("top", Y+"px");
  });
}

// Global variables related to displaying ads
var adNames = ["oscar", "ice", "bowl"];
var adTimes = [5000, 7000, 3000];
var altTexts = ["A Night at the Oscars", "Art of Winter - Ice Extravaganza", "Planes - Beach Bowl"];
var titleTexts = ["A Night at the Oscars\nSat, Feb 27 5-11PM", "Ice Extravaganza\nMon, Feb 29 11:00AM", "Beach Bowl\nFri, Mar 4 7-10PM"];
var links = ["http://sua.umn.edu/events/calendar/event/14601/", "http://sua.umn.edu/events/calendar/event/14617/", "http://sua.umn.edu/events/calendar/event/14616/"];
var ext = ".jpg";
var selected_ad;
var bullet_ids = ["first_bullet", "second_bullet", "third_bullet"];
var buttonStatuses = {};
var timer;

function autoRotateAds() {
  var index = selected_ad;
  var nextIndex = (index + 1) % 3; // Modulo used to give "looping" behavior over fixed-bound array
  selectNewAd(index, nextIndex);
}

// Function used to auto-rotate ads
function selectNewAd(index, nextIndex) {
  var ad_span = document.getElementById("ad");
  var anchor;
  if(ad_span != null) {
    var children = ad_span.childNodes;
    for(i = 0; i < children.length; i++) {
      var child = children[i];
      if(child.tagName == "A") {
        anchor = child;
        break;
      }
    }
  }
  var newAnchor = document.createElement("a");
  newAnchor.href = links[nextIndex];
  newAnchor.target = "_blank";
  var newAd = document.createElement("img");
  newAd.src = adNames[nextIndex] + ".jpg";
  newAd.id = adNames[nextIndex];
  newAd.alt = altTexts[nextIndex];
  newAd.title = titleTexts[nextIndex];

  newAnchor.appendChild(newAd);

  // jQuery code for fading out the old image, changing the picture, then
  // fading the new image in.
  var oldIDSelector = "#" + adNames[index];
  var newIDSelector = "#" + adNames[nextIndex];
  $(oldIDSelector).fadeOut(500, function() {
    ad_span.removeChild(anchor);
    ad_span.appendChild(newAnchor);
    $(newIDSelector).hide();
    $(newIDSelector).fadeIn(500, function() {
      switching = false;
    });
  });

  selected_ad = nextIndex;
  var prevBullet = document.getElementById(bullet_ids[index]);
  var newBullet = document.getElementById(bullet_ids[nextIndex]);
  deselect(prevBullet);
  select(newBullet);
  timer = window.setTimeout(autoRotateAds, adTimes[nextIndex]);
}

// Function used to highlight ad buttons and bullets upon mouseover
function highlight(e) {
  var elem = e.target;
  if(!((selected_ad == 0 && elem.id == "first_bullet") || (selected_ad == 1 && elem.id == "second_bullet") || (selected_ad == 2 && elem.id == "third_bullet"))) {
    var srcFile = elem.src.split("/");
    srcFile = srcFile[srcFile.length-1];
    var name = srcFile.split("_");
    name = name[0]; // Hard-coded to 0 to select first substring after split
    var newSrc = name + "_orange.png";
    elem.src = newSrc;
  }
  buttonStatuses[elem.id] = 1;
}

// Function used to "un-highlight" a button or bullet when the mouse leaves it
function unhighlight(e) {
  var elem = e.target;
  if(!((selected_ad == 0 && elem.id == "first_bullet") || (selected_ad == 1 && elem.id == "second_bullet") || (selected_ad == 2 && elem.id == "third_bullet"))) {
    var srcFile = elem.src.split("/");
    srcFile = srcFile[srcFile.length-1];
    var name = srcFile.split("_");
    name = name[0]; // Hard-coded to 0 to select first substring after split
    var newSrc;
    if(elem.id == "left_button" || elem.id == "right_button") {
      newSrc = name + "_blue.png";
    } else {
      newSrc = name + "_gray.png";
    }
    elem.src = newSrc;
  }
  buttonStatuses[elem.id] = 0;
}

// Function to select an ad's bullet
function select(elem) {
  var srcFile = elem.src.split("/");
  srcFile = srcFile[srcFile.length-1];
  var name = srcFile.split("_");
  name = name[0]; // Hard-coded to 0 to select first substring after split
  var newSrc = name + "_blue.png";
  elem.src = newSrc;
}

// Function to deselect an ad's bullet
function deselect(elem) {
  var srcFile = elem.src.split("/");
  srcFile = srcFile[srcFile.length-1];
  var name = srcFile.split("_");
  name = name[0]; // Hard-coded to 0 to select first substring after split
  var newSrc;
  if(buttonStatuses[elem.id] == 0) {
    newSrc = name + "_gray.png";
  } else if([elem.id] = 1) {
    newSrc = name + "_orange.png";
  }
  elem.src = newSrc;
}

// Variable to ensure that buttons can't be changed while ads are changing
var switching = false;

// Function used to select a different ad when the user clicks on one of the bullets
function manualSelect(e) {
  if(switching) {
    return;
  } else {
    switching = true;
  }
  var elem = e.target;
  // If statement to keep manualSelect from happening from bullet if that bullet is already selected
  if(((selected_ad == 0 && elem.id == "first_bullet") || (selected_ad == 1 && elem.id == "second_bullet") || (selected_ad == 2 && elem.id == "third_bullet"))) {
    return;
  }
  var index, nextIndex;
  window.clearTimeout(timer);
  if(elem.id == "left_button") {
    index = selected_ad;
    nextIndex = (index + 2) % 3; // index + 2 comes from (index - 1 + 3) The +3 is necessary because JavaScript's modulo doesn't handle negative numbers like it should..
  } else if(elem.id == "right_button") {
    index = selected_ad;
    nextIndex = (index + 1) % 3;
  } else if(elem.id == "first_bullet") {
    index = selected_ad;
    nextIndex = 0;
  } else if(elem.id == "second_bullet") {
    index = selected_ad;
    nextIndex = 1;
  } else if(elem.id == "third_bullet") {
    index = selected_ad;
    nextIndex = 2;
  } else {
    console.log("This should never execute.");
    console.log("We're not sure what exactly you clicked.. but we'll reset the ad.");
    index = selected_ad;
    nextIndex = 0;
  }
  selected_ad = nextIndex;
  selectNewAd(index, nextIndex);
}

// Function used to get all ad-bullets and ad-buttons within the input form, and give them mouseover and click event listeners
function loadAdButtons() {
  var span, children;
  var allSpans = document.getElementsByTagName("span");
  for(i = 0; i < allSpans.length; i++) {
    span = allSpans[i];
    if(span.className == "ad-button" || span.className == "ad-bullet") {
      children = span.childNodes;
      for(j = 0; j < children.length; j++) {
        var child = children[j];
        var child_id = child.id;
        if(child.tagName == "IMG") {
          buttonStatuses[child_id] = 0; // 0 means this button is not moused-over, 1 means the button is moused-over
          child.addEventListener("mouseover", highlight, false);
          child.addEventListener("mouseleave", unhighlight, false);
          child.addEventListener("click", manualSelect, false);
        }
      }
    }
  }
}

// Function used to access PHP file and get points and coordinates for markers
function getCoordsJSON() {
  var xmlhttp = new XMLHttpRequest();
  //xmlhttp.open("GET", "http://www-users.cselabs.umn.edu/~warm0086/warm0086plot.php", false);
  //xmlhttp.send(null);
  //var jsonResponse = xmlhttp.responseText;
  //return JSON.parse(jsonResponse);
}

// Init function used to determine which webpage is being displayed on the client's screen, and uses the appropriate functions
function init() {
  var HTMLFile = window.location.pathname.split("/");
  HTMLFile = HTMLFile[HTMLFile.length-1];
  if(HTMLFile == "warm0086calendar.html") {
    registerSlider();
    submitPlaces();
    loadHallMouseovers();
  } else if(HTMLFile == "inputform.html") {
    loadAdButtons();
    select(document.getElementById("first_bullet"));
    selected_ad = 0; // Hard-coded to 0 because oscar is always the first ad to be loaded
    timer = window.setTimeout(autoRotateAds, adTimes[selected_ad]);
  }
}

// On page load, call function: init
window.addEventListener("load", init, false);
