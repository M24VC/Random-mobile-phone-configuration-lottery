// app.js - 最終版本：JS 控管流程，TXT 只提供數據
const finalConfiguration = {}; 
let isDrawing = false;
let currentStepIndex = 0;

// 💡 核心：硬性定義流程順序，與 TXT 檔案名稱對應
const FLOW_STEPS = [
    { key: "品牌", file: "brands.txt" },
    // 系列：此步驟的檔案名將在運行時根據抽到的品牌動態決定
    { key: "系列", file: "dynamic" }, 
    { key: "CPU", file: "cpu.txt" },
    { key: "電池容量", file: "battery.txt" },
    { key: "充電速度", file: "charge_speed.txt" },
    { key: "有無無線充電", file: "wireless_check.txt" },
    { key: "分辨率", file: "resolution.txt" },
    { key: "刷新率", file: "refresh_rate.txt" },
    { key: "記憶體 (RAM)", file: "ram.txt" },
    { key: "儲存空間 (ROM)", file: "rom.txt" },
    { key: "重量", file: "weight.txt" },
    { key: "起售價", file: "price.txt" }, // 最後一個步驟
];

const startButton = document.getElementById('start-button');
const wheelElement = document.getElementById('wheel');
const stepNameElement = document.getElementById('current-step-name');
const resultDisplay = document.getElementById('result-display');

// 助手函式：UI 更新
function updateWheel(options) {
    // 這裡只是簡單地將選項顯示在 wheel 區塊
    wheelElement.innerHTML = options.map(opt => opt.name).join(' | ');
    wheelElement.classList.remove('drawing'); 
}

// 助手函式：從陣列中隨機選取一個項目
function getRandomItem(array) {
    if (!array || array.length === 0) return { name: "N/A" };
    const randomIndex = Math.floor(Math.random() * array.length);
    return { name: array[randomIndex] }; // 以物件形式返回，方便通用處理
}

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
    
    // 💡 處理系列動態路徑：根據已抽取的品牌來決定讀取哪個系列檔案
    if (currentStep.file === "dynamic") {
        const brand = finalConfiguration["品牌"].toLowerCase().replace(/[^a-z]/g, ''); 
        // 假設檔案名為 series_asus.txt, series_mi.txt 等
        filePath = `series_${brand}.txt`;
    }

    stepNameElement.textContent = currentStep.key;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`無法載入檔案: ${filePath}`);
        
        const text = await response.text();
        
        // 💡 只讀取純選項列表，每行一個選項
        const options = text.split('\n')
                            .map(line => line.trim())
                            .filter(opt => opt.length > 0);

        // 將選項儲存到按鈕的 data 屬性
        startButton.dataset.options = JSON.stringify(options);
        updateWheel(options.map(name => ({ name }))); // UI 顯示選項

    } catch (error) {
        console.error('流程載入錯誤:', error);
        wheelElement.textContent = `載入錯誤 (${currentStep.key}): 請檢查檔案 ${filePath} 是否存在。`;
        startButton.disabled = true;
    }
}

// --- 處理抽獎事件 ---

function handleDraw() {
    if (isDrawing || currentStepIndex >= FLOW_STEPS.length) return;
    isDrawing = true;
    startButton.disabled = true;
    startButton.textContent = "抽取中...";
    wheelElement.classList.add('drawing');

    const options = JSON.parse(startButton.dataset.options);
    const result = getRandomItem(options);
    const resultName = result.name;
    
    wheelElement.textContent = `抽中: ${resultName}`; 

    // 模擬轉盤動畫延遲 (1.5 秒)
    setTimeout(() => {
        const currentStepKey = FLOW_STEPS[currentStepIndex].key;
        finalConfiguration[currentStepKey] = resultName;
        
        // 進入下一層
        currentStepIndex++; 
        loadStep();
    }, 1500); 
}

// --- 最終顯示動畫 (輸出層級文字) ---

function showFinalAnimation() {
    startButton.style.display = 'none';
    wheelElement.textContent = "配置抽取完成！🎉 最終結果已出爐！";
    stepNameElement.textContent = "最終結果";
    
    // 構造最終輸出的層級文字
    let finalConfigText = "--- 您的夢幻手機配置藍圖 (最終結果) ---\n";
    
    // 按照 FLOW_STEPS 的順序輸出
    FLOW_STEPS.forEach(step => {
        const key = step.key;
        const value = finalConfiguration[key] || "未抽取";
        // 模擬 GPT 的層級感：粗體和固定長度對齊
        finalConfigText += `**${key.padEnd(14, ' ')}:** ${value}\n`;
    });
    finalConfigText += "--------------------------------------";

    resultDisplay.textContent = finalConfigText;
    // 觸發 CSS 動畫
    resultDisplay.classList.add('show'); 
}

// --- 啟動與事件綁定 ---
window.addEventListener('load', loadStep); // 頁面載入完成後開始載入第一個步驟
startButton.addEventListener('click', handleDraw);
