// app.js - 最終穩健版：修正了所有可能的邏輯錯誤、路徑衝突，並包含所有所需功能。

const finalConfiguration = {}; 
let isDrawing = false;
let currentStepIndex = 0;

// 💡 品牌對應表 (處理 brand_data/series_xxx.txt)
const BRAND_MAP = {
    "華碩": "asus",
    "小米": "mi",
    "三星": "samsung",
    "OPPO":"oppo"
};

// 💡 CPU 品牌對應表 (處理 file/cpu_sets/xxx.txt)
const CPU_BRAND_MAP = {
    "高通": "qualcomm",
    "蘋果": "apple",
    "聯發科": "mediatek",
    "英特爾": "intel",
    "輝達": "nvidia" 
};


// 💡 核心：定義流程順序，file 屬性【只包含檔案名稱】
const FLOW_STEPS = [
    { key: "品牌", file: "brands.txt" },
    { key: "系列", file: "dynamic" },
    { key: "CPU品牌", file: "cpu_brand.txt"}, 
    { key: "CPU", file: "dynamic" },  
    { key: "電池容量", file: "battery.txt" },
    { key: "充電速度", file: "charge_speed.txt" },
    { key: "有無無線充電", file: "wireless_check.txt" },
    { key: "分辨率", file: "resolution.txt" },
    { key: "刷新率", file: "refresh_rate.txt" },
    { key: "記憶體 (RAM)", file: "ram.txt" },
    { key: "儲存空間 (ROM)", file: "rom.txt" },
    { key: "重量", file: "weight.txt" },
    { key: "起售價", file: "price.txt" },
];

const startButton = document.getElementById('start-button');
const wheelElement = document.getElementById('wheel');
const stepNameElement = document.getElementById('current-step-name');
const resultDisplay = document.getElementById('result-display');

// 助手函式：更新轉盤 UI
function updateWheel(options) {
    wheelElement.innerHTML = options.map(opt => opt.name).join(' | ');
    wheelElement.classList.remove('drawing'); 
    // 確保這裡清除了任何錯誤訊息
    if (options.length === 0) {
        wheelElement.textContent = "選項清單為空！請檢查 TXT 檔案內容。";
        startButton.disabled = true;
    }
}

// 助手函式：隨機抽取
function getRandomItem(array) {
    if (!array || array.length === 0) return { name: "N/A" };
    const randomIndex = Math.floor(Math.random() * array.length);
    return { name: array[randomIndex] }; 
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
    let fileName = currentStep.file;
    let finalPath = '';
    
    // 🚩 核心路徑邏輯：確保路徑精確
    
    if (currentStep.key === "品牌" || currentStep.key === "系列") {
        
        // 1. 品牌/系列邏輯 (brand_data/xxx.txt)
        if (currentStep.file === "dynamic") {
            const chineseBrand = finalConfiguration["品牌"];
            const englishBrand = BRAND_MAP[chineseBrand];
            if (!englishBrand) {
                 console.error(`BRAND_MAP Missing: ${chineseBrand}`);
                 wheelElement.textContent = `載入失敗: 品牌 [${chineseBrand}] 缺少內部對應路徑。請檢查 BRAND_MAP。`;
                 startButton.disabled = true;
                 return;
            }
            fileName = `series_${englishBrand}.txt`;
        }
        finalPath = `brand_data/${fileName}`;
        
    } else {
        
        // 2. 所有其他配置邏輯 (file/xxx.txt 或 file/cpu_sets/xxx.txt)
        
        if (currentStep.key === "CPU" && currentStep.file === "dynamic") {
            // 處理 CPU 型號的動態載入
            const chineseCPUBrand = finalConfiguration["CPU品牌"];
            const englishCPUBrand = CPU_BRAND_MAP[chineseCPUBrand];
            
            if (!englishCPUBrand) {
                 console.error(`CPU_BRAND_MAP Missing: ${chineseCPUBrand}`);
                 wheelElement.textContent = `載入失敗: CPU品牌 [${chineseCPUBrand}] 缺少內部對應路徑。請檢查 CPU_BRAND_MAP。`;
                 startButton.disabled = true;
                 return;
            }
            // 構造路徑：file/cpu_sets/qualcomm.txt
            finalPath = `file/cpu_sets/${englishCPUBrand}.txt`;
        } else {
            // 構造所有其他線性檔案路徑：file/xxx.txt (例如 cpu_brand.txt, battery.txt)
            finalPath = `file/${fileName}`;
        }
        
    }
    
    stepNameElement.textContent = currentStep.key;

    try {
        const response = await fetch(finalPath); 
        if (!response.ok) {
             // 如果 fetch 成功，但狀態碼不是 200 (例如 404)
             throw new Error(`檔案不存在或路徑錯誤 (HTTP ${response.status}): ${finalPath}`);
        }
        
        const text = await response.text();
        
        const options = text.split('\n')
                            .map(line => line.trim())
                            .filter(opt => opt.length > 0);

        startButton.dataset.options = JSON.stringify(options);
        updateWheel(options.map(name => ({ name })));

    } catch (error) {
        console.error('流程載入錯誤:', error);
        // 提供最清晰的錯誤訊息
        wheelElement.textContent = `載入失敗 (${currentStep.key}): 請檢查檔案 ${finalPath} 是否存在，或運行環境是否正確。`;
        startButton.disabled = true;
    }
}

// --- 處理抽獎事件 (不變) ---

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

// --- 最終顯示動畫 (不變) ---

function showFinalAnimation() {
    startButton.style.display = 'none';
    wheelElement.textContent = "配置抽取完成！🎉 最終結果已出爐！";
    stepNameElement.textContent = "最終結果";
    
    let finalConfigText = "--- 您的夢幻手機配置藍圖 (最終結果) ---\n";
    
    FLOW_STEPS.forEach(step => {
        const key = step.key;
        const value = finalConfiguration[key] || "未抽取";
        finalConfigText += `**${key.padEnd(14, ' ')}:** ${value}\n`;
    });
    finalConfigText += "--------------------------------------";

    resultDisplay.textContent = finalConfigText;
    resultDisplay.classList.add('show'); 
}

// --- 啟動與事件綁定 ---
window.addEventListener('load', loadStep);
startButton.addEventListener('click', handleDraw);
