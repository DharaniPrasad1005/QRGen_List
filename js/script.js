
const form = document.getElementById('generate-form');
const qr = document.getElementById('qrcode');

const onGenrateSubmit = (e) => {
    e.preventDefault();
    clearUI();

    const name = document.getElementById('name').value;
    const dob = document.getElementById('dob').value;
    const selectedAllergies = document.querySelectorAll('input[name="allergens[]"]:checked');
    const allergyList = Array.from(selectedAllergies).map(el => el.value);

    const size = document.getElementById('size').value;
    console.log(size);

    const dataInQR = {
        Name: name,
        Dob: dob,
        listOfAllergies: allergyList
    }
    console.log(dataInQR);
    const dataInQR_json = JSON.stringify(dataInQR);

    if (name === "" || dob === "" || allergyList === "") {
        alert('Please enter required details');
    } else {
        showSpinner();

        setTimeout(() => {
            hideSpinner();
            generateQRCode(dataInQR_json, size);

            setTimeout(() => {
                const saveURL = qr.querySelector('img').src;
                createSaveBtn(saveURL);
            }, 50)
        }, 1000)
    }

}


const generateQRCode = (dataInQR_json, size) => {
    const qrcode = new QRCode('qrcode', {
        text: dataInQR_json,
        height: size,
        width: size,

    });
}

const showSpinner = () => {
    document.getElementById('spinner').style.display = 'block';
}

const hideSpinner = () => {
    document.getElementById('spinner').style.display = "none";
}

const clearUI = () => {
    qr.innerHTML = '';
    const saveLink = document.getElementById('save-link');
    if (saveLink) {
        saveLink.remove();
    }

}

const createSaveBtn = (saveURL) => {
    const link = document.createElement('a');
    link.id = 'save-link';
    link.classList = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 rounded w-1/3 m-auto m-5';
    link.href = saveURL;
    link.download = 'qrcode';
    link.innerHTML = 'Save QRcode';
    document.getElementById('generated').appendChild(link)
}

hideSpinner();

form.addEventListener('submit', onGenrateSubmit);
