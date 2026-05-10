const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });
const tempCanvas = document.getElementById("tempCanvas");
const tempCtx = tempCanvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const sizeSlider = document.getElementById("sizeSlider");
const opacitySlider = document.getElementById("opacitySlider");
const textInput = document.getElementById("textInput");
const textToolbar = document.getElementById("text-toolbar");

let isDrawing = false;
let tool = "brush";
let startX, startY;
let undoStack = [];
let polyPoints = []; // Lưu các điểm của đa giác

// Khởi tạo
window.onload = () => {
    if(!localStorage.getItem("currentUser")) window.location.href = "login.html";
    const W = 1100, H = 650;
    mainCanvas.width = tempCanvas.width = W;
    mainCanvas.height = tempCanvas.height = H;
    mainCtx.fillStyle = "white";
    mainCtx.fillRect(0, 0, W, H);
    saveState();
};

// Đổi công cụ
document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelector(".tool-btn.active").classList.remove("active");
        btn.classList.add("active");
        tool = btn.dataset.tool;
        polyPoints = []; // Reset đa giác khi đổi tool
        tempCtx.clearRect(0, 0, 1100, 650);
        if(tool !== 'text') finishText();
    }
});

function getProps(ctx) {
    ctx.lineWidth = sizeSlider.value;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "white" : colorPicker.value;
    ctx.fillStyle = colorPicker.value;
    ctx.globalAlpha = tool === "eraser" ? 1 : opacitySlider.value / 100;
}

// --- HÚT MÀU (PICKER) ---
function pickColor(x, y) {
    const pixel = mainCtx.getImageData(x, y, 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    colorPicker.value = hex;
}

// --- BỘ LỌC (FILTERS) ---
function applyFilter(type) {
    const imgData = mainCtx.getImageData(0, 0, 1100, 650);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i+1], b = data[i+2];
        if (type === 'gray') {
            let avg = (r + g + b) / 3;
            data[i] = data[i+1] = data[i+2] = avg;
        } else if (type === 'invert') {
            data[i] = 255 - r; data[i+1] = 255 - g; data[i+2] = 255 - b;
        } else if (type === 'sepia') {
            data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            data[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            data[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }
    }
    mainCtx.putImageData(imgData, 0, 0);
    saveState();
}

// --- XỬ LÝ CHUỘT ---
tempCanvas.onmousedown = (e) => {
    if (textInput.style.display === "block") return;
    startX = e.offsetX;
    startY = e.offsetY;
    getProps(mainCtx);
    getProps(tempCtx);

    if (tool === "picker") {
        pickColor(startX, startY);
    } else if (tool === "poly") {
        isDrawing = true;
        if (polyPoints.length === 0) polyPoints.push({x: startX, y: startY});
    } else if (tool === "text") {
        showText(startX, startY);
    } else {
        isDrawing = true;
        if(tool === "brush" || tool === "eraser") {
            mainCtx.beginPath(); mainCtx.moveTo(startX, startY);
        } else if(tool === "fill") {
            floodFill(startX, startY, colorPicker.value);
        }
    }
};

window.onmousemove = (e) => {
    if (!isDrawing || tool === "text" || tool === "picker") return;
    const rect = tempCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "brush" || tool === "eraser") {
        mainCtx.lineTo(x, y); mainCtx.stroke();
    } else if (tool === "spray") {
        for(let i=0; i<20; i++) {
            const r = sizeSlider.value;
            const offX = (Math.random() - 0.5) * r * 2;
            const offY = (Math.random() - 0.5) * r * 2;
            mainCtx.fillRect(x + offX, y + offY, 1, 1);
        }
    } else if (["line", "rect", "circle", "poly"].includes(tool)) {
        tempCtx.clearRect(0, 0, 1100, 650);
        if (tool === "line") {
            tempCtx.beginPath(); tempCtx.moveTo(startX, startY); tempCtx.lineTo(x, y); tempCtx.stroke();
        } else if (tool === "rect") {
            tempCtx.strokeRect(startX, startY, x - startX, y - startY);
        } else if (tool === "circle") {
            let r = Math.sqrt(Math.pow(x-startX,2) + Math.pow(y-startY,2));
            tempCtx.beginPath(); tempCtx.arc(startX, startY, r, 0, Math.PI*2); tempCtx.stroke();
        } else if (tool === "poly" && polyPoints.length > 0) {
            tempCtx.beginPath();
            tempCtx.moveTo(polyPoints[0].x, polyPoints[0].y);
            polyPoints.forEach(p => tempCtx.lineTo(p.x, p.y));
            tempCtx.lineTo(x, y);
            tempCtx.stroke();
        }
    }
};

