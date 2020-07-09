/**
 * exec_view.js
 */
function executeImagePreview(tabId){
  console.log("executeImagePreview start");

  // 現在のページのイメージURLを取得
  chrome.tabs.executeScript(tabId, {"file": "scraping.js"}, (result) => {
    console.log("scraping.js callback");
    console.log(result[0]);
    // 何故か戻りが配列の0になる。Objectの場合だけ？
    localStorage["previewParam"] = JSON.stringify(result[0]);

    // view用のページを表示
    chrome.tabs.update(tabId, {"url": "preview.html"}, () =>{
      console.log("chrome.tabs.update!");
    });
  });

}