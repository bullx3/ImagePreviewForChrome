/**
 * preview.js
 */

var currentPage = 0; // 現在のページ(0スタート)

const SHOW_PAGE = "table";
const NOT_SHOW = "none";

// パラメー取得
var rcv_param = JSON.parse(localStorage["previewParam"]);
console.log(rcv_param);
var base_title = rcv_param.title;
var all_images = rcv_param.images.slice();
var filter_images = all_images; // フィルタが無効の場合はimagesそのまま
var errorCount = 0;


const LOAD_STATUS = {
  init: 0,
  analizeImage: 1,
  filtering: 2,
  complete: 10,
};
var loadStatus = LOAD_STATUS.init;
var indicator = {status: LOAD_STATUS.init, current: 0, length: all_images.length};
var loadingElement;





console.log(base_title);
console.log(all_images);

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

  document.title = "[Preview][解析中]" + base_title;

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

    for(var i in all_images){
      var image = all_images[i];
      try {
        const res = await asyncLoadImage(image.src);
        image.width = res.naturalWidth;
        image.height = res.naturalHeight;

      } catch (e) {
        console.log('onload error', e);
        errorCount++;
        image.width = 0;
        image.height = 0;
      } finally {
        // インジケーター更新
        indicator.current++;
        updateIndicator();
      }
    }

    indicator.status = LOAD_STATUS.filtering;
    loadingElement.innerHTML = "フィルタリング中";

    var config = loadConfig();
    console.log(config);

    filter_images = filterImages(all_images, config);

    indicator.status = LOAD_STATUS.complete;
    loadingElement.innerHTML = "";
    document.title = "[Preview]" + base_title;

    
    showPreview(filter_images);


    console.log("async load Images finish");
  })();
};

function filterImages(images, config){
  var filterImages = images;
  if(config.filter_chk){
    filterImages = images.filter( (image) => {
      return (image.width >= config.filter_x_size && image.height >= config.filter_y_size);
    });
  }
  return filterImages;
}


function showPreview(images){
  console.log("showPrevie start")

  // インジケータを非表示
  document.querySelector("#load_indicator").style.display = "none";

  // viewerのメニュー表示
  let viewerMenu = document.getElementById("viewer_menu");
  viewerMenu.style.display = "block";

  // page indexも一旦初期化
  var page_index = document.getElementById("page_index");
  page_index.innerHTML = "";

  var title_view = document.getElementById("title_view");
  title_view.innerHTML = base_title;

  if(images.length == 0){
    // 表示する画像がない場合
    var div_viewer = document.getElementById("viewer");
    var errorDisp = errorCount > 0 ? `(<span class="error">エラー数${this.errorCount}</span>)` : "";
    div_viewer.innerHTML = `表示する画像ファイルがありません(${all_images.length}枚の画像がフィルタリング中${errorDisp})<br><br>\n`;
    for(var i in images){
      var image = images[i]

      div_viewer.innerHTML += `${image.width} x ${image.height}<br>`;
    }
    return;
  }

  var win_width = window.innerWidth;
  var win_height = window.innerHeight;

  console.log("幅:" + win_width);
  console.log("高さ:" + win_height);

  var div_viewer = document.getElementById("viewer");
  div_viewer.innerHTML = "";

  var rap_width = Math.floor(win_width / 2);
  var rap_height = win_height;

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
    // 左側は右寄せ
    img_rap_left.style.textAlign = "right";

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
  var errorDisp = errorCount > 0 ? `(<span class="error">エラー数${errorCount}</span>)` : "";
  page_index.innerHTML = `${(currentPage+1)}/${pages.length} p (${all_images.length}枚中${filter_images.length}枚${errorDisp})`;
}

