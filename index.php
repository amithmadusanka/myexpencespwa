
<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catering Manager PWA</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        .page { display: none; }
        .page.active { display: block; }
    </style>
</head>
<body class="bg-slate-50 font-sans text-slate-800">

    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 flex justify-around p-2">
        <button onclick="switchPage('invoice')" class="flex flex-col items-center text-amber-600 focus:outline-none">
            <span class="text-xl">📄</span><span class="text-xs font-semibold">Invoice</span>
        </button>
        <button onclick="switchPage('quotation')" class="flex flex-col items-center text-slate-500 focus:outline-none">
            <span class="text-xl">📋</span><span class="text-xs font-semibold">Quotation</span>
        </button>
        <button onclick="switchPage('products')" class="flex flex-col items-center text-slate-500 focus:outline-none">
            <span class="text-xl">🍲</span><span class="text-xs font-semibold">Products</span>
        </button>
        <button onclick="switchPage('settings')" class="flex flex-col items-center text-slate-500 focus:outline-none">
            <span class="text-xl">⚙️</span><span class="text-xs font-semibold">Settings</span>
        </button>
    </nav>

    <main class="p-4 mb-20 max-w-md mx-auto">

        <div id="invoice" class="page active">
            <h2 class="text-2xl font-bold text-amber-600 mb-4">New Invoice</h2>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                <input id="inv-customer" type="text" placeholder="Customer Name" class="w-full p-2 border border-slate-200 rounded-lg mb-2">
                <h3 class="font-semibold text-sm text-slate-500 mb-2">Select Products:</h3>
                <div id="inv-product-list" class="space-y-2 max-h-40 overflow-y-auto mb-2 border-b border-slate-100 pb-2"></div>
                <button onclick="generatePDF('invoice')" class="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-amber-600 transition">Download Invoice PDF</button>
            </div>
        </div>

        <div id="quotation" class="page">
            <h2 class="text-2xl font-bold text-amber-600 mb-4">New Quotation</h2>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                <input id="q-customer" type="text" placeholder="Customer Name" class="w-full p-2 border border-slate-200 rounded-lg mb-2">
                <h3 class="font-semibold text-sm text-slate-500 mb-2">Select Products:</h3>
                <div id="q-product-list" class="space-y-2 max-h-40 overflow-y-auto mb-2 border-b border-slate-100 pb-2"></div>
                <button onclick="generatePDF('quotation')" class="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-amber-600 transition">Download Quotation PDF</button>
            </div>
        </div>

        <div id="products" class="page">
            <h2 class="text-2xl font-bold text-amber-600 mb-4">Product Management</h2>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                <input id="p-name" type="text" placeholder="Item Name (e.g., Chicken Fried Rice)" class="w-full p-2 border border-slate-200 rounded-lg mb-2">
                <input id="p-price" type="number" placeholder="Price (LKR)" class="w-full p-2 border border-slate-200 rounded-lg mb-3">
                <button onclick="addProduct()" class="w-full bg-slate-800 text-white font-bold py-2 rounded-lg">Add Product</button>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h3 class="font-bold mb-2">Saved Products</h3>
                <div id="saved-products" class="divide-y divide-slate-100"></div>
            </div>
        </div>

        <div id="settings" class="page">
            <h2 class="text-2xl font-bold text-amber-600 mb-4">Settings</h2>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <label class="block text-sm font-semibold mb-1">Company Name</label>
                <input id="cfg-name" type="text" class="w-full p-2 border border-slate-200 rounded-lg mb-3">
                
                <label class="block text-sm font-semibold mb-1">Contact Details</label>
                <textarea id="cfg-details" class="w-full p-2 border border-slate-200 rounded-lg mb-3" placeholder="Phone, Address etc."></textarea>
                
                <label class="block text-sm font-semibold mb-1">Logo / Image</label>
                <input id="cfg-logo" type="file" accept="image/*" onchange="handleLogo(this)" class="w-full text-sm mb-4">
                <img id="logo-preview" class="h-20 object-contain mb-4 hidden">

                <button onclick="saveSettings()" class="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg">Save Settings</button>
            </div>
        </div>

    </main>

    <div id="pdf-template" class="hidden p-8 bg-white text-slate-800" style="width: 790px;">
        <div class="flex justify-between items-start border-b-2 border-amber-500 pb-4 mb-6">
            <div>
                <h1 id="pdf-com-name" class="text-3xl font-bold text-amber-600">Company Name</h1>
                <p id="pdf-com-details" class="text-sm text-slate-500 whitespace-pre-line">Details</p>
            </div>
            <img id="pdf-logo" class="h-20 object-contain hidden">
        </div>
        <div class="mb-6">
            <h2 id="pdf-title" class="text-xl font-bold uppercase tracking-wider mb-2">INVOICE</h2>
            <p class="text-sm"><strong>To:</strong> <span id="pdf-customer">Customer</span></p>
            <p class="text-sm"><strong>Date:</strong> <span id="pdf-date">Date</span></p>
        </div>
        <table class="w-full mb-6 border-collapse">
            <thead>
                <tr class="bg-slate-100 text-left">
                    <th class="p-2 border border-slate-200">Item Description</th>
                    <th class="p-2 border border-slate-200 text-center">Qty</th>
                    <th class="p-2 border border-slate-200 text-right">Price</th>
                    <th class="p-2 border border-slate-200 text-right">Total</th>
                </tr>
            </thead>
            <tbody id="pdf-items"></tbody>
        </table>
        <div class="text-right text-lg font-bold">
            Total Amount: LKR <span id="pdf-total">0.00</span>
        </div>
    </div>

    <script>
        let db = { products: [], settings: { name: 'My Catering', details: '', logo: '' } };

        // Load data from phone's local storage
        function loadData() {
            const data = localStorage.getItem('catering_pwa_db');
            if(data) db = JSON.parse(data);
            renderProducts();
            renderSelectionLists();
            
            document.getElementById('cfg-name').value = db.settings.name;
            document.getElementById('cfg-details').value = db.settings.details;
            if(db.settings.logo) {
                document.getElementById('logo-preview').src = db.settings.logo;
                document.getElementById('logo-preview').classList.remove('hidden');
            }
        }

        function saveData() {
            localStorage.setItem('catering_pwa_db', JSON.stringify(db));
            renderProducts();
            renderSelectionLists();
        }

        function switchPage(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            
            // Highlight active nav icon
            document.querySelectorAll('nav button').forEach(b => b.classList.replace('text-amber-600', 'text-slate-500'));
            event.currentTarget.classList.replace('text-slate-500', 'text-amber-600');
        }

        // Product Management
        function addProduct() {
            const name = document.getElementById('p-name').value;
            const price = parseFloat(document.getElementById('p-price').value);
            if(!name || !price) return alert('Please enter name and price');
            
            db.products.push({ id: Date.now(), name, price });
            document.getElementById('p-name').value = '';
            document.getElementById('p-price').value = '';
            saveData();
        }

        function deleteProduct(id) {
            db.products = db.products.filter(p => p.id !== id);
            saveData();
        }

        function renderProducts() {
            const container = document.getElementById('saved-products');
            container.innerHTML = db.products.map(p => `
                <div class="flex justify-between items-center py-2">
                    <div>
                        <p class="font-medium">${p.name}</p>
                        <p class="text-xs text-slate-500">LKR ${p.price.toFixed(2)}</p>
                    </div>
                    <button onclick="deleteProduct(${p.id})" class="text-red-500 text-sm">Delete</button>
                </div>
            `).join('');
        }

        // Settings
        function handleLogo(input) {
            const reader = new FileReader();
            reader.onload = function(e) {
                db.settings.logo = e.target.result;
                document.getElementById('logo-preview').src = e.target.result;
                document.getElementById('logo-preview').classList.remove('hidden');
            };
            if(input.files[0]) reader.readAsDataURL(input.files[0]);
        }

        function saveSettings() {
            db.settings.name = document.getElementById('cfg-name').value;
            db.settings.details = document.getElementById('cfg-details').value;
            saveData();
            alert('Settings Saved Locally!');
        }

        // Render products selection list inside Invoice / Quotation
        function renderSelectionLists() {
            const generateHTML = (prefix) => db.products.map(p => `
                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" class="prod-chk" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
                        <span>${p.name} (LKR ${p.price})</span>
                    </label>
                    <input type="number" value="1" min="1" class="prod-qty w-12 p-1 border border-slate-200 rounded text-center" style="display:none">
                </div>
            `).join('');

            document.getElementById('inv-product-list').innerHTML = generateHTML('inv');
            document.getElementById('q-product-list').innerHTML = generateHTML('q');

            // Show/Hide Qty input based on checkbox checked status
            document.querySelectorAll('.prod-chk').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const qtyInput = e.target.closest('div').querySelector('.prod-qty');
                    qtyInput.style.display = e.target.checked ? 'block' : 'none';
                });
            });
        }

        // PDF Generation
        function generatePDF(type) {
            const customer = document.getElementById(type === 'invoice' ? 'inv-customer' : 'q-customer').value;
            if(!customer) return alert('Please enter Customer Name');

            const container = document.getElementById(type === 'invoice' ? 'inv-product-list' : 'q-product-list');
            const checkedItems = container.querySelectorAll('.prod-chk:checked');
            
            if(checkedItems.length === 0) return alert('Please select at least one product');

            // Map PDF Fields
            document.getElementById('pdf-com-name').innerText = db.settings.name;
            document.getElementById('pdf-com-details').innerText = db.settings.details;
            if(db.settings.logo) {
                document.getElementById('pdf-logo').src = db.settings.logo;
                document.getElementById('pdf-logo').classList.remove('hidden');
            } else {
                document.getElementById('pdf-logo').classList.add('hidden');
            }

            document.getElementById('pdf-title').innerText = type;
            document.getElementById('pdf-customer').innerText = customer;
            document.getElementById('pdf-date').innerText = new Date().toLocaleDateString();

            let total = 0;
            let rowsHtml = '';

            checkedItems.forEach(chk => {
                const name = chk.dataset.name;
                const price = parseFloat(chk.dataset.price);
                const qty = parseInt(chk.closest('div').querySelector('.prod-qty').value) || 1;
                const subtotal = price * qty;
                total += subtotal;

                rowsHtml += `
                    <tr>
                        <td class="p-2 border border-slate-200">${name}</td>
                        <td class="p-2 border border-slate-200 text-center">${qty}</td>
                        <td class="p-2 border border-slate-200 text-right">${price.toFixed(2)}</td>
                        <td class="p-2 border border-slate-200 text-right">${subtotal.toFixed(2)}</td>
                    </tr>
                `;
            });

            document.getElementById('pdf-items').innerHTML = rowsHtml;
            document.getElementById('pdf-total').innerText = total.toFixed(2);

            // Trigger html2pdf conversion
            const element = document.getElementById('pdf-template');
            element.classList.remove('hidden'); // momentarily unhide for capture
            
            const opt = {
                margin:       0.5,
                filename:     `${type}_${customer}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', portrait: true }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                element.classList.add('hidden');
            });
        }

        // Initialize App
        window.onload = loadData;
    </script>
</body>
</html>
