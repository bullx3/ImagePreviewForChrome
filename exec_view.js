/**
 * exec_view.js
 */
function executeImageView(tabId){
  console.log("executeImageView start");

  // 現在のページのイメージURLを取得
  chrome.tabs.executeScript(tabId, {"file": "scraping.js"}, (result) => {
    console.log("scraping.js callback");
    console.log(result[0]);
    // 何故か戻りが配列の0になる。Objectの場合だけ？
    localStorage["viewParam"] = JSON.stringify(result[0]);

    // view用のページを表示
    chrome.tabs.update(tabId, {"url": "preview.html"}, () =>{
      console.log("chrome.tabs.update!");
    });
  });

}