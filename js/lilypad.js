// Credit: Patt Vira
// https://www.youtube.com/watch?v=YjC6DAy6kK4

let c1, c2, c3; 
let b1, b2, b3;
let r = 150;
let angle = 0;
let ellipses = []; // Stores mouse click positions
let ctx;
let cooldown_time = 750 // ms
let lastTrigger = 0; // last time pinch was triggered

// Webcam variables 
let video;
let handPose;
let hands = [];

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
    createCanvas(480, 700);
    ctx = drawingContext;

    rectMode(CENTER);
    c1 = color('#1bd6ff');
    c2 = color('#3b9dff');
    c3 = color('#f69bb4');
    b1 = color('#7ffb8d');
    b2 = color('#a2c7b0');
    b3 = color('#a2c7b0');
    angleMode(DEGREES);

    // ---- Start webcam ----
    video = createCapture(VIDEO, { flipped: true });
    video.size(480, 640);
    video.hide();
    handPose.detectStart(video, gotHands);
}


function gotHands(results) {
    hands = results;
  }
  


// Hand pose pinch
function detectPinch() {
    // image(video, 0, 0);
  
    // Ensure at least one hand is detected
    if (hands.length > 0) {
    
        let hand = hands[0];
        let index = hand.index_finger_tip;
        let thumb = hand.thumb_tip;
    
        noStroke();

        let gradient1 = ctx.createRadialGradient(
            index.x, index.y, 0,     // inner circle center + radius
            index.x, index.y, 10     // outer circle center + radius
        );
        
        gradient1.addColorStop(0, "rgba(255, 192, 203, 0.2)");
        gradient1.addColorStop(1, "rgba(0, 255, 0, 0.2)");   
        
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.arc(index.x, index.y, 15, 0, TWO_PI);
        ctx.fill();
        // ctx.fillRect(0, 0, width, height);

        let gradient2 = ctx.createRadialGradient(
            thumb.x, thumb.y, 0,     // inner circle center + radius
            thumb.x, thumb.y, 10     // outer circle center + radius
        );
        
        gradient2.addColorStop(0, "rgba(255, 192, 203, 0.2)");
        gradient2.addColorStop(1, "rgba(0, 255, 0, 0.2)");   
        
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(thumb.x, thumb.y, 15, 0, TWO_PI);
        ctx.fill();
        

        // Lowkey could be its own function
        const d = dist(index.x, index.y, thumb.x, thumb.y);
        const thresholdDict = 30;
        
        if (d < thresholdDict) {

            // Cool down
            if (millis() - lastTrigger > cooldown_time) {
            // Changes shape
            ctx.fillStyle = "rgba(255, 255, 0, 0.3)";

            ctx.beginPath();
            ctx.arc(index.x, index.y, 25, 0, TWO_PI);
            ctx.fill();
        
            ctx.beginPath();
            ctx.arc(thumb.x, thumb.y, 25, 0, TWO_PI);
            ctx.fill();

            // Adds an ellipse 
            ellipses.push({x: thumb.x, y: thumb.y});    
            lastTrigger = millis();
            }
        }
        
        circle(index.x, index.y, 12);
        circle(thumb.x, thumb.y, 12);
        
        // addPinchPoint(d);
        
    }
  }


function mouseClicked() {
    // Save mouse positions
    ellipses.push({x: mouseX, y: mouseY});    
}

// Function for setting up gradient - 4 arguments 
function setGradientBlock(min, max, y, height, c1, c2) {
    noStroke();
    for (let i=min; i<=max; i++) {
        let amt = map(i, min, max, 0, 1);
        let c3 = lerpColor(c1, c2, amt);  
        
        stroke(c3);
        line(i, y, i, y + height);

        // fill(c3);
        // rect(i, y + height/2, 1, height);
    }
}

// Follows the mouse
// function drawRadialGradient() {
//     push();
//     let gradient = ctx.createRadialGradient(
//         mouseX, mouseY, 0,     // inner circle center + radius
//         mouseX, mouseY, 150     // outer circle center + radius
//     );

//     gradient.addColorStop(0, "rgba(255, 192, 203, 0.2)");
//     gradient.addColorStop(1, "rgba(0, 255, 0, 0.2)");   

//   ctx.fillStyle = gradient;
//   ctx.fillRect(0, 0, width, height); 
//   pop();
// }


function setGradientEllipse(min, max, c1, c2) {
    // Ellipse
    // i++ --> can modify this for gradation
    for (let i=min; i <=max; i+= 3) {
        let amt = map(i, min, max, 0, 1);
        let c3 = lerpColor(c1, c2, amt); 

        stroke(c3);

        // Using lines to make a circle
        // Need to convert polar coordinates to cortesian coordinates
       let x = 0.3 * r*cos(i); // i = angle
       let y = 0.3 * r*sin(i);
       line(0, 0, x, y);
    }
}

function draw() {
    // background('blue');

    // Amount of interpolation is between 0, 1
    // Interpolated based on poisition of mouse
    // 0 maps to 0
    // width maps to 1
    // let amt = map(mouseX, 0, width, 0, 1);
    // let c3 = lerpColor(c1, c2, amt);

    // Block -- divided into 4 parts
    let t = (sin(frameCount * 2) + 1) / 2;
    let d1 = color('#016B61');
    let d2 = color('#E5E9C5');
    let d3 = lerp(d1, d2, t);

    setGradientBlock(0, width/4, 0, height, d3, c2);
    setGradientBlock(width/4, width/2, 0, height, c2, c3);
    setGradientBlock(width/2, 3*width/4, 0, height, c3, c2);
    setGradientBlock(3*width/4, width, 0, height, c2, d3);

    // drawRadialGradient()
    
    // Draw all stored gradient ellipses
    for (let e of ellipses) {
        push(); // save state
        translate(e.x, e.y);
        setGradientEllipse(0 + angle, 90 + angle, b1, b2);
        setGradientEllipse(90 + angle, 180 +  angle, b2, b3);
        setGradientEllipse(180 + angle, 270 + angle, b3, b2);
        setGradientEllipse(270 + angle, 360 + angle, b2, b1);
        pop();
    }
    // Animating circle
    angle += 1; 

    detectPinch();
} 