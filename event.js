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
  // 設定した情報(最後に保存した情報)で実行する

  var config = loadConfig();

  chrome.tabs.executeScript(null, {"code": 
    `
    let config = ${JSON.stringify(config)}
    `
    }, () => {

    chrome.tabs.executeScript(null, {"file": "convert.js"}, () => {
      console.log("complete convert.js");
    });
  });
}
