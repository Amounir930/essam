// Essam OS - Application Logic Phase 2 (Stable Multi-page)

// --- Constants & State ---
const STORAGE_KEY = 'essam_os_records';
const SETTINGS_KEY = 'essam_os_settings';

const INITIAL_RECORDS = [
    { date: '2026-04-01', startBalance: 640, collection: 12160, supply: 0, cash: 2170, instaShop: 1685, purchases: 364, expenses: 406, essam: 0, actualAmount: 11545, endBalance: 11545, diff: 0 },
    { date: '2026-04-02', startBalance: 11545, collection: 5370, supply: 15600, cash: 740, instaShop: 0, purchases: 0, expenses: 250, essam: 0, actualAmount: 325, endBalance: 325, diff: 0 },
    { date: '2026-04-03', startBalance: 325, collection: 11110, supply: 0, cash: 1665, instaShop: 465, purchases: 660, expenses: 150, essam: 0, actualAmount: 9425, endBalance: 9425, diff: 0 },
    { date: '2026-04-04', startBalance: 9425, collection: 18280, supply: 8500, cash: 295, instaShop: 890, purchases: 660, expenses: 150, essam: 0, actualAmount: 18990, endBalance: 18990, diff: 0 },
    { date: '2026-04-05', startBalance: 18990, collection: 9495, supply: 18000, cash: 0, instaShop: 1055, purchases: 865, expenses: 150, essam: 0, actualAmount: 10525, endBalance: 10525, diff: 0 },
    { date: '2026-04-06', startBalance: 10525, collection: 14630, supply: 9500, cash: 1050, instaShop: 195, purchases: 150, expenses: 350, essam: 0, actualAmount: 14300, endBalance: 14300, diff: 0 },
    { date: '2026-04-07', startBalance: 14300, collection: 15430, supply: 13000, cash: 3175, instaShop: 70, purchases: 80, expenses: 150, essam: 0, actualAmount: 13395, endBalance: 13395, diff: 0 },
    { date: '2026-04-08', startBalance: 13395, collection: 21070, supply: 11500, cash: 5085, instaShop: 160, purchases: 1145, expenses: 150, essam: 0, actualAmount: 16745, endBalance: 16745, diff: 0 },
    { date: '2026-04-09', startBalance: 16745, collection: 14580, supply: 15000, cash: 4135, instaShop: 0, purchases: 0, expenses: 150, essam: 0, actualAmount: 12040, endBalance: 12040, diff: 0 },
    { date: '2026-04-10', startBalance: 12040, collection: 12720, supply: 0, cash: 0, instaShop: 0, purchases: 815, expenses: 150, essam: 495, actualAmount: 23300, endBalance: 23300, diff: 0 },
    { date: '2026-04-11', startBalance: 23795, collection: 0, supply: 20000, cash: 0, instaShop: 0, purchases: 0, expenses: 0, essam: 0, actualAmount: 3795, endBalance: 3795, diff: 0 },
    { date: '2026-04-12', startBalance: 3795, collection: 12175, supply: 0, cash: 0, instaShop: 160, purchases: 115, expenses: 550, essam: 0, actualAmount: 15465, endBalance: 15465, diff: 0 },
    { date: '2026-04-13', startBalance: 15465, collection: 14695, supply: 13000, cash: 735, instaShop: 30, purchases: 140, expenses: 150, essam: 0, actualAmount: 16165, endBalance: 16165, diff: 0 },
    { date: '2026-04-14', startBalance: 16165, collection: 16710, supply: 0, cash: 1265, instaShop: 1505, purchases: 1915, expenses: 150, essam: 0, actualAmount: 31050, endBalance: 31050, diff: 0 },
    { date: '2026-04-15', startBalance: 31050, collection: 12320, supply: 24850, cash: 5760, instaShop: 300, purchases: 450, expenses: 665, essam: 0, actualAmount: 11945, endBalance: 11945, diff: 0 },
    { date: '2026-04-16', startBalance: 11945, collection: 0, supply: 0, cash: 10490, instaShop: 0, purchases: 0, expenses: 0, essam: 0, actualAmount: 1455, endBalance: 1455, diff: 0 },
    { date: '2026-04-17', startBalance: 1455, collection: 10860, supply: 10000, cash: 0, instaShop: 0, purchases: 55, expenses: 350, essam: 0, actualAmount: 1910, endBalance: 1910, diff: 0 },
    { date: '2026-04-18', startBalance: 1910, collection: 12320, supply: 0, cash: 2735, instaShop: 130, purchases: 715, expenses: 295, essam: 0, actualAmount: 10615, endBalance: 10615, diff: 0 },
    { date: '2026-04-19', startBalance: 10615, collection: 9480, supply: 9000, cash: 0, instaShop: 0, purchases: 100, expenses: 150, essam: 0, actualAmount: 10845, endBalance: 10845, diff: 0 },
    { date: '2026-04-20', startBalance: 10845, collection: 15460, supply: 0, cash: 9250, instaShop: 4665, purchases: 1440, expenses: 150, essam: 0, actualAmount: 20130, endBalance: 20130, diff: 0 },
    { date: '2026-04-21', startBalance: 20130, collection: 16385, supply: 7000, cash: 25310, instaShop: 0, purchases: 0, expenses: 350, essam: 0, actualAmount: 3855, endBalance: 3855, diff: 0 },
    { date: '2026-04-22', startBalance: 3855, collection: 9050, supply: 10000, cash: 780, instaShop: 105, purchases: 0, expenses: 150, essam: 0, actualAmount: 2080, endBalance: 2080, diff: 0 }
];

