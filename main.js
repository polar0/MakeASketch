// Get the main structure
const container = document.querySelector('#container');
const wrapper = document.querySelector('.wrapper');
const ui = document.querySelector('#ui');
const style = document.createElement('style');

// Get the grid input values
const sliderContainer = document.querySelector('.slider-output');
const slider = document.querySelector('.slider');
const sliderDisplay = document.createElement('p');
const quickValues = document
  .querySelector('.slider-values')
  .querySelectorAll('button');

// Get the various pencil color values
const inkBase = document.querySelector('#ink');
const bgColor = document.querySelector('#bg-color');
const rainbowMode = document.querySelector('#rainbow');
const shadowMode = document.querySelector('#shadow');
const subShadow = document.querySelector('.sub-shadow');
const shadowDark = document.querySelector('#dark');
const shadowLight = document.querySelector('#light');
const eraser = document.querySelector('#eraser');

// Get the color replacement function
const replaceInput = document.querySelector('#replace-input');
const replaceOutput = document.querySelector('#replace-output');
const replaceGrabber = document.querySelector('#color-grabber');
const grabInstructions = document.querySelector('#grab-instr');
const changeInstructions = document.querySelector('#change-instr');

// Get the import/export function
const importButton = document.querySelector('#import');
const exportButton = document.querySelector('#export');
const confirmButton = document.createElement('p');

let boxes = [];
let mouseDown = false;

/* -------------------------- GRID -------------------------- */

// Create the initial grid
let count = 16;
createGrid(count);

// Get the grid size choice from slider (max 100)...
slider.addEventListener('change', changeGridSize);

// ... or from a button
for (const grid of quickValues) {
  grid.addEventListener('click', changeGridSize);
}

// Set up the initial display
sliderDisplay.textContent = slider.value + ' x ' + slider.value;
sliderContainer.appendChild(sliderDisplay);

// Create the grid
function createGrid(count) {
  let squaredCount = Math.pow(count, 2);
  boxes = document.querySelectorAll('.box');
  clearGrid();
  // If the function is run for the first time
  // or you need a larger grid
  if (
    boxes.length === 0 ||
    (boxes.length > 0 && boxes.length <= squaredCount)
  ) {
    // Update the needed amount, and create the grid
    squaredCount = squaredCount - boxes.length;
    for (let i = 0; i < squaredCount; i++) {
      let square = document.createElement('div');
      square.setAttribute('class', 'box');
      square.style.background = bgColor.value;
      container.appendChild(square);
    }
    // But if you need a smaller grid, just delete the surplus
  } else if (boxes.length > 0 && boxes.length > squaredCount) {
    for (let i = 0; i < boxes.length - squaredCount; i++) {
      boxes[i].remove();
    }
  }

  // Get the boxes from the grid
  boxes = document.querySelectorAll('.box');

  // Set the boxes min width to get a square result;
  let boxWidth = (1 / count) * 100;
  // Add this width to the style tag
  style.textContent = `.box { width: ${boxWidth}%; }`;
  document.head.appendChild(style);

  // Remove the event listeners so it doesn't stack up
  // then add it again for the correct boxes amount
  for (const box of boxes) {
    box.removeEventListener('mouseover', startDrawing);
    box.addEventListener('mouseover', startDrawing);
  }
}

// Clear the grid
function clearGrid() {
  for (const box of boxes) {
    box.style.background = bgColor.value;
  }
}

// Get the user clear grid interaction
const clearButton = document.querySelector('.clearButton');
clearButton.addEventListener('click', clearGrid);

// Change the size, and update the slider display
function changeGridSize(count) {
  if (this !== undefined) {
    count = this.value;
  }
  slider.value = count;
  sliderDisplay.textContent = count + ' x ' + count;
  createGrid(count);
}

/* -------------------------- DRAWING -------------------------- */

// Start drawing on mouse down
document.addEventListener('mousedown', function (e) {
  mouseDown = true;
  // Don't draw if the user is grabbing a color
  if (replaceInput.checked === false) {
    // Only draw in the container
    if (e.target.getAttribute('class') === 'box') {
      startDrawing(e);
    }
  }
});

// Stop drawing on mouse up
document.addEventListener('mouseup', function () {
  mouseDown = false;
});

// Change the background on user interaction
// Specify the initial background color
let oldColor = 'rgb(255, 255, 255)';

