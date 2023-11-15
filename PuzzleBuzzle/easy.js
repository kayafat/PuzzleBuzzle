window.onload = () => {

    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  
  
  // Design
    
    // Größe eines Puzzlestücks
    const xy = 500 / 3;
    // Breite und Höhe des Rechtecks 3x3
    const rectWidth = 500;
    const rectHeight = 500;
    // Berechne die Position des Rechtecks, um es in der Mitte des Canvas zu platzieren
    const rectX = (canvas.width - rectWidth) / 2;
    const rectY = (canvas.height - rectHeight) / 4;
    // Breite und Höhe des Rechtecks 3x3
    const conWidth = 400;
    const conHeight = 100;
    // Berechne die Position des Rechtecks, um es in der Mitte des Canvas zu platzieren
    const conX = (canvas.width - conWidth) / 2;
    const conY = rectHeight + 170;
    
    // Countdown-Variablen
    let countdown = 60; // Startzeit in Sekunden
    let countdownInterval; // Variable für das Intervall
    let lockedPieces = 0; // Anzahl für eingerastete Puzzleteile
    
  // Zurück Button
  
    
    document.getElementById("goback").addEventListener("click", function() {
        // Weiterleitung zur Start-Spielseite
        window.location.href = "index.html";
    });
  
  
  // Puzzleteile
  
  const shapes = [];
  const images = [];
  let isDragging = false;
  let startX, startY;
  let rotationStep = Math.PI / 2; 
  let selectedShape = null;
  
  function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function getOffset() {
  const canvasOffset = canvas.getBoundingClientRect();
  offset_x = canvasOffset.left;
  offset_y = canvasOffset.top;
  }
  
  window.addEventListener('scroll', getOffset);
  window.addEventListener('resize', getOffset);
  getOffset();
  
  // Funktion zum Laden eines Bildes und Rückgabe einer Promise
  function loadImage(imageSrc) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => resolve(image);
        image.onerror = reject;
    });
  }
  
  // Definition der Lock-Positionen für jedes Bild
  const lockPositions = [
    { x: rectX, y: rectY },
    { x: rectX + xy, y: rectY },
    { x: rectX + (2 * xy), y: rectY },
    { x: rectX, y: rectY + xy },
    { x: rectX + xy, y: rectY + xy },
    { x: rectX + (2 * xy), y: rectY + xy },
    { x: rectX, y: rectY + (2 * xy) },
    { x: rectX + xy, y: rectY + (2 * xy) },
    { x: rectX + (2 * xy), y: rectY + (2 * xy) },
  ];
  
  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", handleTouchEnd);
  
  // Laden der Bilder in der gewünschten Reihenfolge und Zuordnung zu den Indexen
  Promise.all([
    loadImage('./images/Blume/bild2_1.jpg'),
    loadImage('./images/Blume/bild2_2.jpg'),
    loadImage('./images/Blume/bild2_3.jpg'),
    loadImage('./images/Blume/bild2_4.jpg'),
    loadImage('./images/Blume/bild2_5.jpg'),
    loadImage('./images/Blume/bild2_6.jpg'),
    loadImage('./images/Blume/bild2_7.jpg'),
    loadImage('./images/Blume/bild2_8.jpg'),
    loadImage('./images/Blume/bild2_9.jpg'),
  ])
  
  .then((loadedImages) => {
    loadedImages.forEach((image, index) => {
        images.push(image);
  
        // Generiere zufällige x- und y-Koordinaten, wobei x links vom Rechteck liegt
        const randomX = getRandomInt(rectX - (xy / 2), rectX-2*xy);
        const randomY = getRandomInt(rectY, rectY + rectHeight + xy);
        const randomAngle = (getRandomInt(0, 3) * 90) * (Math.PI / 180);
  
        shapes.push({
            x: randomX,
            y: randomY,
            width: xy,
            height: xy,
            imageIndex: index,
            isLocked: false,
            lockX: lockPositions[index].x, 
            lockY: lockPositions[index].y, 
            resetX: 100,
            resetY: 100,
            angle: randomAngle,
        });
    });
    drawShapes();
    startCountdown();
  })
  .catch((error) => {
    console.error('Fehler beim Laden der Bilder:', error);
  });
  
  
  function isMouseInShape(x, y, shape) {
  return x > shape.x && x < shape.x + shape.width && y > shape.y && y < shape.y + shape.height;
  }
  
  // Event Listener noch nicht für Touch sondern erstmals für Maus hinzugefügt
  // Wird noch geändert
  
  let touchStartX, touchStartY;
  
  // Event Listener for the second touch event (swipe to rotate)
  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", handleTouchEnd);
 
  let secondTouchStartX, secondTouchStartY, secondTouchEndX, secondTouchEndY;
