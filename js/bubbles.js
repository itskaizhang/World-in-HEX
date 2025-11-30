// Water/Bubble Variables
const frmLen = 15;
let initPoints = [];
let points = [];
let nearestDist = [];
let frameBuffers = [];

// Handpose Variables 
let video;
let handPose;
let hands = [];

// Cooldown
let cooldown_time = 750;
let lastTrigger = 0; 

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  let cnv = createCanvas(480, 700);
  cnv.position((windowWidth - width)/2, (windowHeight - height)/2);
  // cnv.parent("canvas-container");
  pixelDensity(1);
  angleMode(DEGREES);
  randomSeed(70);

  // ---- Start webcam ----
  video = createCapture(VIDEO, { flipped: true });
  video.size(480, 640);
  video.hide();
  handPose.detectStart(video, gotHands);

  // ---- Create initial water points ----
  for (let i = 0; i < 4; i++) {
    initPoints.push(createVector(random(width), random(height)));
  }

}

function gotHands(results) {
  hands = results;
}

function drawBubbleFrame() {
  // Animate point positions for each frame
  for (let f = 0; f < frmLen; f++) {
    let ang = f * 360 / frmLen;
    points[f] = [];

    for (let p of initPoints) {
      points[f].push(createVector(
        50 * sin(ang + 6 * p.x) + p.x,
        50 * cos(ang + 6 * p.y) + p.y
      ));
    }
  }

  // Precompute only nearest distances for each frame & pixel
  let pixCount = width * height;
  for (let f = 0; f < frmLen; f++) {
    nearestDist[f] = new Float32Array(pixCount);
    frameBuffers[f] = new Uint8ClampedArray(pixCount * 4);

    let pts = points[f];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let idx = x + y * width;

        // find nearest point
        let minD = Infinity;
        for (let p of pts) {
          let dx = x - p.x;
          let dy = y - p.y;
          let d = dx * dx + dy * dy;
          if (d < minD) minD = d;
        }

        nearestDist[f][idx] = Math.sqrt(minD);
      }
    }
  }
}

function drawBubble() {
  let f = frameCount % frmLen;
  let buf = frameBuffers[f];
  let distFrame = nearestDist[f];

  // compute these once per frame
  let t = (sin(frameCount * 0.4) + 1) / 2;
  let water1 = color(30, 180, 255);
  let water2 = color(80, 60, 140);
  let dynamicWater = lerpColor(water2, water1, t);

  let wR = red(dynamicWater);
  let wG = green(dynamicWater);
  let wB = blue(dynamicWater);

  // convert dynamicWater -> scaled foam mix once
  for (let i = 0; i < distFrame.length; i++) {
    let nearest = distFrame[i];
    let foam = constrain(255 - nearest * 1.2, 0, 255);

    // blend 30% foam → 70% dynamic water
    let r = wR * 0.7 + foam * 0.3;
    let g = wG * 0.7 + foam * 0.3;
    let b = wB * 0.7 + foam * 0.3;

    let bi = i * 4;
    buf[bi] = 255;
    buf[bi + 1] = g;
    buf[bi + 2] = 0;
    buf[bi + 3] = 255;
  }

  // blit in one pass
  loadPixels();
  pixels.set(buf);
  updatePixels();
}

function detectPinch() {
  // image(video, 0, 0);

  // Ensure at least one hand is detected
  if (hands.length > 0) {

    let hand = hands[0];
    let index = hand.index_finger_tip;
    let thumb = hand.thumb_tip;

    noStroke();
    fill(205, 209, 228);
    
    let d = dist(index.x, index.y, thumb.x, thumb.y);
    
    if (d < 30) {
      fill(40, 67, 135);
    }
    
    circle(index.x, index.y, 12);
    circle(thumb.x, thumb.y, 12);
    
    addPinchPoint(d, index.x, index.y);
  }
}


// x is distance
function addPinchPoint(x, posX, posY) {

    let thresholdDist = 30;
    if (x < thresholdDist) {
        // millis() -- returns the number of milliseconds since program started 
        if (millis() - lastTrigger > cooldown_time) {
            initPoints.push(createVector(posX, posY));

            if (initPoints.length > 15) {
            initPoints.shift();
            }

            // If points is greater than 15 we reduce,
            // But I also want it so we can reduce to 0
            
            drawBubbleFrame();

            lastTrigger = millis();
        }
    }
}


function draw() {
  // 1. Draw webcam
  image(video, 0, 0);

  // 2. Draw water overlay
  if (frameCount === 1) {
    drawBubbleFrame(); // Call once
  }
  drawBubble();

  // 3. Detect pinch
  detectPinch();
}
