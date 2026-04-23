const INITIAL_DATA = [
    { date: "2026-04-01", collection: 12160, cash: 2170, instaShop: 1685, purchases: 364, expenses: 250, essam: 150, actualAmount: 11545, supply: 0 },
    { date: "2026-04-02", collection: 5370, supply: 15600, cash: 740, instaShop: 0, purchases: 0, expenses: 100, essam: 150, actualAmount: 325 },
    { date: "2026-04-03", collection: 11110, cash: 1665, instaShop: 465, purchases: 660, expenses: 0, essam: 150, actualAmount: 9425, supply: 0 },
    { date: "2026-04-04", collection: 18280, supply: 8500, cash: 295, instaShop: 890, purchases: 660, expenses: 0, essam: 150, actualAmount: 18525 },
    { date: "2026-04-05", collection: 9495, supply: 18000, cash: 0, instaShop: 1055, purchases: 865, expenses: 0, essam: 150, actualAmount: 10155 },
    { date: "2026-04-06", collection: 14630, supply: 9500, cash: 1050, instaShop: 195, purchases: 150, expenses: 230, essam: 150, actualAmount: 13900 },
    { date: "2026-04-07", collection: 15430, supply: 13000, cash: 3175, instaShop: 70, purchases: 80, expenses: 0, essam: 150, actualAmount: 13460 },
    { date: "2026-04-08", collection: 21070, supply: 11500, cash: 5085, instaShop: 160, purchases: 1145, expenses: 0, essam: 150, actualAmount: 16780 },
    { date: "2026-04-09", collection: 14580, supply: 15000, cash: 4135, instaShop: 0, purchases: 0, expenses: 0, essam: 1150, actualAmount: 11075 },
    { date: "2026-04-10", collection: 12720, supply: 0, cash: 0, instaShop: 0, purchases: 815, expenses: 0, essam: 645, actualAmount: 22290 },
    { date: "2026-04-11", collection: 0, supply: 20000, cash: 0, instaShop: 0, purchases: 0, expenses: 0, essam: 0, actualAmount: 0 },
    { date: "2026-04-12", collection: 12175, supply: 0, cash: 0, instaShop: 160, purchases: 115, expenses: 400, essam: 150, actualAmount: 13960 },
    { date: "2026-04-13", collection: 14695, supply: 13000, cash: 735, instaShop: 30, purchases: 140, expenses: 0, essam: 150, actualAmount: 14660 },
    { date: "2026-04-14", collection: 16710, supply: 0, cash: 1265, instaShop: 1505, purchases: 1915, expenses: 0, essam: 150, actualAmount: 29595 },
    { date: "2026-04-15", collection: 12320, supply: 24850, cash: 5760, instaShop: 300, purchases: 450, expenses: 0, essam: 665, actualAmount: 10490 },
    { date: "2026-04-16", collection: 0, supply: 0, cash: 10490, instaShop: 0, purchases: 0, expenses: 0, essam: 0, actualAmount: 0 },
    { date: "2026-04-17", collection: 10860, supply: 0, cash: 0, instaShop: 0, purchases: 55, expenses: 200, essam: 150, actualAmount: 10455 },
    { date: "2026-04-18", collection: 12320, supply: 10000, cash: 2735, instaShop: 130, purchases: 715, expenses: 175, essam: 120, actualAmount: 9160 },
    { date: "2026-04-19", collection: 9480, supply: 9000, cash: 0, instaShop: 0, purchases: 100, expenses: 0, essam: 150, actualAmount: 9390 },
    { date: "2026-04-20", collection: 15460, supply: 0, cash: 9250, instaShop: 4665, purchases: 1440, expenses: 0, essam: 150, actualAmount: 18675 },
    { date: "2026-04-21", collection: 16385, supply: 0, cash: 25310, instaShop: 0, purchases: 0, expenses: 200, essam: 150, actualAmount: 9400 },
    { date: "2026-04-22", collection: 9050, supply: 17000, cash: 780, instaShop: 0, purchases: 105, expenses: 0, essam: 150, actualAmount: 415 }
];

