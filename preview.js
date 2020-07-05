/**
 * preview.js
 */

var currentPage = 0; // 現在のページ(0スタート)

const SHOW_PAGE = "table";
const NOT_SHOW = "none";

// パラメー取得
var rcv_param = chrome.extension.getBackgroundPage().viewerParameter.param;
console.log(rcv_param);
var base_title = rcv_param.title;
var images = rcv_param.images.slice();
var filter_images = images; // フィルタが無効の場合はimagesそのまま


const LOAD_STATUS = {
  init: 0,
  analizeImage: 1,
  filtering: 2,
  complete: 10,
};
var loadStatus = LOAD_STATUS.init;
var indicator = {status: LOAD_STATUS.init, current: 0, length: images.length};
var loadingElement;


// 設定値取得
var config = loadConfig();



console.log(base_title);
console.log(images);
console.log(config);

// 一度受け取ったら不要な為削除しておく
rcv_param = null;


window.onresize = function(){
  console.log("window.onrsize");
  // 画像解析が終了するまで呼び出さない。
  if(indicator.status == LOAD_STATUS.complete){
    showPreview(filter_images);
  }
};

window.onload = function(){

  console.log("window.onload");

  document.title = "[View]" + base_title;

  loadingElement = document.getElementById("loading");
  
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

    // 画像読み込みインジケーター
    indicator.loadStatus = LOAD_STATUS.analizeImage;
    updateIndicator();

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
      } finally {
        // インジケーター更新
        indicator.current++;
        updateIndicator();
      }
    }

    indicator.status = LOAD_STATUS.filtering;
    loadingElement.innerHTML = "フィルタリング中";

    filter_images = images;
    if(config.filter_chk){
      filter_images = images.filter( (image) => {
        return (image.width > config.filter_x_size && image.width > config.filter_y_size);
      });
    }

    indicator.status = LOAD_STATUS.complete;
    loadingElement.innerHTML = "";
    
    showPreview(filter_images);
    
    console.log("async load Images finish");
  })();
};


function showPreview(images){
  console.log("showPrevie start")

  // インジケータを非表示
  document.querySelector("#load_indicator").style.display = "none";

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
//    console.log("i: "+i)

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
//  currentPage = 0;

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
    if(scale_horizon < scale_vertical){
      img.style.width = "100%";
    }else{
      img.style.height = "100%";
    }
    img_rap.appendChild(img);

    // 画像サイズを表示
    var img_info = document.createElement('div');
    img_info.className = "img_info";
    img_info.innerHTML = `${image.width}x${image.height}`;
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


//
function modifyPageIndex(){
  var page_index = document.getElementById("page_index");
  page_index.innerHTML = (currentPage+1) + "/" + pages.length;
}

function updateIndicator(){
  loadingElement.innerHTML = "画像解析 " + (indicator.current + 1) + " / " + indicator.length;

  // インジゲータ更新
  var percent = Math.floor((indicator.current / indicator.length) * 100);
  document.querySelector("#load_indicator").style.width = `${percent}%`;
}