/**
 * コンテキストメニュー
 */
console.log("execute event.js ")


// インストール時にリスナーを設定する
chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled.addListener")
    // ここではcontextMenusをID付きで生成のみをおおなう
    chrome.contextMenus.create({
      "id": "newTabImageViewer",
      "title": "新しいタブでImageViewrを表示",
      "type": "normal",
      "contexts": ["link"], // リンクのみ有効
    });
});

chrome.contextMenus.onClicked.addListener((info)=>{
  console.log(`chrome.contextMenus.onClicked start(${info.menuItemId})`);
  if(info.menuItemId == "newTabImageViewer"){
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
