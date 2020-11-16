//引入或宣告物件的初始化動作
var Botkit = require('botkit');
var os = require('os');
var lunch_list = new Object();
var dinner_list = new Object();

//跟資料庫做連接
var mysql = require('mysql');
var type = '';
var con = mysql.createConnection({
    host: "localhost",
    database : 'demo_slack_bot',
    user: "proot",
    password: "0eoRRgg9UtQuDqTJpDpB"
});
con.connect(function(err) {
    if (err) throw err;
    // con.query("INSERT INTO `lunch_item` (`id`, `name`, `type`, `cost`, `address`) VALUES (NULL, '水源市場-炒飯A', '便當', '平價/ NT(00左右', '台北市羅斯福路四段XX號');\n", function (err, result) {
    //     if (err) throw err;
    // });

    con.query("SELECT name FROM `lunch_item` WHERE 1\n", function (err, result) {
        lunch_list = result;
        if (err) throw err;
    });


    con.query("SELECT name FROM `dinner_item` WHERE 1\n", function (err, result) {
        dinner_list = result;
        if (err) throw err;
    });
});

//將.env中的設定值，寫到 process.env 之中
require('dotenv').config();

//新增 slack 耳朵來聽訊息
var slackEars = Botkit.slackbot({
    debug:true,
    //將資料存在 json 檔之中 => 目前還未有實際功用
    json_file_store: './slackDataStore',
});

//開始接上 slack RTM (Real Time Messaging)
var slackBot = slackEars.spawn({
        token:process.env.SLACK_BOT_TOKEN
}).startRTM();