function updateIndicator(){
  loadingElement.innerHTML = "画像解析 " + (indicator.current + 1) + " / " + indicator.length;
  loadingElement.innerHTML += errorCount > 0 ? `(エラー数${errorCount})`: "";

  // インジゲータ更新
  var percent = Math.floor((indicator.current / indicator.length) * 100);
  document.querySelector("#load_indicator").style.width = `${percent}%`;
}


document.getElementById("btn_open_dialog").onclick = function(){
  console.log("click open dialog");

  var config = loadConfig();
  console.log(config);
  document.getElementById("filter_chk").checked = config.filter_chk;
  document.getElementById("filter_x_size").value = config.filter_x_size;
  document.getElementById("filter_y_size").value = config.filter_y_size;


  createImageTable(all_images, config);

  var dialog = document.getElementById("dialog_menu");
  dialog.show();

}

document.getElementById("btn_close_dialog").onclick = function(){
  console.log("click close dialog");
  var dialog = document.getElementById("dialog_menu");
  dialog.close();
}

document.getElementById("filter_x_size").onchange = function() {
  console.log("onchange filter_x_size");
  createImageTableByTempData();
}

document.getElementById("filter_y_size").onchange = function() {
  console.log("onchange filter_y_size");
  createImageTableByTempData();
}


document.getElementById('btn_update').onclick = function() {

  console.log("click btn_update");

  var filter_chk = document.getElementById("filter_chk").checked;
  var filter_x_size = parseInt(document.getElementById("filter_x_size").value, 10);
  var filter_y_size = parseInt(document.getElementById("filter_y_size").value, 10);

  var config = {
    "filter_chk": filter_chk,
    "filter_x_size": filter_x_size,
    "filter_y_size": filter_y_size,
  }
  console.log(config);

  setConfig(config);

  filter_images = filterImages(all_images, config);

  showPreview(filter_images);
}

// ボタンクリック(設定初期化)
document.getElementById('btn_init_config').onclick = function() {
  console.log("push button btn_init_config");

  // 初期化
  initializeConfig();

  // 表示変更
  var config = loadConfig();
  console.log(config);

  document.getElementById("filter_chk").checked = config.filter_chk;
  document.getElementById("filter_x_size").value = config.filter_x_size;
  document.getElementById("filter_y_size").value = config.filter_y_size;
}


function createImageTableByTempData(){
  var config_temp = {
    "filter_chk": document.getElementById("filter_chk").checked,
    "filter_x_size": document.getElementById("filter_x_size").value,
    "filter_y_size": document.getElementById("filter_y_size").value,
  }
  createImageTable(all_images, config_temp);
}

function createImageTable(images, config){
  var dgErrorCount = 0;
  var dgFilterCount = 0;

  var tbodyElement = document.getElementById("table_images_list_tbody");
  tbodyElement.innerHTML = "";

  for(var i in images){
    var image = images[i];
    var tr = document.createElement("tr");

    var td_file = document.createElement('td');
    try {
      var parser = new URL(image.src);
      var file_name = parser.pathname.split('/').pop();
      td_file.innerHTML = file_name;

      if(image.width < config.filter_x_size || image.height < config.filter_y_size){
        tr.className = "no_match_tr";
      } else {
        dgFilterCount++;
      }
    }catch(e) {
      dgErrorCount++;
      td_file.innerHTML = "error";
      td_file.className = "error";
      tr.className = "no_match_tr";
    }

    var td_size_x = document.createElement('td');
    td_size_x.innerHTML = image.width.toString();
    var td_size_y = document.createElement('td');
    td_size_y.innerHTML = image.height.toString();

    tr.appendChild(td_file);
    tr.appendChild(td_size_x);
    tr.appendChild(td_size_y);

    tbodyElement.appendChild(tr);
  }

  var infoElement = document.getElementById("analyze_info");
  var errorDisp = dgErrorCount > 0 ? `<span class="error">エラー数${dgErrorCount}</span>` : "";
  infoElement.innerHTML = `${images.length}枚中${dgFilterCount}枚有効${errorDisp}`
}
