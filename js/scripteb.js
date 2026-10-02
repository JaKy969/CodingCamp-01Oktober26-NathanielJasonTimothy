// Expense & Budget Visualizer JavaScript

// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let customCategories = JSON.parse(localStorage.getItem('customCategories')) || ['Food', 'Transport', 'Fun'];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 500.00;
let expenseChart = null;

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const itemAmountInput = document.getElementById('itemAmount');
const itemCategorySelect = document.getElementById('itemCategory');
const itemDateInput = document.getElementById('itemDate');
const transactionListContainer = document.getElementById('transactionListContainer');
const emptyState = document.getElementById('emptyState');
const totalBalanceEl = document.getElementById('totalBalance');
const budgetLimitDisplay = document.getElementById('budgetLimitDisplay');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const budgetStatusText = document.getElementById('budgetStatusText');
const budgetAlert = document.getElementById('budgetAlert');
const editBudgetBtn = document.getElementById('editBudgetBtn');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Modal Elements
const monthlySummaryBtn = document.getElementById('monthlySummaryBtn');
const summaryModal = document.getElementById('summaryModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeSummaryAction = document.getElementById('closeSummaryAction');
const summaryMonthInput = document.getElementById('summaryMonthInput');
const summaryContent = document.getElementById('summaryContent');

const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const newCategoryInput = document.getElementById('newCategoryInput');
const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
const saveCategoryBtn = document.getElementById('saveCategoryBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    itemDateInput.value = today;

    // Load Theme Preference
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    populateCategoryDropdown();
    updateUI();

    // Event Listeners
    transactionForm.addEventListener('submit', handleAddTransaction);
    sortSelect.addEventListener('change', updateUI);
    themeToggle.addEventListener('click', toggleTheme);
    editBudgetBtn.addEventListener('click', handleEditBudget);

    // Modal Listeners
    monthlySummaryBtn.addEventListener('click', openSummaryModal);
    closeModalBtn.addEventListener('click', () => summaryModal.classList.add('hidden'));
    closeSummaryAction.addEventListener('click', () => summaryModal.classList.add('hidden'));
    summaryMonthInput.addEventListener('change', updateMonthlySummaryContent);

    addCategoryBtn.addEventListener('click', () => categoryModal.classList.remove('hidden'));
    cancelCategoryBtn.addEventListener('click', () => categoryModal.classList.add('hidden'));
    saveCategoryBtn.addEventListener('click', handleAddCustomCategory);
});

// Theme Toggle Handler
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    updateChart(); // Redraw chart to match border/label color theme
}

// Populate Category Dropdown
function populateCategoryDropdown() {
    itemCategorySelect.innerHTML = '';
    customCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        itemCategorySelect.appendChild(option);
    });
}

// Add Custom Category Handler
function handleAddCustomCategory() {
    const newCat = newCategoryInput.value.trim();
    if (newCat && !customCategories.includes(newCat)) {
        customCategories.push(newCat);
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
        populateCategoryDropdown();
        itemCategorySelect.value = newCat;
        newCategoryInput.value = '';
        categoryModal.classList.add('hidden');
        updateChart();
    }
}

// Add Transaction Handler
function handleAddTransaction(e) {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(itemAmountInput.value);
    const category = itemCategorySelect.value;
    const date = itemDateInput.value;

    if (!name || isNaN(amount) || !category || !date) {
        alert('Please fill out all fields correctly.');
        return;
    }

    const newTransaction = {
        id: Date.now().toString(),
        name,
        amount,
        category,
        date
    };

    transactions.push(newTransaction);
    saveAndRefresh();

    // Reset Form
    itemNameInput.value = '';
    itemAmountInput.value = '';
    itemDateInput.value = new Date().toISOString().split('T')[0];
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndRefresh();
}

// Save Data & Refresh UI
function saveAndRefresh() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

// Update UI Layout, Lists, Totals, and Charts
function updateUI() {
    renderTransactions();
    updateTotalsAndBudget();
    updateChart();
}

