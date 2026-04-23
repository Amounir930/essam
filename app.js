// Essam OS - Application Logic Phase 2

// --- Constants & State ---
const STORAGE_KEY = 'essam_os_records';
const SETTINGS_KEY = 'essam_os_settings';
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { token: '', repo: 'Amounir930/essam' };
let editIndex = -1;

// --- Selectors ---
const modal = document.getElementById('recordModal');
const settingsModal = document.getElementById('settingsModal');
const recordForm = document.getElementById('recordForm');
const recordsList = document.getElementById('recordsList');
const essamDetailsList = document.getElementById('essamDetailsList');

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
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerText = now.toLocaleDateString('ar-EG', options);
}

function loadSettings() {
    document.getElementById('ghToken').value = settings.token;
    document.getElementById('ghRepo').value = settings.repo;
}

// --- Logic Functions ---

function updateSummary() {
    if (records.length === 0) {
        totalBalanceEl.innerText = '0.00';
        totalActualEl.innerText = '0.00';
        totalDiffEl.innerText = '0.00';
        return;
    }

    const lastRecord = records[records.length - 1];
    totalBalanceEl.innerText = formatNumber(lastRecord.endBalance);
    totalActualEl.innerText = formatNumber(lastRecord.actualAmount || 0);
    
    const diff = lastRecord.diff || 0;
    totalDiffEl.innerText = formatNumber(diff);
    
    // Update color
    diffCard.className = 'mini-card deficit ' + (diff < 0 ? 'is-deficit' : (diff > 0 ? 'is-surplus' : ''));

    // Filter today's income/expense
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === todayStr);
    
    const income = todayRecords.reduce((sum, r) => sum + r.collection + r.instaShop, 0);
    const essamExp = todayRecords.reduce((sum, r) => sum + r.essam, 0);
    const expense = todayRecords.reduce((sum, r) => sum + (r.supply + r.cash + r.purchases + r.expenses), 0);

    todayIncomeEl.innerText = formatNumber(income);
    todayEssamEl.innerText = formatNumber(essamExp);
    todayExpenseEl.innerText = formatNumber(expense);
}

function renderRecords() {
    if (records.length === 0) {
        recordsList.innerHTML = '<div class="no-data">لا توجد سجلات بعد</div>';
        return;
    }

    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

    recordsList.innerHTML = sortedRecords.map((r) => {
        const index = records.indexOf(r);
        const dateObj = new Date(r.date);
        const dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
        const dateStr = dateObj.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' });

        const statusClass = r.diff >= 0 ? 'success' : 'danger';
        const diffText = r.diff >= 0 ? `+${formatNumber(r.diff)} (زيادة)` : `${formatNumber(r.diff)} (عجز)`;

        return `
            <div class="record-item">
                <div class="record-info">
                    <span class="record-date">${dateStr}</span>
                    <span class="record-day">${dayName}</span>
                </div>
                <div class="record-amount">
                    <span class="amount">${formatNumber(r.endBalance)} ج.م</span>
                    <span class="diff ${statusClass}">${diffText}</span>
                </div>
                <div class="record-actions">
                    <button class="btn-action edit" onclick="editRecord(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" onclick="deleteRecord(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function renderDetailedReports() {
    if (records.length === 0) {
        detailedReportsList.innerHTML = '<div class="no-data">لا توجد بيانات بعد</div>';
        return;
    }

    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

    detailedReportsList.innerHTML = sortedRecords.map((r) => {
        const index = records.indexOf(r);
        return `
            <div class="card" style="margin-bottom: 15px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--glass-border); padding-bottom: 5px; margin-bottom: 10px;">
                    <strong>${new Date(r.date).toLocaleDateString('ar-EG', {weekday:'long', day:'2-digit', month:'2-digit'})}</strong>
                    <div class="record-actions">
                        <button class="btn-action edit" onclick="editRecord(${index})"><i class="fas fa-edit"></i> تعديل</button>
                        <button class="btn-action delete" onclick="deleteRecord(${index})"><i class="fas fa-trash"></i> حذف</button>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <div>بداية: ${formatNumber(r.startBalance)}</div>
                    <div>تحصيل: ${formatNumber(r.collection)}</div>
                    <div>انستا: ${formatNumber(r.instaShop)}</div>
                    <div>توريد: ${formatNumber(r.supply)}</div>
                    <div>كاش: ${formatNumber(r.cash)}</div>
                    <div>مشتريات: ${formatNumber(r.purchases)}</div>
                    <div>مصاريف: ${formatNumber(r.expenses)}</div>
                    <div>عصام: ${formatNumber(r.essam)}</div>
                    <div style="grid-column: span 2; font-weight: bold; color: var(--primary); border-top: 1px solid var(--glass-border); padding-top: 5px; margin-top: 5px;">
                        الخزنة: ${formatNumber(r.endBalance)} | فعلي: ${formatNumber(r.actualAmount)} | ${r.diff >=0 ? 'زيادة' : 'عجز'}: ${formatNumber(r.diff)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatNumber(num) {
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- Actions ---

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
    // Sort by date to ensure carry-over works
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let prevEnd = 0;
    records.forEach((r, i) => {
        if (i === 0) {
            // First record keeps its start balance if it was manual, 
            // but usually it should be 0 if it's the start of the system.
            // For now, let's keep it as is.
        } else {
            r.startBalance = records[i-1].endBalance;
        }
        
        r.endBalance = r.startBalance + r.collection + r.instaShop - 
                      (r.supply + r.cash + r.purchases + r.expenses + r.essam);
        r.diff = (r.actualAmount || 0) - r.endBalance;
    });
}

function saveAndRefresh() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    updateSummary();
    renderRecords();
    renderDetailedReports();
}

async function uploadToGitHub(file, date) {
    if (!settings.token) {
        console.warn('GitHub token not set');
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const fileName = `supply_${date}_${Date.now()}.png`;
        const url = `https://api.github.com/repos/${settings.repo}/contents/توريدات/${fileName}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${settings.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload supply image for ${date}`,
                    content: base64Content
                })
            });

            if (response.ok) {
                alert('تم رفع الصورة بنجاح إلى GitHub');
            } else {
                alert('فشل رفع الصورة. تأكد من الـ Token والصلاحيات.');
            }
        } catch (error) {
            console.error('GitHub Upload Error:', error);
        }
    };
}