let rotationThreshold = 2; // Schwellenwert für die Rotation in cm, kann angepasst werden
let rotationSpeed = 0.01; // Geschwindigkeit der Drehung, kann angepasst werden

function handleTouchStart(event) {
    event.preventDefault();

    // Check for the second touch
    if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        secondTouchStartX = (touch1.clientX + touch2.clientX) / 2;
        secondTouchStartY = (touch1.clientY + touch2.clientY) / 2;
    } else {
        // Your existing touchstart logic
        const touch = event.touches[0];
        touchStartX = touch.clientX - canvas.getBoundingClientRect().left;
        touchStartY = touch.clientY - canvas.getBoundingClientRect().top;

        for (const shape of shapes) {
            if (isTouchInShape(touchStartX, touchStartY, shape)) {
                if (!shape.isLocked) {
                    isDragging = true;
                    selectedShape = shape;
                    startX = touchStartX - shape.x;
                    startY = touchStartY - shape.y;
                }
                break;
                //test
            }
        }
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    if (isDragging && selectedShape && !selectedShape.isLocked) {
        const touch = event.touches[0];
        const touchX = touch.clientX - canvas.getBoundingClientRect().left;
        const touchY = touch.clientY - canvas.getBoundingClientRect().top;

        // Calculate the change in position
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;

        // Check for the second touch
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            secondTouchEndX = (touch1.clientX + touch2.clientX) / 2;
            secondTouchEndY = (touch1.clientY + touch2.clientY) / 2;

            // Check the direction of the second swipe and rotate accordingly
            const swipeDistance = Math.sqrt(Math.pow((secondTouchEndX - secondTouchStartX), 2) + Math.pow((secondTouchEndY - secondTouchStartY), 2));
            if (swipeDistance >= rotationThreshold) {
                const swipeDirection = getSwipeDirection(secondTouchStartX, secondTouchStartY, secondTouchEndX, secondTouchEndY);
                if (swipeDirection === 'right') {
                    selectedShape.angle += rotationSpeed;
                } else if (swipeDirection === 'left') {
                    selectedShape.angle -= rotationSpeed;
                }

                drawShapes();
                return;
            }
        }

        // Move the shape
        selectedShape.x = touchX - startX;
        selectedShape.y = touchY - startY;

        // Update the start position for the next move event
        touchStartX = touchX;
        touchStartY = touchY;

        drawShapes();
    }
}

function getSwipeDirection(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const angle = Math.atan2(deltaY, deltaX);
    const angleInDegrees = angle * (180 / Math.PI);

    if (angleInDegrees >= -45 && angleInDegrees <= 45) {
        return 'right';
    } else if (angleInDegrees > 45 && angleInDegrees <= 135) {
        return 'up';
    } else if (angleInDegrees > 135 || angleInDegrees <= -135) {
        return 'left';
    } else {
        return 'down';
    }
}

 

