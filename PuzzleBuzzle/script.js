const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

ctx.font = "50px Arial";
ctx.fillStyle = "white";
ctx.textAlign = "center";
ctx.fillText("PuzzleBuzzle", innerWidth / 2, 70);

ctx.font = "20px Arial";
ctx.fillStyle = "white";
ctx.textAlign = "center";
ctx.fillText("By Fatih & Selin Kaya", innerWidth / 2, 120);

const rectWidth = 800;
const rectHeight = 50;
const rectX = (canvas.width - rectWidth) / 2;
const rectY = (canvas.height - rectHeight) / 4;

const logoWidth = 300;
const logoHeight = 300;
const logoX = ((canvas.width - logoWidth) / 2) + 10;
const logoY = (canvas.height - logoWidth) - 50;

const textX = rectX + rectWidth / 2;
const textY = (rectY + rectHeight / 2) + 6;

const text = "Wähle einen Schwierigkeitsgrad aus, um dein Können unter Beweis zu stellen!";

ctx.beginPath();
ctx.lineWidth = "1";
ctx.strokeStyle = "white";
ctx.fillStyle = "white";
ctx.rect(rectX, rectY, rectWidth, rectHeight);
ctx.fill();
ctx.stroke();

ctx.font = "20px Arial"; 
ctx.fillStyle = "black"; 
ctx.textAlign = "center"; 
ctx.fillText(text, textX, textY);


const image = new Image();
image.src = './images/logo.png';


image.onload = function() {
    ctx.drawImage(image, logoX, logoY, logoWidth, logoHeight);
};

document.getElementById("Easy").addEventListener("click", function() {
  // Weiterleitung zur Easy-Spielseite
  window.location.href = "easy.html";
});

document.getElementById("Normal").addEventListener("click", function() {
  // Weiterleitung zur Normal-Spielseite
  window.location.href = "normal.html";
});

document.getElementById("Hard").addEventListener("click", function() {
  // Weiterleitung zur Hard-Spielseite
  window.location.href = "hard.html";
});
