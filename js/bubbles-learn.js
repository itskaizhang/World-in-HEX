// Code inspired by https://github.com/Creativeguru97/YouTube_tutorial/blob/master/Play_with_noise/waterSurface/sketch.js 
// Making water surface 

const frmLen = 180; // Changes the speed of bubble movement 
let initPoints = [];
let points = [];
let nearestDist = [];   // only store distances
let frameBuffers = [];  // typed pixel buffers (Uint8ClampedArray)

function setup() {
  createCanvas(400, 600);
  pixelDensity(1);
  angleMode(DEGREES);
  randomSeed(70);

  // 1. Generate initial points -- randomly scattered throughout the canvas
  for (let i = 0; i < 12; i++) {
    initPoints.push(createVector(random(width), random(height)));
  }

  // 2. Animate point positions for each frame
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

  // 3. Precompute only nearest distances for each frame & pixel
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

function draw() {
  let f = frameCount % frmLen;
  let buf = frameBuffers[f];
  let distFrame = nearestDist[f];

  // compute these once per frame
  // frameCount * 0.4 changes the speed of color change
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
    buf[bi] = r;
    buf[bi + 1] = g;
    buf[bi + 2] = b;
    buf[bi + 3] = 255;
  }

  // blit in one pass
  loadPixels();
  pixels.set(buf);
  updatePixels();
}
