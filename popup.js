/*
  popup.htmlで実行されるスクリプト
*/

var images = [];
var analyzedCount = 0; // 解析数
var filter_count = 0; // フィルタリングした画像数(有効数)

window.onload = function(){
  console.log("Extension onload start");

  chrome.tabs.getSelected(null, tab => {
    console.log("tab.id: " + tab.id);
    console.log("tab.url: " + tab.url);
    console.log("tab.title: " + tab.title);

    var elementTabUrl = this.document.getElementById("tab_url");
    elementTabUrl.innerHTML = tab.url.toString();
    var elementTabTitle = this.document.getElementById("tab_title");
    elementTabTitle.innerHTML = tab.title.toString();

    console.log("onload getSelected end");
  });

  // 設定値を呼び出して
  var config = loadConfig();
  document.getElementById("filter_chk").checked = config.filter_chk;
  document.getElementById("filter_x_size").value = config.filter_x_size;
  document.getElementById("filter_y_size").value = config.filter_y_size;

  // 画像ファイル一覧を表示する(非同期でサイズ取得)
  loadAndViewImagesList(config);

  console.log("Extension onload end");

};

// ボタンクリック(変換)
document.getElementById('btn_exec').onclick = function() {
  console.log("push button btn_exec");
  var filter_chk = document.getElementById("filter_chk").checked;
  var filter_x_size = parseInt(document.getElementById("filter_x_size").value, 10);
  var filter_y_size = parseInt(document.getElementById("filter_y_size").value, 10);


  var config = {
    "filter_chk": filter_chk,
    "filter_x_size": filter_x_size,
    "filter_y_size": filter_y_size,
  }

  setConfig(config);

  // ImageViewを表示
  executeImageView();

}

// ボタンクリック(戻す)
document.getElementById('btn_return').onclick = function() {
  console.log("push button btn_return");

  chrome.tabs.goBack();
}

// ボタンクリック(設定初期化)
document.getElementById('btn_init_config').onclick = function() {
  console.log("push button btn_init_config");

  // 初期化
  initializeConfig();

  // 表示変更
  var config = loadConfig();

  document.getElementById("filter_chk").checked = config.filter_chk;
  document.getElementById("filter_x_size").value = config.filter_x_size;
  document.getElementById("filter_y_size").value = config.filter_y_size;
}


document.getElementById("filter_x_size").onchange = function() {
  console.log("onChange filter_x_size");
  checkAndViewImageList();
}

document.getElementById("filter_y_size").onchange = function() {
  console.log("onChange filter_y_size");
  checkAndViewImageList();
}


async function loadAndViewImagesList(config){
  return new Promise((resolve, reject) => {
    chrome.tabs.executeScript(null, {"file": "scraping.js"}, (result) => {
      console.log("scraping.js callback");
      console.log(result[0]);
      // 何故か戻りが配列の0になる。Objectの場合だけ？
      images = result[0].images;

      // 解析情報表示
      showAnalyzeInfo()

      var tbodyElement = document.getElementById("table_images_list_tbody");
      for(var i in images){
        var image = images[i];
        var tr = document.createElement("tr");
        image.trElement = tr;

        var td_file = document.createElement('td');
        var parser = new URL(image.src);
        var file_name = parser.pathname.split('/').pop();
        td_file.innerHTML = file_name;

        var td_size_x = document.createElement('td');
        var td_size_y = document.createElement('td');

        console.log("async: " + file_name);

        asyncAppendImageSize(image, td_size_x, td_size_y, config);

        tr.appendChild(td_file);
        tr.appendChild(td_size_x);
        tr.appendChild(td_size_y);

        tbodyElement.appendChild(tr);
      }
    });  
  });

}


async function asyncAppendImageSize(image, xElement, yElement, config){

  const asyncLoadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };


  try{
    // console.log("analyzeImage before");
    // console.log(image.src);
    const res = await asyncLoadImage(image.src);
    // console.log("analyzeImage after");
    // console.log(image.src);
    console.log(`${res.naturalWidth} x ${res.naturalHeight}`);
    xElement.innerHTML = res.naturalWidth.toString();
    yElement.innerHTML = res.naturalHeight.toString();
    image.width = res.naturalWidth;
    image.height = res.naturalHeight;

    if(image.width < config.filter_x_size || image.height < config.filter_y_size){
      console.log("exclusive image")
      console.log(image.width, image.height);
      image.trElement.className = "no_match_tr";
    }

  }catch(e){
    console.log('onload error', e);
    xElement.innerHTML = "error!";
    yElement.innerHTML = "error!";
  } finally {
    // 解析情報表示更新
    analyzedCount++;
    // フィルタチェックと表示色変更(最後の一回のみ実行)
    checkAndViewImageList();
    // 解析状況を表示
    showAnalyzeInfo();
  }

}

function showAnalyzeInfo(){
  var analyzeInfoElement = document.getElementById("analyze_info");
  if(images.length == 0){
    analyzeInfoElement.innerHTML = "画像なし";
  }else if(analyzedCount < images.length){
    analyzeInfoElement.innerHTML = `解析中(${analyzedCount}/${images.length})`;
  }else{
    analyzeInfoElement.innerHTML = `解析完了(総数${analyzedCount}枚/フィルタリング数${filter_count}枚)`;
  }

}


function checkAndViewImageList(){
  if(analyzedCount < images.length){
    // 解析が完了してない場合は実行しない
    return;
  }

  var filter_x_size = parseInt(document.getElementById("filter_x_size").value, 10);
  var filter_y_size = parseInt(document.getElementById("filter_y_size").value, 10);

  filter_count = 0;
  for(var i in images){
    var image = images[i];

    image.trElement.className = null;

    if(image.width < filter_x_size || image.height < filter_y_size){
      console.log("exclusive image")
      console.log(image.width, image.height);
      image.trElement.className = "no_match_tr";
    }else{
      filter_count++;
    }
  }
}