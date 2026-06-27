let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

document.addEventListener("DOMContentLoaded", () => {
    // Check if URL parameter contains text sent from iPhone Automation
    const urlParams = new URLSearchParams(window.location.search);
    const smsFromUrl = urlParams.get('sms');
    
    if (smsFromUrl) {
        processSMSText(decodeURIComponent(smsFromUrl));
        // Clean up URL parameter to prevent duplicate entries on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    updateUI();
});

// Toggle between Input Tabs
function switchTab(tab) {
    if (tab === 'sms-tab') {
        document.getElementById('sms-container').classList.remove('hidden');
        document.getElementById('pdf-container').classList.add('hidden');
        document.getElementById('smsBtn').className = "w-1/2 py-2 text-center font-bold text-indigo-600 border-b-2 border-indigo-600 focus:outline-none";
        document.getElementById('pdfBtn').className = "w-1/2 py-2 text-center font-bold text-gray-500 focus:outline-none";
    } else {
        document.getElementById('sms-container').classList.add('hidden');
        document.getElementById('pdf-container').classList.remove('hidden');
        document.getElementById('pdfBtn').className = "w-1/2 py-2 text-center font-bold text-indigo-600 border-b-2 border-indigo-600 focus:outline-none";
        document.getElementById('smsBtn').className = "w-1/2 py-2 text-center font-bold text-gray-500 focus:outline-none";
    }
}

function processSMS() {
    const smsText = document.getElementById('smsInput').value;
    processSMSText(smsText);
}

// Extract information from Text SMS formats
function processSMSText(smsText) {
    if (!smsText || !smsText.trim()) return;

    const amountRegex = /(?:LKR|Rs\.?)\s*([\d,]+\.\d{2})/i;
    const debitRegex = /(debited|paid|charged|withdrawn|spent)/i;
    
    const amountMatch = smsText.match(amountRegex);
    
    if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const type = debitRegex.test(smsText) ? 'Debit' : 'Credit';
        const date = new Date().toLocaleDateString();
        
        let description = type === 'Debit' ? "Expense Alert" : "Income Received";
        if (smsText.includes("at ")) {
            description = smsText.split("at ")[1].split(" ")[0]; 
        }

        transactions.unshift({ amount, type, date, description });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        if (document.getElementById('smsInput')) document.getElementById('smsInput').value = '';
        updateUI();
    }
}

// Convert uploaded PDF File data into searchable Text strings
async function processPDF() {
    const fileInput = document.getElementById('pdfFile');
    const status = document.getElementById('pdfStatus');
    
    if (fileInput.files.length === 0) return;
    
    status.innerText = "Reading PDF... Please wait...";
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async function (e) {
        try {
            const typedarray = new Uint8Array(e.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = "";
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(" ");
                fullText += pageText + "\n";
            }
            
            parseStatementText(fullText);
            status.innerText = "Successfully Imported!";
            fileInput.value = ""; 
        } catch (error) {
            console.error(error);
            status.innerText = "Error reading PDF file. Make sure it's not password protected.";
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Run Regex rules over PDF raw text to filter tabular rows
function parseStatementText(text) {
    // Matches common Lankan e-statement rows: (Date) (Description) (Amount) (Debit/Credit Sign)
    const lineRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})([\s\S]*?)([\d,]+\.\d{2})\s*(DR|CR|Debit|Credit)?/gi;
    let match;
    let addedCount = 0;

    while ((match = lineRegex.exec(text)) !== null) {
        const date = match[1];
        let description = match[2].trim().substring(0, 20) || "Transaction";
        const amount = parseFloat(match[3].replace(/,/g, ''));
        let sign = match[4] ? match[4].toUpperCase() : '';

        let type = 'Debit'; 
        if (sign === 'CR' || sign === 'CREDIT' || description.toLowerCase().includes('deposit') || description.toLowerCase().includes('salary')) {
            type = 'Credit';
        }

        transactions.unshift({ amount, type, date, description });
        addedCount++;
    }

    if (addedCount > 0) {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateUI();
        alert(`Successfully parsed ${addedCount} transactions from PDF!`);
    } else {
        alert("No visible transactions found. Format might differ.");
    }
}

function updateUI() {
    const list = document.getElementById('transactionList');
    if (!list) return;
    
    const totalDebitEl = document.getElementById('totalDebit');
    const totalCreditEl = document.getElementById('totalCredit');
    const netBalanceEl = document.getElementById('netBalance');
    
    list.innerHTML = '';
    let totalDebit = 0;
    let totalCredit = 0;

    if (transactions.length === 0) {
        list.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">No transactions added yet.</p>';
    }

    transactions.forEach(tx => {
        if (tx.type === 'Debit') totalDebit += tx.amount;
        else totalCredit += tx.amount;

        const item = document.createElement('div');
        item.className = `p-3 rounded-xl flex justify-between items-center text-sm ${tx.type === 'Debit' ? 'bg-red-50' : 'bg-green-50'}`;
        item.innerHTML = `
            <div>
                <p class="font-bold text-gray-800">${tx.description}</p>
                <p class="text-xs text-gray-500">${tx.date}</p>
            </div>
            <span class="font-extrabold ${tx.type === 'Debit' ? 'text-red-600' : 'text-green-600'}">
                ${tx.type === 'Debit' ? '-' : '+'} LKR ${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
        `;
        list.appendChild(item);
    });

    const netBalance = totalCredit - totalDebit;

    if (totalDebitEl) totalDebitEl.innerText = `LKR ${totalDebit.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    if (totalCreditEl) totalCreditEl.innerText = `LKR ${totalCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    if (netBalanceEl) {
        netBalanceEl.innerText = `LKR ${netBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        netBalanceEl.className = `font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`;
    }
}

function clearAllData() {
    if (confirm("Are you sure you want to clear all transaction history?")) {
        transactions = [];
        localStorage.removeItem('transactions');
        updateUI();
    }
}
