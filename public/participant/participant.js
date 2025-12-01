// Client
var socket;
let button; 
let fileInput;
let img;
let userImages = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background('black');

    socket = io('https://world-in-hex-s4p.onrender.com'); 
    // socket = io('http://localhost:4000'); 


    // Client receiving the message from the server
    // socket.on('mouse', newDrawing);

    // Create button
    button = createButton('Upload image');
    button.size(150, 40);
    button.style('font-size', '20px');
    button.position(windowWidth/2 - button.width/2, windowHeight/2 - button.height/2);

    // Create hidden file input
    fileInput = createFileInput(handleFile);
    fileInput.hide();

    button.mousePressed(() => fileInput.elt.click());
}

function handleFile(file) {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    if (file.type === 'image' && fileExtension !== 'heic') {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;

            // Load image to canvas
            loadImage(base64, (img) => {
                const resized = createGraphics(800, 600);

                setTimeout(() => {
                    // Compute aspect ratio
                    const imgRatio = img.width / img.height;
                    const canvasRatio = 800 / 600;
            
                    let drawWidth, drawHeight;
                    if (imgRatio > canvasRatio) {
                        drawWidth = 800;
                        drawHeight = 800 / imgRatio;
                    } else {
                        drawHeight = 600;
                        drawWidth = 600 * imgRatio;
                    }
            
                    // Draw onto buffer
                    resized.image(img, 0, 0, drawWidth, drawHeight);
            
                    // Export base64
                    const smallBase64 = resized.elt.toDataURL('image/jpeg', 0.8);
            
                    socket.emit('upload-image', smallBase64);
                    console.log("Sent image to server.");
                }, 0);
            });
        };
        reader.readAsDataURL(file.file);
    } else {
        console.log('Not an acceptable image.');
    }
}

// Handling HEIC some other time
//     // Since most iPhones take photos that are HEIC files
//     } else if (fileExtension === 'heic') {
//         const blob = new Blob([file.file], { type: file.file.type });
  
//         // Use heic2any to convert HEIC to JPG
//         heic2any({
//             blob: blob,
//             toType: "image/jpeg",
//             quality: 0.8 
//         }).then((convertedBlob) => {
//             // Create an image element to display the converted JPG
//             imgElement = createImg(URL.createObjectURL(convertedBlob), '', '', () => {
//             // Load the converted image onto the canvas
//             loadImage(imgElement.elt.src, (img) => {
//                 userImages.push(img);
//                 image(img, 0, 0, width, height);

//                 // Sent image to server if HEIC
//                 socket.emit('upload-image', base64);
//                 convertedImage = img; // Save for later use
//             });
//             });
//             imgElement.hide(); // Hide the image element (we only need its src for the canvas)
//         }).catch((err) => {
//             console.error("HEIC conversion failed: ", err);
//       });
//     } else {
//         console.log('Not an image file');
//     }
// }


// function newDrawing(data) {
//     noStroke();
//     fill(255, 0, 100);
//     ellipse(data.x, data.y, 36, 36)
// }

// function mouseDragged() {
//     console.log('Sending: ' + mouseX + ', ' +  mouseY)

//     // Sending data of x, y coordinate 
//     // Creating a Javascript object with data in it
//     var data = {
//         x: mouseX, 
//         y: mouseY
//     }

//     // Sends the messaage
//     // In server.js, we need to write code to receive the message
//     socket.emit('mouse', data); // Name the message 'mouse'

//     fill('black');
//     ellipse(mouseX, mouseY, 36, 36);
// }

function draw() {
  
}
