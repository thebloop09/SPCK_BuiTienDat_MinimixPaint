const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const colorPicker = document.getElementById("color-picker");
const sizeSlider = document.getElementById("size-slider");
const sizeVal = document.getElementById("size-val");
const opacitySlider = document.getElementById("opacity-slider");
const opacityVal = document.getElementById("opacity-val");
const coordsDisplay = document.getElementById("coords");

let isDrawing = false, tool = "brush", startX, startY, snapshot, undoStack = [];

// KHỞI TẠO STUDIO
window.onload = () => {
    const user = localStorage.getItem("currentUser");
    if(!user) window.location.href = "login.html";
    document.getElementById("user-tag").innerText = "Họa sĩ: " + user;

    canvas.width = 900; canvas.height = 550;
    ctx.fillStyle = "white"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Nạp ảnh cũ nếu có lệnh vẽ tiếp
    const editing = localStorage.getItem("editingArt");
    if(editing) {
        const img = new Image(); img.src = editing;
        img.onload = () => { ctx.drawImage(img, 0, 0); saveState(); localStorage.removeItem("editingArt"); };
    } else saveState();
};

// CẬP NHẬT THÔNG SỐ CỌ
sizeSlider.oninput = () => sizeVal.innerText = sizeSlider.value;
opacitySlider.oninput = () => opacityVal.innerText = opacitySlider.value + "%";

// CHỌN CÔNG CỤ
document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelector(".tool-btn.active").classList.remove("active");
        btn.classList.add("active");
        tool = btn.dataset.tool;
    }
});

// LOGIC VẼ TƯƠNG TÁC
canvas.onmousedown = (e) => {
    isDrawing = true; 
    startX = e.offsetX; 
    startY = e.offsetY;
    
    // Thiết lập nét vẽ mượt
    ctx.lineWidth = sizeSlider.value;
    ctx.strokeStyle = tool === "eraser" ? "white" : colorPicker.value;
    ctx.globalAlpha = tool === "eraser" ? 1.0 : opacitySlider.value / 100;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Lưu màn hình hiện tại trước khi vẽ
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if(tool === "brush" || tool === "eraser") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
    
    if(tool === "fill") floodFill(startX, startY, colorPicker.value);
};

canvas.onmousemove = (e) => {
    coordsDisplay.innerText = `Tọa độ: ${e.offsetX}, ${e.offsetY} px`;
    if(!isDrawing || tool === "fill") return;

    // Trả lại ảnh cũ để tạo hiệu ứng xem trước (Preview)
    if(tool !== "brush" && tool !== "eraser") ctx.putImageData(snapshot, 0, 0);

    if(tool === "brush" || tool === "eraser") { 
        ctx.lineTo(e.offsetX, e.offsetY); 
        ctx.stroke(); 
    } 
    else if(tool === "rect") {
        ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    } 
    else if(tool === "circle") {
        ctx.beginPath();
        let r = Math.sqrt(Math.pow(startX - e.offsetX, 2) + Math.pow(startY - e.offsetY, 2));
        ctx.arc(startX, startY, r, 0, 2 * Math.PI); 
        ctx.stroke();
    }
    else if(tool === "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
};

canvas.onmouseup = () => { 
    if(isDrawing) { 
        isDrawing = false; 
        saveState(); 
    } 
};

// THUẬT TOÁN ĐỔ MÀU CHUYÊN NGHIỆP
function floodFill(x, y, color) {
    const target = ctx.getImageData(x, y, 1, 1).data;
    const f = hexToRgb(color);
    if(target[0] === f[0] && target[1] === f[1] && target[2] === f[2]) return;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const q = [[x, y]];
    while(q.length) {
        const [cx, cy] = q.pop();
        const i = (cy * canvas.width + cx) * 4;
        if(cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height && img.data[i] === target[0] && img.data[i+1] === target[1] && img.data[i+2] === target[2]) {
            img.data[i] = f[0]; img.data[i+1] = f[1]; img.data[i+2] = f[2]; img.data[i+3] = 255;
            q.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
        }
    }
    ctx.putImageData(img, 0, 0);
}

// HÀM HỖ TRỢ
function hexToRgb(h) { return [parseInt(h.slice(1,3), 16), parseInt(h.slice(3,5), 16), parseInt(h.slice(5,7), 16)]; }
function saveState() { undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); if(undoStack.length > 25) undoStack.shift(); }
function undo() { if(undoStack.length > 1) { undoStack.pop(); ctx.putImageData(undoStack[undoStack.length-1], 0, 0); } }
function clearCanvas() { if(confirm("Xóa sạch bảng vẽ?")) { ctx.fillStyle="white"; ctx.fillRect(0,0,900,550); saveState(); } }

function saveToGallery(showAlert) {
    let gallery = JSON.parse(localStorage.getItem("paintGallery") || "[]");
    gallery.unshift({ id: Date.now(), user: localStorage.getItem("currentUser"), image: canvas.toDataURL("image/png", 0.6) });
    localStorage.setItem("paintGallery", JSON.stringify(gallery.slice(0, 15)));
    if(showAlert) alert("✅ Đã lưu tác phẩm!");
}

function handleExit() {
    if(confirm("Bạn có muốn lưu tranh trước khi rời đi không?")) saveToGallery(false);
    window.location.href = "index.html";
}

// PHÍM TẮT
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') undo();
});