// --- Event Listeners ---

function setupEventListeners() {
    // Navigation
    document.getElementById('navReports').addEventListener('click', (e) => {
        e.preventDefault();
        togglePage('reportsPage');
    });

    document.querySelector('.nav-item.active').addEventListener('click', (e) => {
        e.preventDefault();
        togglePage('historyPage');
    });

    document.getElementById('navSettings').addEventListener('click', (e) => {
        e.preventDefault();
        settingsModal.classList.add('active');
    });

    function togglePage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        document.getElementById(pageId).style.display = 'block';
        
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        if (pageId === 'historyPage') document.querySelector('.nav-item:first-child').classList.add('active');
        if (pageId === 'reportsPage') document.getElementById('navReports').classList.add('active');
    }

    // Modal Close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
            settingsModal.classList.remove('active');
            editIndex = -1;
            recordForm.reset();
        });
    });

    // File Name Display
    document.getElementById('supplyImage').addEventListener('change', (e) => {
        document.getElementById('fileName').innerText = e.target.files[0] ? e.target.files[0].name : '';
    });

    // Add/Edit Record Btn
    document.getElementById('addRecordBtn').addEventListener('click', () => {
        editIndex = -1;
        document.querySelector('#recordModal h3').innerText = 'إضافة سجل يوم جديد';
        document.getElementById('startBalance').value = records.length > 0 ? records[records.length-1].endBalance : 0;
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        modal.classList.add('active');
    });

    // Form Submission
    recordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(recordForm);
        const record = {
            date: formData.get('date'),
            startBalance: parseFloat(document.getElementById('startBalance').value || 0),
            collection: parseFloat(formData.get('collection') || 0),
            supply: parseFloat(formData.get('supply') || 0),
            cash: parseFloat(formData.get('cash') || 0),
            instaShop: parseFloat(formData.get('instaShop') || 0),
            purchases: parseFloat(formData.get('purchases') || 0),
            expenses: parseFloat(formData.get('expenses') || 0),
            essam: parseFloat(formData.get('essam') || 0),
            actualAmount: parseFloat(formData.get('actualAmount') || 0)
        };

        // Handle Image Upload
        const fileInput = document.getElementById('supplyImage');
        if (fileInput.files[0]) {
            await uploadToGitHub(fileInput.files[0], record.date);
        }

        if (editIndex > -1) {
            records[editIndex] = record;
        } else {
            records.push(record);
        }

        recalculateAll();
        saveAndRefresh();
        modal.classList.remove('active');
        recordForm.reset();
    });

    // Settings Save
    document.getElementById('saveSettings').addEventListener('click', () => {
        settings.token = document.getElementById('ghToken').value;
        settings.repo = document.getElementById('ghRepo').value;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        settingsModal.classList.remove('active');
        alert('تم حفظ الإعدادات بنجاح');
    });

    // Export Excel
    document.getElementById('exportBtn').addEventListener('click', () => {
        if (records.length === 0) return alert('لا توجد بيانات لتصديرها');
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "اليوم,بداية اليوم,التحصيل,توريد,تحويل كاش,اوردرات انستا,مشتريات,مصروفات محل,مصروفات عصام,مبلغ الخزنة,المبلغ الفعلي,عجز/زيادة\n";
        records.forEach(r => {
            csvContent += `${r.date},${r.startBalance},${r.collection},${r.supply},${r.cash},${r.instaShop},${r.purchases},${r.expenses},${r.essam},${r.endBalance},${r.actualAmount || 0},${r.diff || 0}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `essam_full_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
}

// Start the app
init();
