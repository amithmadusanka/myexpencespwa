<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MenuMint</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
</head>
<body class="bg-amber-50 text-neutral-800 font-sans min-h-screen pb-16">

    <header class="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50">
        <div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 class="text-xl font-bold text-orange-700">MenuMint</h1>
            <nav class="flex space-x-2">
                <button id="tab-creator" onclick="switchTab('creator')" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">ක්‍රියේටර්</button>
                <button id="tab-orders" onclick="switchTab('orders')" class="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100">ඕඩර්ස්</button>
                <button id="tab-history" onclick="switchTab('history')" class="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100">හිස්ට්‍රි</button>
            </nav>
        </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
        
        <div id="view-creator" class="">
            </div>

        <div id="view-orders" class="hidden">
            <div class="bg-white rounded-2xl p-6 shadow-md border border-orange-100 mb-6">
                <h2 class="text-lg font-bold text-orange-800 mb-4">නව ඕඩරයක් ඇතුලත් කරන්න</h2>
                
                <form id="order-form" onsubmit="addOrder(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">ඕඩර් එක/පාරිභෝගිකයාගේ නම</label>
                        <input type="text" id="order-name" required class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">දිනය</label>
                            <input type="date" id="order-date" required class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">වේලාව (උදේ/දවල්/රෑ)</label>
                            <select id="order-time" required class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none">
                                <option value="උදේ">උදේ (Morning)</option>
                                <option value="දවල්">දවල් (Afternoon)</option>
                                <option value="රෑ">රෑ (Night)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">ස්ථානය (Location)</label>
                        <input type="text" id="order-location" required class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="උදා: කොළඹ">
                    </div>

                    <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg transition">
                        ඕඩරය සුරකින්න
                    </button>
                </form>
            </div>

            <div class="bg-amber-100 border border-amber-300 rounded-xl p-4 mb-6 flex justify-between items-center">
                <span class="text-xs text-amber-900 font-medium">මතක් කිරීම් ලබා ගැනීමට Notification සක්‍රීය කරන්න:</span>
                <button onclick="requestNotificationPermission()" class="bg-amber-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-amber-900">සක්‍රීය කරන්න</button>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-md border border-orange-100">
                <h2 class="text-lg font-bold text-orange-800 mb-4">සියලුම ඕඩර්ස්</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-gray-200 text-gray-600 text-sm">
                                <th class="pb-3">නම</th>
                                <th class="pb-3">දිනය</th>
                                <th class="pb-3">වේලාව</th>
                                <th class="pb-3">ස්ථානය</th>
                                <th class="pb-3 text-right">ක්‍රියාකාරකම්</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body" class="divide-y divide-gray-100 text-sm">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="view-history" class="hidden">
            </div>

    </main>

    <script src="app.js"></script>
    <script>
        // Service Worker ලියාපදිංචි කිරීම (Offline වැඩ කිරීමට)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker Registered'));
        }
    </script>
</body>
</html>
