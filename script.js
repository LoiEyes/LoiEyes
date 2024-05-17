let device;
let jumlahGif = 22;
let tft;
let alert = false;
var Success = document.querySelector('#alert-success');
var Connectedd = document.querySelector('#alert-connected');
var Failed = document.querySelector('#alert-failed');
let statusboard;
function generateSwiperSlides(numSlides) {
    var swiperWrapper = document.querySelector('.swiper-wrapper');
    for (var i = 1; i <= numSlides; i++) {
        var div = document.createElement('div');
        div.classList.add('swiper-slide');
        div.dataset.value = i;
        var img1 = document.createElement('img');
        img1.src = 'GIF/' + i + 'L.gif';
        img1.classList.add('swiper-image');
        div.appendChild(img1);
        var img2 = document.createElement('img');
        img2.src = 'GIF/' + i + 'R.gif';
        img2.classList.add('swiper-image');
        div.appendChild(img2);
        swiperWrapper.appendChild(div);
    }
}
generateSwiperSlides(jumlahGif);


function connectedAlert() {
    if (alert) {
        Connectedd.classList.remove('hidden');
        setTimeout(function () {
            alert = false;
            Connectedd.classList.add('hidden');
        }, 3000);
    }
}
function successAlert() {
    if (alert) {
        Success.classList.remove('hidden');
        setTimeout(function () {
            alert = false;
            Success.classList.add('hidden');
        }, 3000);
    }
}
function failedAlert() {
    if (alert) {
        Failed.classList.remove('hidden');
        setTimeout(function () {
            alert = false;
            Failed.classList.add('hidden');
        }, 3000);
    }
}

Success.classList.add('hidden');
Connectedd.classList.add('hidden');
Failed.classList.add('hidden');
async function hideConnectDevice() {
    var connectDevice = document.querySelector('.connect-device');
    var connectedDevice = document.querySelector('.connected-device');
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['dee13011-14d8-4e12-94af-a6edfeaa1af9'] }] // UUID untuk layanan yang sama dengan yang digunakan di ESP32
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('dee13011-14d8-4e12-94af-a6edfeaa1af9');
        tft = await service.getCharacteristic('dee13012-14d8-4e12-94af-a6edfeaa1af9');
        console.log('Connected to ESP32');
        connectDevice.classList.add('hidden');
        connectedDevice.classList.remove('hidden');
        alert = true;
        connectedAlert();
    } catch (error) {
        console.error('Error connecting to ESP32:', error);
    }
}
function openPopupForm() {
    const statusBoardElement = document.querySelector('.statusboard');
    const statusText = statusBoardElement.textContent;
    if (statusText != "UNLOCKED") {
        var myModal = new bootstrap.Modal(document.getElementById('popupForm'), {
            keyboard: false
        });
        myModal.show();
    }
}

function handleCharacteristicChange(event) {
    statusboard = new TextDecoder().decode(event.target.value);
    console.log("status: ", statusboard);
    if (statusboard === "LOCKED") {
        locked = true;
    } else if (statusboard === "UNLOCKED") {
        locked = false;
    }
    const statusBoardElement = document.querySelector('.statusboard');
    statusBoardElement.innerHTML = `<p>${statusboard}</p>`;
    if (locked) {
        openPopupForm();
    }
}
async function changegif(newValue) {
    if (device && device.gatt && device.gatt.connected && tft) {
        try {
            await tft.writeValue(new TextEncoder().encode(newValue));
            console.log('Nilai telah diubah menjadi:', newValue);
            alert = true;
            successAlert();
            // readstatus();
        } catch (error) {
            alert = true;
            failedAlert();
            console.error('Gagal mengubah nilai:', error);
        }
    } else {
        console.error('Tidak dapat mengirim nilai baru: Perangkat tidak terhubung atau karakteristik tidak tersedia.');
        alert = true;
        failedAlert();
    }
}

var swiper = new Swiper(".mySwiper", {
    effect: "coverflow",
    grabCursor: true,
    loop: false,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier:10    ,
        slideShadows: false,
    },
    on: {
        doubleTap: function () {

            var activeSlide = this.slides[this.activeIndex];
            // Mendapatkan nilai dari atribut data-value
            var value = activeSlide.getAttribute('data-value');
            // Logging nilai data-value
            console.log('Nilai data-value:', value);
            // Fungsi yang akan dipanggil ketika double tap terdeteksi
            console.log('Double tap terdeteksi!');
            changegif(value);
            // Anda dapat menambahkan tindakan lain yang ingin dilakukan di sini
        }
    }
});