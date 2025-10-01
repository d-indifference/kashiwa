const DEFAULT_OEKAKI_CANVAS_WIDTH = 640;
const DEFAULT_OEKAKI_CANVAS_HEIGHT = 480;

const initOekaki = () => {
  const canvas = document.getElementById('oekaki_canvas');
  const ctx = canvas.getContext('2d');
  const colorInput = document.getElementById('oe_color');
  const sizeInput = document.getElementById('oe_size');
  const eraserButton = document.getElementById('oe_eraser');
  const clearButton = document.getElementById('oe_clear');
  const undoButton = document.getElementById('oe_undo');
  const closeButton = document.getElementById('oe_close');
  const saveButton = document.getElementById('oe_save');

  let paintColor = colorInput.value;
  let currentColor = paintColor;
  let size = parseInt(sizeInput.value);
  let isEraser = false;
  let drawing = false;
  let lastPos = null;
  const undoStack = [];

  const UNDO_STACK_SIZE = 12;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const saveUndo = () => {
    undoButton.disabled = false;

    if (undoStack.length >= UNDO_STACK_SIZE) {
      undoStack.shift();
    }

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const undo = () => {
    if (undoStack.length > 0) {
      ctx.putImageData(undoStack.pop(), 0, 0);
    }

    if (undoStack.length === 0) {
      undoButton.disabled = true;
    }
  };

  const getPos = e => {
    const rect = canvas.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
  };

  const startDraw = e => {
    e.preventDefault();

    drawing = true;

    const pos = getPos(e);
    lastPos = pos;
    saveUndo();

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = size;
    ctx.stroke();
  };

  const doDraw = e => {
    e.preventDefault();

    if (!drawing) {
      return;
    }

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = size;
    ctx.stroke();
    lastPos = pos;
  };

  const endDraw = e => {
    drawing = false;
    lastPos = null;
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', doDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', startDraw);
  canvas.addEventListener('touchmove', doDraw);
  canvas.addEventListener('touchend', endDraw);

  colorInput.addEventListener('input', e => {
    paintColor = e.target.value;

    if (!isEraser) {
      currentColor = paintColor;
    }
  });

  sizeInput.addEventListener('input', e => {
    size = parseInt(e.target.value);
  });

  eraserButton.addEventListener('click', e => {
    isEraser = !isEraser;

    if (isEraser) {
      e.target.innerHTML = 'Brush';
      currentColor = 'white';
      eraserButton.classList.add('active');
    } else {
      e.target.innerHTML = 'Eraser';
      currentColor = paintColor;
      eraserButton.classList.remove('active');
    }
  });

  clearButton.addEventListener('click', () => {
    saveUndo();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  undoButton.addEventListener('click', undo);

  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'e') {
      eraserButton.click();
    }

    if (e.key === 'Escape') {
      undo();
    }
  });

  saveButton.addEventListener('click', () => {
    const canvas = document.getElementById('oekaki_canvas');
    document.forms.postform.oekaki.value = canvas.toDataURL('image/png').replace(/^data:.+;base64,/, '');
    document.forms.oekakiform.oe_save.innerHTML = 'Saved!';
    document.forms.oekakiform.oe_save.disabled = true;
  });

  closeButton.addEventListener('click', () => {
    const canvas = document.getElementById('oekaki_canvas');
    const width = canvas.width;
    const height = canvas.height;

    document.getElementById('oekakiform_canvas').remove();
    placeOekakiInit(width, height);
  });
};

const placeOekakiInit = (width, height) => {
  document.forms.oekakiform.innerHTML += getOekakiInitHtml(width, height);
};

const getOekakiInitHtml = (width, height) => `
<div id="oekakiform_init">
    <label>
        <span>Width:</span>
        <input type="text" name="oekakiWidth" value="${width}" size="3">
    </label>
    <label>
        <span>Height:</span>
        <input type="text" name="oekakiHeight" value="${height}" size="3">
    </label>
    <button type="button" onclick="startOekaki()">Draw</button>
</div>
`;

const getOekakiHtml = (width, height) => `
<div id="oekakiform_canvas">
    <canvas width="${width}" height="${height}" id="oekaki_canvas">
        <p>Your browser does not support JavaScript canvas</p>
    </canvas>
    <div class="toolbar">
        <label>Color <input id="oe_color" type="color" value="#000000"></label>
        <label>Brush size <input id="oe_size" type="range" min="1" max="100" value="6"></label>
        <button class="oebtn" type="button" id="oe_eraser" title="E — eraser">Eraser</button>
        <button class="oebtn" type="button" id="oe_clear" title="Clear the canvas">Clear</button>
        <button class="oebtn" type="button" id="oe_undo" title="Undo last action" disabled>Undo</button>
        <button class="oebtn" type="button" id="oe_save" title="Upload a file to the form">Save</button>
        <button class="oebtn" type="button" id="oe_close" title="Close the canvas mode">Close</button>
        <div class="info">Left button: draw · E: Eraser · Esc: Undo the last action</div>
    </div>
</div>
`;

const startOekaki = () => {
  const oekakiWidth = document.forms.oekakiform.oekakiWidth.value;
  const oekakiHeight = document.forms.oekakiform.oekakiHeight.value;

  document.getElementById('oekakiform_init').remove();

  document.forms.oekakiform.innerHTML += getOekakiHtml(oekakiWidth, oekakiHeight);
  initOekaki();
};