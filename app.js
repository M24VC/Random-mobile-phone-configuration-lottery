// app.js - 最終穩定版：使用中文品牌，內部使用英文檔名確保穩定性
const finalConfiguration = {}; 
let isDrawing = false;
let currentStepIndex = 0;

// 💡 關鍵：中文到可靠的英文文件名的對應表
const BRAND_MAP = {
    "華碩": "asus",
    "小米": "mi",
    "三星": "samsung"
};

// 💡 核心：硬性定義流程順序
const FLOW_STEPS = [
    { key: "品牌", file: "brands.txt" },
    { key: "系列", file: "dynamic" }, 
    { key: "CPU", file: "file/cpu.txt" },
    { key: "電池容量", file: "file/battery.txt" },
    { key: "充電速度", file: "file/charge_speed.txt" },
    { key: "有無無線充電", file: "file/wireless_check.txt" },
    { key: "分辨率", file: "file/resolution.txt" },
    { key: "刷新率", file: "file/refresh_rate.txt" },
    { key: "記憶體 (RAM)", file: "file/ram.txt" },
    { key: "儲存空間 (ROM)", file: "file/rom.txt" },
    { key: "重量", file: "file/weight.txt" },
    { key: "起售價", file: "file/price.txt" },
];

const startButton = document.getElementById('start-button');
const wheelElement = document.getElementById('wheel');
const stepNameElement = document.getElementById('current-step-name');
const resultDisplay = document.getElementById('result-display');

// ... (省略 updateWheel, getRandomItem 助手函式) ...

// --- 核心流程控制：載入下一步的數據 ---

async function loadStep() {
    isDrawing = false;
    startButton.disabled = false;
    startButton.textContent = "抽取配置";

    if (currentStepIndex >= FLOW_STEPS.length) {
        showFinalAnimation();
        return;
    }

    const currentStep = FLOW_STEPS[currentStepIndex];
    let filePath = currentStep.file;
    
    // 🚩 核心修正區域：構造正確的檔案路徑
    
    if (currentStep.key === "品牌" || currentStep.key === "系列") {
        
        if (currentStep.file === "dynamic") {
            // 關鍵修正：使用 BRAND_MAP 將中文轉換為英文，確保檔案路徑可靠
            const chineseBrand = finalConfiguration["品牌"];
            const englishBrand = BRAND_MAP[chineseBrand];
            
            if (!englishBrand) {
                throw new Error(`[品牌路徑錯誤] 無法找到 ${chineseBrand} 的內部對應英文名。`);
            }
            // 構造系列檔案路徑 (series_asus.txt)
            filePath = `series_${englishBrand}.txt`; 
        }

        // 加上品牌資料夾的前綴
        filePath = `brand_data/${filePath}`;
        
    } 
    // 線性配置檔案的路徑 (例如 file/cpu.txt) 保持不變
    
    stepNameElement.textContent = currentStep.key;

    try {
        const response = await fetch(filePath); 
        if (!response.ok) throw new Error(`檔案不存在或路徑錯誤: ${filePath}`);
        
        const text = await response.text();
        
        const options = text.split('\n')
                            .map(line => line.trim())
                            .filter(opt => opt.length > 0);

        startButton.dataset.options = JSON.stringify(options);
        updateWheel(options.map(name => ({ name })));

    } catch (error) {
        console.error('流程載入錯誤:', error);
        // 顯示最關鍵的錯誤訊息
        wheelElement.textContent = `載入失敗 (${currentStep.key}): 請檢查檔案 ${filePath} 是否存在。`;
        startButton.disabled = true;
    }
}

// ... (省略 handleDraw, showFinalAnimation 邏輯，保持不變) ...

// --- 啟動與事件綁定 ---
window.addEventListener('load', loadStep);
startButton.addEventListener('click', handleDraw);
