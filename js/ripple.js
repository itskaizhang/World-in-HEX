let points = [];

function setup() {
    createCanvas(600,600);
    angleMode(DEGREES); 
    stroke(255); 
    strokeWeight(10);

    for (let i=0; i<12; i++) {
        points[i] = createVector(random(width), random(height));
    }
}

function draw() {
    background(0);
    loadPixels(); // access all pixels in canvas

    for (let x=0; x<width; x++) {
        for (let y=0; y<height; y++) {
            let distances = []; // Create an array to store distnace values
            for (let i=0; i<points.length; i++) {
                let d = dist(x, y, points[i].x, points[i].y);
                distances[i] = d; 
            }
            let index = (x + y*width) * 4; // Each array value contains RGBA value
            pixels[index] = 44; // Stores RGBA values 
            pixels[index + 1] = 169;
            pixels[index + 2] = 255;
            pixels[index + 3] = 255;
        }
    } 

    updatePixels();

    beginShape(POINTS);
    for(let i=0; i<points.length; i++) {
        vertex(points[i].x, points[i].y); 
    }
}