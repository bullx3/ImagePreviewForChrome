/**
 * exec_view.js
 */
function executeImageView(){
  console.log("executeImageView start");

  // 現在のページのイメージURLを取得
  chrome.tabs.executeScript(null, {"file": "scraping.js"}, (result) => {
    console.log("scraping.js callback");
    console.log(result[0]);
    // 何故か戻りが配列の0になる。Objectの場合だけ？
    var backgroundPage = chrome.extension.getBackgroundPage();
    backgroundPage.viewerParameter.param = result[0];

    // view用のページを表示
    chrome.tabs.update(null, {"url": "preview.html"}, () =>{
      console.log("chrome.tabs.update!");
    });
  });

}