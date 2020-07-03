/**
 * コンテキストメニュー
 */
console.log("execute event.js ")


chrome.contextMenus.create({
  "title": "Image Viewrに切り替え",
  "type": "normal",
  "contexts": ["all"],
  "onclick": (info) => {
    console.log("click contextMenu");

    executeImageView();

  }
});

/**
 * manifest.jsonで指定したcommandのショートカットを入力すると呼び出される
 */
chrome.commands.onCommand.addListener((command) => {
  console.log('Command:', command);
  if(command == "change_image_viewer"){
    executeImageView();
  }
});

// imageViewerへの受け渡し用パラメータ
var viewerParameter = {}