// Render Transactions List with Sorting Applied
function renderTransactions() {
    const sortValue = sortSelect.value;
    let sortedTransactions = [...transactions];

    if (sortValue === 'date-desc') {
        sortedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortValue === 'date-asc') {
        sortedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === 'amount-desc') {
        sortedTransactions.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === 'amount-asc') {
        sortedTransactions.sort((a, b) => a.amount - b.amount);
    } else if (sortValue === 'category') {
        sortedTransactions.sort((a, b) => a.category.localeCompare(b.category));
    }

    transactionListContainer.innerHTML = '';

    if (sortedTransactions.length === 0) {
        transactionListContainer.innerHTML = `
            <div id="emptyState" class="text-center py-12 text-slate-400 dark:text-slate-500">
                <i class="fa-solid fa-receipt text-4xl mb-2 opacity-50"></i>
                <p class="text-sm">No transactions added yet.</p>
            </div>
        `;
        return;
    }

    sortedTransactions.forEach(t => {
        const itemEl = document.createElement('div');
        itemEl.className = "flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100/60 dark:hover:bg-slate-900 transition";
        
        // Category Badge Color Mapping
        itemEl.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-tag text-sm"></i>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(t.name)}</h4>
                    <p class="text-xs text-slate-400 dark:text-slate-500">${t.category} • ${t.date}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-slate-900 dark:text-white">$${t.amount.toFixed(2)}</span>
                <button onclick="deleteTransaction('${t.id}')" class="text-slate-400 hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20" aria-label="Delete">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
        `;
        transactionListContainer.appendChild(itemEl);
    });
}

// Update Total Balance & Budget Progress
function updateTotalsAndBudget() {
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    totalBalanceEl.textContent = `$${totalSpent.toFixed(2)}`;
    budgetLimitDisplay.textContent = `$${monthlyBudget.toFixed(2)}`;

    const percentage = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
    budgetProgressBar.style.width = `${percentage}%`;

    if (totalSpent >= monthlyBudget) {
        budgetProgressBar.className = "bg-rose-500 h-2.5 rounded-full transition-all duration-300";
        budgetStatusText.textContent = "Limit Exceeded!";
        budgetStatusText.className = "text-xs font-medium text-rose-500";
        budgetAlert.classList.remove('hidden');
    } else if (percentage >= 80) {
        budgetProgressBar.className = "bg-amber-500 h-2.5 rounded-full transition-all duration-300";
        budgetStatusText.textContent = "Warning (80%+)";
        budgetStatusText.className = "text-xs font-medium text-amber-500";
        budgetAlert.classList.add('hidden');
    } else {
        budgetProgressBar.className = "bg-indigo-600 h-2.5 rounded-full transition-all duration-300";
        budgetStatusText.textContent = "On Track";
        budgetStatusText.className = "text-xs font-medium text-emerald-500";
        budgetAlert.classList.add('hidden');
    }
}

// Edit Budget Limit
function handleEditBudget() {
    const newBudget = prompt('Enter new monthly budget limit ($):', monthlyBudget);
    if (newBudget !== null && !isNaN(parseFloat(newBudget))) {
        monthlyBudget = parseFloat(newBudget);
        localStorage.setItem('monthlyBudget', monthlyBudget);
        updateTotalsAndBudget();
    }
}

// Render Doughnut Chart
function updateChart() {
    const canvasElement = document.getElementById('expenseChart');
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    const categoryTotals = {};

    customCategories.forEach(cat => categoryTotals[cat] = 0);

    transactions.forEach(t => {
        if (categoryTotals[t.category] !== undefined) {
            categoryTotals[t.category] += t.amount;
        } else {
            categoryTotals[t.category] = t.amount;
        }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (expenseChart) {
        expenseChart.destroy();
    }

    const backgroundColors = [
        '#6366f1', '#3b82f6', '#10b981', '#f59e0b', 
        '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
    ];

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Monthly Summary Modal Logic
function openSummaryModal() {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    summaryMonthInput.value = currentMonthStr;
    updateMonthlySummaryContent();
    summaryModal.classList.remove('hidden');
    summaryModal.classList.add('flex');
}

function updateMonthlySummaryContent() {
    const selectedMonth = summaryMonthInput.value; // format: YYYY-MM
    if (!selectedMonth) return;

    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    const totalMonthSpent = filtered.reduce((sum, t) => sum + t.amount, 0);

    let html = `
        <div class="flex justify-between items-center text-sm font-semibold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-700">
            <span>Total Spent in ${selectedMonth}:</span>
            <span class="text-indigo-600 dark:text-indigo-400">$${totalMonthSpent.toFixed(2)}</span>
        </div>
        <div class="space-y-2 mt-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Category Breakdown</p>
    `;

    const catMap = {};
    customCategories.forEach(c => catMap[c] = 0);
    filtered.forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    for (const [cat, amt] of Object.entries(catMap)) {
        if (amt > 0) {
            html += `
                <div class="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>${cat}</span>
                    <span class="font-medium">$${amt.toFixed(2)}</span>
                </div>
            `;
        }
    }

    if (filtered.length === 0) {
        html += `<p class="text-xs text-slate-400 italic">No transactions recorded for this month.</p>`;
    }

    html += `</div>`;
    summaryContent.innerHTML = html;
}

// Security Helper to avoid XSS injections in names
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}