// Replace only the boxes of the old background color
bgColor.oninput = function () {
  for (const box of boxes) {
    if (box.style.background === oldColor) {
      box.style.background = bgColor.value;
    }
  }
  // Update to the new background color for next iteration
  oldColor = hexToRGB(bgColor.value);
};

// Disable other selectors on Rainbow selection
rainbowMode.addEventListener('change', function () {
  if (rainbowMode.checked) {
    shadowMode.checked = false;
    eraser.checked = false;
    // Let the user know they can't choose a color
    inkBase.disabled = true;
    subShadow.style.display = 'none';
    // Disable the color grab function
    disableGrabber();
  } else {
    inkBase.disabled = false;
  }
});

// Disable other selectors on Shadow selection
shadowMode.addEventListener('change', function () {
  rainbowMode.checked = false;
  if (shadowMode.checked) {
    inkBase.disabled = false;
    eraser.checked = false;
    disableGrabber();
    // Show the darken or lighten functions
    subShadow.style.display = 'flex';
    shadowDark.checked = true;
    shadowLight.checked = false;
  } else {
    subShadow.style.display = 'none';
  }
});

// Disable other selectors on Eraser selection
eraser.addEventListener('change', function () {
  if (eraser.checked) {
    inkBase.disabled = true;
    rainbowMode.checked = false;
    shadowMode.checked = false;
    subShadow.style.display = 'none';
    disableGrabber();
  } else {
    inkBase.disabled = false;
  }
});

// Check/uncheck each other on change
shadowDark.addEventListener('change', function () {
  if (shadowDark.checked) {
    shadowLight.checked = false;
  } else {
    shadowLight.checked = true;
  }
});
shadowLight.addEventListener('change', function () {
  if (shadowLight.checked) {
    shadowDark.checked = false;
  } else {
    shadowDark.checked = true;
  }
});

// Call the color replacement function on change
replaceInput.addEventListener('change', replaceColor);

// Drawing function, called on mousedown and mouseover
function startDrawing(box) {
  let pixel = box.target;
  // Don't draw if grabbing color
  if (replaceInput.checked) {
    return;
  }
  // Only draw if mouse button is down
  if (mouseDown) {
    if (shadowMode.checked) {
      pixel.style.background = drawShadow(pixel);
    }
    if (eraser.checked) {
      pixel.style.background = bgColor.value;
    } else if (rainbowMode.checked) {
      // Gets a random color value at each box
      let randomColor = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
      pixel.style.background = `#${randomColor}`;
    } else if (shadowMode.checked === false) {
      // Draw regular color value
      pixel.style.background = inkBase.value;
      inkBase.disabled = false;
    }
  }
}

function drawShadow(box) {
  // Retrieve HSL values for target box
  let shadowArray = RGBToHSL(box.style.background);
  let h = shadowArray[0];
  let s = shadowArray[1];
  let l = shadowArray[2];

  if (shadowDark.checked) {
    // Don't go to 0% lightness so it doesn't lose color attribute
    if (l > 0) {
      l < 15 ? (l = 5) : (l -= 10);
    }
  } else {
    // Don't go to 100% lightness, but don't darken an uncolored box
    l === 100 ? (l = 100) : l >= 85 ? (l = 95) : (l += 10);
  }

  // Return the color to the drawing function in HSL form
  let inkShadow = 'hsl(' + h + ',' + s + '%,' + l + '%)';
  return inkShadow;
}

function replaceColor() {
  // Uncheck all boxes when replace color selector is active
  if (replaceInput.checked) {
    eraser.checked = false;
    shadowMode.checked = false;
    rainbowMode.checked = false;
    subShadow.style.display = 'none';
    // Display intructions to the user
    grabInstructions.textContent = 'Grab the color you want to replace...';
    changeInstructions.textContent = '... then choose the color and hit ENTER';
  } else {
    // If not active, hide the instructions
    disableGrabber();
  }

  // Let the user pick color from the sketch
  for (const box of boxes) {
    if (replaceInput.checked) {
      box.addEventListener('click', getColor);
    }
  }
  // Prepare output triggering
  replaceOutput.addEventListener('change', changeColor);
}

// Fill the grabber with the picked color
function getColor() {
  replaceGrabber.style.background = this.style.background;
}

