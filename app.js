// --- INITIAL DATA & STATE ---
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    recalculateAll();
    renderAll();
    setupEventListeners();
});

// --- THEME ENGINE ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    document.getElementById('themeToggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    const text = document.querySelector('#themeToggle span');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        text.innerText = 'الوضع النهاري';
    } else {
        icon.className = 'fas fa-moon';
        text.innerText = 'الوضع الليلي';
    }
}

// --- RENDER ENGINE ---
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
        const net = r.collection - r.supply;
        const statusClass = r.diff >= 0 ? 'pos' : 'neg';
        const statusLabel = r.diff >= 0 ? 'مطابق/زيادة' : 'عجز';
        const invoiceLink = r.invoiceUrl ? `<a href="${r.invoiceUrl}" target="_blank" class="action-btn" title="عرض الفاتورة"><i class="fas fa-paperclip"></i></a>` : '';

        return `
            <tr>
                <td>
                    <div style="font-weight:700">${r.date}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary)">${new Date(r.date).toLocaleDateString('ar-EG', {weekday:'long'})}</div>
                </td>
                <td class="text-center num pos">${formatNumber(r.collection)}</td>
                <td class="text-center num neg">${formatNumber(r.supply)}</td>
                <td class="text-center num">${formatNumber(net)}</td>
                <td class="text-center">
                    <span class="status-tag ${statusClass}">${statusLabel} (${formatNumber(Math.abs(r.diff))})</span>
                </td>
                <td class="text-right">
                    ${invoiceLink}
                    <button onclick="editRecord(${idx})" class="action-btn" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord(${idx})" class="action-btn delete" title="حذف"><i class="fas fa-trash-alt"></i></button>
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

// --- CORE ACTIONS ---
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
    document.getElementById('repTitle').innerText = type === 'essam' ? 'تقرير مصروفات عصام' : 'تقرير توريد أمازون';
    document.getElementById('repFrom').value = "";
    document.getElementById('repTo').value = new Date().toISOString().split('T')[0];
    document.getElementById('reportModal').classList.add('active');
};
window.closeReportModal = () => document.getElementById('reportModal').classList.remove('active');

document.getElementById('recordForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalBtn = btn.innerText;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ والرفع...';
    btn.disabled = true;

    const idx = document.getElementById('recordIndex').value;
    const fileInput = document.getElementById('invoiceFile');
    let invoiceUrl = document.getElementById('invoiceUrl').value;

    // Handle File Upload to GitHub
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        invoiceUrl = await new Promise((resolve) => {
            reader.onload = async () => {
                const base64Content = reader.result.split(',')[1];
                const extension = file.name.split('.').pop();
                const path = `Invoices/Invoice_${Date.now()}.${extension}`;
                const success = await pushFileToGitHub(base64Content, path);
                if (success) {
                    resolve(`https://github.com/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${path}?raw=true`);
                } else {
                    alert('فشل رفع الفاتورة للسحابة');
                    resolve("");
                }
            };
            reader.readAsDataURL(file);
        });
    }

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
        invoiceUrl: invoiceUrl
    };

    if (idx === "") records.push(data); else records[idx] = data;
    recalculateAll(); renderAll(); closeAddModal();
    btn.innerText = originalBtn;
    btn.disabled = false;
};

window.editRecord = (idx) => {
    const r = records[idx];
    document.getElementById('recordIndex').value = idx;
    Object.keys(r).forEach(key => { if(document.getElementById(key)) document.getElementById(key).value = r[key]; });
    document.getElementById('recordModal').classList.add('active');
};

window.deleteRecord = (idx) => { if(confirm('هل أنت متأكد من الحذف؟')){ records.splice(idx,1); recalculateAll(); renderAll(); } };

// --- GITHUB SYNC ---
document.getElementById('btnSyncGithub').onclick = async () => {
    const btn = document.getElementById('btnSyncGithub');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري الحفظ...</span>';
    let csv = "sep=;\nDate;Collection;Supply;Net\n";
    records.forEach(r => csv += `${r.date};${r.collection};${r.supply};${r.collection-r.supply}\n`);
    const filename = `Supply_Reports/Report_${new Date().toISOString().split('T')[0]}.csv`;
    const success = await pushFileToGitHub(btoa(unescape(encodeURIComponent(csv))), filename);
    if (success) {
        btn.innerHTML = '<i class="fas fa-check"></i> <span>تم الحفظ</span>';
        setTimeout(() => btn.innerHTML = originalContent, 2000);
    } else {
        alert('فشل الاتصال بـ GitHub. يرجى التحقق من التوكن.');
        btn.innerHTML = originalContent;
    }
};

async function pushFileToGitHub(base64Content, path) {
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.repo}/contents/${path}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Upload File ${path}`,
                content: base64Content,
                branch: GITHUB_CONFIG.branch
            })
        });
        return response.ok;
    } catch (e) { return false; }
}

// --- EXPORT ENGINE ---
window.exportReport = async (format) => {
    const from = document.getElementById('repFrom').value;
    const to = document.getElementById('repTo').value;
    const filtered = records.filter(r => (!from || r.date >= from) && (!to || r.date <= to));
    const printContainer = document.getElementById('printTemplate');
    if (format === 'pdf') {
        let tableRows = '';
        let totalVal = 0;
        let reportTitle = currentReportType === 'essam' ? 'تقرير مصروفات عصام التفصيلي' : 'تقرير توريدات أمازون';
        let tableHeaders = currentReportType === 'essam' ? '<tr><th>التاريخ</th><th>المبلغ</th></tr>' : '<tr><th>التاريخ</th><th>التحصيل</th><th>التوريد</th><th>الصافي</th></tr>';
        filtered.forEach(r => {
            if (currentReportType === 'essam' && r.essam > 0) {
                tableRows += `<tr><td>${r.date}</td><td class="num">${formatNumber(r.essam)}</td></tr>`;
                totalVal += r.essam;
            } else if (currentReportType !== 'essam') {
                tableRows += `<tr><td>${r.date}</td><td class="num">${formatNumber(r.collection)}</td><td class="num">${formatNumber(r.supply)}</td><td class="num">${formatNumber(r.collection-r.supply)}</td></tr>`;
            }
        });
        printContainer.innerHTML = `<div class="print-header"><h1>Financial OS</h1><h2>${reportTitle}</h2></div><table class="print-table"><thead>${tableHeaders}</thead><tbody>${tableRows}</tbody></table>`;
        closeReportModal();
        setTimeout(() => { window.print(); printContainer.innerHTML = ''; }, 500);
    } else {
        let csv = "sep=;\nDate;Collection;Supply;Net\n";
        filtered.forEach(r => csv += `${r.date};${r.collection};${r.supply};${r.collection-r.supply}\n`);
        const blob = new Blob(["\uFEFF"+csv], {type:'text/csv;charset=utf-8;'});
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${currentReportType}_report.csv`; a.click();
        closeReportModal();
    }
};

function formatNumber(n) { return Number(n).toLocaleString('en-US', {minimumFractionDigits:2}); }
function setupEventListeners() {
    document.getElementById('searchTerm').oninput = renderAll;
    document.getElementById('sortBy').onchange = renderAll;
}
