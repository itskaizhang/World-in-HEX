// Fonts
let RokkittMedium; 

// User uploaded image
let input; 
let img; 
let imgLoaded = false;


// Webcam variables 
let video;
let videoFrame;
let handPose;
// let hands = [];

// function preload() {
// //   handPose = ml5.handPose({ flipped: true });
//   RokkittMedium = loadFont('../assets/Rokkitt-Medium.ttf');
// }

function setup() {
    createCanvas(windowWidth, windowHeight);
    ctx = drawingContext;

    // User uploaded image
    input = createFileInput(handleFile);
    input.hide();

    let uploadButton = createButton('Upload Image');
    uploadButton.position(windowWidth * 1/30, windowHeight - 35);
    // input.style('background', 'black');
    uploadButton.style('color', 'black');  
    uploadButton.style('font-size', '10px');
    // uploadButton.style('font-family', 'RokkittMedium, sans-serif');
    uploadButton.style('cursor', 'pointer');

    uploadButton.mousePressed(() => {
        input.elt.click();
    });

    // ---- Start webcam ----
    // video = createCapture(VIDEO, { flipped: true });
    // video.size(480, 640);
    // video.hide();
    // videoFrame = createImage(video.width, video.height);
    // handPose.detectStart(video, gotHands);
}


// function gotHands(results) {
//     hands = results;
//   }
  


function draw() {
    background('pink');
     // If webcam isn't ready, stop
    //  if (video.width === 0 || video.height === 0) {
    //     background(0);
    //     fill(255);
    //     text("Loading webcam...", 20, 20);
    //     return;
    // }

    // // Copy current video frame into p5.Image
    // videoFrame.copy(video, 0, 0, video.width - 50, video.height - 50, 0, 0, video.width - 50, video.height -50)
    // image(video, 0, 0, width, height);
    
    // // For webcam video
    // videoFrame.loadPixels();
    // for (let i=0; i<50000; i++) {
    //     sortPixels(videoFrame); 
    // }
    // videoFrame.updatePixels();
    // image(videoFrame, 0, 0, width, height);


    
    // For uploaded images
    if (imgLoaded) {
        img.loadPixels();

        for (let i=0; i<10; i++) {
            // sortPixels(img);  // Change to i < 75000
            sortColumn(floor(random(img.width)));
        }
        img.updatePixels();
        image(img, 0, 0);
    }

    titleText();
    hexCodePalettes();

    let c = get(mouseX, mouseY);
    let hexColor = rgbToHex(c[0], c[1], c[2]);

    fill('black');
    textSize(20);
    text(hexColor, windowWidth * 1/30, 30);


    fill(c);
    strokeWeight(2);
    stroke('black');
    rectMode(CENTER);
    square(mouseX, mouseY, 30);
} 


// Helper function for getting HEX code
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      let hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  }

// Image handling
function handleFile(file) {
    imgLoaded = false; 
    if (file.type === 'image') {
        // Converting image into a p5.js image object
        img = createImg(
            file.data, 'Alt text', 'anonymous', imgCreated);
            img.hide();
    } else {
        img = null;
        alert("Image couldn't be uploaded.")
    }
}

// Converting to p5.js image object allows us to use functions like 
// 'resize' and 'filer' that aren't available for HTML img elements
function imgCreated() {
    img.hide(); 
    let g = createGraphics(img.elt.width, img.elt.height);
    g.image(img, 0, 0);
    img.remove();
    img = g.get(0, 0, g.width, g.height);

    // Resize to fill canvas
    const imgRatio = img.width / img.height;
    const canvasRatio = windowWidth / windowHeight;
  
    if (imgRatio > canvasRatio) {
      // Image is wider → match height, crop sides
      img.resize(0, windowHeight);
    } else {
      // Image is taller → match width, crop top/bottom
      img.resize(windowWidth, 0);
    }
    imgLoaded = true;
}


