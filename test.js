document.body.innerHTML = `
<div id="h5container" style="background:#1a1a1a; color:#eee; font-family:sans-serif; padding:15px; min-height:100vh;">
    <h3 style="text-align:center; color:#00ff88; margin-bottom:15px;">h5gg Pro Tool</h3>
    
    <div style="background:#333; padding:12px; border-radius:8px; margin-bottom:15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <input type="text" id="searchVal" placeholder="数値を入力" style="width:100%; padding:10px; background:#000; color:#fff; border:1px solid #555; border-radius:4px; margin-bottom:10px; box-sizing:border-box;">
        
        <div style="display:flex; gap:10px; margin-bottom:10px;">
            <select id="dataType" style="flex:1; padding:10px; background:#444; color:#fff; border:none; border-radius:4px;">
                <option value="I32">I32</option>
                <option value="F32">F32</option>
                <option value="I64">I64</option>
                <option value="F64">F64</option>
            </select>
            <button onclick="clearResults()" style="flex:1; padding:10px; background:#666; color:#fff; border:none; border-radius:4px;">リセット</button>
        </div>

        <div style="display:flex; gap:10px;">
            <button onclick="newSearch()" style="flex:1; padding:12px; background:#007bff; color:#fff; border:none; border-radius:4px; font-weight:bold;">新規検索</button>
            <button onclick="refineSearch()" style="flex:1; padding:12px; background:#28a745; color:#fff; border:none; border-radius:4px; font-weight:bold;">絞り込み</button>
        </div>
    </div>

    <div id="resultList" style="max-height:400px; overflow-y:auto; border-top:1px solid #444; padding-top:10px;">
        </div>
</div>
`;

let freezeList = {}; 

// 1. 新規検索
window.newSearch = () => {
    const val = document.getElementById('searchVal').value;
    const type = document.getElementById('dataType').value;
    if(!val) return alert("数値を入力してください");

    h5gg.clearResults(); // 前の結果をクリア
    h5gg.searchNumber(val, type, '0x100000000', '0x200000000');
    renderResults();
};

// 2. 絞り込み (現在ある結果からさらに検索)
window.refineSearch = () => {
    const val = document.getElementById('searchVal').value;
    const type = document.getElementById('dataType').value;
    if(!val) return alert("絞り込む数値を入力してください");

    h5gg.searchNumber(val, type, '0x100000000', '0x200000000');
    renderResults();
};

// 結果のリセット
window.clearResults = () => {
    h5gg.clearResults();
    renderResults();
    alert("リセットしました");
};

// 結果一覧の描画
window.renderResults = () => {
    const count = h5gg.getResultsCount();
    const results = h5gg.getResults(100); 
    const listDiv = document.getElementById('resultList');
    listDiv.innerHTML = `<p style="font-size:12px; color:#00ff88;">ヒット件数: ${count}</p>`;

    results.forEach((res, i) => {
        const div = document.createElement('div');
        div.style = "background:#252525; margin-bottom:8px; padding:10px; border-radius:6px; display:flex; align-items:center; justify-content:space-between; font-size:13px; border-left:4px solid #555;";
        
        const isFreezing = !!freezeList[res.address];
        
        div.innerHTML = `
            <div style="flex-grow:1;">
                <div style="color:#00ff88; font-weight:bold; cursor:pointer;" onclick="copyAddr('${res.address}')">${res.address}</div>
                <div style="color:#ddd; font-size:11px;">Current: ${res.value}</div>
            </div>
            <div style="display:flex; gap:5px;">
                <button id="fz-${i}" onclick="toggleFreeze('${res.address}', '${res.value}')" 
                    style="background:${isFreezing ? '#ff4444' : '#444'}; color:#fff; border:none; padding:6px 12px; border-radius:4px; min-width:60px;">
                    ${isFreezing ? '解除' : '固定'}
                </button>
            </div>
        `;
        listDiv.appendChild(div);
    });
};

window.copyAddr = (addr) => {
    navigator.clipboard.writeText(addr);
    alert("Address Copied!");
};

window.toggleFreeze = (addr, val) => {
    const type = document.getElementById('dataType').value;
    
    if (freezeList[addr]) {
        clearInterval(freezeList[addr]);
        delete freezeList[addr];
    } else {
        // 設定値の入力を促す（現在の値で固定するか、新しい値にするか）
        const newVal = prompt("固定する値を入力してください", val);
        if(newVal === null) return;

        freezeList[addr] = setInterval(() => {
            h5gg.setValue(addr, newVal, type);
        }, 100);
    }
    renderResults(); 
};
