/**
 * コンテキストメニュー
 */
chrome.contextMenus.create({
  "title": "Image Viewrに切り替え",
  "type": "normal",
  "contexts": ["all"],
  "onclick": (info) => {
    console.log("click contextMenu");

    executeConvert();

  }
});

/**
 * manifest.jsonで指定したcommandのショートカットを入力すると呼び出される
 */
chrome.commands.onCommand.addListener((command) => {
  console.log('Command:', command);
  if(command == "change_image_viewer"){
    executeConvert();
  }
});

function executeConvert(){
  console.log("executeConvert start");
  // popoup.htmlで指定が読めないのでデフォルトの情報をパラメータとして渡してconvert.jsを実行する
  // 設定を保存できるようになったらそちらを使う。

  chrome.tabs.executeScript(null, {"code": 
    `
    let filter_chk = true;
    let filter_x_size = 250;
    let filter_y_size = 250;
    `
    }, () => {

    chrome.tabs.executeScript(null, {"file": "convert.js"}, () => {
      console.log("complete convert.js");
    });
  });
}