// Called on output change
function changeColor() {
  for (const box of boxes) {
    if (replaceInput.checked) {
      // Replace only if the color fits the grabber color
      if (box.style.background === replaceGrabber.style.background) {
        box.style.background = replaceOutput.value;
      }
    }
    // Remove listeners so it doesn't stack up
    box.removeEventListener('click', getColor);
  }
  replaceOutput.removeEventListener('change', changeColor);
  disableGrabber();
}

// Called when replacing done, and when changing selector
function disableGrabber() {
  replaceInput.checked = false;
  grabInstructions.textContent = 'Replace color...';
  changeInstructions.textContent = '';
}

// Export sketch to clipboard, after confirmation
exportButton.addEventListener('click', function () {
  exportButton.textContent = 'Do you want to copy your sketch to clipboard ?';
  confirmButton.textContent = 'Click to confirm!';
  exportButton.appendChild(confirmButton);

  exportButton.addEventListener('click', exportToClipboard);
});

function exportToClipboard() {
  let exportContent = [];
  // Store each box background color into a new Array
  for (let i = 0; i < boxes.length; i++) {
    exportContent[i] = boxes[i].style.background;
  }
  let exportArray = exportContent.join(';');

  // Throw it into clipboard
  navigator.clipboard
    .writeText(exportArray)
    .then(() => {
      // then confirm the action to the user
      exportButton.textContent = 'Sketch copied to clipboard!';
      confirmButton.textContent = 'Save it in a text document!';
      exportButton.appendChild(confirmButton);
    })
    .catch((err) => {
      // or let them know it didn't work
      confirmButton.textContent =
        'The copy could not work due to error : ' + err;
      exportButton.appendChild(confirmButton);
    });

  // Remove the confirmation after a while and
  setTimeout(function () {
    exportButton.removeChild(confirmButton);
    exportButton.textContent = 'Export';
  }, 4000);

  // Remove the listener so it doesn't stack up
  exportButton.removeEventListener('click', exportToClipboard);
}

// Import from clipboard, after confirmation
importButton.addEventListener('click', function () {
  importButton.textContent =
    'Do you want to import your sketch from clipboard ?';
  confirmButton.textContent = 'It will erase the current sketch!';
  importButton.appendChild(confirmButton);

  importButton.addEventListener('click', importFromClipboard);
});

function importFromClipboard() {
  // Get the clipboard content
  navigator.clipboard
    .readText()
    .then((importContent) => {
      // Throw it into an array
      let importArray = [];
      importArray = importContent.split(';');
      // Reset the grid with the corresponding size
      let arrayGridSize = Math.sqrt(importArray.length);
      changeGridSize(arrayGridSize);
      // Retrieve each box stored background color
      for (let i = 0; i < importArray.length; i++) {
        boxes[i].style.background = importArray[i];
      }
      // Tell the user the action success
      importButton.textContent = 'Sketch imported!';
      confirmButton.textContent = ':)';
      importButton.appendChild(confirmButton);
    })
    .catch((err) => {
      // Give them the reason if failing
      confirmButton.textContent =
        'I could not retrieve the clipboard content dur to error : ' + err;
      importButton.appendChild(confirmButton);
    });

  // Reset the button after a while
  setTimeout(function () {
    importButton.removeChild(confirmButton);
    importButton.textContent = 'Import';
  }, 4000);

  // Delete the listener so it doesn't stack up
  importButton.removeEventListener('click', importFromClipboard);
}

// Both the following functions come from this website :
// https://css-tricks.com/converting-color-spaces-in-javascript/

function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0;

  // 3 digits
  if (h.length === 4) {
    r = '0x' + h[1] + h[1];
    g = '0x' + h[2] + h[2];
    b = '0x' + h[3] + h[3];

    // 6 digits
  } else if (h.length === 7) {
    r = '0x' + h[1] + h[2];
    g = '0x' + h[3] + h[4];
    b = '0x' + h[5] + h[6];
  }

  return 'rgb(' + +r + ', ' + +g + ', ' + +b + ')';
}

function RGBToHSL(rgb) {
  let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
  rgb = rgb.substr(4).split(')')[0].split(sep);

  for (let R in rgb) {
    let r = rgb[R];
    if (r.indexOf('%') > -1)
      rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
  }

  // Make r, g, and b fractions of 1
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255;

  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
}
