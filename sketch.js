let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = "";

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 Facemesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 Handpose
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture();
  });
}

function modelReady() {
  console.log("模型載入完成");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 根據手勢移動圓圈
    let x, y;
    let color = [255, 0, 0]; // 預設為紅色 (鼻子)

    if (handPredictions.length > 0 && gesture === "rock") {
      // 額頭 (第10點)
      [x, y] = keypoints[10];
      color = [255, 255, 0]; // 黃色
    } else if (handPredictions.length > 0 && gesture === "scissors") {
      // 左右眼睛 (第33點和第263點)
      [x, y] = keypoints[33];
      color = [0, 0, 255]; // 藍色
    } else if (handPredictions.length > 0 && gesture === "paper") {
      // 左右臉頰 (第234點和第454點)
      [x, y] = keypoints[234];
      color = [255, 105, 180]; // 粉色
    } else {
      // 預設為鼻子 (第1點)
      [x, y] = keypoints[1];
      color = [255, 0, 0]; // 紅色
    }

    noFill();
    stroke(color[0], color[1], color[2]); // 設定圓圈顏色
    strokeWeight(2); // 減少線條粗細
    ellipse(x, y, 30, 30); // 縮小圓圈直徑
  }
}

// 手勢辨識函數
function detectGesture() {
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 簡單手勢判斷 (剪刀、石頭、布)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const distanceThumbIndex = dist(
      thumbTip[0],
      thumbTip[1],
      indexTip[0],
      indexTip[1]
    );
    const distanceIndexMiddle = dist(
      indexTip[0],
      indexTip[1],
      middleTip[0],
      middleTip[1]
    );

    if (distanceThumbIndex < 30 && distanceIndexMiddle < 30) {
      gesture = "rock"; // 石頭
    } else if (distanceThumbIndex > 50 && distanceIndexMiddle > 50) {
      gesture = "paper"; // 布
    } else {
      gesture = "scissors"; // 剪刀
    }
  }
}
