/**
 * Minimix Studio Pro - Paint Logic
 */

const mainCanvas = document.getElementById("mainCanvas"), mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });
const tempCanvas = document.getElementById("tempCanvas"), tempCtx = tempCanvas.getContext("2d");
const gridCanvas = document.getElementById("gridCanvas"), gridCtx = gridCanvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker"), sizeSlider = document.getElementById("sizeSlider");
const textInput = document.getElementById("textInput"), textToolbar = document.getElementById("text-toolbar");
const opacitySlider = document.getElementById("opacitySlider");

let isDrawing = false, selectedTool = "brush", startX, startY, undoStack = [], polyPoints = [];

// --- KHỞI TẠO ---
window.onload = () => {
    // Kiểm tra đăng nhập
    if (!localStorage.getItem("currentUser")) {
        window.location.href = "login.html";
        return;
    }

    // Kích thước cố định cho bảng vẽ
    mainCanvas.width = tempCanvas.width = gridCanvas.width = 900;
    mainCanvas.height = tempCanvas.height = gridCanvas.height = 550;

    // Nền trắng mặc định
    mainCtx.fillStyle = "white";
    mainCtx.fillRect(0, 0, 900, 550);

    drawGrid();
    saveState();

    // Kiểm tra nếu là chế độ "Vẽ tiếp" từ Gallery
    const editing = localStorage.getItem("editingArt");
    if (editing) {
        const img = new Image();
        img.src = editing;
        img.onload = () => {
            mainCtx.drawImage(img, 0, 0);
            saveState();
            localStorage.removeItem("editingArt");
        };
    }
};

// Cập nhật số hiển thị kích thước cọ
sizeSlider.oninput = () => document.getElementById("sizeVal").innerText = sizeSlider.value;

// Xử lý đổi công cụ
document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelector(".tool-btn.active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.dataset.tool;
        
        // Reset trạng thái vẽ đa giác nếu đổi tool
        polyPoints = []; 
        tempCtx.clearRect(0, 0, 900, 550);
    };
});

// Thiết lập thuộc tính vẽ (màu, nét, độ mờ)
const setContextProps = (ctx) => {
    ctx.lineWidth = sizeSlider.value;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = selectedTool === "eraser" ? "white" : colorPicker.value;
    ctx.fillStyle = colorPicker.value;
    ctx.globalAlpha = selectedTool === "eraser" ? 1 : opacitySlider.value / 100;
};

// --- LOGIC CHUỘT ---
tempCanvas.onmousedown = (e) => {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    setContextProps(mainCtx);
    setContextProps(tempCtx);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        mainCtx.beginPath();
        mainCtx.moveTo(startX, startY);
    } else if (selectedTool === "fill") {
        floodFill(startX, startY, colorPicker.value);
    } else if (selectedTool === "text") {
        showTextUI(startX, startY);
    } else if (selectedTool === "picker") {
        const pixel = mainCtx.getImageData(startX, startY, 1, 1).data;
        const hex = "#" + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
        colorPicker.value = hex;
    }
};

tempCanvas.onmousemove = (e) => {
    if (!isDrawing) return;
    const x = e.offsetX;
    const y = e.offsetY;

    if (selectedTool === "brush" || selectedTool === "eraser") {
        mainCtx.lineTo(x, y);
        mainCtx.stroke();
    } else if (selectedTool === "spray") {
        sprayEffect(x, y);
    } else if (selectedTool !== "text" && selectedTool !== "fill" && selectedTool !== "picker") {
        // Vẽ bản xem trước lên tempCanvas cho các hình khối
        tempCtx.clearRect(0, 0, 900, 550);
        if (selectedTool === "line") {
            tempCtx.beginPath(); tempCtx.moveTo(startX, startY); tempCtx.lineTo(x, y); tempCtx.stroke();
        } else if (selectedTool === "rect") {
            tempCtx.strokeRect(startX, startY, x - startX, y - startY);
        } else if (selectedTool === "circle") {
            let r = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            tempCtx.beginPath(); tempCtx.arc(startX, startY, r, 0, Math.PI * 2); tempCtx.stroke();
        } else if (selectedTool === "poly" && polyPoints.length > 0) {
            tempCtx.beginPath();
            tempCtx.moveTo(polyPoints[0].x, polyPoints[0].y);
            polyPoints.forEach(p => tempCtx.lineTo(p.x, p.y));
            tempCtx.lineTo(x, y);
            tempCtx.stroke();
        }
    }
};

tempCanvas.onmouseup = (e) => {
    if (!isDrawing) return;

    if (selectedTool === "poly") {
        polyPoints.push({ x: e.offsetX, y: e.offsetY });
        // Nếu click gần điểm bắt đầu thì đóng đa giác
        if (polyPoints.length > 2) {
            const dist = Math.sqrt(Math.pow(e.offsetX - polyPoints[0].x, 2) + Math.pow(e.offsetY - polyPoints[0].y, 2));
            if (dist < 25) {
                mainCtx.beginPath();
                mainCtx.moveTo(polyPoints[0].x, polyPoints[0].y);
                polyPoints.forEach(p => mainCtx.lineTo(p.x, p.y));
                mainCtx.closePath();
                mainCtx.stroke();
                polyPoints = [];
                tempCtx.clearRect(0, 0, 900, 550);
                isDrawing = false;
                saveState();
                return;
            }
        }
        return;
    }

    isDrawing = false;
    // Chép hình từ temp sang main
    if (!["brush", "eraser", "spray", "fill", "picker", "text"].includes(selectedTool)) {
        mainCtx.drawImage(tempCanvas, 0, 0);
        tempCtx.clearRect(0, 0, 900, 550);
    }
    
    saveState();
    addRecentColor(colorPicker.value);
};

