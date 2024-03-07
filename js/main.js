'use strict'

const fileInput = document.getElementById("csvFileInput");

// ファイルが選択されたら、読み込む
fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  readFile(file);
});

// FileReader APIを使ってファイルを読み込む関数
function readFile(file) {
  const reader = new FileReader();

  // 読み込みが完了したら、CSVデータを処理
  let resultSampleArray;
  reader.onload = function (e) {
    const csvData = e.target.result;
    resultSampleArray = processData(csvData);
    
    const result = psmAnalyzer(resultSampleArray);

    // 出力結果
    console.log(`最高価格：${Math.ceil(result.heighest.xPoint)}円`)
    console.log(`妥協価格：${Math.ceil(result.compromise.xPoint)}円`)
    console.log(`理想価格：${Math.ceil(result.ideal.xPoint)}円`)
    console.log(`最低価格：${Math.ceil(result.lowest.xPoint)}円`)
  };
  
  // ファイルをテキストとして読み込む
  reader.readAsText(file);
}


// CSVデータの処理
function processData(csvData) {

  const rows = csvData.split(/\r\n|\n|\r/);
  const data = rows.map(row => row.split(","));
  // 列タイトル（1行目）の削除
  data.shift();
  // 回答者の番号（A列の値）の削除
  for (let i = 0; i < data.length; i++) {
    data[i].shift();
  }
  // 最後の配列の要素が数字が入っていなければ削除
  if (data[data.length - 1][0] == undefined) data.pop();

  let integerSampleArray = convertToIntegerArray(data);
  let resultSampleArray = arrayRowColumnTrade(integerSampleArray);

  return resultSampleArray;
}

// 2次元配列の要素をInteger型に変換
function convertToIntegerArray(array) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      array[i][j] = parseInt(array[i][j], 10);
    }
  }
  return array;
}

// 行ごとの配列から、列ごとの配列に変換
function arrayRowColumnTrade(array) {
  const result = [];

  for (let i = 0; i < questionNum; i++) {
    const inputArray = [];
    for(let j = 0; j < array.length; j++) {
      inputArray.push(array[j][i]);
    }
    result.push(inputArray);
  }
  return result;
}