// --- Core State ---
let records = JSON.parse(localStorage.getItem('financial_records')) || [];

// If still empty, use INITIAL_DATA
if (records.length === 0) {
    records = INITIAL_DATA;
}

let githubToken = localStorage.getItem('github_token') || '';
let currentExportType = ''; 

const list = document.getElementById('detailedReportsList');
const recordForm = document.getElementById('recordForm');

document.addEventListener('DOMContentLoaded', () => {
    recalculateAll();
    renderDetailedReports();
    setupEventListeners();
});

let renderTimer;
function renderDetailedReports() {
    if (!list) return;
    clearTimeout(renderTimer);
    
    renderTimer = setTimeout(() => {
        const search = document.getElementById('searchTerm')?.value?.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'date-desc';

        let filtered = records.filter(r => r.date.includes(search) || String(r.collection).includes(search));

        filtered.sort((a, b) => {
            if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
            if (sortBy === 'amount-desc') return b.collection - a.collection;
            return 0;
        });

        // Totals for filtered period
        const tColl = filtered.reduce((s, r) => s + r.collection, 0);
        const tSupp = filtered.reduce((s, r) => s + r.supply, 0);
        const amazonPending = tColl - tSupp;
        
        document.getElementById('fTotalCollection').innerText = formatNumber(tColl);
        document.getElementById('fTotalSupply').innerText = formatNumber(tSupp);
        document.getElementById('fTotalAmazon').innerText = formatNumber(amazonPending);

        if (filtered.length === 0) {
            list.innerHTML = '<div class="no-data-premium">لا توجد سجلات حالياً</div>';
            return;
        }

        list.innerHTML = filtered.map((r) => {
            const idx = records.indexOf(r);
            const d = new Date(r.date);
            const pending = r.collection - r.supply;
            const diffClass = r.diff >= 0 ? 'pos' : 'neg';
            return `
                <div class="ledger-row-premium">
                    <div class="col-date">
                        <span class="day-name">${d.toLocaleDateString('ar-EG', {weekday:'short'})}</span>
                        <span class="date-val">${d.toLocaleDateString('ar-EG', {day:'2-digit', month:'2-digit'})}</span>
                    </div>
                    <div class="col-val income">${formatNumber(r.collection)}</div>
                    <div class="col-val expense">${formatNumber(r.supply)}</div>
                    <div class="col-val ${pending >=0 ? 'income' : 'expense'}">${formatNumber(pending)}</div>
                    <div class="col-val-diff ${diffClass}">
                        <span>${r.diff >= 0 ? 'زيادة' : 'عجز'}</span>
                        <strong>${formatNumber(Math.abs(r.diff))}</strong>
                    </div>
                    <div class="col-actions">
                        <button onclick="editRecord(${idx})" class="btn-circle-edit"><i class="fas fa-pen"></i></button>
                        <button onclick="deleteRecord(${idx})" class="btn-circle-delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }, 50);
}

function recalculateAll() {
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningBalance = 640; // Starting balance of the first day (01/04)
    records.forEach(r => {
        r.startBalance = runningBalance;
        // Calculation Logic based on user's manual ledger:
        // Treasury = Start + Collection + Insta - Supply - Cash - Purchases - Expenses - Essam
        r.endBalance = r.startBalance + (r.collection||0) + (r.instaShop||0) - (r.supply||0) - (r.cash||0) - (r.purchases||0) - (r.expenses||0) - (r.essam||0);
        r.diff = (r.actualAmount||0) - r.endBalance;
        runningBalance = (r.actualAmount||0); 
    });
    save();
}

window.openAddModal = () => {
    recordForm.reset();
    document.getElementById('recordIndex').value = "";
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    document.getElementById('recordModal').classList.add('active');
};

window.closeAddModal = () => document.getElementById('recordModal').classList.remove('active');

window.openExportModal = (type) => {
    currentExportType = type;
    document.getElementById('exportTitle').innerText = type === 'essam' ? 'تقرير مصروفات عصام' : 'توريدات أمازون';
    document.getElementById('exportModal').classList.add('active');
};

window.closeExportModal = () => document.getElementById('exportModal').classList.remove('active');

recordForm.onsubmit = (e) => {
    e.preventDefault();
    const idx = document.getElementById('recordIndex').value;
    const data = {
        date: document.getElementById('date').value,
        collection: parseFloat(document.getElementById('collection').value) || 0,
        instaShop: parseFloat(document.getElementById('instaShop').value) || 0,
        supply: parseFloat(document.getElementById('supply').value) || 0,
        cash: parseFloat(document.getElementById('cash').value) || 0,
        purchases: parseFloat(document.getElementById('purchases').value) || 0,
        expenses: parseFloat(document.getElementById('expenses').value) || 0,
        essam: parseFloat(document.getElementById('essam').value) || 0,
        actualAmount: parseFloat(document.getElementById('actualAmount').value) || 0
    };

    if (idx === "") records.push(data);
    else records[idx] = data;

    recalculateAll();
    renderDetailedReports();
    closeAddModal();
};

window.editRecord = (idx) => {
    const r = records[idx];
    document.getElementById('recordIndex').value = idx;
    document.getElementById('date').value = r.date;
    document.getElementById('collection').value = r.collection;
    document.getElementById('instaShop').value = r.instaShop || 0;
    document.getElementById('supply').value = r.supply;
    document.getElementById('cash').value = r.cash || 0;
    document.getElementById('purchases').value = r.purchases || 0;
    document.getElementById('expenses').value = r.expenses;
    document.getElementById('essam').value = r.essam;
    document.getElementById('actualAmount').value = r.actualAmount;
    document.getElementById('recordModal').classList.add('active');
};

window.deleteRecord = (idx) => {
    if (confirm('حذف هذا اليوم نهائياً؟')) {
        records.splice(idx, 1);
        recalculateAll();
        renderDetailedReports();
    }
};

document.getElementById('btnExcelExp').onclick = () => {
    const f = document.getElementById('expFrom').value;
    const t = document.getElementById('expTo').value;
    const data = records.filter(r => (!f || r.date >= f) && (!t || r.date <= t));
    
    if (currentExportType === 'essam') {
        let csv = "sep=;\nالتاريخ;اليوم;المبلغ\n";
        let tot = 0;
        data.filter(r => r.essam > 0).forEach(r => {
            csv += `${r.date};${new Date(r.date).toLocaleDateString('ar-EG',{weekday:'long'})};${r.essam}\n`;
            tot += r.essam;
        });
        csv += `\nالإجمالي;;${tot}`;
        downloadCSV(csv, `مصروفات_عصام.csv`);
    } else {
        let csv = "sep=;\nالتاريخ;اليوم;تحصيل;توريد;صافي\n";
        let tc=0, ts=0;
        data.forEach(r => {
            csv += `${r.date};${new Date(r.date).toLocaleDateString('ar-EG',{weekday:'long'})};${r.collection};${r.supply};${r.collection-r.supply}\n`;
            tc += r.collection; ts += r.supply;
        });
        csv += `\nالإجمالي;;${tc};${ts};${tc-ts}`;
        downloadCSV(csv, `توريدات_أمازون.csv`);
    }
    closeExportModal();
};

function downloadCSV(c, n) {
    const b = new Blob(["\uFEFF"+c], {type: 'text/csv;charset=utf-8;'});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = n; a.click();
}

function save() { localStorage.setItem('financial_records', JSON.stringify(records)); }
function formatNumber(n) { return Number(n).toLocaleString('en-US', {minimumFractionDigits:2}); }

function setupEventListeners() {
    document.getElementById('searchTerm').oninput = renderDetailedReports;
    document.getElementById('sortBy').onchange = renderDetailedReports;
    document.getElementById('btnEssamReport').onclick = () => openExportModal('essam');
    document.getElementById('btnAmazonReport').onclick = () => openExportModal('amazon');
    document.getElementById('navSettings').onclick = () => document.getElementById('settingsModal').classList.add('active');
}

window.saveSettings = () => {
    githubToken = document.getElementById('githubToken').value;
    localStorage.setItem('github_token', githubToken);
    alert('تم الحفظ');
    document.getElementById('settingsModal').classList.remove('active');
};
