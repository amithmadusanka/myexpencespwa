// Switching Tab Logic
function switchTab(tabName) {
    const creatorView = document.getElementById('view-creator');
    const ordersView = document.getElementById('view-orders');
    const historyView = document.getElementById('view-history');
    
    const tabCreator = document.getElementById('tab-creator');
    const tabOrders = document.getElementById('tab-orders');
    const tabHistory = document.getElementById('tab-history');

    if (creatorView) creatorView.classList.add('hidden');
    if (ordersView) ordersView.classList.add('hidden');
    if (historyView) historyView.classList.add('hidden');

    if (tabName === 'creator') {
        if (creatorView) creatorView.classList.remove('hidden');
        setActiveTabBtn(tabCreator, [tabOrders, tabHistory]);
    } else if (tabName === 'orders') {
        if (ordersView) ordersView.classList.remove('hidden');
        setActiveTabBtn(tabOrders, [tabCreator, tabHistory]);
        renderOrders();
    } else if (tabName === 'history') {
        if (historyView) historyView.classList.remove('hidden');
        setActiveTabBtn(tabHistory, [tabCreator, tabOrders]);
        if (typeof renderHistory === 'function') renderHistory();
    }
}

function setActiveTabBtn(activeBtn, inactiveBtns) {
    if(!activeBtn) return;
    activeBtn.className = "px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-600 text-white";
    inactiveBtns.forEach(btn => {
        if(btn) btn.className = "px-3 py-1.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100";
    });
}

// === OFFLINE ORDERS (LOCAL STORAGE) ===

function getOrders() {
    return JSON.parse(localStorage.getItem('menuMintOrders')) || [];
}

function addOrder(event) {
    event.preventDefault();
    const name = document.getElementById('order-name').value;
    const date = document.getElementById('order-date').value;
    const time = document.getElementById('order-time').value;
    const location = document.getElementById('order-location').value;

    const newOrder = {
        id: Date.now(),
        name,
        date,
        time,
        location
    };

    const orders = getOrders();
    orders.push(newOrder);
    localStorage.setItem('menuMintOrders', JSON.stringify(orders));

    document.getElementById('order-form').reset();
    renderOrders();
    checkUpcomingOrders(); 
}

function deleteOrder(id) {
    let orders = getOrders();
    orders = orders.filter(order => order.id !== id);
    localStorage.setItem('menuMintOrders', JSON.stringify(orders));
    renderOrders();
}

function renderOrders() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;
    const orders = getOrders();

    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-gray-400 italic">No orders saved yet.</td></tr>`;
        return;
    }

    orders.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(order => {
        const row = `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="py-3 font-semibold text-gray-800">${order.name}</td>
                <td class="py-3 text-gray-600">${order.date}</td>
                <td class="py-3"><span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">${order.time}</span></td>
                <td class="py-3 text-gray-600">${order.location}</td>
                <td class="py-3 text-right">
                    <button onclick="deleteOrder(${order.id})" class="text-red-500 hover:text-red-700 text-xs font-bold">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// === REMINDERS / LOCAL PUSH NOTIFICATIONS ===

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert('Notifications successfully enabled!');
                checkUpcomingOrders();
            }
        });
    } else {
        alert('This browser does not support desktop notifications.');
    }
}

// Scans stored orders for target dates arriving tomorrow 
function checkUpcomingOrders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const orders = getOrders();
    const today = new Date();
    
    // Set Tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    orders.forEach(order => {
        if (order.date === tomorrowStr) {
            // Prevent duplicated notifications for the same day
            const notificationKey = `notified_${order.id}_${tomorrowStr}`;
            if (!localStorage.getItem(notificationKey)) {
                
                showLocalNotification(
                    `Upcoming Order Tomorrow!`,
                    `Order: ${order.name}\nTime: ${order.time}\nWhere: ${order.location}`
                );

                localStorage.setItem(notificationKey, 'true');
            }
        }
    });
}

function showLocalNotification(title, body) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: 'icons/icon-192.png',
                vibrate: [200, 100, 200],
                badge: 'icons/icon-192.png'
            });
        });
    } else {
        new Notification(title, { body: body });
    }
}

// Triggers date scanning every time the App loads
window.addEventListener('DOMContentLoaded', () => {
    checkUpcomingOrders();
});
