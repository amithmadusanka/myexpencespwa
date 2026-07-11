// Tab Switching System
function switchTab(tabName) {
    const creatorView = document.getElementById('view-creator');
    const historyView = document.getElementById('view-history');
    const tabCreator = document.getElementById('tab-creator');
    const tabHistory = document.getElementById('tab-history');

    if (tabName === 'creator') {
        creatorView.classList.remove('hidden');
        historyView.classList.add('hidden');
        
        tabCreator.className = "border-paprika text-paprika px-3 py-2 font-medium text-sm border-b-2 font-semibold cursor-pointer";
        tabHistory.className = "border-transparent text-gray-500 hover:text-gray-700 px-3 py-2 font-medium text-sm border-b-2 cursor-pointer";
    } else if (tabName === 'history') {
        creatorView.classList.add('hidden');
        historyView.classList.remove('hidden');
        
        tabHistory.className = "border-paprika text-paprika px-3 py-2 font-medium text-sm border-b-2 font-semibold cursor-pointer";
        tabCreator.className = "border-transparent text-gray-500 hover:text-gray-700 px-3 py-2 font-medium text-sm border-b-2 cursor-pointer";
        
        renderHistory();
    }
}

// Persist document data to LocalStorage
function saveToHistory(type, docNum, client, amount) {
    const history = JSON.parse(localStorage.getItem('menuMintHistory')) || [];
    
    const newEntry = {
        type: type, // Expects 'Invoice' or 'Quotation'
        docNum: docNum,
        client: client,
        date: new Date().toLocaleDateString(),
        amount: amount
    };
    
    history.push(newEntry);
    localStorage.setItem('menuMintHistory', JSON.stringify(history));
    alert(`${type} saved to history log!`);
}

// Populate the history view table dynamically
function renderHistory() {
    const tableBody = document.getElementById('history-table-body');
    const history = JSON.parse(localStorage.getItem('menuMintHistory')) || [];
    
    tableBody.innerHTML = '';
    
    if (history.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-400 italic">No files generated yet.</td></tr>`;
        return;
    }

    history.forEach((item) => {
        // Different badges based on the document type
        const badgeColor = item.type === 'Invoice' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
        
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4"><span class="px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}">${item.type}</span></td>
                <td class="px-6 py-4 font-mono text-xs font-semibold text-gray-600">${item.docNum}</td>
                <td class="px-6 py-4 font-medium text-gray-800">${item.client}</td>
                <td class="px-6 py-4 text-gray-500">${item.date}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">${item.amount}</td>
                <td class="px-6 py-4"><button class="text-paprika hover:text-paprika-dark font-medium underline cursor-pointer">View PDF</button></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}
