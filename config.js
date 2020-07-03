const DEFAULT_FILTER_CHK = true;
const DEFAULT_FILTER_X_XIZE = 500;
const DEFAULT_FILTER_Y_XIZE = 500;

function loadConfig(){

  config = localStorage["config"];
  if(config == null){
    initializeConfig();
  }
  return JSON.parse(localStorage["config"])
}

function setConfig(config){
  localStorage["config"] = JSON.stringify(config);
}

function initializeConfig(){
  var config ={
    "filter_chk": DEFAULT_FILTER_CHK,
    "filter_x_size": DEFAULT_FILTER_X_XIZE,
    "filter_y_size": DEFAULT_FILTER_Y_XIZE,
  }
  setConfig(config);
}
