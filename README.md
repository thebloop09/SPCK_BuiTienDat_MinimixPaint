

hiện tại tôi muốn tách code của tôi trong file paint.html ra riêng css riêng js riêng chứ không được dồn vào một file paint.html nó dày và khó bảo chì cung cấp full code hoàn chỉnh không được làm ảnh huownrgh đến các chức nawmg khác 


```
SPCK-JSA13
├─ app.js
├─ gallery.html
├─ index.html
├─ login.html
├─ paint.html
├─ paint.js
├─ register.html
└─ style.css

```


code hiện tại của tôi như sao 
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minimix Studio Pro v6 | Ultimate Edition</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        :root { --primary: #7d2ae8; --primary-hover: #6610f2; --dark: #18191b; --bg: #e9eaed; --side-w: 260px; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
        body { height: 100vh; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }

        /* Topbar */
        .topbar { height: 64px; background: white; border-bottom: 1px solid #ddd; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 100; }
        .logo { color: var(--primary); font-weight: 800; font-size: 20px; cursor: pointer; }
        .config-panel { display: flex; align-items: center; gap: 15px; background: #f1f2f6; padding: 6px 15px; border-radius: 40px; }
        .config-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; }
        input[type="color"] { border: none; width: 25px; height: 25px; cursor: pointer; background: none; }
        input[type="range"] { cursor: pointer; accent-color: var(--primary); width: 70px; }
        .btn-icon-top { width: 34px; height: 34px; border-radius: 10px; border: 1px solid #ddd; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-icon-top:hover { background: var(--primary); color: white; border-color: var(--primary); }

        /* Floating Text Toolbar */
        .text-floating-bar { position: absolute; display: none; background: white; padding: 8px 15px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 2000; align-items: center; gap: 8px; border: 1px solid #ddd; animation: popUp 0.3s ease; }
        .text-floating-bar select { padding: 5px; border-radius: 6px; border: 1px solid #ddd; font-size: 12px; }
        .t-btn { width: 30px; height: 30px; background: none; border: none; border-radius: 6px; cursor: pointer; color: #444; }
        .t-btn.active { background: #e8f0fe; color: var(--primary); border: 1px solid var(--primary); }

        /* Layout */
        .app-body { display: flex; flex: 1; height: calc(100vh - 64px); }
        .sidebar { width: var(--side-w); background: var(--dark); color: white; display: flex; flex-direction: column; padding: 15px; overflow-y: auto; }
        .tool-section h4 { font-size: 10px; color: #666; text-transform: uppercase; margin: 15px 0 8px; letter-spacing: 1px; }
        .tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .tool-btn { background: #2c2c2e; border: none; color: #a9abb0; padding: 10px 5px; border-radius: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 10px; transition: 0.2s; }
        .tool-btn i { font-size: 18px; }
        .tool-btn.active { color: white; background: var(--primary); }

        /* Palette màu gần đây */
        .recent-colors { display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap; }
        .color-swatch { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: 1px solid #444; }

        /* Workspace */
        .workspace { flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 40px; position: relative; }
        .canvas-holder { position: relative; background: white; box-shadow: 0 20px 60px rgba(0,0,0,0.15); border-radius: 4px; }
        #mainCanvas { position: absolute; top: 0; left: 0; z-index: 1; }
        #tempCanvas { position: relative; z-index: 2; cursor: crosshair; }
        #gridCanvas { position: absolute; top:0; left:0; z-index: 3; pointer-events: none; opacity: 0.3; display: none; }
        
        #textInput { position: absolute; display: none; z-index: 1000; border: 1px dashed var(--primary); background: transparent; outline: none; padding: 5px; }

        .btn-main { background: var(--primary); color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
        .btn-filter { background: #444; color: white; font-size: 11px; padding: 8px; border-radius: 6px; border: none; cursor: pointer; transition: 0.2s; }
        .btn-filter:hover { background: #555; }
    </style>
</head>
<body>

    <header class="topbar">
        <div class="logo" onclick="location.href='index.html'">🎨 Minimix<b>Studio</b></div>
        <div class="config-panel">
            <div class="config-item"><input type="color" id="colorPicker" value="#000000"></div>
            <div class="config-item"><i class="fas fa-pen-nib"></i><input type="range" id="sizeSlider" min="1" max="100" value="5"> <span id="sizeVal">5</span></div>
            <div class="config-item"><i class="fas fa-droplet"></i><input type="range" id="opacitySlider" min="1" max="100" value="100"></div>
            <button class="btn-icon-top" onclick="undo()" title="Hoàn tác (Ctrl+Z)"><i class="fas fa-rotate-left"></i></button>
            <button class="btn-icon-top" onclick="toggleGrid()" title="Bật/Tắt Lưới"><i class="fas fa-grid-2"></i></button>
        </div>
        <div style="display:flex; gap:10px;">
            <button class="btn-main" style="background:#27ae60" onclick="downloadImage()"><i class="fas fa-download"></i></button>
            <button class="btn-main" onclick="saveToGalleryBtn()">Lưu Gallery</button>
            <button onclick="handleExit()" style="background:none; border:none; color:red; cursor:pointer; font-weight:700;">Thoát</button>
        </div>
    </header>

    <div id="text-toolbar" class="text-floating-bar">
        <select id="font-family"><option value="Arial">Arial</option><option value="Inter" selected>Inter</option><option value="Courier New">Courier New</option></select>
        <select id="font-size"><option value="26">26</option><option value="48">48</option><option value="72">72</option></select>
        <button class="t-btn" id="btn-bold"><i class="fas fa-bold"></i></button>
        <button class="t-btn" id="btn-italic"><i class="fas fa-italic"></i></button>
        <button class="btn-main" style="padding:5px 10px" onclick="finishText()">Xong</button>
    </div>

    <div class="app-body">
        <aside class="sidebar">
            <div class="tool-section">
                <h4>Công cụ vẽ</h4>
                <div class="tool-grid">
                    <button class="tool-btn active" data-tool="brush"><i class="fas fa-paint-brush"></i>Cọ vẽ</button>
                    <button class="tool-btn" data-tool="spray"><i class="fas fa-spray-can"></i>Phun sơn</button>
                    <button class="tool-btn" data-tool="eraser"><i class="fas fa-eraser"></i>Tẩy</button>
                    <button class="tool-btn" data-tool="fill"><i class="fas fa-fill-drip"></i>Đổ màu</button>
                    <button class="tool-btn" data-tool="picker"><i class="fas fa-eye-dropper"></i>Hút màu</button>
                    <button class="tool-btn" data-tool="text"><i class="fas fa-font"></i>Chữ Pro</button>
                </div>
                <div class="recent-colors" id="recentColors"></div>
            </div>

            <div class="tool-section">
                <h4>Hình khối</h4>
                <div class="tool-grid">
                    <button class="tool-btn" data-tool="line"><i class="fas fa-slash"></i>Đường kẻ</button>
                    <button class="tool-btn" data-tool="rect"><i class="far fa-square"></i>Chữ nhật</button>
                    <button class="tool-btn" data-tool="circle"><i class="far fa-circle"></i>Hình tròn</button>
                    <button class="tool-btn" data-tool="poly"><i class="fas fa-draw-polygon"></i>Đa giác</button>
                </div>
            </div>

            <div class="tool-section">
                <h4>Bộ lọc ảnh (Filters)</h4>
                <div class="tool-grid" style="grid-template-columns: 1fr;">
                    <button class="btn-filter" onclick="applyFilter('gray')">Trắng đen</button>
                    <button class="btn-filter" onclick="applyFilter('invert')">Đảo ngược màu</button>
                </div>
            </div>

            <button class="btn-main" onclick="clearCanvas()" style="background:#333; color:#ff4757; margin-top:auto;"><i class="fas fa-trash-alt"></i> XÓA SẠCH BẢNG</button>
        </aside>

        <main class="workspace">
            <div class="canvas-holder">
                <canvas id="mainCanvas"></canvas>
                <canvas id="tempCanvas"></canvas>
                <canvas id="gridCanvas"></canvas>
                <input type="text" id="textInput" placeholder="Nhập chữ...">
            </div>
        </main>
    </div>

    <script>
        const mainCanvas = document.getElementById("mainCanvas"), mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });
        const tempCanvas = document.getElementById("tempCanvas"), tempCtx = tempCanvas.getContext("2d");
        const gridCanvas = document.getElementById("gridCanvas"), gridCtx = gridCanvas.getContext("2d");
        const colorPicker = document.getElementById("colorPicker"), sizeSlider = document.getElementById("sizeSlider");
        const textInput = document.getElementById("textInput"), textToolbar = document.getElementById("text-toolbar");
        
        let isDrawing = false, selectedTool = "brush", startX, startY, undoStack = [], polyPoints = [], textOptions = { bold: false, italic: false };

        window.onload = () => {
            const user = localStorage.getItem("currentUser") || "Khách";
            mainCanvas.width = tempCanvas.width = gridCanvas.width = 900;
            mainCanvas.height = tempCanvas.height = gridCanvas.height = 550;
            mainCtx.fillStyle = "white"; mainCtx.fillRect(0, 0, 900, 550);
            drawGrid(); saveState();
            const editing = localStorage.getItem("editingArt");
            if(editing) { const img = new Image(); img.src = editing; img.onload = () => { mainCtx.drawImage(img, 0, 0); saveState(); localStorage.removeItem("editingArt"); }; }
        };

        // --- CỌ PHUN SƠN (SPRAY) ---
        function spray(x, y) {
            const radius = sizeSlider.value;
            const density = 30;
            for (let i = 0; i < density; i++) {
                const offsetX = (Math.random() - 0.5) * 2 * radius;
                const offsetY = (Math.random() - 0.5) * 2 * radius;
                if (offsetX * offsetX + offsetY * offsetY <= radius * radius) {
                    mainCtx.fillRect(x + offsetX, y + offsetY, 1, 1);
                }
            }
        }

        // --- BỘ LỌC (FILTERS) ---
        function applyFilter(type) {
            const imgData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (type === 'gray') {
                    const avg = (data[i] + data[i+1] + data[i+2]) / 3;
                    data[i] = data[i+1] = data[i+2] = avg;
                } else if (type === 'invert') {
                    data[i] = 255 - data[i]; data[i+1] = 255 - data[i+1]; data[i+2] = 255 - data[i+2];
                }
            }
            mainCtx.putImageData(imgData, 0, 0); saveState();
        }

        // --- LƯỚI (GRID) ---
        function drawGrid() {
            gridCtx.strokeStyle = "#ddd"; gridCtx.beginPath();
            for(let x=0; x<=900; x+=50) { gridCtx.moveTo(x,0); gridCtx.lineTo(x,550); }
            for(let y=0; y<=550; y+=50) { gridCtx.moveTo(0,y); gridCtx.lineTo(900,y); }
            gridCtx.stroke();
        }
        function toggleGrid() { gridCanvas.style.display = gridCanvas.style.display === "block" ? "none" : "block"; }

        // --- LOGIC VẼ CƠ BẢN ---
        sizeSlider.oninput = () => document.getElementById("sizeVal").innerText = sizeSlider.value;
        document.querySelectorAll(".tool-btn").forEach(btn => btn.onclick = () => {
            document.querySelector(".tool-btn.active").classList.remove("active");
            btn.classList.add("active"); selectedTool = btn.dataset.tool;
            polyPoints = []; tempCtx.clearRect(0,0,900,550);
        });

        tempCanvas.onmousedown = (e) => {
            isDrawing = true; startX = e.offsetX; startY = e.offsetY;
            mainCtx.lineWidth = tempCtx.lineWidth = sizeSlider.value;
            mainCtx.strokeStyle = tempCtx.strokeStyle = selectedTool === "eraser" ? "white" : colorPicker.value;
            mainCtx.fillStyle = tempCtx.fillStyle = colorPicker.value;
            mainCtx.globalAlpha = tempCtx.globalAlpha = selectedTool === "eraser" ? 1 : document.getElementById("opacitySlider").value / 100;
            if(selectedTool === "brush" || selectedTool === "eraser") { mainCtx.beginPath(); mainCtx.moveTo(startX, startY); }
            if(selectedTool === "fill") floodFill(startX, startY, colorPicker.value);
            if(selectedTool === "text") showTextUI(startX, startY);
            if(selectedTool === "picker") { const p = mainCtx.getImageData(startX, startY, 1, 1).data; colorPicker.value = "#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1); }
        };

        tempCanvas.onmousemove = (e) => {
            if(!isDrawing) return;
            const x = e.offsetX, y = e.offsetY;
            if(selectedTool === "brush" || selectedTool === "eraser") { mainCtx.lineTo(x, y); mainCtx.stroke(); }
            else if(selectedTool === "spray") { spray(x, y); }
            else {
                tempCtx.clearRect(0, 0, 900, 550);
                if(selectedTool === "line") { tempCtx.beginPath(); tempCtx.moveTo(startX, startY); tempCtx.lineTo(x, y); tempCtx.stroke(); }
                else if(selectedTool === "rect") tempCtx.strokeRect(startX, startY, x - startX, y - startY);
                else if(selectedTool === "circle") { let r = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)); tempCtx.beginPath(); tempCtx.arc(startX, startY, r, 0, Math.PI * 2); tempCtx.stroke(); }
                else if(selectedTool === "poly" && polyPoints.length > 0) { tempCtx.beginPath(); tempCtx.moveTo(polyPoints[0].x, polyPoints[0].y); polyPoints.forEach(p => tempCtx.lineTo(p.x, p.y)); tempCtx.lineTo(x, y); tempCtx.stroke(); }
            }
        };

        tempCanvas.onmouseup = (e) => {
            if(!isDrawing) return;
            if(selectedTool === "poly") {
                polyPoints.push({x: e.offsetX, y: e.offsetY});
                if(polyPoints.length > 2 && Math.sqrt(Math.pow(e.offsetX - polyPoints[0].x, 2) + Math.pow(e.offsetY - polyPoints[0].y, 2)) < 25) {
                    mainCtx.beginPath(); mainCtx.moveTo(polyPoints[0].x, polyPoints[0].y); polyPoints.forEach(p => mainCtx.lineTo(p.x, p.y)); mainCtx.closePath(); mainCtx.stroke();
                    polyPoints = []; tempCtx.clearRect(0,0,900,550); isDrawing = false; saveState();
                }
                return;
            }
            isDrawing = false;
            if(!["brush", "eraser", "spray", "fill", "picker"].includes(selectedTool)) { mainCtx.drawImage(tempCanvas, 0, 0); tempCtx.clearRect(0, 0, 900, 550); }
            saveState(); addRecentColor(colorPicker.value);
        };

        // --- QUẢN LÝ MÀU GẦN ĐÂY ---
        function addRecentColor(color) {
            const container = document.getElementById("recentColors");
            if([...container.children].some(c => c.dataset.color === color)) return;
            const div = document.createElement("div"); div.className = "color-swatch"; div.style.background = color; div.dataset.color = color;
            div.onclick = () => colorPicker.value = color;
            container.prepend(div); if(container.children.length > 10) container.lastChild.remove();
        }

        // --- CÁC HÀM KHÁC (GIỮ NGUYÊN) ---
        function showTextUI(x, y) { textToolbar.style.display="flex"; textToolbar.style.left=x+"px"; textToolbar.style.top=(y-50)+"px"; textInput.style.display="block"; textInput.style.left=x+"px"; textInput.style.top=y+"px"; textInput.focus(); }
        function finishText() { if(textInput.value.trim()!=="") { mainCtx.font = (textOptions.bold?"bold ":"") + document.getElementById('font-size').value+"px "+document.getElementById('font-family').value; mainCtx.fillText(textInput.value, parseInt(textInput.style.left), parseInt(textInput.style.top)); saveState(); } textInput.style.display="none"; textInput.value=""; textToolbar.style.display="none"; }
        function floodFill(x, y, color) { const img = mainCtx.getImageData(0, 0, 900, 550); const target = [img.data[(y*900+x)*4], img.data[(y*900+x)*4+1], img.data[(y*900+x)*4+2]]; const fill = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)]; if(target[0]===fill[0] && target[1]===fill[1] && target[2]===fill[2]) return; const q = [[x, y]]; while(q.length) { const [cx, cy] = q.pop(); const i = (cy*900+cx)*4; if(cx>=0 && cx<900 && cy>=0 && cy<550 && img.data[i]===target[0] && img.data[i+1]===target[1] && img.data[i+2]===target[2]) { img.data[i]=fill[0]; img.data[i+1]=fill[1]; img.data[i+2]=fill[2]; img.data[i+3]=255; q.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]); } } mainCtx.putImageData(img, 0, 0); }
        function saveState() { undoStack.push(mainCtx.getImageData(0, 0, 900, 550)); if(undoStack.length > 30) undoStack.shift(); }
        function undo() { polyPoints=[]; tempCtx.clearRect(0,0,900,550); if(undoStack.length > 1) { undoStack.pop(); mainCtx.putImageData(undoStack[undoStack.length - 1], 0, 0); } }
        function clearCanvas() { if(confirm("Xóa sạch?")) { mainCtx.globalAlpha=1; mainCtx.fillStyle="white"; mainCtx.fillRect(0,0,900,550); saveState(); } }
        function downloadImage() { const a = document.createElement("a"); a.download=`Minimix_${Date.now()}.png`; a.href=mainCanvas.toDataURL(); a.click(); }
        function saveToGalleryBtn() { let g = JSON.parse(localStorage.getItem("paintGallery")||"[]"); g.unshift({id:Date.now(), user:localStorage.getItem("currentUser"), image:mainCanvas.toDataURL(), date:new Date().toLocaleString()}); localStorage.setItem("paintGallery", JSON.stringify(g.slice(0,15))); alert("Đã lưu!"); }
        function handleExit() { if(confirm("Lưu trước khi thoát?")) saveToGalleryBtn(); window.location.href="index.html"; }
        document.getElementById('btn-bold').onclick = function() { this.classList.toggle('active'); textOptions.bold = !textOptions.bold; };
        document.addEventListener('keydown', e => { if(e.ctrlKey && e.key === 'z') undo(); });
    </script>
</body>
</html>





