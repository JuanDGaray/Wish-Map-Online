const contenedores = document.querySelectorAll(".imagen-contenedor");
const Tooltogglebutton = document.getElementById("Tooltoggle-button");
const Toolcontainer = document.getElementById("Tool-container");
const gridContainer = document.getElementById("grid-container");
const stikerContainer = document.getElementById("tool-stikers");

let activeElement = null;
let isDragging = false;
let isScaling = false;
let isRotating = false;
let initialX, initialY, startX, startY;
let initialWidth, initialHeight;
let initialRotation, rotation = 0;
let currentX, currentY, offsetX, offsetY;


function startDrag(event) {
    // Obtener las coordenadas del elemento
    const rect = event.target.getBoundingClientRect();

    // Calcular la diferencia entre la posición del mouse y la posición del elemento
    initialX = event.clientX - rect.left;
    initialY = event.clientY - rect.top;

    // Definir el elemento activo
    activeElement = event.target;

    if (activeElement.classList.contains("tool-objet")) {
        isDragging = true;
    }
}

function handleDrag(event) {
    if (isDragging) {
        // Calcular las nuevas coordenadas basadas en la posición del mouse
        const deltaX = event.clientX - initialX;
        const deltaY = event.clientY - initialY;

        // Aplicar las nuevas coordenadas al estilo del elemento
        activeElement.style.position = "absolute";
        activeElement.style.left = `${deltaX}px`;
        activeElement.style.top = `${deltaY}px`;

        // Permitir que el elemento se salga del contenedor si es necesario
        stikerContainer.style.overflow = 'visible';
    }
}

function stopDrag() {
    if (isDragging) {
        isDragging = false;
    }
}
function handleDrop(event) {
    stikerContainer.style.overflowY = 'scroll'; 

    if (isDragging && activeElement) {
        isDragging = false;
        const ToolcontainerStiker = document.getElementById("tool-stikers");

        let collisionDetected = false;
        let targetContainer = null;

        // Verificar colisión con contenedores de layout
        document.querySelectorAll('.layout-container').forEach(container => {
            if (isColliding(activeElement, container)) {
                collisionDetected = true;
                targetContainer = container;
                if (activeElement.classList.contains("tool-objet")) {
                    activeElement.classList.remove("tool-objet");
                }
                container.style.border = ''; 
            }
        });

        if (collisionDetected && targetContainer) {
            const containerRect = targetContainer.getBoundingClientRect();
            const elementRect = activeElement.getBoundingClientRect();
          

            // Calcular la posición relativa dentro del contenedor
            const relativeLeft = elementRect.left;
            const relativeTop = elementRect.top;

            // Ajustar la posición del elemento arrastrado al contenedor
            targetContainer.appendChild(activeElement);
            activeElement.style.position = 'absolute'; // Asegúrate de que la posición sea absoluta
            activeElement.style.left = `${relativeLeft}px`;
            activeElement.style.top = `${relativeTop-22}px`;
        } else{

            activeElement.style.position = 'block';
            activeElement.style.left =  '0px';
            activeElement.style.top = '0px';
            stikerContainer.style.overflowY = 'scroll'; 

        }
        

        // Restablecer el cursor del activeElement
        if (activeElement) {
            activeElement.style.cursor = 'grab'; 
        }
    }
}
// Asignar eventos de arrastre
document.addEventListener('mousemove', handleDrag);
document.addEventListener('mouseup', handleDrop);

// Función para detectar colisión
function isColliding(elem1, elem2) {
    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();

    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}
// Función para manejar la escala
function handleScale(event) {
    if (isScaling) {
        const newWidth = initialWidth + (event.clientX - startX);
        const newHeight = initialHeight + (event.clientY - startY);
        activeElement.style.width = `${newWidth}px`;
        activeElement.style.height = `${newHeight}px`;
    }
}

// Función para manejar la rotación
function handleRotate(event) {
    if (isRotating) {
        const centerX = activeElement.offsetLeft + activeElement.offsetWidth / 2;
        const centerY = activeElement.offsetTop + activeElement.offsetHeight / 2;
        const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
        rotation = angle - initialRotation;
        activeElement.style.transform = `rotate(${rotation}deg)`;
    }
}
function disableEditTools() {
    const editTools = document.querySelectorAll('.control-punto, #edit-tool1, #edit-tool2');

if (!event.target.closest('.stiker')) {
    editTools.forEach(editTool => {
        if (!editTool.classList.contains("disable")) {
            editTool.classList.add("disable");
        }
    });

    if (activeElement) {
        activeElement.style.borderWidth = "0px";
    }
}
    
}