window.onmouseup = (e) => {
    if (!isDrawing) return;
    if (tool === "poly") {
        const x = e.offsetX, y = e.offsetY;
        const dist = Math.sqrt(Math.pow(x - polyPoints[0].x, 2) + Math.pow(y - polyPoints[0].y, 2));
        if (dist < 20 && polyPoints.length > 2) { // Click gần điểm đầu để kết thúc
            mainCtx.beginPath();
            mainCtx.moveTo(polyPoints[0].x, polyPoints[0].y);
            polyPoints.forEach(p => mainCtx.lineTo(p.x, p.y));
            mainCtx.closePath(); mainCtx.stroke();
            polyPoints = []; tempCtx.clearRect(0, 0, 1100, 650);
            isDrawing = false; saveState();
        } else {
            polyPoints.push({x, y});
        }
        return;
    }
    isDrawing = false;
    if (["line", "rect", "circle"].includes(tool)) {
        mainCtx.drawImage(tempCanvas, 0, 0);
        tempCtx.clearRect(0, 0, 1100, 650);
    }
    saveState();
};

// --- CÁC HÀM CƠ BẢN KHÁC (GIỮ NGUYÊN) ---
function showText(x, y) {
    textInput.style.display = "block"; textInput.style.left = x + "px"; textInput.style.top = y + "px";
    textToolbar.style.display = "flex"; textToolbar.style.left = x + "px"; textToolbar.style.top = (y - 60) + "px";
    textInput.focus();
}
function finishText() {
    if(textInput.style.display === "block" && textInput.value.trim() !== "") {
        const size = document.getElementById("font-size").value;
        mainCtx.globalAlpha = 1; mainCtx.font = `bold ${size}px Arial`; mainCtx.fillStyle = colorPicker.value;
        mainCtx.fillText(textInput.value, parseInt(textInput.style.left), parseInt(textInput.style.top) + parseInt(size)*0.8);
        saveState();
    }
    textInput.value = ""; textInput.style.display = "none"; textToolbar.style.display = "none";
}
function downloadImage() {
    const link = document.createElement("a");
    link.download = `Art_${Date.now()}.png`; link.href = mainCanvas.toDataURL(); link.click();
}
function floodFill(x, y, color) {
    const img = mainCtx.getImageData(0,0,1100,650); const data = img.data;
    const pos = (y * 1100 + x) * 4; const target = [data[pos], data[pos+1], data[pos+2]];
    const fill = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    if(target[0]===fill[0] && target[1]===fill[1] && target[2]===fill[2]) return;
    const stack = [[x, y]];
    while(stack.length) {
        const [cx, cy] = stack.pop(); const i = (cy * 1100 + cx) * 4;
        if(cx>=0 && cx<1100 && cy>=0 && cy<650 && data[i]===target[0] && data[i+1]===target[1] && data[i+2]===target[2]) {
            data[i]=fill[0]; data[i+1]=fill[1]; data[i+2]=fill[2]; data[i+3]=255;
            stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
        }
    }
    mainCtx.putImageData(img, 0, 0);
}
function saveState() { undoStack.push(mainCtx.getImageData(0,0,1100,650)); if(undoStack.length > 20) undoStack.shift(); }
function undo() { if(undoStack.length > 1) { undoStack.pop(); mainCtx.putImageData(undoStack[undoStack.length-1], 0, 0); } }
function clearCanvas() { if(confirm("Xóa sạch?")) { mainCtx.fillStyle="white"; mainCtx.fillRect(0,0,1100,650); saveState(); } }
function saveToGalleryBtn() {
    let g = JSON.parse(localStorage.getItem("paintGallery") || "[]");
    g.unshift({id: Date.now(), user: localStorage.getItem("currentUser"), image: mainCanvas.toDataURL(), date: new Date().toLocaleString()});
    localStorage.setItem("paintGallery", JSON.stringify(g.slice(0, 20))); alert("Đã lưu!");
}
function handleExit() { window.location.href = "index.html"; }
document.addEventListener('keydown', e => { if(e.ctrlKey && e.key === 'z') undo(); });