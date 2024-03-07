'use strict'

const amountRange = 50;										// 何円単位の金額でPSM分析したいか（今回は50円単位）
const minAmount   = 50;										// 最低金額
const maxAmount   = 600;									// 最高金額
const questionNum = 4;										// 質問数
const amountArray = getxData();						// x座標の配列
const xDataLength = amountArray.length;		// x座標の個数

// 最低金額から最高金額までの配列を生成（amountRangeずつ増加）
function getxData() {
	const amountArray = [];
	for (let i = minAmount; i <= maxAmount; i+=amountRange) {
		amountArray.push(i);
	}
	return amountArray;
}

// どの価格で何パーセントの回答者が「高い」，「安い」，「高すぎて買えない」，「安すぎて買わない」と
// 考えたかのデータを集計する
function getPercentArray(sampleDataArry) {

	const result = {
		expensive: [],
		cheap: [],
		overprice: [],
		underprice: [],
	};

	const answerNum = sampleDataArry[0].length;	// 回答者数

	const percentArry = [];
	for (let i = 0; i < questionNum; i++) {
		const ary = [];
		for (let j = 0; j < xDataLength; j++) {
			let num = 0;
			for (let k = 0; k < answerNum; k++) {
				// 質問が「高いと思い始める価格」か「高すぎて変えない価格」のとき（高い系）
				if (i == 0 || i == 2) {		// 列の順序が変更されたら正しいデータ出てこなくなるのでこのコードは良くない
					if (sampleDataArry[i][k] <= amountArray[j]) num++;
				} else {	// 質問が「やすいと思い始める価格」か「安すぎて買わない価格」のとき（安い系）
					if (sampleDataArry[i][k] >= amountArray[j]) num++;
				}
			}
			ary.push(num / answerNum * 100);
		}
		percentArry[i] = ary;
	}

	result.expensive = percentArry[0];
	result.cheap = percentArry[1];
	result.overprice = percentArry[2];
	result.underprice = percentArry[3];

	return result;
}

// 2直線の交点を求める
function getIntersection(line1, line2) {
	const x1 = line1.start.x,
				y1 = line1.start.y,
				x2 = line1.end.x,
				y2 = line1.end.y,
				x3 = line2.start.x,
				y3 = line2.start.y,
				x4 = line2.end.x,
				y4 = line2.end.y;

	const a0 = x1 - x2,
				a1 = x3 - x4,
				b0 = y1 - y2,
				b1 = y3 - y4,
				b2 = y3 - y1;

	const x = (b2 * a0 * a1 + x1 * b0 * a1 - x3 * b1 * a0) / (b0 * a1 - a0 * b1);
	const y = x * b0 / a0 + y1 - x1 *  b0 / a0;

	// 交差しているか否か
	var overlap = (x >= x1 || x >= x2) && (x <= x1 || x <= x2) &&
								(y >= y1 || y >= y2) && (y <= y1 || y <= y2) &&
								(x >= x3 || x >= x4) && (x <= x3 || x <= x4) &&
								(y >= y3 || y >= y4) && (y <= y3 || y <= y4);

	const result = overlap ? {xPoint: x, yPoinst: y} : null;
	return result;
}

function psmAnalyzer(array) {

	const samplePercentDataArray = getPercentArray(array);
	const result = {};
	// 最高価格
	for (let i = 0; i < xDataLength - 1; i++) {
		for (let j = 0; j < xDataLength - 1; j++) {

			const line1 = {
				start : { x : amountArray[i], y : samplePercentDataArray.cheap[i] },
				end   : { x : amountArray[i + 1], y : samplePercentDataArray.cheap[i + 1] }
			};
			
			const line2 = {
				start : { x : amountArray[xDataLength - j - 1], y : samplePercentDataArray.overprice[xDataLength - j - 1] },
				end   : { x : amountArray[xDataLength - j - 2], y : samplePercentDataArray.overprice[xDataLength - j - 2] }
			};
			const intersection = getIntersection(line1, line2);
			if (intersection != null) result.heighest = intersection;
		}
	}

	// 妥協価格
	for (let i = 0; i < xDataLength - 1; i++) {
		for (let j = 0; j < xDataLength - 1; j++) {

			const line1 = {
				start : { x : amountArray[i], y : samplePercentDataArray.cheap[i] },
				end   : { x : amountArray[i + 1], y : samplePercentDataArray.cheap[i + 1] }
			};
			
			const line2 = {
				start : { x : amountArray[xDataLength - j - 1], y : samplePercentDataArray.expensive[xDataLength - j - 1] },
				end   : { x : amountArray[xDataLength - j - 2], y : samplePercentDataArray.expensive[xDataLength - j - 2] }
			};
			const intersection = getIntersection(line1, line2);
			if (intersection != null) result.compromise = intersection;
		}
	}

	// 理想価格
	for (let i = 0; i < xDataLength - 1; i++) {
		for (let j = 0; j < xDataLength - 1; j++) {

			const line1 = {
				start : { x : amountArray[i], y : samplePercentDataArray.underprice[i] },
				end   : { x : amountArray[i + 1], y : samplePercentDataArray.underprice[i + 1] }
			};
			
			const line2 = {
				start : { x : amountArray[xDataLength - j - 1], y : samplePercentDataArray.overprice[xDataLength - j - 1] },
				end   : { x : amountArray[xDataLength - j - 2], y : samplePercentDataArray.overprice[xDataLength - j - 2] }
			};
			const intersection = getIntersection(line1, line2);
			if (intersection != null) result.ideal = intersection;
		}
	}

	// 最低価格
	for (let i = 0; i < xDataLength - 1; i++) {
		for (let j = 0; j < xDataLength - 1; j++) {

			const line1 = {
				start : { x : amountArray[i], y : samplePercentDataArray.underprice[i] },
				end   : { x : amountArray[i + 1], y : samplePercentDataArray.underprice[i + 1] }
			};
			
			const line2 = {
				start : { x : amountArray[xDataLength - j - 1], y : samplePercentDataArray.expensive[xDataLength - j - 1] },
				end   : { x : amountArray[xDataLength - j - 2], y : samplePercentDataArray.expensive[xDataLength - j - 2] }
			};
			const intersection = getIntersection(line1, line2);
			if (intersection != null) result.lowest = intersection;
		}
	}

	return result;
}