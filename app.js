// --- PERFECTIONIST CORE ENGINE ---
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

let records = JSON.parse(localStorage.getItem('financial_records')) || INITIAL_DATA;
let currentReportType = '';
let deleteIndex = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    recalculateAll();
    renderAll();
    setupCoreListeners();
});

// --- THEME ENGINE ---
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// --- RENDER PIPELINE ---
function renderAll() {
    const list = document.getElementById('detailedReportsList');
    const search = document.getElementById('searchTerm')?.value?.toLowerCase() || '';
    const sortBy = document.getElementById('sortBy')?.value || 'date-desc';

    let filtered = records.filter(r => r.date.includes(search) || String(r.collection).includes(search));
    filtered.sort((a, b) => (sortBy === 'date-desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));

    const tColl = filtered.reduce((s, r) => s + r.collection, 0);
    const tSupp = filtered.reduce((s, r) => s + r.supply, 0);
    document.getElementById('fTotalCollection').innerText = formatNumber(tColl);
    document.getElementById('fTotalSupply').innerText = formatNumber(tSupp);
    document.getElementById('fTotalAmazon').innerText = formatNumber(tColl - tSupp);

    list.innerHTML = filtered.map((r) => {
        const idx = records.indexOf(r);
        return `
            <tr>
                <td><strong>${r.date}</strong><br><small>${new Date(r.date).toLocaleDateString('ar-EG',{weekday:'short'})}</small></td>
                <td class="val" style="color:var(--success)">${formatNumber(r.collection)}</td>
                <td class="val" style="color:var(--danger)">${formatNumber(r.supply)}</td>
                <td class="val">${formatNumber(r.collection-r.supply)}</td>
                <td><span class="status-tag ${r.diff >= 0 ? 'pos' : 'neg'}">${r.diff >= 0 ? 'مطابق' : 'عجز'}</span></td>
                <td class="actions">
                    <button onclick="editRecord(${idx})" class="btn-icon" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord(${idx})" class="btn-icon delete" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function recalculateAll() {
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    let balance = 640; 
    records.forEach(r => {
        r.startBalance = balance;
        r.endBalance = r.startBalance + (r.collection||0) + (r.instaShop||0) - (r.supply||0) - (r.cash||0) - (r.purchases||0) - (r.expenses||0) - (r.essam||0);
        r.diff = (r.actualAmount||0) - r.endBalance;
        balance = r.actualAmount || 0;
    });
    localStorage.setItem('financial_records', JSON.stringify(records));
}

// --- MODAL CONTROLS ---
window.openAddModal = () => {
    document.getElementById('recordForm').reset();
    document.getElementById('recordIndex').value = "";
    document.getElementById('invoiceUrl').value = "";
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    document.getElementById('recordModal').classList.add('active');
};
window.closeAddModal = () => document.getElementById('recordModal').classList.remove('active');

window.openReportModal = (type) => {
    currentReportType = type;
    document.getElementById('repTitle').innerText = type === 'essam' ? 'إعداد تقرير مصروفات عصام' : 'إعداد تقرير توريد أمازون';
    document.getElementById('repFrom').value = "";
    document.getElementById('repTo').value = new Date().toISOString().split('T')[0];
    document.getElementById('reportModal').classList.add('active');
};
window.closeReportModal = () => document.getElementById('reportModal').classList.remove('active');

window.closeConfirmModal = () => document.getElementById('confirmModal').classList.remove('active');

// --- ACTIONS ---
document.getElementById('recordForm').onsubmit = async (e) => {
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
        actualAmount: parseFloat(document.getElementById('actualAmount').value) || 0,
        invoiceUrl: document.getElementById('invoiceUrl').value
    };
    if (idx === "") records.push(data); else records[idx] = data;
    recalculateAll(); renderAll(); closeAddModal();
    showToast("تم الحفظ بنجاح", "success");
};

window.editRecord = (idx) => {
    const r = records[idx];
    document.getElementById('recordIndex').value = idx;
    const fields = ['date', 'collection', 'instaShop', 'supply', 'cash', 'purchases', 'expenses', 'essam', 'actualAmount', 'invoiceUrl'];
    fields.forEach(f => { if (document.getElementById(f)) document.getElementById(f).value = r[f] || (f === 'date' ? "" : 0); });
    document.getElementById('recordModal').classList.add('active');
};

window.deleteRecord = (idx) => {
    deleteIndex = idx;
    document.getElementById('confirmModal').classList.add('active');
};

document.getElementById('confirmBtn').onclick = () => {
    if (deleteIndex !== null) {
        records.splice(deleteIndex, 1);
        recalculateAll(); renderAll(); closeConfirmModal();
        showToast("تم حذف السجل نهائياً", "success");
    }
};

// --- GITHUB PIPELINE ---
const uploadZone = document.getElementById('uploadZone');
uploadZone.addEventListener('click', () => document.getElementById('invoiceFile').click());
document.getElementById('invoiceFile').addEventListener('change', (e) => handleFileUpload(e.target.files[0]));

async function handleFileUpload(file) {
    if (!file) return;
    const status = document.getElementById('uploadStatus');
    status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الرفع...';
    const reader = new FileReader();
    reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const path = `Invoices/INV_${Date.now()}_${file.name}`;
        const success = await pushToGitHub(base64, path);
        if (success) {
            document.getElementById('invoiceUrl').value = `https://github.com/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${path}?raw=true`;
            status.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success)"></i> تم الرفع';
            showToast("تمت الأرشفة السحابية", "success");
        } else {
            status.innerHTML = '<i class="fas fa-times-circle" style="color:var(--danger)"></i> فشل الرفع';
            showToast("خطأ في المزامنة", "error");
        }
    };
    reader.readAsDataURL(file);
}

async function pushToGitHub(content, path) {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.repo}/contents/${path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_CONFIG.token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Upload ${path}`, content, branch: GITHUB_CONFIG.branch })
        });
        return response.ok;
    } catch (e) { return false; }
}

// --- SYNC ---
document.getElementById('btnSyncGithub').onclick = async () => {
    const btn = document.getElementById('btnSyncGithub');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    let csv = "sep=;\nDate;Collection;Supply;Net\n";
    records.forEach(r => csv += `${r.date};${r.collection};${r.supply};${r.collection-r.supply}\n`);
    const success = await pushToGitHub(btoa(unescape(encodeURIComponent(csv))), `Supply_Reports/Rpt_${Date.now()}.csv`);
    btn.innerHTML = success ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
    showToast(success ? "تمت المزامنة" : "فشل المزامنة", success ? "success" : "error");
    setTimeout(() => btn.innerHTML = orig, 2000);
};

// --- EXPORT ---
window.exportReport = (format) => {
    const from = document.getElementById('repFrom').value;
    const to = document.getElementById('repTo').value;
    if (!from || !to) { showToast("يرجى تحديد التاريخ", "error"); return; }
    
    const filtered = records.filter(r => r.date >= from && r.date <= to);
    if (format === 'pdf') {
        const printContainer = document.getElementById('printTemplate');
        let rows = ""; let tColl = 0, tSupp = 0;
        filtered.forEach(r => {
            rows += `<tr><td>${r.date}</td><td class="val">${formatNumber(r.collection)}</td><td class="val">${formatNumber(r.supply)}</td><td class="val">${formatNumber(r.collection-r.supply)}</td></tr>`;
            tColl += r.collection; tSupp += r.supply;
        });
        printContainer.innerHTML = `
            <div style="text-align:center; margin-bottom:30px;"><h1>تقرير العمليات المالية</h1><p>من ${from} إلى ${to}</p></div>
            <table class="data-table">
                <thead><tr><th>التاريخ</th><th>التحصيل</th><th>التوريد</th><th>الصافي</th></tr></thead>
                <tbody>${rows}</tbody>
                <tfoot><tr style="background:#eee; font-weight:bold;"><td>الإجماليات</td><td>${formatNumber(tColl)}</td><td>${formatNumber(tSupp)}</td><td>${formatNumber(tColl-tSupp)}</td></tr></tfoot>
            </table>
        `;
        closeReportModal(); setTimeout(() => { window.print(); printContainer.innerHTML = ''; }, 500);
    } else {
        let csv = "sep=;\nDate;Collection;Supply;Net\n";
        filtered.forEach(r => csv += `${r.date};${r.collection};${r.supply};${r.collection-r.supply}\n`);
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv], {type:'text/csv;charset=utf-8;'})); a.download = `report_${Date.now()}.csv`; a.click();
        closeReportModal();
    }
};

// --- UTILS ---
function formatNumber(n) { return Number(n).toLocaleString('en-US', {minimumFractionDigits:2}); }
function setupCoreListeners() {
    document.getElementById('searchTerm').oninput = renderAll;
    document.getElementById('sortBy').onchange = renderAll;
}
