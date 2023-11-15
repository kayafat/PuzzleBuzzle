window.onload = () => {

    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  
  
  // Design
    
    // Größe eines Puzzlestücks
    const xy = 500 / 3;
    // Breite und Höhe des Rechtecks 3x3 bzw. Spielfeld
    const rectWidth = 500;
    const rectHeight = 500;
    // Berechne die Position des Spielfelds, um es in der Mitte des Canvas zu platzieren
    const rectX = (canvas.width - rectWidth) / 2;
    const rectY = (canvas.height - rectHeight) / 4;
      
  // Countdown-Variablen

    let countdown = 60; // Startzeit in Sekunden
    let countdownInterval; // Variable für das Intervall
    let lockedPieces = 0; // Anzahl für eingerastete Puzzleteile
    
  // Zurück Button, um zur Startseite zu gelangen
  
    document.getElementById("goback").addEventListener("click", function() {
        // Weiterleitung zur Start-Spielseite
        window.location.href = "index.html";
    });
  
  
  // Puzzleteile
  
  const shapes = [];
  const images = [];
  let isDragging = false;
  let startX, startY;
  let selectedShape = null;

  let rotationStartAngle = 0;
  
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
  
        // Generiert zufällige x- und y-Koordinaten, wobei y unter dem Spielfeld liegt
        const randomX = getRandomInt(rectX, rectX + rectWidth - xy);
        const randomY = getRandomInt(rectY + rectHeight, canvas.height - (3/2 * xy));
        const randomAngle = (getRandomInt(0, 3) * 90) * (Math.PI / 180);    // Diese erscheinen in unterschiedlichen Winkeln
  
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
    
  let touchStartX, touchStartY;
  
  // Event Listener für den zweiten Touch / Finger (wischen zum Rotieren)
  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", handleTouchEnd);
  
  function handleTouchStart(event) {
        event.preventDefault();

        // Prüft den zweiten Touch
        // Prüft die Rotation
    if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        rotationStartX = (touch1.clientX + touch2.clientX) / 2;
        rotationStartY = (touch1.clientY + touch2.clientY) / 2;
        rotationStartAngle = Math.atan2(touch1.clientY - touch2.clientY, touch1.clientX - touch2.clientX);
    } else {
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
                }
            }
        }
    }

    function handleTouchMove(event) {
        event.preventDefault();
    
        // Prüft die Rotation
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const rotationCurrentX = (touch1.clientX + touch2.clientX) / 2;
            const rotationCurrentY = (touch1.clientY + touch2.clientY) / 2;
            const rotationCurrentAngle = Math.atan2(touch1.clientY - touch2.clientY, touch1.clientX - touch2.clientX);
    
            // Berechnet die Rotation
            const deltaRotation = rotationCurrentAngle - rotationStartAngle;
    
            // Addiert die Rotierung zum ausgewählten Puzzlestück
            if (isDragging && selectedShape && !selectedShape.isLocked) {
                selectedShape.angle += deltaRotation;
                drawShapes();
            }
    
            // Aktualisiert die Rotation für den nächsten Touch - Event
            rotationStartX = rotationCurrentX;
            rotationStartY = rotationCurrentY;
            rotationStartAngle = rotationCurrentAngle;
        } else {
            if (isDragging && selectedShape && !selectedShape.isLocked) {
                const touch = event.touches[0];
                const touchX = touch.clientX - canvas.getBoundingClientRect().left;
                const touchY = touch.clientY - canvas.getBoundingClientRect().top;
    
                // Bewegt das Puzzlestück
                selectedShape.x = touchX - startX;
                selectedShape.y = touchY - startY;
    
                // Aktualisiert den Startpunkt für den nächsten Touch - Event
                touchStartX = touchX;
                touchStartY = touchY;
    
                drawShapes();
            }
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
    
                // Überprüft, ob das Puzzlestück innerhalb des Spielfeldes ist
                if (
                    touchEndX >= rectX &&
                    touchEndX <= rectX + rectWidth &&
                    touchEndY >= rectY &&
                    touchEndY <= rectY + rectHeight
                ) {
                    // Überprüft, ob es sich in der jeweiligen Lock-Area befindet
                    if (
                        touchEndX <= selectedShape.lockX + xy &&
                        touchEndX >= selectedShape.lockX &&
                        touchEndY >= selectedShape.lockY &&
                        touchEndY <= selectedShape.lockY + xy
                    ) {
                        // Überprüft, ob es den originalen/richtigen Winkel hat
                        const correctAngle = 0; 
                        const angleDifference = Math.abs(selectedShape.angle - correctAngle);
    
                        // Toleranz für Rotation, damit es trotzdem einrastert
                        if (angleDifference < 0.1) { 
                            selectedShape.x = selectedShape.lockX;
                            selectedShape.y = selectedShape.lockY;
                            selectedShape.isLocked = true;
                            lockedPieces++;
    
                            // Setzt den Winkel auf 0 zurück, wenn es eingerastert ist (wegen Toleranzgründen)
                            selectedShape.angle = 0;
    
                            if (lockedPieces === shapes.length) {
                                showGameOverModal();
                            }
                        // Ansonsten wird das Puzzlestück oben links zurückgesetzt
                        } else {
                            selectedShape.x = selectedShape.resetX;
                            selectedShape.y = selectedShape.resetY;
                            selectedShape.angle = 0;
                        }
                    } else {
                        // Ansonsten wird das Puzzlestück oben links zurückgesetzt
                        selectedShape.x = selectedShape.resetX;
                        selectedShape.y = selectedShape.resetY;
                        selectedShape.angle = 0;
                    }
                }
            }
    
            selectedShape = null;
            drawShapes();
        }
    }    
  
    function isTouchInShape(x, y, shape) {
        return x > shape.x && x < shape.x + shape.width && y > shape.y && y < shape.y + shape.height;
    }
  
  function showGameOverModal() {
      // Anzeigen des Modals
      const modal = document.querySelector('.modal');
      modal.style.display = 'flex';
  
      // Prüft, ob das Spiel gewonnen ist
      if (lockedPieces === shapes.length) {
          modal.innerHTML = `<p style="font-size: 55px; color: white; margin: right">Congratulations, you've won!</p><button id="retryBtn">Retry</button><button id="menuBtn">Back to Menu</button>`;
          clearInterval(countdownInterval); // Falls gewonnen, stoppe den Countdown
      } else {
          modal.innerHTML = `<p style="font-size: 55px; color: white";>Game Over!</p><button id="retryBtn">Retry</button><button id="menuBtn">Back to Menu</button>`;
      }
  
      // Add event listeners für die Buttons
      const retryBtn = document.getElementById('retryBtn');
      retryBtn.addEventListener('click', function () {
          // Seite neuladen, um das Spiel neuzustarten
          window.location.reload();
      });
  
      const menuBtn = document.getElementById('menuBtn');
      menuBtn.addEventListener('click', function () {
          // Leitet zur Startseite zurück
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
              ctx.save(); 
              ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2); // In die Mitte des Bildes verschieben
              ctx.rotate(shape.angle); // Drehen des Bildes um den Winkel im Radianten
              ctx.drawImage(image, -shape.width / 2, -shape.height / 2, shape.width, shape.height); 
              ctx.restore(); 
          }
      }
  
      drawCountdown(); // Zeige die Zeit am Ende des renderns an
  }
  
  function startCountdown() {
      countdownInterval = setInterval(() => {
          countdown--;
          drawCountdown(); // Rufe die Funktion auf, um die Zeit zu aktuallisieren
          if (countdown === 0) {
              clearInterval(countdownInterval); // Stoppe die Zeit, wenn es 0 erreicht
              showGameOverModal(); // Ruft die Funktion auf, um das modal anzuzeigen (Text)
          }
      }, 1000); // Aktuallisiere die Zeit alle 1000 millisekunden (1sekunde)
  }
  
  function drawCountdown() {
      const minutes = Math.floor(countdown / 60);
      const seconds = countdown % 60;
  
      // Aktuallisieren des Bereiches, um den Timer nicht überlappt anzuzeigen
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

  // Überschriften
  
  function drawPlayfield() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("PuzzleBuzzle", innerWidth / 2, 70);
  
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("By Fatih & Selin Kaya", innerWidth / 2, 120);
  
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