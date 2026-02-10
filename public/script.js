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
    
    const dataInQR = {
        Name: name,
        Dob: dob,
        listOfAllergies: allergyList
    }
    
    if (name === "" || dob === "" || allergyList.length === 0) {
        alert('Please enter required details');
        return;
    }
    
    showSpinner();
    
    // Send data to Netlify Function
    fetch('/.netlify/functions/save-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataInQR)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        hideSpinner();
        
        // Create URL that points to PDF endpoint
        const pdfURL = `${window.location.origin}/.netlify/functions/generate-pdf?id=${data.id}`;
        
        // Generate QR code with the URL
        generateQRCode(pdfURL, size);
        
        setTimeout(() => {
            const saveURL = qr.querySelector('img').src;
            createSaveBtn(saveURL);
        }, 50);
    })
    .catch(error => {
        hideSpinner();
        alert('Error generating QR code: ' + error.message);
        console.error(error);
    });
}

const generateQRCode = (url, size) => {
    const qrcode = new QRCode('qrcode', {
        text: url,
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
    document.getElementById('generated').appendChild(link);
}

hideSpinner();
form.addEventListener('submit', onGenrateSubmit);