# Slack_Robot_Extension
Slack機器人練習-抽籤午餐

## 來源
https://dotblogs.com.tw/rainmaker/2017/03/21/230510

## 啟動流程
要先按照上方教學網址製作來布置環境(使用node js)，
接著把檔案放到有運行伺服器的主機上，然後輸入command：`sudo node app.js`。

## 說明
此專案為抽籤功能，拿午餐/晚餐來當作操作的項目，目前有這幾項指令可使用：
* help
* 顯示午餐
* 顯示晚餐
* 選午餐
* 選晚餐
* 加午餐：ID
* 加晚餐：ID
* 刪除午餐：ID
* 刪除晚餐：ID

目前可對於資料庫做連接，可以讀取和新增和刪除，如此可保存大家所做的操作。

## 設定
若要變更資料庫資訊，請到「/app.js」，調整「createConnection」的設定值；
若要變更slack app的key，請到「/.env」，調整「SLACK_BOT_TOKEN」的設定值。

## DEMO
影片：https://drive.google.com/file/d/10A7ddeC-3aowOUSvs3ikdRcoT682DG4j/view?usp=sharing

## 其他
註解圖形在terminal上顯示比較正常，那若要調整在註解區的佛祖大大，請自行調整~