//聽到打招呼並開始對話流程
slackEars.hears('HELP|Help|help|hI|hi|Hi|HI|hello|HELLO|Hello|嗨|哈囉','direct_message,direct_mention',function(bot,message) {

    //按照步驟開始
    bot.reply(message,"您好!我是抽籤機器人，請問有什麼我能為您服務的嗎:)\n" +
        "可以輸入您要抽籤的類型：\n1.午餐\n2.晚餐\n\n-----------------------\n或是輸入您要增加的類型：\na.午餐\nb.晚餐\n\n--------------------------------------------------------------------------------------------\n或是跳過步驟式，直接開始使用，請從以下指令擇一直接輸入\n 「 顯示午餐\n  顯示晚餐\n  加午餐：{午餐名字}\n  加晚餐：{晚餐名字}\n  選午餐\n  選晚餐\n  刪除午餐：{午餐ID}\n  刪除晚餐：{晚餐ID}  」\n/**\n" +
        " *\n" +
        " *                             _ooOoo_\n" +
        " *                            o8888888o\n" +
        " *                            88\" . \"88\n" +
        " *                            (| -_- |)\n" +
        " *                            O\\  =  /O\n" +
        " *                         ____/`---‘\\____\n" +
        " *                       .‘  \\\\|     |//  `.\n" +
        " *                      /  \\\\|||  :  |||//\n" +
        " *                     /  _||||| -:- |||||-\n" +
        " *                     |   | \\\\\\  -  /// |   |\n" +
        " *                     | \\_|  ‘‘\\---/‘‘  |   |\n" +
        " *                     \\  .-\\__  `-`  ___/-. /\n" +
        " *                   ___`. .‘  /--.--\\  `. . __\n" +
        " *                .\"\" ‘<  `.___\\_<|>_/___.‘  >‘\"\".\n" +
        " *               | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |\n" +
        " *               \\  \\ `-.   \\_ __\\ /__ _/   .-` /  /\n" +
        " *          ======`-.____`-.___\\_____/___.-`____.-‘======\n" +
        " *                             `=---=‘\n" +
        " *          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n" +
        " *                     佛祖保佑        永無BUG\n" +
        " */");

    //抽籤-午餐
    slackEars.hears('1.|1','direct_message,direct_mention',function(bot, message) {
        type = 'lunch';
        bot.reply(message, '您好，以下是午餐抽籤結果：' + lunch_list[Math.floor(Math.random() * Math.floor(lunch_list.length))].name + '\n您想要顯示所有午餐嗎?(Y/N)');
        slackEars.hears('Y|y|是|對','direct_message,direct_mention',function(bot, message) {
            answer_text = '';
            for(i=0; i<lunch_list.length;i++){
                answer_text += (i+1) + '. ' + lunch_list[i].name + '\n';
            }
            bot.reply(message, '您好，以下是所有午餐：\n' + answer_text);
        });
    });

    //抽籤-晚餐
    slackEars.hears('2.|2','direct_message,direct_mention',function(bot, message) {
        type = 'dinner';
        bot.reply(message, '您好，以下是晚餐抽籤結果：' + dinner_list[Math.floor(Math.random() * Math.floor(dinner_list.length))].name + '\n您想要顯示所有晚餐嗎?(Y/N)');
        slackEars.hears('Y|y|是|對','direct_message,direct_mention',function(bot, message) {
            bot.reply(message,"您好，以下是所有晚餐：\n");
            answer_text = '';
            for(i=0; i<dinner_list.length;i++){
                answer_text += (i+1) + '. ' + dinner_list[i].name + '\n';
            }
            bot.reply(message,answer_text);
        });
    });

    //增加-午餐
    slackEars.hears('a.|a|A|A.','direct_message,direct_mention',function(bot, message) {
        bot.reply(message, '請輸入您要增加的午餐，若多項可以用逗號區隔，且在輸入餐點名稱前要輸入關鍵字「加午餐：」，多謝配合。');
        slackEars.hears('.*加午餐：.*','direct_message,direct_mention',function(bot, message) {
            original_length = lunch_list.length;
            if(message.text.includes(',')){
                food_list = (message.text.split('：')[1]).split(',');
                for(i=0;i<food_list.length;i++){
                    con.query("SET @food_list_value = "+food_list[i]+"\n  " +
                        "INSERT INTO `lunch_item` (`id`, `name`, `type`, `cost`, `address`) VALUES (NULL, @food_list_value, NULL, NULL, NULL);\n", function (err, result) {
                    });
                }
                if(original_length < lunch_list.length){
                    bot.reply(message, '(恭喜)您已經成功按照步驟增加多個午餐。');
                    con.query("SELECT name FROM `lunch_item` WHERE 1\n", function (err, result) {
                        lunch_list = result;
                        if (err) throw err;
                        answer_text = '您好，以下按照步驟後顯示的所有午餐：\n';
                        for(i=0; i<lunch_list.length;i++){
                            answer_text += (i+1) + '. ' + lunch_list[i].name + '\n';
                        }
                        bot.reply(message,answer_text);
                    });
                }else{
                    bot.reply(message, '(失敗)按照步驟後卻失敗增加多個午餐。');
                }
            }else{
                food_list = message.text.split('：')[1];
                sql = "INSERT INTO `lunch_item` (`id`, `name`, `type`, `cost`, `address`) VALUES ?";
                values = [
                    ['NULL', food_list , 'NULL', 'NULL', 'NULL'],
                ];
                con.query(sql, [values], function (err, result) {
                    if(result.affectedRows > 0){
                        bot.reply(message, '(恭喜)您已經按照步驟成功增加單一午餐。');
                    }else{
                        bot.reply(message, '(失敗)按照步驟後卻失敗增加單一午餐。');
                    }
                    con.query("SELECT name FROM `lunch_item` WHERE 1\n", function (err, result) {
                        lunch_list = result;
                        if (err) throw err;
                        answer_text = '您好，以下是按照步驟顯示的所有午餐：\n';
                        for(i=0; i<lunch_list.length;i++){
                            answer_text += (i+1) + '. ' + lunch_list[i].name + '\n';
                        }
                        bot.reply(message,answer_text);
                    });
                });
            }
        })
    });

    //增加-晚餐
    slackEars.hears('b.|b|B|B.','direct_message,direct_mention',function(bot, message) {
        bot.reply(message, '請輸入您要增加的晚餐，若多項可以用逗號區隔，且在輸入餐點名稱前要輸入關鍵字「加晚餐：」，多謝配合。');
        slackEars.hears('.*加晚餐：.*','direct_message,direct_mention',function(bot, message) {
            original_length = dinner_list.length;
            if(message.text.includes(',')){
                food_list = (message.text.split('：')[1]).split(',');
                for(i=0;i<food_list.length;i++){
                    con.query("SET @food_list_value = "+food_list[i]+"\n  " +
                        "INSERT INTO `dinner_item` (`id`, `name`, `type`, `cost`, `address`) VALUES (NULL, @food_list_value, NULL, NULL, NULL);\n", function (err, result) {});
                }
                if(original_length < dinner_list.length){
                    bot.reply(message, '(恭喜)您已經成功按照步驟增加多個晚餐。');
                    con.query("SELECT name FROM `dinner_item` WHERE 1\n", function (err, result) {
                        dinner_list = result;
                        if (err) throw err;
                        answer_text = '您好，以下按照步驟後顯示的所有晚餐：\n';
                        for(i=0; i<dinner_list.length;i++){
                            answer_text += (i+1) + '. ' + dinner_list[i].name + '\n';
                        }
                        bot.reply(message,answer_text);
                    });
                }else{
                    bot.reply(message, '(失敗)按照步驟後卻失敗增加多個晚餐。');
                }
            }else{
                food_list = message.text.split('：')[1];
                sql = "INSERT INTO `dinner_item` (`id`, `name`, `type`, `cost`, `address`) VALUES ?";
                values = [
                    ['NULL', food_list , 'NULL', 'NULL', 'NULL'],
                ];
                con.query(sql, [values], function (err, result) {
                    if(result.affectedRows > 0){
                        bot.reply(message, '(恭喜)您已經按照步驟成功增加單一晚餐項目。');
                    }else{
                        bot.reply(message, '(失敗)按照步驟後卻失敗增加單一晚餐。');
                    }
                    con.query("SELECT name FROM `dinner_item` WHERE 1\n", function (err, result) {
                        dinner_list = result;
                        if (err) throw err;
                        answer_text = '您好，以下是按照步驟顯示的所有晚餐：\n';
                        for(i=0; i<dinner_list.length;i++){
                            answer_text += (i+1) + '. ' + dinner_list[i].name + '\n';
                        }
                        bot.reply(message,answer_text);
                    });
                });
            }
        })
    });
});