// --- CÁC CÔNG CỤ ĐẶC BIỆT ---

function sprayEffect(x, y) {
    const radius = sizeSlider.value;
    const density = 30;
    for (let i = 0; i < density; i++) {
        const offX = (Math.random() - 0.5) * 2 * radius;
        const offY = (Math.random() - 0.5) * 2 * radius;
        if (offX * offX + offY * offY <= radius * radius) {
            mainCtx.fillRect(x + offX, y + offY, 1, 1);
        }
    }
}

function floodFill(startX, startY, fillColor) {
    const imgData = mainCtx.getImageData(0, 0, 900, 550);
    const data = imgData.data;
    const pos = (startY * 900 + startX) * 4;
    const targetR = data[pos], targetG = data[pos+1], targetB = data[pos+2];
    
    const fillR = parseInt(fillColor.slice(1,3), 16);
    const fillG = parseInt(fillColor.slice(3,5), 16);
    const fillB = parseInt(fillColor.slice(5,7), 16);

    if (targetR === fillR && targetG === fillG && targetB === fillB) return;

    const queue = [[startX, startY]];
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const currPos = (y * 900 + x) * 4;

        if (x >= 0 && x < 900 && y >= 0 && y < 550 && 
            data[currPos] === targetR && data[currPos+1] === targetG && data[currPos+2] === targetB) {
            
            data[currPos] = fillR; data[currPos+1] = fillG; data[currPos+2] = fillB; data[currPos+3] = 255;
            queue.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
        }
    }
    mainCtx.putImageData(imgData, 0, 0);
}

// --- HỆ THỐNG CHỮ ---
function showTextUI(x, y) {
    textToolbar.style.display = "flex";
    textToolbar.style.left = Math.min(x, window.innerWidth - 300) + "px";
    textToolbar.style.top = (y + 100) + "px";
    
    textInput.style.display = "block";
    textInput.style.left = x + "px";
    textInput.style.top = y + "px";
    textInput.style.color = colorPicker.value;
    setTimeout(() => textInput.focus(), 50);
}

function finishText() {
    const val = textInput.value.trim();
    if (val) {
        const size = document.getElementById("font-size").value;
        const family = document.getElementById("font-family").value;
        mainCtx.globalAlpha = 1;
        mainCtx.font = `${size}px ${family}`;
        mainCtx.fillStyle = colorPicker.value;
        // Vẽ chữ vào mainCanvas (căn lề dưới theo font size)
        mainCtx.fillText(val, parseInt(textInput.style.left), parseInt(textInput.style.top) + parseInt(size)/1.2);
        saveState();
    }
    textInput.value = "";
    textInput.style.display = "none";
    textToolbar.style.display = "none";
}

// --- BỘ LỌC (FILTERS) ---
function applyFilter(type) {
    const imgData = mainCtx.getImageData(0, 0, 900, 550);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        if (type === 'gray') {
            const avg = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = avg;
        } else if (type === 'invert') {
            d[i] = 255 - d[i]; d[i+1] = 255 - d[i+1]; d[i+2] = 255 - d[i+2];
        } else if (type === 'sepia') {
            const r = d[i], g = d[i+1], b = d[i+2];
            d[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            d[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            d[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }
    }
    mainCtx.putImageData(imgData, 0, 0);
    saveState();
}

// --- HỆ THỐNG QUẢN LÝ ---
function drawGrid() {
    gridCtx.strokeStyle = "#ddd";
    gridCtx.beginPath();
    for(let x=0; x<=900; x+=50) { gridCtx.moveTo(x,0); gridCtx.lineTo(x,550); }
    for(let y=0; y<=550; y+=50) { gridCtx.moveTo(0,y); gridCtx.lineTo(900,y); }
    gridCtx.stroke();
}

function toggleGrid() {
    gridCanvas.style.display = gridCanvas.style.display === "block" ? "none" : "block";
}

function saveState() {
    undoStack.push(mainCtx.getImageData(0, 0, 900, 550));
    if (undoStack.length > 30) undoStack.shift();
}

function undo() {
    if (undoStack.length > 1) {
        undoStack.pop();
        mainCtx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    }
}

function clearCanvas() {
    if (confirm("Xóa sạch bảng vẽ?")) {
        mainCtx.globalAlpha = 1;
        mainCtx.fillStyle = "white";
        mainCtx.fillRect(0, 0, 900, 550);
        saveState();
    }
}

function addRecentColor(color) {
    const container = document.getElementById("recentColors");
    if ([...container.children].some(c => c.dataset.color === color)) return;
    const div = document.createElement("div");
    div.className = "color-swatch";
    div.style.background = color;
    div.dataset.color = color;
    div.onclick = () => colorPicker.value = color;
    container.prepend(div);
    if (container.children.length > 14) container.lastChild.remove();
}

function downloadImage() {
    const link = document.createElement("a");
    link.download = `MinimixArt_${Date.now()}.png`;
    link.href = mainCanvas.toDataURL();
    link.click();
}

function saveToGalleryBtn() {
    let gallery = JSON.parse(localStorage.getItem("paintGallery") || "[]");
    gallery.unshift({
        id: Date.now(),
        user: localStorage.getItem("currentUser"),
        image: mainCanvas.toDataURL("image/png", 0.5), // Nén nhẹ để tiết kiệm bộ nhớ
        date: new Date().toLocaleString()
    });
    localStorage.setItem("paintGallery", JSON.stringify(gallery.slice(0, 20)));
    alert("Đã lưu vào Gallery thành công!");
}

function handleExit() {
    if (confirm("Lưu trước khi thoát?")) saveToGalleryBtn();
    window.location.href = "index.html";
}

// Phím tắt Ctrl+Z
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'z') undo();
});