const mainCanvas = document.getElementById("mainCanvas"), mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });
const tempCanvas = document.getElementById("tempCanvas"), tempCtx = tempCanvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker"), sizeSlider = document.getElementById("sizeSlider");
const textInput = document.getElementById("textInput"), textToolbar = document.getElementById("text-toolbar");
const opacitySlider = document.getElementById("opacitySlider");

let isDrawing = false, tool = "brush", startX, startY, undoStack = [], polyPoints = [];

window.onload = () => {
    if(!localStorage.getItem("currentUser")) window.location.href = "login.html";
    mainCanvas.width = tempCanvas.width = 900; mainCanvas.height = tempCanvas.height = 550;
    mainCtx.fillStyle = "white"; mainCtx.fillRect(0, 0, 900, 550);
    saveState();
    const editing = localStorage.getItem("editingArt");
    if(editing) {
        const img = new Image(); img.src = editing;
        img.onload = () => { mainCtx.drawImage(img, 0, 0); saveState(); localStorage.removeItem("editingArt"); };
    }
};

sizeSlider.oninput = () => document.getElementById("sizeVal").innerText = sizeSlider.value;

document.querySelectorAll(".tool-btn").forEach(btn => btn.onclick = () => {
    document.querySelector(".tool-btn.active").classList.remove("active");
    btn.classList.add("active"); tool = btn.dataset.tool;
    polyPoints = []; tempCtx.clearRect(0,0,900,550);
});

const setProps = (c) => {
    c.lineWidth = sizeSlider.value; c.lineCap = "round"; c.lineJoin = "round";
    c.strokeStyle = tool === "eraser" ? "white" : colorPicker.value;
    c.fillStyle = colorPicker.value;
    c.globalAlpha = tool === "eraser" ? 1 : opacitySlider.value / 100;
};

tempCanvas.onmousedown = (e) => {
    isDrawing = true; startX = e.offsetX; startY = e.offsetY; setProps(mainCtx); setProps(tempCtx);
    if(tool === "brush" || tool === "eraser") { mainCtx.beginPath(); mainCtx.moveTo(startX, startY); }
    else if(tool === "fill") floodFill(startX, startY, colorPicker.value);
    else if(tool === "text") showTextUI(startX, startY);
};

tempCanvas.onmousemove = (e) => {
    if(!isDrawing) return;
    const x = e.offsetX, y = e.offsetY;
    if(tool === "brush" || tool === "eraser") { mainCtx.lineTo(x, y); mainCtx.stroke(); }
    else if(tool === "spray") {
        for (let i = 0; i < 20; i++) {
            const offX = (Math.random() - 0.5) * sizeSlider.value * 2;
            const offY = (Math.random() - 0.5) * sizeSlider.value * 2;
            mainCtx.fillRect(startX + offX + (x-startX), startY + offY + (y-startY), 1, 1);
        }
    } else {
        tempCtx.clearRect(0, 0, 900, 550);
        if(tool === "line") { tempCtx.beginPath(); tempCtx.moveTo(startX, startY); tempCtx.lineTo(x, y); tempCtx.stroke(); }
        else if(tool === "rect") tempCtx.strokeRect(startX, startY, x - startX, y - startY);
        else if(tool === "circle") { 
            let r = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)); 
            tempCtx.beginPath(); tempCtx.arc(startX, startY, r, 0, Math.PI * 2); tempCtx.stroke(); 
        }
        else if(tool === "poly" && polyPoints.length > 0) { 
            tempCtx.beginPath(); tempCtx.moveTo(polyPoints[0].x, polyPoints[0].y); 
            polyPoints.forEach(p => tempCtx.lineTo(p.x, p.y)); tempCtx.lineTo(x, y); tempCtx.stroke(); 
        }
    }
};

tempCanvas.onmouseup = (e) => {
    if(!isDrawing) return;
    if(tool === "poly") {
        polyPoints.push({x: e.offsetX, y: e.offsetY});
        if(polyPoints.length > 2 && Math.sqrt(Math.pow(e.offsetX - polyPoints[0].x, 2) + Math.pow(e.offsetY - polyPoints[0].y, 2)) < 25) {
            mainCtx.beginPath(); mainCtx.moveTo(polyPoints[0].x, polyPoints[0].y); 
            polyPoints.forEach(p => mainCtx.lineTo(p.x, p.y)); mainCtx.closePath(); mainCtx.stroke();
            polyPoints = []; tempCtx.clearRect(0,0,900,550); isDrawing = false; saveState();
        }
        return;
    }
    isDrawing = false;
    if(!["brush", "eraser", "fill", "text", "picker", "spray"].includes(tool)) { 
        mainCtx.drawImage(tempCanvas, 0, 0); tempCtx.clearRect(0, 0, 900, 550); 
    }
    saveState();
};

