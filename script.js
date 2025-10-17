// kalkulator-mol.js

// --- BAGIAN 1: DATA MASSA ATOM RELATIF (Ar) ---
const AR_DATA = {
    // Periode 1
    "H": 1.008,   "He": 4.003,
    // Periode 2
    "Li": 6.941,   "Be": 9.012,   "B": 10.81,    "C": 12.01,    "N": 14.01,    "O": 16.00,    "F": 19.00,    "Ne": 20.18,
    // Periode 3
    "Na": 22.99,   "Mg": 24.31,   "Al": 26.98,   "Si": 28.09,   "P": 30.97,    "S": 32.07,    "Cl": 35.45,   "Ar": 39.95,
    // Periode 4
    "K": 39.10,    "Ca": 40.08,   "Sc": 44.96,   "Ti": 47.87,   "V": 50.94,    "Cr": 52.00,   "Mn": 54.94,   "Fe": 55.85,
    "Ni": 58.69,   "Cu": 63.55,   "Zn": 65.38,   "As": 74.92,   "Br": 79.90,   "Kr": 83.80,
    // Unsur-unsur penting lainnya
    "Ag": 107.87,  "Sn": 118.71,  "I": 126.90,   "Ba": 137.33,  "Au": 196.97,  "Hg": 200.59,  "Pb": 207.2,
};

// --- BAGIAN 2: LOGIKA PERHITUNGAN MOL & MR ---

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan DOM sudah dimuat sebelum menambahkan listener
    document.getElementById('hitung-mr-btn').addEventListener('click', hitungMr);
    document.getElementById('konversi-mol-btn').addEventListener('click', konversiMolMassMr);
});

/**
 * Memecah rumus kimia menjadi komponen elemen dan jumlahnya.
 */
function parseRumusKimia(rumus) {
    const rumusBersih = rumus.replace(/\s/g, '').trim(); 
    
    // Regex: ([A-Z][a-z]*) menangkap elemen, (\d*) menangkap angka multi-digit
    const matches = rumusBersih.match(/([A-Z][a-z]*)(\d*)/g);
    
    if (!matches) return [];

    const komponen = [];
    for (let match of matches) {
        const elemenMatch = match.match(/[A-Z][a-z]*/);
        const elemen = elemenMatch ? elemenMatch[0] : null;

        const jumlahMatch = match.match(/\d+/);
        const jumlah = jumlahMatch ? parseInt(jumlahMatch[0]) : 1; 

        if (elemen && AR_DATA[elemen]) {
            komponen.push({ elemen, jumlah });
        } else if (elemen) {
            throw new Error(`Elemen '${elemen}' tidak ditemukan dalam database AR.`);
        }
    }
    return komponen;
}

/**
 * Menghitung Massa Molar (Mr) dan rincian Ar.
 */
function hitungMr() {
    const rumusInput = document.getElementById('rumus-kimia').value.trim();
    const resultDiv = document.getElementById('mr-result');

    if (!rumusInput) {
        resultDiv.innerHTML = '<p style="color: red;">Masukkan rumus kimia.</p>';
        return;
    }

    try {
        const komponen = parseRumusKimia(rumusInput);
        if (komponen.length === 0) {
            throw new Error('Format rumus kimia tidak valid atau tidak ada elemen yang dikenal.');
        }

        let totalMr = 0;
        let detailHtml = `**Perhitungan Mr ${rumusInput}**<br>`;

        komponen.forEach(item => {
            const ar = AR_DATA[item.elemen];
            const kontribusi = ar * item.jumlah;
            totalMr += kontribusi;
            
            detailHtml += `${item.elemen} (${item.jumlah}) x Ar ${item.elemen} (${ar.toFixed(3)}) = ${kontribusi.toFixed(3)}<br>`;
        });

        resultDiv.innerHTML = `
            <p style="text-align: left;">${detailHtml}</p>
            <p class="hasil-mr">**Massa Molar (Mr): ${totalMr.toFixed(3)} g/mol**</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

/**
 * Konversi Mol ↔ Massa ↔ Mr.
 */
function konversiMolMassMr() {
    // Fungsi bantuan untuk membersihkan input dari koma (,) menjadi titik (.)
    const cleanParse = (id) => {
        const value = document.getElementById(id).value.replace(',', '.');
        return value.trim() === '' ? NaN : parseFloat(value);
    };

    let mol = cleanParse('mol-input');
    let massa = cleanParse('massa-input');
    let mr = cleanParse('mr-input');
    const resultDiv = document.getElementById('mol-konversi-result');
    let count = 0;

    // Hitung berapa banyak input yang valid
    if (!isNaN(mol) && mol >= 0) count++;
    if (!isNaN(massa) && massa >= 0) count++;
    if (!isNaN(mr) && mr >= 0) count++;

    if (count !== 2) {
        resultDiv.innerHTML = '<p style="color: orange;">⚠️ Masukkan TEPAT dua nilai untuk menghitung yang ketiga. (Mol, Massa, Mr).</p>';
        return;
    }

    // Hitung salah satu nilai yang hilang
    if (isNaN(mol)) {
        // Hitung Mol (n = massa / Mr)
        if (mr <= 0) {
             resultDiv.innerHTML = '<p style="color: red;">Massa Molar (Mr) harus > 0.</p>'; return;
        }
        mol = massa / mr;
        resultDiv.innerHTML = `<p style="text-align: left;">Rumus: n = Massa / Mr</p>
                               <p class="hasil-konversi">**Mol (n): ${mol.toFixed(4)} mol**</p>`;
    } else if (isNaN(massa)) {
        // Hitung Massa (massa = n × Mr)
        massa = mol * mr;
        resultDiv.innerHTML = `<p style="text-align: left;">Rumus: Massa = n × Mr</p>
                               <p class="hasil-konversi">**Massa: ${massa.toFixed(3)} gram**</p>`;
    } else if (isNaN(mr)) {
        // Hitung Mr (Mr = massa / n)
        if (mol <= 0) {
             resultDiv.innerHTML = '<p style="color: red;">Jumlah Mol (n) harus > 0 saat menghitung Mr.</p>'; return;
        }
        mr = massa / mol;
        resultDiv.innerHTML = `<p style="text-align: left;">Rumus: Mr = Massa / n</p>
                               <p class="hasil-konversi">**Massa Molar (Mr): ${mr.toFixed(3)} g/mol**</p>`;
    }
          }