//直接-加午餐
slackEars.hears('.*加午餐：.*','direct_message,direct_mention',function(bot, message) {
        original_length = lunch_list.length;
        if(message.text.includes(',')){
            food_list = (message.text.split('：')[1]).split(',');
            for(i=0;i<food_list.length;i++){
                sql = "INSERT INTO `lunch_item` (`id`, `name`, `type`, `cost`, `address`) VALUES ?";
                values = [
                    ['NULL', food_list[i] , 'NULL', 'NULL', 'NULL'],
                ];
                con.query(sql, [values], function (err, result) {
                    if (result.affectedRows > 0) {
                        bot.reply(message, '(恭喜)您已經成功直接增加多個午餐項目。');
                    } else {
                        bot.reply(message, '(失敗)直接增加多個午餐失敗。');
                    }
                });
            }
            con.query("SELECT name FROM `lunch_item` WHERE 1\n", function (err, result) {
                lunch_list = result;
                if (err) throw err;
                answer_text = '您好，以下是所有午餐：\n';
                for(i=0; i<lunch_list.length;i++){
                    answer_text += (i+1) + '. ' + lunch_list[i].name + '\n';
                }
                bot.reply(message,answer_text);
            });

        }else{
            food_list = message.text.split('：')[1];
            sql = "INSERT INTO `lunch_item` (`id`, `name`, `type`, `cost`, `address`) VALUES ?";
            values = [
                ['NULL', food_list , 'NULL', 'NULL', 'NULL'],
            ];
            con.query(sql, [values], function (err, result) {
                if(result.affectedRows > 0){
                    bot.reply(message, '(恭喜)您已經成功直接增加單一午餐項目。');
                }else{
                    bot.reply(message, '(失敗)直接增加單一午餐失敗。');
                }
                con.query("SELECT name FROM `lunch_item` WHERE 1\n", function (err, result) {
                    lunch_list = result;
                    if (err) throw err;
                    answer_text = '您好，以下是直接顯示所有午餐：\n';
                    for(i=0; i<lunch_list.length;i++){
                        answer_text += (i+1) + '. ' + lunch_list[i].name + '\n';
                    }
                    bot.reply(message,answer_text);
                });
            });
        }
});

