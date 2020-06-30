/*
  popup.htmlで実行されるスクリプト
*/

window.onload = function(){
  console.log("Extension onload");

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

  });
};

// ボタンクリック(変換)
document.getElementById('btn_exec').onclick = function() {
  console.log("push button btn_exec");
  var filter_chk = document.getElementById("filter_chk").checked;
  var filter_x_size = document.getElementById("filter_x_size").value;
  var filter_y_size = document.getElementById("filter_y_size").value;

  // popoup.htmlで指定した情報をパラメータとして渡してconvert.jsを実行する
  chrome.tabs.executeScript(null, {"code": 
    `
    let filter_chk = ${filter_chk};
    let filter_x_size = ${filter_x_size};
    let filter_y_size = ${filter_y_size};
    `
    }, () => {

    chrome.tabs.executeScript(null, {"file": "convert.js"}, (result) => {
     console.log("complete convert.js");
     console.log(result);
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


