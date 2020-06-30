/*
  popup.htmlからexecuteScriptで実行され、呼び出し元のサイトでで実行する
 */

console.log(filter_chk);
console.log(filter_x_size);
console.log(filter_y_size);

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
console.log("get image before")
console.log(images);


/*
  画像情報の取得処理を同期的に終わらせる
*/

const asyncLoadImage = (src) => {
  // console.log("start asyncLoadImage");
  return new Promise((resolve, reject) => {
    // console.log("start Promise");
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

// 即時asyncで画像データ読み込み
(async () => {
  console.log("async load Images start");
  for(var i in images){
    var image = images[i];
    try {
      const res = await asyncLoadImage(image.src);
      image.width = res.naturalWidth;
      image.height = res.naturalHeight;
    } catch (e) {
      console.log('onload error', e);
      image.width = 100;
      image.height = 100;
    }
  }

  console.log("async load Images finish");

  // popupでチェックボックスを入れている場合、サイズをチェックして縦横両方が指定以下だったら除外する
  
  var filter_images = images;
  if(filter_chk){
    filter_images = images.filter( (image) => {
      return (image.width > filter_x_size && image.width > filter_y_size);
    });
  }

  convertHtml(filter_images);

})();



function convertHtml(images){

  console.log("start convertHtml");
  console.log(images);


  /**
   * style作成
   */
  var style_str = `
  * {
    margin: 0;
    padding: 0;
  }

  body {
    display: block;
    height: 100%
  }

  .view_page {
    display: table;
  }

  .image_rap{
    display: table-cell;
    vertical-align: middle;
    position: relative;
  }  

  #page_index{
    position: absolute;
    z-index: 100;
    top: 0px;
    color: cornflowerblue;
  }

  .img_info {
    position: absolute;
    z-index: 90;
    bottom: 0px;
    right: 0px;
    color: cornflowerblue;
  }
  
  `;


  /**
   * body部作成
   */
  var body_str = `
  <div id="page_index"></div>
  <div id="viewer"></div>
  `;

  /**
   * script作成
   */
  var img_list_str =  ""
  images.forEach((image)=>{
    img_list_str += `  {src: "${image.src}", width: "${image.width}", height: "${image.height}"},\n`;
  })
  
  var script_str = `
  console.log("start script");
  var images = [
  ${img_list_str}
  ];

  var pages = []; // page毎のElement配列
  var currentPage = 0; // 現在のページ(0スタート)

  const SHOW_PAGE = "table";
  const NOT_SHOW = "none";

  console.log(images);

  //window.onload = function(){
  //  console.log("window.onload");
    showPreview();
  //};

  window.onresize = function(){
    console.log("画面サイズ変更");
    showPreview();
  };

  function showPreview(){

    var win_width = window.innerWidth;
    var win_height = window.innerHeight;

    console.log("幅:" + win_width);
    console.log("高さ:" + win_height);

    var div_viewer = document.getElementById("viewer");
    div_viewer.innerHTML = "";

    var rap_width = Math.floor(win_width / 2);
    var rap_height = win_height;

    var image_rap = document.getElementsByClassName("image_rap");
    image_rap.width = rap_width.toString();
    image_rap.height = rap_height.toString();


    // 画面サイズの変更による再構築で初期化が必要
    pages = [];
    // 右から左の画像ビュアー
    for(var i = 0; i < images.length; i+=2){

      var view_page = document.createElement("div");
      view_page.className = "view_page";

      var img_rap_left;
      // 左側
      if((i + 1) < images.length){
        // 残りページが1ページの場合は追加しない
        img_rap_left = createImageRapper(images[i+1], rap_width, rap_height);
      }else{
        // 空白を追加する
        img_rap_left = createImageRapper(null, rap_width, rap_height);
      }
      view_page.appendChild(img_rap_left);

      // 右側
      var img_rap_right = createImageRapper(images[i], rap_width, rap_height);
      view_page.appendChild(img_rap_right);

      // 1ページ目以外は非表示にする
      view_page.style.display = NOT_SHOW;

      // ページコントロールの為ページElementの配列を生成しておく
      pages.push(view_page);

      div_viewer.appendChild(view_page);

    }

    // 現在のページだけ表示
    pages[currentPage].style.display = SHOW_PAGE;

    // pageのindex/全ページを表示
    modifyPageIndex();
  }

  function createImageRapper(image, rap_width, rap_height){

    var img_rap = document.createElement('div');
    img_rap.className = "image_rap";
    img_rap.style.width = rap_width + "px";
    img_rap.style.height = rap_height + "px";


    if(image != null){
      var img = document.createElement('img');
      img.src = image.src;
      // 拡大縮小したときに倍率の低い方がmaxになるようにする
      var scale_horizon = rap_width / image.width;
      var scale_vertical = rap_height / image.height;
      //console.log(scale_horizon, scale_vertical);
      if(scale_horizon < scale_vertical){
        img.style.width = "100%";
      }else{
        img.style.height = "100%";
      }
  
      img_rap.appendChild(img);

      // 画像サイズを表示
      var img_info = document.createElement('div');
      img_info.className = "img_info";
      img_info.innerHTML = image.width + "x" + image.height;
      img_rap.appendChild(img_info);
  
    }

    return img_rap;
  }

  // キー押し検知
  document.addEventListener('keydown', (event) => {
    var keyName = event.key;

    console.log("currentPageNow: " + currentPage);
    console.log(keyName);

    switch(keyName){
      case "ArrowDown":
      case "ArrowLeft":
        if(currentPage < pages.length - 1 ){
          pages[currentPage].style.display = NOT_SHOW;
          pages[currentPage+1].style.display = SHOW_PAGE;
          currentPage++;
          modifyPageIndex();
        }
        break;
      case "ArrowUp":
      case "ArrowRight":
        if(currentPage > 0){
          pages[currentPage].style.display = NOT_SHOW;
          pages[currentPage-1].style.display = SHOW_PAGE;
          currentPage--;
          modifyPageIndex();
        }
        break;
    }
    console.log("currentPageAfter: " + currentPage);


  });


  function modifyPageIndex(){
    var page_index = document.getElementById("page_index");
    page_index.innerHTML = (currentPage+1) + "/" + pages.length;
  }
  `;


  /**
   * Head作成
   */
  var head_str = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>[View]${title}</title>
  `;

  /**
   * Html全体を構築
   */

  var html_elements = this.document.getElementsByTagName("html");
  var html_element = html_elements[0];
  html_element.innerHTML = "";
  html_element.className = "";

  document.head.innerHTML = head_str;

  document.body.innerHTML = body_str;

  var style_element = document.createElement('style');
  style_element.type = "text/css";
  style_element.innerHTML = style_str;
  document.head.appendChild(style_element);

  console.log("add script")

  var script_element = document.createElement("script");
  script_element.innerHTML = script_str;
  html_element.appendChild(script_element);

  console.log("convertHtml finish");

}