document.getElementById('dohvatiTečaj').addEventListener('click', function() {
    const valuta = document.getElementById('valuta').value;
    const url = `https://api.exchangerate-api.com/v4/latest/HRK`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Mrežna greška');
            }
            return response.json();
        })
        .then(data => {
            const tečaj = data.rates[valuta];
            document.getElementById('rezultat').innerText = `Tečaj 1 HRK = ${tečaj} ${valuta}`;
        })
        .catch(error => {
            document.getElementById('rezultat').innerText = 'Greška prilikom dohvaćanja tečaja.';
            console.error('Greška:', error);
        });
});