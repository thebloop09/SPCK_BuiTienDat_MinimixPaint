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

window.onload = () => {
    if(!localStorage.getItem("currentUser")) {
        window.location.href = "login.html";
        return;
    }
    
    const W = 1100, H = 650;
    mainCanvas.width = tempCanvas.width = W;
    mainCanvas.height = tempCanvas.height = H;
    
    mainCtx.fillStyle = "white";
    mainCtx.fillRect(0, 0, W, H);
    saveState();

    const data = localStorage.getItem("editingArt");
    if(data) {
        const img = new Image();
        img.src = data;
        img.onload = () => { mainCtx.drawImage(img, 0, 0); saveState(); };
        localStorage.removeItem("editingArt");
    }
};

sizeSlider.oninput = () => document.getElementById("sizeVal").innerText = sizeSlider.value;

document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelector(".tool-btn.active").classList.remove("active");
        btn.classList.add("active");
        tool = btn.dataset.tool;
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

// CHUỘT XUỐNG
tempCanvas.onmousedown = (e) => {
    if (textInput.style.display === "block") return;

    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    
    getProps(mainCtx);
    getProps(tempCtx);

    if(tool === "brush" || tool === "eraser") {
        mainCtx.beginPath();
        mainCtx.moveTo(startX, startY);
    } else if(tool === "fill") {
        floodFill(startX, startY, colorPicker.value);
    } else if(tool === "text") {
        isDrawing = false; 
        showText(startX, startY);
    }
};

// DI CHUYỂN CHUỘT (Toàn cục để tránh lỗi trượt ra ngoài)
window.onmousemove = (e) => {
    if(!isDrawing || tool === "text") return;

    const rect = tempCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if(tool === "brush" || tool === "eraser") {
        mainCtx.lineTo(x, y);
        mainCtx.stroke();
    } else if(tool === "spray") {
        for(let i=0; i<20; i++) {
            const r = sizeSlider.value;
            const offX = (Math.random() - 0.5) * r * 2;
            const offY = (Math.random() - 0.5) * r * 2;
            mainCtx.fillRect(x + offX, y + offY, 1, 1);
        }
    } else if(["line", "rect", "circle"].includes(tool)) {
        tempCtx.clearRect(0, 0, 1100, 650);
        if(tool === "line") {
            tempCtx.beginPath(); tempCtx.moveTo(startX, startY); tempCtx.lineTo(x, y); tempCtx.stroke();
        } else if(tool === "rect") {
            tempCtx.strokeRect(startX, startY, x - startX, y - startY);
        } else if(tool === "circle") {
            let r = Math.sqrt(Math.pow(x-startX,2) + Math.pow(y-startY,2));
            tempCtx.beginPath(); tempCtx.arc(startX, startY, r, 0, Math.PI*2); tempCtx.stroke();
        }
    }
};

// THẢ CHUỘT
window.onmouseup = () => {
    if(!isDrawing) return;
    isDrawing = false;
    if(["line", "rect", "circle"].includes(tool)) {
        mainCtx.drawImage(tempCanvas, 0, 0);
        tempCtx.clearRect(0, 0, 1100, 650);
    }
    saveState();
};

// CÔNG CỤ CHỮ
function showText(x, y) {
    textInput.style.display = "block";
    textInput.style.left = x + "px";
    textInput.style.top = y + "px";
    textInput.style.color = colorPicker.value;
    textToolbar.style.display = "flex";
    textToolbar.style.left = Math.min(x, 800) + "px";
    textToolbar.style.top = (y - 60) + "px";
    setTimeout(() => textInput.focus(), 10);
}

function finishText() {
    if(textInput.style.display === "none") return;
    if(textInput.value.trim() !== "") {
        const size = document.getElementById("font-size").value;
        mainCtx.globalAlpha = 1;
        mainCtx.font = `bold ${size}px Arial`;
        mainCtx.fillStyle = colorPicker.value;
        const x = parseInt(textInput.style.left);
        const y = parseInt(textInput.style.top) + parseInt(size) * 0.8;
        mainCtx.fillText(textInput.value, x, y);
        saveState();
    }
    textInput.value = "";
    textInput.style.display = "none";
    textToolbar.style.display = "none";
}

// TẢI ẢNH VỀ MÁY (DOWNLOAD)
function downloadImage() {
    const link = document.createElement("a");
    link.download = `MinimixArt_${Date.now()}.png`;
    link.href = mainCanvas.toDataURL("image/png");
    link.click();
}

// ĐỔ MÀU
function floodFill(x, y, color) {
    const img = mainCtx.getImageData(0,0,1100,650);
    const data = img.data;
    const startPos = (y * 1100 + x) * 4;
    const target = [data[startPos], data[startPos+1], data[startPos+2]];
    const fill = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    if(target[0]===fill[0] && target[1]===fill[1] && target[2]===fill[2]) return;
    const stack = [[x, y]];
    while(stack.length) {
        const [cx, cy] = stack.pop();
        const i = (cy * 1100 + cx) * 4;
        if(cx>=0 && cx<1100 && cy>=0 && cy<650 && data[i]===target[0] && data[i+1]===target[1] && data[i+2]===target[2]) {
            data[i]=fill[0]; data[i+1]=fill[1]; data[i+2]=fill[2]; data[i+3]=255;
            stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
        }
    }
    mainCtx.putImageData(img, 0, 0);
}

// HỆ THỐNG
function saveState() { undoStack.push(mainCtx.getImageData(0,0,1100,650)); if(undoStack.length > 25) undoStack.shift(); }
function undo() { if(undoStack.length > 1) { undoStack.pop(); mainCtx.putImageData(undoStack[undoStack.length-1], 0, 0); } }
function clearCanvas() { if(confirm("Xóa sạch bảng vẽ?")) { mainCtx.fillStyle="white"; mainCtx.fillRect(0,0,1100,650); saveState(); } }

function saveToGalleryBtn() {
    let g = JSON.parse(localStorage.getItem("paintGallery") || "[]");
    g.unshift({id: Date.now(), user: localStorage.getItem("currentUser"), image: mainCanvas.toDataURL(), date: new Date().toLocaleString()});
    localStorage.setItem("paintGallery", JSON.stringify(g.slice(0, 20)));
    alert("Đã lưu!");
}

function handleExit() { 
    if(confirm("Lưu trước khi thoát?")) saveToGalleryBtn();
    window.location.href = "index.html"; 
}

document.addEventListener('keydown', e => { 
    if(e.ctrlKey && e.key === 'z') undo(); 
    if(e.key === 'Enter' && textInput.style.display === "block") finishText();
});