function handleTouchEnd(event) {
    event.preventDefault();
    if (event.touches.length !== 2) {
        isDragging = false;

        if (selectedShape) {
            const touch = event.changedTouches[0];
            const touchEndX = touch.clientX - canvas.getBoundingClientRect().left;
            const touchEndY = touch.clientY - canvas.getBoundingClientRect().top;

            // Check if the piece is within the playfield
            if (
                touchEndX >= rectX &&
                touchEndX <= rectX + rectWidth &&
                touchEndY >= rectY &&
                touchEndY <= rectY + rectHeight
            ) {
                // Check if the piece is also in the lock area
                if (
                    touchEndX >= rectX &&
                    touchEndX <= rectX + rectWidth &&
                    touchEndY >= rectY &&
                    touchEndY <= rectY + rectHeight
                ) {
                    // Check if the piece is also in the lock area
                    if (
                        touchEndX <= selectedShape.lockX + xy &&
                        touchEndX >= selectedShape.lockX &&
                        touchEndY >= selectedShape.lockY &&
                        touchEndY <= selectedShape.lockY + xy
                    ) {
                        selectedShape.x = selectedShape.lockX;
                        selectedShape.y = selectedShape.lockY;
                        selectedShape.isLocked = true;
                        lockedPieces++;
                        if (lockedPieces === shapes.length) {
                            showGameOverModal();
                        }
                    } else {
                        selectedShape.x = selectedShape.resetX;
                        selectedShape.y = selectedShape.resetY;
                    }
                }
            }
            
            // Rotate the shape by 90 degrees
            selectedShape.angle += rotationStep;

            // Draw shapes after rotation
            drawShapes();
        }                    
    
        selectedShape = null;
        drawShapes();
    }
}
    
  
    function isTouchInShape(x, y, shape) {
        return x > shape.x && x < shape.x + shape.width && y > shape.y && y < shape.y + shape.height;
    }
  
  // Anzeige ob man gewonnen oder verloren hat wenn der Timer abläuft
  
  function showGameOverModal() {
      // Anzeigen des Modals
      const modal = document.querySelector('.modal');
      modal.style.display = 'flex';
  
      // Check if the game is won
      if (lockedPieces === shapes.length) {
          modal.innerHTML = `<p style="font-size: 55px; color: white">Congratulations, you've won!</p><button id="retryBtn">Retry</button><button id="menuBtn">Back to Menu</button>`;
          clearInterval(countdownInterval); // Stop the countdown when the game is won
      } else {
          modal.innerHTML = `<p style="font-size: 55px; color: white";>Game Over!</p><button id="retryBtn">Retry</button><button id="menuBtn">Back to Menu</button>`;
      }
  
      // Add event listeners to the buttons
      const retryBtn = document.getElementById('retryBtn');
      retryBtn.addEventListener('click', function () {
          // Reload the page to restart the game
          window.location.reload();
      });
  
      const menuBtn = document.getElementById('menuBtn');
      menuBtn.addEventListener('click', function () {
          // Redirect to the menu page
          window.location.href = "index.html";
      });
  }
  
  function drawShapes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayfield();
      
      for (const shape of shapes) {
          const imageIndex = shape.imageIndex;
          const image = images[imageIndex];
          
          if (image) {
              ctx.save(); // Speichern des aktuellen Zeichenkontexts
              ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2); // In die Mitte des Bildes verschieben
              ctx.rotate(shape.angle); // Drehen des Bildes um den Winkel im Radianten
              ctx.drawImage(image, -shape.width / 2, -shape.height / 2, shape.width, shape.height); // Zeichnen des Bildes
              ctx.restore(); // Wiederherstellen des Zeichenkontexts
          }
      }
  
      drawCountdown(); // Zeige die Zeit am Ende des renderns an
  }
  
  function startCountdown() {
      countdownInterval = setInterval(() => {
          countdown--;
          drawCountdown(); // Rufe die Funktion auf um die Zeit zu aktuallisieren
          if (countdown === 0) {
              clearInterval(countdownInterval); // Stoppe die Zeit wenn es 0 erreicht
              showGameOverModal(); // Ruft die Funktion auf um das modal anzuzeigen (Text)
          }
      }, 1000); // Aktuallisiere die Zeit alle 1000 millisekunden (1sekunde)
  }
  
  function drawCountdown() {
      const minutes = Math.floor(countdown / 60);
      const seconds = countdown % 60;
  
      // Aktuallisieren des Bereiches um den Timer nicht überlappt anzuzeigen
      ctx.clearRect(canvas.width / 2 - 100, canvas.height - 50, 200, 30);
  
      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
  
      if (minutes > 0) {
          ctx.fillText(`Time: ${minutes}m ${seconds}s`, canvas.width / 2, canvas.height - 20);
      } else {
          ctx.fillText(`Time: ${seconds}s`, canvas.width / 2, canvas.height - 20);
      }
  }
  
  function drawPlayfield() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("PuzzleBuzzle", innerWidth / 2, 70);
  
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("By Fatih & Selin Kaya", innerWidth / 2, 940);
  
  // Spielfeld
  
        ctx.beginPath();
        ctx.lineWidth = "3";
        ctx.strokeStyle = "white";
        ctx.rect(rectX, rectY, rectWidth, rectHeight);     
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.stroke();
  
  // Spielfeld Gitter
  
        const cellHeight = rectHeight / 3;
    for (let i = 1; i < 3; i++) {
        const y = rectY + i * cellHeight;
        ctx.beginPath();
        ctx.moveTo(rectX, y);
        ctx.lineTo(rectX + rectWidth, y);
        ctx.strokeStyle = "grey";
        ctx.stroke();
    }
    const cellWidth = rectWidth / 3;
    for (let i = 1; i < 3; i++) {
        const x = rectX + i * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, rectY);
        ctx.lineTo(x, rectY + rectHeight);
        ctx.strokeStyle = "grey";
        ctx.stroke();
    }
  
    // Kleines Rechteck unten (Platzhalter für eventuellen Countdown)
  
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "white";
        ctx.rect(conX, conY, conWidth, conHeight);  
        ctx.stroke();
  
  
    // Rechteck für das Lösungsbild
  
        const imageUrlForRectangle = './images/bild2.jpg';
  
        const image2 = new Image();
            image2.src = imageUrlForRectangle;
            image2.onload = () => {
  
                ctx.beginPath();
                ctx.lineWidth = "2";
                ctx.strokeStyle = "black";
                ctx.rect(rectX + 3* xy + 50, rectY, 75, 75);
                ctx.stroke();
        
                ctx.drawImage(image2, rectX + 3* xy + 50, rectY, 75, 75);
            };     
  }
  
  };