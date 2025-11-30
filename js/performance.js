// Uses socket to take in user uploaded images

let socket = io();

function handleFile(file) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
            socket.emit('image-upload', reader.result);
        };
        reader.readAsDataURL(file);
    }
}

io.on('connection', (socket) => {
    socket.on('image-upload', (imgData) => {
      io.emit('new-image', imgData); // broadcast to all clients
    });
  });




// Performance/sketch.js from class
// let socket = io();
// let images_src=["bug.jpg","cat.gif","computer.jpg","forest.jpg","giphy.gif","moodeng.gif","moodeng2.gif","mosquito.jpg","pie.jpg","sky.jpg","subway.jpg","taxi.jpg","underground.jpg"]
// let image_folder="/images/"
// let images=[]
// let sounds_src=["bubble1.wav","bubble2.wav","bubble3.wav","bubble4.wav","bubble5.wav","bubble6.wav","bubble7.wav","click.wav","click2.wav","click3.wav","click4.wav","click5.wav","cracking1.wav","cracking2.wav","cracking3.wav","cracking4.wav","pop.wav","bird1.mp3"]
// let sounds_folder="/sounds/"
// let sounds=[]
// let current_image;
// let current_text;
// let h,w;
// let started=false;

// function preload(){
//   for(let i=0;i<images_src.length;i++){
//     images.push(loadImage(image_folder+images_src[i]))
//   }
//   for(let j=0;j<sounds_src.length;j++){
//     sounds.push(loadSound(sounds_folder+sounds_src[j]))
//   }

// }

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   textAlign(CENTER,CENTER)
//   imageMode(CENTER)
//   text("Click to start",width/2,height/2);
//   // current_image=random(images)
// }

// function draw() {
//   if(!started) {
//     background(0);
//     fill(255);
//     textSize(height/20);
//     text("Click to start", width/2, height/2);
//   }
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }

// socket.on("relay", (msg) => {
//   if(started && (msg.type=="sound" || msg.type == "image")){
//     if (msg.type=="image"){
//         background(0);
//         placeImage(msg.value);
//     }
//     else if(msg.type=="sound"){
//         playSound(msg.value);
//     }
//   }
// });

// function placeImage(img_requested){
//     let img;
//     for (let i=0;i<images_src.length;i++){
//         if(images_src[i]==img_requested){
//             img=images[i];
//             break;
//         }
//     }
    
//     if(!img) {
//         console.log("Image not found:", img_requested);
//         return;
//     }
    
//     if(img.height>img.width){
//        h=height-height/10;
//        w=h/img.height*img.width
//     }else{
//        w=width-width/10;
//        h=w/img.width*img.height
//     }
//     current_image=img;
//     image(current_image,width/2,height/2,w,h)
// }

// function playSound(sound_requested){
//   if(started){
//     let sound;
//     for (let i=0;i<sounds_src.length;i++){
//         if(sounds_src[i]==sound_requested){
//             sound=sounds[i];
//             break;
//         }
//     }
//     if(sound) {
//         sound.play();
//     } else {
//         console.log("Sound not found:", sound_requested);
//     }
//   }
// }


// // function randomWord(){
// //   let c=color(255)
// //   let s=random(height/50,height/2)
// //   fill(c);
// //   textSize(s)
// //   current_text=random(words)
// // }

// function mousePressed(){
//   started=true;
// }

// // function keyPressed(){
// //   if(key==" "){
// //     socket.emit("relay", { type: "word" });
// //   }
// // }