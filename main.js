const container = document.querySelector('#container');

const ui = document.querySelector('#ui');

const sliderContainer = document.querySelector('.slider-output');
const slider = document.querySelector('.slider');
const sliderDisplay = document.createElement('p');
const quickValues = document
  .querySelector('.slider-values')
  .querySelectorAll('button');

const inkBase = document.querySelector('#ink');
const bgColor = document.querySelector('#bg-color');
const rainbowMode = document.querySelector('#rainbow');
const shadowMode = document.querySelector('#shadow');
const subShadow = document.querySelector('.sub-shadow');
const shadowSmooth = document.querySelector('#smooth');
const shadowRough = document.querySelector('#rough');
const eraser = document.querySelector('#eraser');

const replaceInput = document.querySelector('#replace-input');
const replaceOutput = document.querySelector('#replace-output');
const replaceGrabber = document.querySelector('#color-grabber');
const grabInstructions = document.querySelector('#grab-instr');
const changeInstructions = document.querySelector('#change-instr');

const style = document.createElement('style');

let boxes = [];

// Create the initial grid
let count = 16;
createGrid(count);

// Get the grid size choice from slider (max 100)
slider.addEventListener('change', changeGridSize);

// Let the user choose from a button
for (const grid of quickValues) {
  grid.addEventListener('click', changeGridSize);
}

// Set up the initial display
sliderDisplay.textContent = slider.value + ' x ' + slider.value;
sliderContainer.appendChild(sliderDisplay);

// Change the background on user interaction
let oldColor = 'rgb(255, 255, 255)';

bgColor.oninput = function () {
  for (const box of boxes) {
    if (box.style.background === oldColor) {
      box.style.background = bgColor.value;
      console.log('yes');
    }
  }
  oldColor = hexToRGB(bgColor.value);
};

// Let the user clear the grid
const clearButton = document.querySelector('.clearButton');
clearButton.addEventListener('click', clearGrid);

rainbowMode.addEventListener('change', function () {
  shadowMode.checked = false;
  if (rainbowMode.checked) {
    inkBase.disabled = true;
    eraser.checked = false;
    subShadow.style.display = 'none';
    disableGrabber();
  } else {
    inkBase.disabled = false;
  }
});

shadowMode.addEventListener('change', function () {
  rainbowMode.checked = false;
  if (shadowMode.checked) {
    inkBase.disabled = false;
    eraser.checked = false;
    disableGrabber();

    subShadow.style.display = 'flex';
    shadowSmooth.checked = true;
  } else {
    subShadow.style.display = 'none';
  }
  shadowSmooth.addEventListener('change', function () {
    if (shadowSmooth.checked) {
      shadowRough.checked = false;
    } else {
      shadowRough.checked = true;
    }
  });
  shadowRough.addEventListener('change', function () {
    if (shadowRough.checked) {
      shadowSmooth.checked = false;
    } else {
      shadowSmooth.checked = true;
    }
  });
});

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

disableGrabber();

replaceInput.addEventListener('change', replaceColor);

// Create the grid
function createGrid(count) {
  let squaredCount = Math.pow(count, 2);
  boxes = document.querySelectorAll('.box');
  clearGrid();
  // If the function is run for the first time, or you need a larger grid
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

  for (const box of boxes) {
    box.addEventListener('mousedown', startDrawing);
  }
}

function clearGrid() {
  for (const box of boxes) {
    box.style.background = bgColor.value;
  }
}

function changeGridSize() {
  count = this.value;
  slider.value = count;
  sliderDisplay.textContent = count + ' x ' + count;
  createGrid(count);
}

function startDrawing() {
  if (eraser.checked) {
    if (this.hasAttribute('value')) {
      this.removeAttribute('value');
    }
    this.style.background = bgColor.value;
  } else if (rainbowMode.checked) {
    let randomColor = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
    this.style.background = `#${randomColor}`;
  } else if (shadowMode.checked) {
    this.style.background = drawShadow(this);
  } else {
    this.style.background = inkBase.value;
    inkBase.disabled = false;
    shadowMode.checked = false;
    rainbowMode.checked = false;
    eraser.checked = false;
    subShadow.style.display = 'none';
  }

  // Get the user interaction
  for (const box of boxes) {
    box.addEventListener('mouseover', startDrawing);
    box.addEventListener('mouseup', function () {
      for (const box of boxes) {
        box.removeEventListener('mouseover', startDrawing);
      }
    });
  }
}

function drawShadow(box) {
  // Retrieve hsl values
  let shadowArray = hexToHSL(inkBase.value);
  let h = shadowArray[0];
  let s = shadowArray[1];
  let l = 90;

  if (box.hasAttribute('value')) {
    l = box.getAttribute('value');
    if (Number(l) === 20 || Number(l) === 30) {
      console.log('kzkkfzk');
      l = 20;
    } else {
      if (shadowSmooth.checked) {
        l -= 10;
      } else {
        l -= 20;
      }
      box.setAttribute('value', l);
    }
  } else {
    box.setAttribute('value', '90');
  }

  let inkShadow = 'hsl(' + h + ',' + s + '%,' + l + '%)';
  return inkShadow;
}

function replaceColor() {
  if (replaceInput.checked) {
    eraser.checked = false;
    shadowMode.checked = false;
    rainbowMode.checked = false;
    subShadow.style.display = 'none';
    grabInstructions.textContent = 'Grab the color you want to replace...';
    changeInstructions.textContent = '... then choose the color and hit ENTER';
  } else {
    disableGrabber();
  }
  for (const box of boxes) {
    if (replaceInput.checked) {
      box.removeEventListener('mousedown', startDrawing);
      box.addEventListener('click', getColor);
    } else {
      //box.addEventListener('mousedown', startDrawing);
    }
  }
  replaceOutput.addEventListener('change', function () {
    disableGrabber();
    for (const box of boxes) {
      if (box.style.background === replaceGrabber.style.background) {
        box.style.background = replaceOutput.value;
      }
      //box.addEventListener('mousedown', startDrawing);
    }
  }); // only once
  // fait tout le délire puis
  // replaceInput.checked = false;
}

function getColor() {
  replaceGrabber.style.background = this.style.background;
  console.log('grab');
}

function disableGrabber() {
  for (const box of boxes) {
    box.removeEventListener('click', getColor);
    box.addEventListener('mousedown', startDrawing);
  }
  replaceInput.checked = false;
  grabInstructions.textContent = 'Replace color...';
  changeInstructions.textContent = '';
}

// From https://css-tricks.com/converting-color-spaces-in-javascript/

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

function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length === 4) {
    r = '0x' + H[1] + H[1];
    g = '0x' + H[2] + H[2];
    b = '0x' + H[3] + H[3];
  } else if (H.length === 7) {
    r = '0x' + H[1] + H[2];
    g = '0x' + H[3] + H[4];
    b = '0x' + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
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
