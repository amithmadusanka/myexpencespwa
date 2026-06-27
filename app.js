// Retrieve stored transactions from local storage, or initialize empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

document.addEventListener("DOMContentLoaded", () => {
    // Check if the URL contains an 'sms' parameter from iPhone Shortcut Automation
    const urlParams = new URLSearchParams(window.location.search);
    const smsFromUrl = urlParams.get('sms');
    
    if (smsFromUrl) {
        processSMSText(decodeURIComponent(smsFromUrl));
        // Clean URL parameter to prevent duplicate entries on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    updateUI();
});

function processSMS() {
    const smsText = document.getElementById('smsInput').value;
    processSMSText(smsText);
}

// Main logic to parse bank SMS and extract data
function processSMSText(smsText) {
    if (!smsText || !smsText.trim()) return;

    // Regex to match Sri Lankan bank currency format (LKR or Rs.)
    const amountRegex = /(?:LKR|Rs\.?)\s*([\d,]+\.\d{2})/i;
    // Regex keywords to identify a debit transaction
    const debitRegex = /(debited|paid|charged|withdrawn|spent)/i;
    
    const amountMatch = smsText.match(amountRegex);
    
    if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const type = debitRegex.test(smsText) ? 'Debit' : 'Credit';
        const date = new Date().toLocaleDateString();
        
        // Extract merchant name if SMS contains "at [Merchant]"
        let description = "Bank Alert";
        if (smsText.includes("at ")) {
            description = smsText.split("at ")[1].split(" ")[0]; 
        }

        const newTx = { amount, type, date, description };
        transactions.unshift(newTx);
        
        // Save data locally on device (100% Secure, doesn't go to cloud)
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        if (document.getElementById('smsInput')) {
            document.getElementById('smsInput').value = '';
        }
        updateUI();
    } else {
        alert("Sorry, could not extract the amount. Please check the SMS format.");
    }
}

function updateUI() {
    const list = document.getElementById('transactionList');
    if (!list) return;
    
    const totalDebitEl = document.getElementById('totalDebit');
    const totalCreditEl = document.getElementById('totalCredit');
    
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

    if (totalDebitEl) totalDebitEl.innerText = `LKR ${totalDebit.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    if (totalCreditEl) totalCreditEl.innerText = `LKR ${totalCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}