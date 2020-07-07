/**
 * コンテキストメニュー
 */
console.log("execute event.js ")


chrome.contextMenus.create({
  "title": "新しいタブでImageViewrを表示",
  "type": "normal",
  "contexts": ["link"], // リンクのみ有効
  "onclick": (info) => {
    console.log("click contextMenu");
    console.log(info);

    // 選択されているリンクを新しいタブで開いて新しいタブはImageViewrに繊維する.
    // 新しいタブは非アクティブ
    chrome.tabs.create({"url": info.linkUrl, "active": false}, (tab) =>{
      console.log("complete tab create:" + tab.id);
      executeImageView(tab.id);
    });
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

