// Fonts
let RokkittMedium; 

// User uploaded image
let input; 
let img; 
let imgLoaded = false;


// Webcam variables 
let video;
let w = 64, h = 48, scl = 10;
let videoFrame;
let handPose;
let hands = [];

// Palette
let palettes = []; // Used for ML5
let lastAddedTime = 0;
let cooldown = 1000;


function preload() {
    handPose = ml5.handPose({ flipped: true });
    RokkittMedium = loadFont('assets/Rokkitt-Medium.ttf');
}

function gotHands(results) {
    hands = results;
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    ctx = drawingContext;

    // User uploaded image
    input = createFileInput(handleFile);
    input.hide();

    let uploadButton = createButton('Upload Image');
    uploadButton.position(windowWidth * 1/35, windowHeight - 40);
    // input.style('background', 'black');
    let c = get(mouseX, mouseY);
    uploadButton.style('color', 'white');  
    uploadButton.style('background', c);  
    uploadButton.style('border', '1px solid')
    uploadButton.style('font-size', '10px');
    uploadButton.style('font-family', 'RokkittMedium, sans-serif');
    uploadButton.style('cursor', 'pointer');

    uploadButton.mousePressed(() => {
        input.elt.click();
    });

    scl = width/w;
    // ---- Start webcam ----
    video = createCapture(VIDEO, { flipped: true });
    video.size(w, h);
    video.hide();

    // Detect hands
    handPose.detectStart(video, gotHands);

    // Set up socket
    socket = io('http://localhost:4000'); 

    // Receives image from server
    socket.on('upload-image', (base64) => {
        handleServerImage(base64);
    });
}

function handleServerImage(base64) {
    loadImage(base64, (loadedImg) => {
        img = loadedImg;   // p5.Image
        imgLoaded = true;
        img.resize(windowWidth, 0);
    });
}


function draw() {
    background('white');
     // If webcam isn't ready, stop
    //  if (!video) {
    //     background(0);
    //     fill(255);
    //     text("Loading webcam...", 20, 20);
    //     return;
    // }

    if (video && !imgLoaded)
    {
        // video.loadPixels();
        for (let i=0; i<video.width; i++) {
            for (let j=0; j<video.height; j++) {
                // let index = ((j*video.width) + 1) * 4 // Get all the pixels in video
                // let r = video.pixels[index + 0];
                // let g = video.pixels[index + 1];
                // let b = video.pixels[index + 2];
                // let a = video.pixels[index + 3];

                // Get pixel value for each of the location in video
                let val = video.get(i, j);
                let r = val[0];
                let g = val[1];
                let b = val[2];
                // let c = map(val, 0, 100, 0, 20); 
                // let c = (r + g + b) / 3;
                // let s = map(c, 0, 100, 0, 255);
                fill(r, g, b); 
                noStroke();
                rect(i*scl + scl/2, j*scl + scl/2, scl, scl);
            }
        }
    }

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
        // Stop webcam stream -- maybe have webcam on, but overlay image on top
        // Because I still want the webcam to detect hand motion
        // if (video) {
        //     let stream = video.elt.srcObject;
        //     let tracks = stream.getTracks();
        //     tracks.forEach(t => t.stop());
        //     video.remove();
        //     video = null;
        // }

        img.resize(64*3, 48*3);
        img.loadPixels();

        for (let i=0; i<3; i++) {
            // sortPixels(img);  // Change to i < 75000
            sortColumn(floor(random(img.width)));
        }
        img.updatePixels();
        noSmooth();
        image(img, 0, 0, width, height);
    }

    // Detecting hand positions to get HEX code --
    let hand;
    let index;
    let thumb;
    let scaleX = width / video.width;
    let scaleY = height / video.height;
    let c;

    if (hands.length > 0) {
        hand = hands[0];
        index = hand.index_finger_tip;
        thumb = hand.thumb_tip;

       
        // circle(thumb.x * scaleX, thumb.y * scaleY, 16);
        let scaledIndexX = index.x * scaleX;
        let scaledIndexY = index.y * scaleY;
        let scaledThumbX = thumb.x * scaleX; 
        let scaledThumbY = thumb.y * scaleY;

        c = get(scaledIndexX, scaledIndexY - 40); // Can swap between mouse and index
        let hexColor = rgbToHex(c[0], c[1], c[2]);

        fill(c);
    

        noStroke();
        textSize(20);
        text(hexColor, windowWidth * 1/30, 30);
        
        strokeWeight(1);
        stroke('black');
        square(scaledIndexX, scaledIndexY - 20, 20);
   
        let d = dist(scaledIndexX, scaledIndexY, scaledThumbX, scaledThumbY); 
        if (d < 25) {
            strokeWeight(1);
            fill(c);
            stroke('black');
            square(scaledIndexX, scaledIndexY - 10, 40);
            square(scaledThumbX, scaledThumbY - 20, 20);
            let now = millis();
            if (now - lastAddedTime > cooldown) {
                let x = constrain(scaledIndexX, 0, width - 1);
                let y = constrain(scaledIndexY - 10, 0, height - 1);
                let colorToPalette = get(x, y);           
                if (colorToPalette) {
                    if (palettes.length >=4) {
                        palettes.pop();
                    }
                    palettes.unshift(colorToPalette);
                    console.log(palettes);
    
                }      
                lastAddedTime = now; 
            }
        }
    }


    titleText();
    hexCodePalettes();

    if (imgLoaded) {
        hexCodePalettes();
    }

    // let c = get(mouseX, mouseY); // Uses mouse color
    // let hexColor = rgbToHex(c[0], c[1], c[2]);

    // fill(c);
    // noStroke();
    // textSize(20);
    // text(hexColor, windowWidth * 1/30, 30);

    // fill(c);
    // strokeWeight(2);
    // stroke('black');
    rectMode(CENTER);
    // square(mouseX, mouseY, 30);
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

let palette = [];
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
    // palette = getDominantColors(img);
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
    let c = get(mouseX, mouseY);
    fill('black');
    rect(0, windowWidth, windowWidth, windowHeight/1.22);
    textAlign(LEFT, CENTER);
    textFont(RokkittMedium);
    fill('white');
    textSize(30);
    // 'In Search of HEX'
    text('World in HEX', windowWidth * 1/30, windowHeight - 90);
    textSize(10);
    text('POINT TO A PIXEL. TAP TO CAPTURE THE HEX.', windowWidth * 1/30, windowHeight - 60)
}

function hexCodePalettes() {
    let rectWidth = 50;
    let rectHeight = 50;

    let xBase = windowWidth - 40;
    let yBase = windowHeight - 40;

    // Get 4 dominant colors from histogram binning

    // Draw each palette block -- palettes is a global var
    for (let i = 0; i < palettes.length; i++) {
        fill(palettes[i]);
        noStroke();
        rectMode(CORNERS);

        rect(
            xBase - rectWidth - (i * 60), // shift each block left by 60
            yBase - rectHeight,
            xBase - (i * 60),
            yBase
        );
    }
}