// Sorting pixels
function sortPixels(img) {
    // Get a random pixel
    const x = floor(random(img.width)); 
    const y = floor(random(img.height - 1));

    // Get color of pixel
    const colorOne = img.get(x, y);

    // Get color of the pixel below first one
    const colorTwo = img.get(x, y + 1);

    // Get total R+G+B of both colors
    const totalOne = red(colorOne) + green(colorOne) + blue(colorOne);
    const totalTwo = red(colorTwo) + green(colorTwo) + blue(colorTwo);

    // If first total is less than second, swap pixels -- dark falls to bottom, light to top
    if (totalOne < totalTwo) {
        img.set(x, y, colorTwo);
        img.set(x, y+1, colorOne);
    }
}

// Sorting columns
function sortColumn(x) {
    // Collect the column of pixels
    let column = [];
    for (let y=0; y<img.height; y++) {
        column.push(img.get(x,y));
    }

    // Sort by brightness
    column.sort((a, b) => {
        let colorA = red(a) + green(a) + blue(a);
        let colorB = red(b) + green(b) + blue(b);
        return colorB - colorA;
    });

    // Write the sorted pixels back to the image
    for (let y=0; y<img.height; y++) {
        img.set(x,y,column[y])
    }
}




// Poster organizational layout
function titleText() {
    rectMode(CORNERS);
    fill('black');
    rect(0, windowWidth, windowWidth, windowHeight/1.25);
    textAlign(LEFT, CENTER);
    // textFont(RokkittMedium);
    fill('white');
    textSize(30);
    // 'In Search of HEX'
    text('Our World in HEX', windowWidth * 1/30, windowHeight - 80);
    textSize(10);
    text('A COLOR EXPLORATION OF NEW HAVEN', windowWidth * 1/30, windowHeight - 50)
}

// Getting the average color function 
// Might instead get the most frequent color pixel
function averageColor(x, y, w, h) {
    // Extract region as a p5.Image
    let region; 
    if (!imgLoaded) {
        region = get(x, y, w, h);
    } else {
        region = img.get(x, y, w, h);
    }

    region.loadPixels();
  
    let totalR = 0, totalG = 0, totalB = 0;
    let count = region.width * region.height;
  
    for (let i = 0; i < region.pixels.length; i += 4) {
      totalR += region.pixels[i];     // R
      totalG += region.pixels[i + 1]; // G
      totalB += region.pixels[i + 2]; // B
    }
  
    return color(
      totalR / count,
      totalG / count,
      totalB / count
    );
  }
  


function hexCodePalettes() {
    let rectWidth = 50;
    let rectHeight = 50;
    let xRect = windowWidth - 40;
    let yRect = windowHeight - 40;

    // Collecting colors
    let sliceW = windowWidth / 4;

    // let col0 = averageColor(0, 0, sliceW, windowHeight);
    // let col1 = averageColor(sliceW, 0, sliceW, windowHeight);
    // let col2 = averageColor(sliceW * 2, 0, sliceW, windowHeight);
    // let col3 = averageColor(sliceW * 3, 0, sliceW, windowHeight);

    // HEX blocks
    // 1st HEX
    rectMode(CORNERS); 
    // x1, y1 = top-left corner
    // x2, y2 = bottom-right corner
    fill('black');
    noStroke();
    rect(xRect - rectWidth, 
        yRect - rectHeight, 
        xRect,
        yRect);

    // 2nd HEX
    xRect = windowWidth - 40;
    yRect = windowHeight - 40;

    rectMode(CORNERS); 
    fill('black');
    noStroke();
    rect(xRect - rectWidth - 60, 
        yRect - rectHeight, 
        xRect - 60,
        yRect)
    
    // 3rd HEX
    xRect = windowWidth - 40;
    yRect = windowHeight - 40;

    rectMode(CORNERS); 
    fill('black');
    noStroke();
    rect(xRect - rectWidth - 120, 
        yRect - rectHeight, 
        xRect - 120,
        yRect)

    // 4th HEX
    xRect = windowWidth - 40;
    yRect = windowHeight - 40;

    rectMode(CORNERS); 
    fill('black');
    noStroke();
    rect(xRect - rectWidth - 180, 
        yRect - rectHeight, 
        xRect - 180,
        yRect)

}