// Evento de mousemove que aplica las transformaciones
document.addEventListener("mousemove", function(event) {
    if (isDragging) handleDrag(event);
    if (isScaling) handleScale(event);
    if (isRotating) handleRotate(event);
});

let autoDisableTimeout;

document.addEventListener("mouseup", function() {
    if (activeElement) {
        isDragging = isScaling = isRotating = false;
        activeElement.style.cursor = "grab";

        const gridRect = gridContainer.getBoundingClientRect();
        const elemRect = activeElement.getBoundingClientRect();

        const isTouchingGrid = !(elemRect.right < gridRect.left ||
                                 elemRect.left > gridRect.right ||
                                 elemRect.bottom < gridRect.top ||
                                 elemRect.top > gridRect.bottom);

        if (isTouchingGrid) {
            const relativeLeft = elemRect.left;
            const relativeTop = elemRect.top;

            gridContainer.appendChild(activeElement);
            activeElement.style.position = "absolute";
            activeElement.style.left = `${relativeLeft}px`;
            activeElement.style.top = `${relativeTop}px`;
        }

        // Configura o reinicia el temporizador para desactivar las herramientas después de 30 segundos
        if (autoDisableTimeout) {
            clearTimeout(autoDisableTimeout);
        }

        autoDisableTimeout = setTimeout(() => {
            if (!isScaling && !isRotating) {
                const puntoEditElement = activeElement.querySelector("#edit-tool1");
                const puntoEditElement2 = activeElement.querySelector("#edit-tool2");
                puntoEditElement.classList.add("disable");
                puntoEditElement2.classList.add("disable");
            }
        }, 30000); // 30 segundos
    }
});
// Inicializar eventos para cada contenedor
contenedores.forEach(contenedor => {
    const puntoEscalar = contenedor.querySelector('.control-punto.escalar');
    const puntoRotar = contenedor.querySelector('.control-punto.rotar');
    const edittool1 = contenedor.querySelector("#edit-tool1");
    const edittool2 = contenedor.querySelector("#edit-tool2");

    contenedor.addEventListener("mousedown", function(e) {
        if (!e.target.classList.contains('control-punto')) {
            activeElement = contenedor;
            isDragging = true;
            initialX = e.clientX - contenedor.offsetLeft;
            initialY = e.clientY - contenedor.offsetTop;
            contenedor.style.cursor = "grabbing";
            edittool1.classList.remove("disable");
            edittool2.classList.remove("disable");
            contenedor.style.borderWidth = "2px";
        }
    });

    puntoEscalar.addEventListener("mousedown", function(e) {
        e.stopPropagation();
        activeElement = contenedor;
        isScaling = true;
        initialWidth = contenedor.offsetWidth;
        initialHeight = contenedor.offsetHeight;
        startX = e.clientX;
        startY = e.clientY;
    });

    puntoRotar.addEventListener("mousedown", function(e) {
        e.stopPropagation();
        activeElement = contenedor;
        isRotating = true;
        const centerX = contenedor.offsetLeft + contenedor.offsetWidth / 2;
        const centerY = contenedor.offsetTop + contenedor.offsetHeight / 2;
        initialRotation = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    });

    // Desactivar el arrastre nativo de la imagen
    contenedor.addEventListener("dragstart", function(e) {
        e.preventDefault();
    });
});

// Toggle para la herramienta
Tooltogglebutton.addEventListener('click', function() {
    Toolcontainer.classList.toggle("off-tools");
});

// Función para obtener el ángulo de rotación en grados
function getRotationAngle(element) {
    const transform = window.getComputedStyle(element).transform;
    if (transform === 'none') return 0;

    const matrix = transform.match(/^matrix\((.+)\)$/)[1].split(',').map(Number);
    const angle = Math.round(Math.atan2(matrix[1], matrix[0]) * (180 / Math.PI));

    return (angle + 360) % 360;
}

// Desactivar selección de texto en todo el documento
document.addEventListener("selectstart", function(e) {
    e.preventDefault();
});
document.addEventListener('click', function(event) {
    disableEditTools()
  
});
const moreImg = document.getElementById("add-image");
moreImg.addEventListener("mousedown", function() {
    const imgCont = document.getElementById("insert-image-caontainer"); // Corregido el id
    if (imgCont.classList.contains("deactive")) {
        imgCont.classList.add("active");
        imgCont.classList.remove("deactive");
    }
});

