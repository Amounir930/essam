// --- Core State ---
let records = JSON.parse(localStorage.getItem('essam_records')) || [];
let githubToken = localStorage.getItem('github_token') || '';
let currentExportType = ''; // 'essam' or 'amazon'

// --- DOM Elements ---
const list = document.getElementById('detailedReportsList');
const recordForm = document.getElementById('recordForm');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    recalculateAll();
    renderDetailedReports();
    setupEventListeners();
});

// --- Performance-Safe Rendering ---
let renderTimer;
function renderDetailedReports() {
    if (!list) return;
    clearTimeout(renderTimer);
    
    // Debounce to prevent lag during typing
    renderTimer = setTimeout(() => {
        const fromDate = document.getElementById('filterFrom')?.value;
        const toDate = document.getElementById('filterTo')?.value;
        const search = document.getElementById('searchTerm')?.value?.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'date-desc';

        let filtered = records.filter(r => {
            const matchesSearch = !search || r.date.includes(search) || String(r.collection).includes(search);
            return matchesSearch;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
            if (sortBy === 'amount-desc') return b.collection - a.collection;
            return 0;
        });

        // Update Summaries
        const tColl = filtered.reduce((s, r) => s + r.collection, 0);
        const tSupp = filtered.reduce((s, r) => s + r.supply, 0);
        
        document.getElementById('fTotalCollection').innerText = formatNumber(tColl);
        document.getElementById('fTotalSupply').innerText = formatNumber(tSupp);
        document.getElementById('fTotalAmazon').innerText = formatNumber(tColl - tSupp);

        if (filtered.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:#8b8ea8;">لا توجد بيانات</div>';
            return;
        }

        // Render limited set if huge, but usually fine for ledger
        list.innerHTML = filtered.map((r) => {
            const idx = records.indexOf(r);
            const d = new Date(r.date);
            const pending = r.collection - r.supply;
            return `
                <div class="record-strip-ledger">
                    <div class="l-date">
                        <span class="d-day">${d.toLocaleDateString('ar-EG', {weekday:'short'})}</span>
                        <span class="d-val">${d.toLocaleDateString('ar-EG', {day:'2-digit', month:'2-digit'})}</span>
                    </div>
                    <div class="l-val positive">${formatNumber(r.collection)}</div>
                    <div class="l-val negative">${formatNumber(r.supply)}</div>
                    <div class="l-val ${pending >=0 ? 'positive' : 'negative'}">${formatNumber(pending)}</div>
                    <div class="strip-actions">
                        <button class="btn-action" onclick="editRecord(${idx})"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" onclick="deleteRecord(${idx})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }, 50); // Small delay to batch updates
}

// --- Calculation Logic ---
function recalculateAll() {
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningBalance = 0;
    records.forEach(r => {
        r.startBalance = runningBalance;
        // Logic: End = Start + Collection + Insta - Supply - Cash - Purchases - Expenses - Essam
        r.endBalance = r.startBalance + r.collection + (r.instaShop||0) - (r.supply||0) - (r.cash||0) - (r.purchases||0) - (r.expenses||0) - (r.essam||0);
        r.diff = r.actualAmount - r.endBalance;
        runningBalance = r.actualAmount; // Carry over actual cash
    });
    save();
}

// --- Modals Logic ---
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
    document.getElementById('expFrom').value = "";
    document.getElementById('expTo').value = new Date().toISOString().split('T')[0];
    document.getElementById('exportModal').classList.add('active');
};

window.closeExportModal = () => document.getElementById('exportModal').classList.remove('active');

// --- Record Actions ---
recordForm.onsubmit = (e) => {
    e.preventDefault();
    const idx = document.getElementById('recordIndex').value;
    const data = {
        date: document.getElementById('date').value,
        collection: parseFloat(document.getElementById('collection').value) || 0,
        supply: parseFloat(document.getElementById('supply').value) || 0,
        essam: parseFloat(document.getElementById('essam').value) || 0,
        expenses: parseFloat(document.getElementById('expenses').value) || 0,
        actualAmount: parseFloat(document.getElementById('actualAmount').value) || 0,
        // Carry over hidden fields
        instaShop: 0, cash: 0, purchases: 0
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
    document.getElementById('supply').value = r.supply;
    document.getElementById('essam').value = r.essam;
    document.getElementById('expenses').value = r.expenses;
    document.getElementById('actualAmount').value = r.actualAmount;
    document.getElementById('recordModal').classList.add('active');
};

window.deleteRecord = (idx) => {
    if (confirm('هل أنت متأكد من حذف هذا اليوم؟')) {
        records.splice(idx, 1);
        recalculateAll();
        renderDetailedReports();
    }
};

// --- Exports ---
document.getElementById('btnExcelExp').onclick = () => exportReport('excel');
document.getElementById('btnPdfExp').onclick = () => window.print(); // Browser print handles PDF well with our CSS

function exportReport(format) {
    const from = document.getElementById('expFrom').value;
    const to = document.getElementById('expTo').value;
    const filtered = records.filter(r => (!from || r.date >= from) && (!to || r.date <= to));
    
    if (currentExportType === 'essam') exportEssamCSV(filtered, from, to);
    else exportAmazonCSV(filtered, from, to);
    closeExportModal();
}

function exportEssamCSV(data, f, t) {
    let csv = "sep=;\nالتاريخ;اليوم;المبلغ المسحوب\n";
    let total = 0;
    data.filter(r => r.essam > 0).forEach(r => {
        csv += `${r.date};${new Date(r.date).toLocaleDateString('ar-EG',{weekday:'long'})};${r.essam}\n`;
        total += r.essam;
    });
    csv += `\nالإجمالي;;${total}`;
    downloadFile(csv, `مصروفات_عصام_${f||'كل'}.csv`);
}

function exportAmazonCSV(data, f, t) {
    let csv = "sep=;\nالتاريخ;اليوم;تحصيل;توريد;الصافي\n";
    let tc=0, ts=0;
    data.forEach(r => {
        csv += `${r.date};${new Date(r.date).toLocaleDateString('ar-EG',{weekday:'long'})};${r.collection};${r.supply};${r.collection-r.supply}\n`;
        tc += r.collection; ts += r.supply;
    });
    csv += `\nالإجمالي;;${tc};${ts};${tc-ts}`;
    downloadFile(csv, `توريدات_أمازون_${f||'كل'}.csv`);
}

function downloadFile(content, name) {
    const blob = new Blob(["\uFEFF"+content], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

// --- Utilities ---
function save() { localStorage.setItem('essam_records', JSON.stringify(records)); }
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
    alert('تم حفظ الإعدادات');
    document.getElementById('settingsModal').classList.remove('active');
};
