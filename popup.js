/*
  popup.htmlで実行されるスクリプト
*/

window.onload = function(){
  console.log("Extension onload start");

  chrome.tabs.getSelected(null, tab => {
    console.log("tab.id: " + tab.id);
    console.log("tab.url: " + tab.url);
    console.log("tab.title: " + tab.title);

    var elementTabId = this.document.getElementById("tab_id");
    elementTabId.innerHTML = tab.id.toString();
    var elementTabUrl = this.document.getElementById("tab_url");
    elementTabUrl.innerHTML = tab.url.toString();
    var elementTabTitle = this.document.getElementById("tab_title");
    elementTabTitle.innerHTML = tab.title.toString();

    // 設定値を呼び出して
    var config = loadConfig();

    document.getElementById("filter_chk").checked = config.filter_chk;
    document.getElementById("filter_x_size").value = config.filter_x_size;
    document.getElementById("filter_y_size").value = config.filter_y_size;

    console.log("onload getSelected end");


  });
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

  // popoup.htmlで指定した情報をパラメータとして渡してconvert.jsを実行する
  chrome.tabs.executeScript(null, {"code": 
    `
    let config = ${JSON.stringify(config)};
    `
    }, () => {

    chrome.tabs.executeScript(null, {"file": "convert.js"}, () => {
      console.log("complete convert.js");
    });
  });
}

// ボタンクリック(戻す)
document.getElementById('btn_return').onclick = function() {
  console.log("push button btn_return");

  chrome.tabs.reload(null, null, (result) => {
    console.log("complete reload");
    console.log(result);
  });
}

document.getElementById('btn_init_config').onclick = function() {
  console.log("push button btn_init_config");
  // 設定値初期化
  initializeConfig();

  // 表示変更
  var config = loadConfig();

  document.getElementById("filter_chk").checked = config.filter_chk;
  document.getElementById("filter_x_size").value = config.filter_x_size;
  document.getElementById("filter_y_size").value = config.filter_y_size;
}