//直接-加晚餐
slackEars.hears('.*加晚餐：.*','direct_message,direct_mention',function(bot, message) {
    original_length = dinner_list.length;
    if(message.text.includes(',')){
        food_list = (message.text.split('：')[1]).split(',');
        for(i=0;i<food_list.length;i++){
            sql = "INSERT INTO `dinner_item` (`id`, `name`, `type`, `cost`, `address`) VALUES ?";
            values = [
                ['NULL', food_list[i] , 'NULL', 'NULL', 'NULL'],
            ];
            con.query(sql, [values], function (err, result) {
                if (result.affectedRows > 0) {
                    bot.reply(message, '(恭喜)您已經成功直接增加多個晚餐項目。');
                } else {
                    bot.reply(message, '(失敗)直接增加多個晚餐失敗。');
                }
            });
        }
        con.query("SELECT name FROM `dinner_item` WHERE 1\n", function (err, result) {
            dinner_list = result;
            if (err) throw err;
            answer_text = '您好，以下是所有晚餐：\n';
            for(i=0; i<dinner_list.length;i++){
                answer_text += (i+1) + '. ' + dinner_list[i].name + '\n';
            }
            bot.reply(message,answer_text);
        });

    }else{
        food_list = message.text.split('：')[1];
        sql = "INSERT INTO `dinner_item` (`id`, `name`, `type`, `cost`, `address`) VALUES ?";
        values = [
            ['NULL', food_list , 'NULL', 'NULL', 'NULL'],
        ];
        con.query(sql, [values], function (err, result) {
            if(result.affectedRows > 0){
                bot.reply(message, '(恭喜)您已經成功直接增加單一晚餐項目。');
            }else{
                bot.reply(message, '(失敗)直接增加單一晚餐失敗。');
            }
            con.query("SELECT name FROM `dinner_item` WHERE 1\n", function (err, result) {
                dinner_list = result;
                if (err) throw err;
                answer_text = '您好，以下是直接顯示所有晚餐：\n';
                for(i=0; i<dinner_list.length;i++){
                    answer_text += (i+1) + '. ' + dinner_list[i].name + '\n';
                }
                bot.reply(message,answer_text);
            });
        });
    }
});

//直接-選午餐
slackEars.hears('.*選午餐.*','direct_message,direct_mention',function(bot, message) {
    con.query("SELECT name FROM `lunch_item` WHERE 1\n", function (err, result) {
        lunch_list = result;
        if (err) throw err;
        answer_text = '您好，以下是午餐抽籤結果：\n';
        answer_text += lunch_list[Math.floor(Math.random() * Math.floor(lunch_list.length-1))].name + '\n';

        bot.reply(message,answer_text);
    });
});

//直接-選晚餐
slackEars.hears('.*選晚餐.*','direct_message,direct_mention',function(bot, message) {
    con.query("SELECT name FROM `dinner_item` WHERE 1\n", function (err, result) {
        dinner_list = result;
        if (err) throw err;
        answer_text = '您好，以下是晚餐抽籤結果：\n';
        answer_text += dinner_list[Math.floor(Math.random() * Math.floor(dinner_list.length-1))].name + '\n';

        bot.reply(message,answer_text);
    });
});

//直接-顯示午餐
slackEars.hears('.*顯示午餐.*','direct_message,direct_mention',function(bot, message) {
    con.query("SELECT `id`, `name` FROM `lunch_item`", function (err, result) {
        lunch_list = result;
        if (err) throw err;
        answer_text = '';
        for(i=0; i<lunch_list.length;i++){
            answer_text += '第' + parseInt(i+1) + '個. ID：' + lunch_list[i].id + ' 名字：' + lunch_list[i].name + '\n';
        }
        bot.reply(message,answer_text);
    });
});

//直接-顯示晚餐
slackEars.hears('.*顯示晚餐.*','direct_message,direct_mention',function(bot, message) {
    con.query("SELECT `id`, `name` FROM `dinner_item` WHERE 1\n", function (err, result) {
        dinner_list = result;
        if (err) throw err;
        answer_text = '';
        for(i=0; i<dinner_list.length;i++){
            answer_text += '第' + parseInt(i+1) + '個. ID：' + dinner_list[i].id + ' 名字：' + dinner_list[i].name + '\n';
        }
        bot.reply(message,answer_text);
    });
});

//直接-刪除午餐
slackEars.hears('.*刪除午餐：.*','direct_message,direct_mention',function(bot, message) {
    if(message.text.includes('：')) {
        be_deleted_food_list = message.text.split('：')[1];
        con.query("DELETE FROM `lunch_item` WHERE `lunch_item`.`id` = "+be_deleted_food_list, function (err, result) {
            if(result.affectedRows>0){
                bot.reply(message, '(恭喜)您已經成功刪除午餐');
            }
        });
    }
});

//直接-刪除晚餐
slackEars.hears('.*刪除晚餐：.*','direct_message,direct_mention',function(bot, message) {
    if(message.text.includes('：')) {
        be_deleted_food_list = message.text.split('：')[1];
        con.query("DELETE FROM `dinner_item` WHERE `dinner_item`.`id` = "+be_deleted_food_list, function (err, result) {
            if(result.affectedRows>0){
                bot.reply(message, '(恭喜)您已經成功刪除晚餐');
            }
        });
    }
});