/*
* IndexedDB
* */

function createDatabase() {
    // apakah browser support dengan IDB
    if (!('indexedDB' in window)) {
        console.log('Web Browser tidak mendukung IDB');
        return;
    }
    // membuat database
    var request = window.indexedDB.open('db-a1');

    request.onerror = tanganiError;
    request.onupgradeneeded = (e) => {
        var db = e.target.result;
        db.onerror = tanganiError;
        // Buat objek baru
        var objStore = db.createObjectStore('mahasiswa',{keyPath : 'nim'});
        console.log('Object mahasiswa berhasil dibuat');
    }
    request.onsuccess = (e) => {
        db = e.target.result;
        db.onerror = tanganiError;
        console.log('Berhasil melakukan koneksi ke IDB');
        // LAKUKAN SESUATU ...
        bacaDariDB();
    }
}

function tanganiError(e) {
    console.log('Error IDB ' + e.target.errorCode);
}

createDatabase();
var tabel = document.getElementById('tabel-mahasiswa'),
    form = document.getElementById('form-tambah'),
    nama = document.getElementById('nama'),
    nim = document.getElementById('nim'),
    gender = document.getElementById('gender');

form.addEventListener('submit', tambahBaris);

function tambahBaris(e) {
    // cek apakah nim sudah ada di tabel
    if (tabel.rows.namedItem(nim.value)){
        alert("Error : NIM sudah terdaftar");
        e.preventDefault();
        return;
    }
    // masukkan ke database
    insertKeDB({
        nim : nim.value,
        nama : nama.value,
        gender : gender.value,
    });

    // modifikasi tabel dengan manggunakan fungsi appendChild()
    var baris = tabel.insertRow(); // => <tr></tr>
    baris.id = nim.value; // => <tr id="123"> </tr>
    baris.insertCell().appendChild(document.createTextNode(nim.value));
    baris.insertCell().appendChild(document.createTextNode(nama.value));
    baris.insertCell().appendChild(document.createTextNode(gender.value));

    // button
    var btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Hapus';
    btn.id = nim.value;
    btn.className = 'btn btn-danger btn-sm';
    baris.insertCell().appendChild(btn);
    e.preventDefault();
}

function insertKeDB(mahasiswa) {
    var objStore = buatTransaksi().objectStore('mahasiswa');
    var request = objStore.add(mahasiswa);
    request.onerror = tanganiError;
    request.onsuccess = console.log("Mahasiswa nim " + mahasiswa.nim +
    'berhasil ditambahkan ke DB');
}

function buatTransaksi() {
    var transaksi = db.transaction(['mahasiswa'],'readwrite');
    transaksi.onerror = tanganiError;
    transaksi.oncomplete = console.log("Transaksi selesai");

    return transaksi;
}

bacaDariDB = () => {
    var objStore = buatTransaksi().objectStore('mahasiswa');
    objStore.openCursor().onsuccess = (e) => {
        var result = e.target.result;
        if(result){
            console.log('Membaca ['+result.value.nim+' ] dari IDB');
    
            var baris = tabel.insertRow(); // => <tr></tr>
            baris.id = nim.value; // => <tr id="123"> </tr>
            baris.insertCell().appendChild(document.createTextNode(nim.value));
            baris.insertCell().appendChild(document.createTextNode(nama.value));
            baris.insertCell().appendChild(document.createTextNode(gender.value));
        
            // button
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Hapus';
            btn.id = nim.value;
            btn.className = 'btn btn-danger btn-sm';
            baris.insertCell().appendChild(btn);
            result.continue();
        }
    }

}

tabel.addEventListener('click',hapusBaris);
function hapusBaris(e){
    if(e.target.type === 'button'){
        var hapus = confirm('Apakah anda yakin ingin menghapus data ?');
        if(hapus){
            tabel.deleteRow(tabel.rows.namedItem(e.target.id).sectionRowIndex);
            hapusDariDB(e.target.id);
        } 
    }
}

function hapusDariDB(nim){
    var objStore = buatTransaksi().objectStore('mahasiswa');
    var request = objStore.delete(nim);
    request.error = tanganiError;
    request.onsuccess = console.log('Berhasil manghapus mahasiswa ['+nim+']');

}