function showTextUI(x, y) {
    textToolbar.style.display = "flex";
    textToolbar.style.left = Math.min(window.innerWidth - 350, x) + "px";
    textToolbar.style.top = (y - 70) + "px";
    document.getElementById("text-color-input").value = colorPicker.value;
    textInput.style.display = "block"; textInput.style.left = x + "px"; textInput.style.top = y + "px";
    const updatePreview = () => {
        textInput.style.fontFamily = document.getElementById("font-family").value;
        textInput.style.fontSize = document.getElementById("font-size-input").value + "px";
        textInput.style.color = document.getElementById("text-color-input").value;
    };
    document.getElementById("font-family").onchange = updatePreview;
    document.getElementById("font-size-input").oninput = updatePreview;
    document.getElementById("text-color-input").oninput = updatePreview;
    updatePreview(); textInput.focus();
}

function finishText() {
    if (textInput.value.trim() !== "") {
        const x = parseInt(textInput.style.left), y = parseInt(textInput.style.top);
        const size = document.getElementById("font-size-input").value;
        const family = document.getElementById("font-family").value;
        const color = document.getElementById("text-color-input").value;
        mainCtx.globalAlpha = 1.0; mainCtx.font = `${size}px ${family}`; mainCtx.fillStyle = color;
        mainCtx.fillText(textInput.value, x, y + size/1.2);
        saveState();
    }
    textInput.style.display = "none"; textInput.value = ""; textToolbar.style.display = "none";
}

function floodFill(x, y, color) {
    const img = mainCtx.getImageData(0, 0, 900, 550);
    const target = [img.data[(y*900+x)*4], img.data[(y*900+x)*4+1], img.data[(y*900+x)*4+2]];
    const fill = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    if(target[0]===fill[0] && target[1]===fill[1] && target[2]===fill[2]) return;
    const q = [[x, y]];
    while(q.length) {
        const [cx, cy] = q.pop(); const i = (cy*900+cx)*4;
        if(cx>=0 && cx<900 && cy>=0 && cy<550 && img.data[i]===target[0] && img.data[i+1]===target[1] && img.data[i+2]===target[2]) {
            img.data[i]=fill[0]; img.data[i+1]=fill[1]; img.data[i+2]=fill[2]; img.data[i+3]=255;
            q.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
        }
    }
    mainCtx.putImageData(img, 0, 0);
}

function saveState() { undoStack.push(mainCtx.getImageData(0, 0, 900, 550)); if(undoStack.length > 40) undoStack.shift(); }
function undo() { polyPoints=[]; tempCtx.clearRect(0,0,900,550); if(undoStack.length > 1) { undoStack.pop(); mainCtx.putImageData(undoStack[undoStack.length - 1], 0, 0); } }
function clearCanvas() { if(confirm("Xóa sạch bảng vẽ?")) { mainCtx.globalAlpha=1; mainCtx.fillStyle="white"; mainCtx.fillRect(0,0,900,550); saveState(); } }
function downloadImage() { const a = document.createElement("a"); a.download=`Minimix_${Date.now()}.png`; a.href=mainCanvas.toDataURL(); a.click(); }
function saveToGalleryBtn() {
    let g = JSON.parse(localStorage.getItem("paintGallery")||"[]");
    g.unshift({id:Date.now(), user:localStorage.getItem("currentUser"), image:mainCanvas.toDataURL(), date:new Date().toLocaleString()});
    localStorage.setItem("paintGallery", JSON.stringify(g.slice(0,20))); alert("Đã lưu vào Gallery!");
}
function handleExit() { if(confirm("Lưu trước khi thoát?")) saveToGalleryBtn(); window.location.href="index.html"; }
document.addEventListener('keydown', e => { if(e.ctrlKey && e.key === 'z') undo(); });