let records = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!records || records.length === 0) {
    records = INITIAL_RECORDS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { token: '', repo: 'Amounir930/essam' };
let editIndex = -1;

// --- Selectors ---
const modal = document.getElementById('recordModal');
const settingsModal = document.getElementById('settingsModal');
const recordForm = document.getElementById('recordForm');
const recordsList = document.getElementById('recordsList');

const totalBalanceEl = document.getElementById('totalBalance');
const totalActualEl = document.getElementById('totalActual');
const totalDiffEl = document.getElementById('totalDiff');
const todayIncomeEl = document.getElementById('todayIncome');
const todayEssamEl = document.getElementById('todayEssam');
const todayExpenseEl = document.getElementById('todayExpense');

const detailedReportsList = document.getElementById('detailedReportsList');
const currentDateEl = document.getElementById('currentDate');
const diffCard = document.getElementById('diffCard');

// --- Initialization ---
function init() {
    updateSummary();
    renderRecords();
    renderDetailedReports();
    setCurrentDate();
    setupEventListeners();
    loadSettings();
}

function setCurrentDate() {
    if (!currentDateEl) return;
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerText = now.toLocaleDateString('ar-EG', options);
}

function loadSettings() {
    if (document.getElementById('ghToken')) document.getElementById('ghToken').value = settings.token;
    if (document.getElementById('ghRepo')) document.getElementById('ghRepo').value = settings.repo;
}

// --- Logic Functions ---

function updateSummary() {
    if (records.length === 0) return;

    const lastRecord = records[records.length - 1];
    
    if (totalBalanceEl) totalBalanceEl.innerText = formatNumber(lastRecord.endBalance);
    if (totalActualEl) totalActualEl.innerText = formatNumber(lastRecord.actualAmount || 0);
    
    const diff = lastRecord.diff || 0;
    if (totalDiffEl) totalDiffEl.innerText = formatNumber(diff);
    
    if (diffCard) {
        diffCard.className = 'mini-card deficit ' + (diff < 0 ? 'is-deficit' : (diff > 0 ? 'is-surplus' : ''));
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === todayStr);
    
    const income = todayRecords.reduce((sum, r) => sum + r.collection + r.instaShop, 0);
    const essamExp = todayRecords.reduce((sum, r) => sum + r.essam, 0);
    const expense = todayRecords.reduce((sum, r) => sum + (r.supply + r.cash + r.purchases + r.expenses), 0);

    if (todayIncomeEl) todayIncomeEl.innerText = formatNumber(income);
    if (todayEssamEl) todayEssamEl.innerText = formatNumber(essamExp);
    if (todayExpenseEl) todayExpenseEl.innerText = formatNumber(expense);
}

function renderRecords() {
    if (!recordsList) return;
    if (records.length === 0) {
        recordsList.innerHTML = '<div class="no-data">لا توجد سجلات بعد</div>';
        return;
    }
    // We keep this empty for index if we want it gone, 
    // but the user might still want a small summary. 
    // For now, let's just make it empty if it's index.
    recordsList.innerHTML = ''; 
}

function renderDetailedReports() {
    if (!detailedReportsList) return;
    if (records.length === 0) {
        detailedReportsList.innerHTML = '<div class="no-data">لا توجد بيانات بعد</div>';
        return;
    }

    // Get filter & sort values
    const fromDate = document.getElementById('filterFrom')?.value;
    const toDate = document.getElementById('filterTo')?.value;
    const search = document.getElementById('searchTerm')?.value?.toLowerCase() || '';
    const sortBy = document.getElementById('sortBy')?.value || 'date-desc';

    let filtered = records.filter(r => {
        const d = r.date;
        const matchesDate = (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
        const matchesSearch = !search || 
            d.includes(search) || 
            String(r.collection).includes(search) || 
            String(r.supply).includes(search) || 
            String(r.endBalance).includes(search);
        return matchesDate && matchesSearch;
    });

    // Sorting Logic
    filtered.sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.collection - a.collection;
        if (sortBy === 'amount-asc') return a.collection - b.collection;
        return 0;
    });

    // Amazon Focus Summary
    const totalColl = filtered.reduce((sum, r) => sum + r.collection, 0);
    const totalSupply = filtered.reduce((sum, r) => sum + r.supply, 0);
    const amazonBalance = totalColl - totalSupply; // What we have minus what we sent

    if (document.getElementById('fTotalCollection')) document.getElementById('fTotalCollection').innerText = formatNumber(totalColl);
    if (document.getElementById('fTotalSupply')) document.getElementById('fTotalSupply').innerText = formatNumber(totalSupply);
    if (document.getElementById('fTotalAmazon')) {
        document.getElementById('fTotalAmazon').innerText = formatNumber(amazonBalance);
        document.getElementById('fTotalAmazon').parentElement.className = 'f-card amazon ' + (amazonBalance >= 0 ? 'surplus' : 'deficit');
    }

    if (filtered.length === 0) {
        detailedReportsList.innerHTML = '<div class="no-data">لا توجد نتائج</div>';
        return;
    }

    const sortedRecords = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Strip Layout (Ledger Style)
    detailedReportsList.innerHTML = sortedRecords.map((r) => {
        const index = records.indexOf(r);
        const d = new Date(r.date);
        const dateStr = d.toLocaleDateString('ar-EG', {day:'2-digit', month:'2-digit'});
        const dayName = d.toLocaleDateString('ar-EG', {weekday:'short'});
        const pending = r.collection - r.supply;
        
        return `
            <div class="record-strip-ledger">
                <div class="l-date">
                    <span class="d-day">${dayName}</span>
                    <span class="d-val">${dateStr}</span>
                </div>
                <div class="l-val positive">${formatNumber(r.collection)}</div>
                <div class="l-val negative">${formatNumber(r.supply)}</div>
                <div class="l-val ${pending >= 0 ? 'positive' : 'negative'}">${formatNumber(pending)}</div>
                <div class="strip-actions">
                    <button class="btn-action edit" onclick="editRecord(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" onclick="deleteRecord(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

window.generateEssamReport = function() {
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const filtered = records.filter(r => {
        const d = r.date;
        return (!from || d >= from) && (!to || d <= to) && r.essam > 0;
    });

    if (filtered.length === 0) return alert('لا توجد مصروفات لعصام في هذه الفترة');

    let csvContent = "\uFEFFالتاريخ,اليوم,المبلغ\n";
    let total = 0;
    filtered.forEach(r => {
        const dayName = new Date(r.date).toLocaleDateString('ar-EG', {weekday: 'long'});
        csvContent += `${r.date},${dayName},${r.essam}\n`;
        total += r.essam;
    });
    csvContent += `\nالإجمالي,,${total}`;

    downloadCSV(csvContent, `مصروفات_عصام_${from || 'كل_المدة'}.csv`);
};

window.generateAmazonReport = function() {
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const filtered = records.filter(r => {
        const d = r.date;
        return (!from || d >= from) && (!to || d <= to);
    });

    if (filtered.length === 0) return alert('لا توجد بيانات في هذه الفترة');

    let csvContent = "\uFEFFالتاريخ,اليوم,التحصيل,التوريد,الصافي المعلق\n";
    let tColl = 0, tSupp = 0;
    filtered.forEach(r => {
        const dayName = new Date(r.date).toLocaleDateString('ar-EG', {weekday: 'long'});
        const pending = r.collection - r.supply;
        csvContent += `${r.date},${dayName},${r.collection},${r.supply},${pending}\n`;
        tColl += r.collection;
        tSupp += r.supply;
    });
    csvContent += `\nالإجماليات,,${tColl},${tSupp},${tColl - tSupp}`;

    downloadCSV(csvContent, `تقرير_أمازون_${from || 'كل_المدة'}.csv`);
};

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatNumber(num) {
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.deleteRecord = function(index) {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        records.splice(index, 1);
        recalculateAll();
        saveAndRefresh();
    }
};

window.editRecord = function(index) {
    editIndex = index;
    const r = records[index];
    if (!modal) return;
    
    document.getElementById('date').value = r.date;
    document.getElementById('startBalance').value = r.startBalance;
    document.getElementById('collection').value = r.collection;
    document.getElementById('supply').value = r.supply;
    document.getElementById('cash').value = r.cash;
    document.getElementById('instaShop').value = r.instaShop;
    document.getElementById('purchases').value = r.purchases;
    document.getElementById('expenses').value = r.expenses;
    document.getElementById('essam').value = r.essam;
    document.getElementById('actualAmount').value = r.actualAmount;
    
    document.querySelector('#recordModal h3').innerText = 'تعديل سجل';
    modal.classList.add('active');
};

function recalculateAll() {
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    records.forEach((r, i) => {
        if (i > 0) r.startBalance = records[i-1].endBalance;
        r.endBalance = r.startBalance + r.collection + r.instaShop - 
                      (r.supply + r.cash + r.purchases + r.expenses + r.essam);
        r.diff = (r.actualAmount || 0) - r.endBalance;
    });
}

function saveAndRefresh() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    updateSummary();
    renderDetailedReports();
}

async function uploadToGitHub(file, date) {
    if (!settings.token) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const fileName = `supply_${date}_${Date.now()}.png`;
        const url = `https://api.github.com/repos/${settings.repo}/contents/توريدات/${fileName}`;
        try {
            await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `token ${settings.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Upload supply image for ${date}`, content: base64Content })
            });
            alert('تم رفع الصورة بنجاح');
        } catch (error) { console.error(error); }
    };
}