const exitbutton = document.getElementById("exit-button");
exitbutton.addEventListener("mousedown", function() {
    const imgCont = document.getElementById("insert-image-caontainer"); // Corregido el id
    if (imgCont.classList.contains("active")) {
        imgCont.classList.remove("active");
        imgCont.classList.add("deactive");
    }
});

document.getElementById('button-sbmt').addEventListener('click', function() {
    // Obtener la URL de la imagen del input
    const urlImg = document.getElementById('UrlImg').value;

    // Validar si la URL no está vacía
    if (urlImg.trim() === '') {
        alert('Por favor, ingrese una URL de imagen válida.');
        return;
    }

    // Contenedor de las imágenes
    const toolStickers = document.getElementById('tool-stikers');

    // Crear nuevo contenedor de imagen
    const newImgContainer = document.createElement('div');
    newImgContainer.classList.add('imagen-contenedor', 'tool-objet');

    // Crear nueva imagen
    const newImg = document.createElement('img');
    newImg.src = urlImg; // Usar la URL proporcionada
    newImg.alt = 'Imagen arrastrable';
    newImg.classList.add('stiker');

    // Crear puntos de control (escalar y rotar)
    const newScaleControl = document.createElement('div');
    newScaleControl.classList.add('control-punto', 'escalar');
    newScaleControl.id = 'edit-tool1'; // Asegúrate de que los ID sean únicos si necesitas

    const newRotateControl = document.createElement('div');
    newRotateControl.classList.add('control-punto', 'rotar');
    newRotateControl.id = 'edit-tool2'; // Asegúrate de que los ID sean únicos si necesitas

    // Añadir imagen y controles al contenedor
    newImgContainer.appendChild(newImg);
    newImgContainer.appendChild(newScaleControl);
    newImgContainer.appendChild(newRotateControl);

    // Añadir el nuevo contenedor al contenedor principal
    toolStickers.appendChild(newImgContainer);

    // Limpiar el campo de entrada
    document.getElementById('UrlImg').value = '';

    // Reasignar eventos de arrastre a los nuevos elementos
    attachEventHandlers(newImgContainer);
});

function attachEventHandlers(container) {
    const puntoEscalar = container.querySelector('.control-punto.escalar');
    const puntoRotar = container.querySelector('.control-punto.rotar');

    container.addEventListener("mousedown", function(e) {
        if (!e.target.classList.contains('control-punto')) {
            activeElement = container;
            isDragging = true;
            initialX = e.clientX - container.offsetLeft;
            initialY = e.clientY - container.offsetTop;
            container.style.cursor = "grabbing";
            puntoEscalar.classList.remove("disable");
            puntoRotar.classList.remove("disable");
            container.style.borderWidth = "2px";
        }
    });

    puntoEscalar.addEventListener("mousedown", function(e) {
        e.stopPropagation();
        activeElement = container;
        isScaling = true;
        initialWidth = container.offsetWidth;
        initialHeight = container.offsetHeight;
        startX = e.clientX;
        startY = e.clientY;
    });

    puntoRotar.addEventListener("mousedown", function(e) {
        e.stopPropagation();
        activeElement = container;
        isRotating = true;
        const centerX = container.offsetLeft + container.offsetWidth / 2;
        const centerY = container.offsetTop + container.offsetHeight / 2;
        initialRotation = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    });

    // Desactivar el arrastre nativo de la imagen
    container.addEventListener("dragstart", function(e) {
        e.preventDefault();
    });
}


// Seleccionar el div contenedor y el input
const imageContainer = document.getElementById('photo-container');
const imageInput = document.getElementById('imageInput');

// Al hacer clic en el div, disparar el clic del input oculto
imageContainer.addEventListener('click', function() {
    imageInput.click(); // Simula un clic en el input de archivo
});

// Cuando se seleccione una imagen, cargarla en el div
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
        const imgURL = URL.createObjectURL(file);
        const img = document.createElement('img');
        img.src = imgURL;
        img.alt = 'Imagen seleccionada por el usuario';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = 'var(--size-boderraduis)'

        // Limpiar el contenido anterior y añadir la imagen
        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);
    } else {
        alert('Por favor, selecciona un archivo de imagen válido.');
    }
});
function screenShot(){
    Toolcontainer
}


document.getElementById('downloadButton').addEventListener('click', function() {
    const section = document.getElementById('main');
    Toolcontainer.style.opacity = "0"
    Toolcontainer.classList.toggle("off-tools");
    domtoimage.toPng(section)
        .then(function(dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'captura.png';
            link.click();
        })
        .catch(function(error) {
            console.error('Error al capturar la imagen:', error);
        });
        setTimeout(function() {
            Toolcontainer.style.opacity = "1";
        }, 1000);
});