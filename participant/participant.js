// where socket should go 
let socket = io(); 
let userImages = [];

function setup() {

}

socket.on("newImage", (imgDataURL) => {
    userImages.push(imgDataURL);
    console.log("Received new image:", imgDataURL);

    // Preview 
    let img = new Image();
    img.src = imgDataURL;
    document.getElementById("preview-body").appendChild(img);
})


document.getElementById('uploadBtn').addEventListener("click", () => {
    document.getElementById("fileInput").click(); // opens file picker
});

document.getElementById('fileInput').addEventListener("change", () => {
    document.getElementById("uploadForm").submit();
});