function setupEventListeners() {
    // Advanced Filters
    if (document.getElementById('filterFrom')) document.getElementById('filterFrom').addEventListener('input', renderDetailedReports);
    if (document.getElementById('filterTo')) document.getElementById('filterTo').addEventListener('input', renderDetailedReports);
    if (document.getElementById('searchTerm')) document.getElementById('searchTerm').addEventListener('input', renderDetailedReports);
    if (document.getElementById('sortBy')) document.getElementById('sortBy').addEventListener('change', renderDetailedReports);

    // Specialized Reports
    if (document.getElementById('btnEssamReport')) document.getElementById('btnEssamReport').addEventListener('click', window.generateEssamReport);
    if (document.getElementById('btnAmazonReport')) document.getElementById('btnAmazonReport').addEventListener('click', window.generateAmazonReport);

    if (document.getElementById('navSettings')) {
        document.getElementById('navSettings').addEventListener('click', (e) => {
            e.preventDefault();
            settingsModal.classList.add('active');
        });
    }

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
            if (settingsModal) settingsModal.classList.remove('active');
            editIndex = -1;
        });
    });

    if (document.getElementById('supplyImage')) {
        document.getElementById('supplyImage').addEventListener('change', (e) => {
            if (document.getElementById('fileName'))
                document.getElementById('fileName').innerText = e.target.files[0] ? e.target.files[0].name : '';
        });
    }

    const addRecordBtn = document.getElementById('addRecordBtn');
    if (addRecordBtn) {
        addRecordBtn.addEventListener('click', () => {
            editIndex = -1;
            document.getElementById('startBalance').value = records.length > 0 ? records[records.length-1].endBalance : 0;
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
            modal.classList.add('active');
        });
    }

    if (recordForm) {
        recordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const record = {
                date: document.getElementById('date').value,
                startBalance: parseFloat(document.getElementById('startBalance').value || 0),
                collection: parseFloat(document.getElementById('collection').value || 0),
                supply: parseFloat(document.getElementById('supply').value || 0),
                cash: parseFloat(document.getElementById('cash').value || 0),
                instaShop: parseFloat(document.getElementById('instaShop').value || 0),
                purchases: parseFloat(document.getElementById('purchases').value || 0),
                expenses: parseFloat(document.getElementById('expenses').value || 0),
                essam: parseFloat(document.getElementById('essam').value || 0),
                actualAmount: parseFloat(document.getElementById('actualAmount').value || 0)
            };
            const fileInput = document.getElementById('supplyImage');
            if (fileInput && fileInput.files[0]) await uploadToGitHub(fileInput.files[0], record.date);
            if (editIndex > -1) records[editIndex] = record;
            else records.push(record);
            recalculateAll();
            saveAndRefresh();
            modal.classList.remove('active');
            recordForm.reset();
        });
    }

    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            settings.token = document.getElementById('ghToken').value;
            settings.repo = document.getElementById('ghRepo').value;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            settingsModal.classList.remove('active');
            alert('تم حفظ الإعدادات');
        });
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (records.length === 0) return alert('لا توجد بيانات');
            let csvContent = "data:text/csv;charset=utf-8,اليوم,بداية اليوم,التحصيل,توريد,تحويل كاش,اوردرات انستا,مشتريات,مصروفات محل,مصروفات عصام,مبلغ الخزنة,المبلغ الفعلي,عجز/زيادة\n";
            records.forEach(r => {
                csvContent += `${r.date},${r.startBalance},${r.collection},${r.supply},${r.cash},${r.instaShop},${r.purchases},${r.expenses},${r.essam},${r.endBalance},${r.actualAmount || 0},${r.diff || 0}\n`;
            });
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `report.csv`);
            link.click();
        });
    }
}

init();
