'use strict';
//csvを読み込んで、変化のランキングを出す

//モジュールの呼び出し
const fs = require('fs');   //ファイルシステム
const readline = require('readline');   //

const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': { }});

//データ用配列
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

/**
 * csvファイルを1行ずつ受け取る処理
 */
rl.on('line', (lineString) => {
    const columus = lineString.split(',');  //,で分割して、配列に格納
    const year = parseInt(columus[0]);  //年を取得して、数値に変換して格納  
    const prefrcture = columus[1];      //県を取得
    const popu = parseInt(columus[3]);  //15〜19歳の人口を取得して、数値に変換して格納

    let value = prefectureDataMap.get(prefrcture)
    if (!value) {
        //該当県が無い場合、初期化する
        value = {
            popu2010: 0,  //2010年
            popu2015: 0,  //2015年
            change: null    //差分
        }
    }

    if ( year === 2010 ) {
        value.popu2010 = popu;
    }
    if ( year === 2015 ) {
        value.popu2015 = popu;
    }

    prefectureDataMap.set(prefrcture, value);

})

/**
 * csvファイルがクローズされた時に呼ばれる処理
 */
rl.on('close', () => {
    //変化を計算
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu2015 / value.popu2010;
    };
    //ソート
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    //整形
    const rankingStrings = rankingArray.map(([key, value], i) => {
        return i + '位 ' + key + ': ' + value.popu2010 + '=>' + value.popu2015 + ' 変化率:' + value.change
    });

    //表示
    console.log('- CSV ---------------------------');
    console.log(prefectureDataMap);
    console.log('- ソート後 ---------------------------');
    console.log(rankingArray);
    console.log('- 整形 ---------------------------');
    console.log(rankingStrings);

})
