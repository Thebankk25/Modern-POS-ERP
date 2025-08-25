
import { Transaction } from '../types.ts';

const generateReceiptHtml = (transaction: Transaction): string => {
    const itemsHtml = transaction.items.map(item => `
        <tr class="text-left">
            <td class="py-1 pr-1">${item.name} (x${item.quantity})</td>
            <td class="py-1 pl-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const receiptDate = new Date(transaction.date).toLocaleString('th-TH', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });

    return `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>ใบเสร็จ #${transaction.id.slice(-6)}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Sarabun', sans-serif;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                @page {
                    size: 80mm auto;
                    margin: 3mm;
                }
                @media screen {
                    body {
                        background-color: #f1f5f9;
                    }
                    .receipt {
                        width: 80mm;
                        box-shadow: 0 0 10px rgba(0,0,0,0.15);
                        margin: 20px auto;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt bg-white text-black text-xs p-2">
                <div class="text-center mb-2">
                    <h1 class="text-base font-bold">ร้านค้า POS ERP</h1>
                    <p>ใบเสร็จรับเงินอย่างย่อ</p>
                </div>

                <div class="text-xs mb-2">
                    <p>เลขที่: ${transaction.id}</p>
                    <p>วันที่: ${receiptDate}</p>
                </div>
                
                <table class="w-full">
                    <thead>
                        <tr>
                            <th class="text-left font-semibold py-1 border-t border-b border-dashed border-black">รายการ</th>
                            <th class="text-right font-semibold py-1 border-t border-b border-dashed border-black">ราคา</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="mt-2 pt-2 border-t border-dashed border-black">
                    <div class="flex justify-between">
                        <span>ยอดรวม</span>
                        <span>${transaction.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>ภาษี (7%)</span>
                        <span>${transaction.tax.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-black">
                        <span>รวมทั้งสิ้น</span>
                        <span>${transaction.total.toFixed(2)} บาท</span>
                    </div>
                </div>

                <div class="text-center mt-3 text-xs">
                    <p>ขอบคุณที่ใช้บริการ</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const printReceipt = (transaction: Transaction) => {
    const printWindow = window.open('', '_blank', 'height=600,width=400');
    if (!printWindow) {
        alert('กรุณาอนุญาต pop-ups เพื่อพิมพ์ใบเสร็จ');
        return;
    }

    const html = generateReceiptHtml(transaction);
    printWindow.document.write(html);
    printWindow.document.close();

    // Give the content and styles time to load before printing
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500); 
};
