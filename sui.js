import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/bcs';
import fs from 'fs';
import xlsx from 'xlsx';
import readline from 'readline';

const CONFIG = {
    outputFile: 'sui_wallets.json',
    addressFile: 'address_sui.txt',
    excelFile: 'sui_wallets.xlsx' // Tên file Excel
};

async function promptForNumberOfWallets() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Nhập số lượng ví bạn muốn tạo: ', (answer) => {
            rl.close();
            const num = parseInt(answer, 10);
            if (isNaN(num) || num <= 0) {
                console.log('Vui lòng nhập một số nguyên hợp lệ lớn hơn 0.');
                process.exit(1);
            }
            resolve(num);
        });
    });
}

async function generateWallets(numberOfWallets) {
    try {
        const wallets = [];
        let addressesText = '';
        const excelData = [];

        for (let i = 0; i < numberOfWallets; i++) {
            const keypair = new Ed25519Keypair();

            const wallet = {
                address: keypair.getPublicKey().toSuiAddress(),
                publicKey: keypair.getPublicKey().toBase64(),
                privateKey: keypair.export().privateKey,
                index: i + 1
            };

            // Thêm địa chỉ vào chuỗi văn bản
            addressesText += `${wallet.address}\n`;

            wallets.push(wallet);

            // Thêm vào dữ liệu Excel
            excelData.push({
                Index: wallet.index,
                Address: wallet.address,
                PublicKey: wallet.publicKey,
                PrivateKey: wallet.privateKey
            });

            console.log(`Tạo ví ${i + 1}/${numberOfWallets}`);
        }

        // Lưu thông tin đầy đủ vào file JSON
        fs.writeFileSync(
            CONFIG.outputFile,
            JSON.stringify(wallets, null, 2)
        );

        // Lưu danh sách địa chỉ vào file text
        fs.writeFileSync(CONFIG.addressFile, addressesText.trim());

        // Tạo file Excel
        const worksheet = xlsx.utils.json_to_sheet(excelData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Wallets');
        xlsx.writeFile(workbook, CONFIG.excelFile);

        console.log(`\nTạo thành công ${numberOfWallets} ví`);
        console.log(`Lưu thông tin đầy đủ vào: ${CONFIG.outputFile}`);
        console.log(`Lưu danh sách địa chỉ vào: ${CONFIG.addressFile}`);
        console.log(`Lưu thông tin Excel vào: ${CONFIG.excelFile}`);

        return wallets;
    } catch (error) {
        console.error('Lỗi tạo ví:', error);
        throw error;
    }
}

(async () => {
    const numberOfWallets = await promptForNumberOfWallets();
    await generateWallets(numberOfWallets);
})();
