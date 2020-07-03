console.log("start scraping.js");

var title_elements = this.document.getElementsByTagName("title");
var title = title_elements[0].innerText;
console.log(title);

var images = [];
var imagesElements = document.images;

for(var i = 0; i < imagesElements.length; i++){
  var image = {};
  image.src = imagesElements[i].src;
  image.srcset = imagesElements[i].srcset;

  images.push(image);
}

// return 
result = {"title": title, "images": images};
result;

