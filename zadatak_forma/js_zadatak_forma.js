function provjeri() {
    var rezultat = 0; 
    
    var pitanje1 = document.kviz.pitanje1.value;
    var pitanje2 = document.kviz.pitanje2.value;
    var pitanje3 = document.kviz.pitanje3.value;
    var pitanje4 = document.kviz.pitanje4.value;
    var pitanje5 = document.kviz.pitanje5.value;
    var pitanje6 = document.kviz.pitanje6.value;
    var pitanje7 = document.kviz.pitanje7.value;
    var pitanje8 = document.kviz.pitanje8.value;
    var pitanje9 = document.kviz.pitanje9.value;
    var pitanje10 = document.kviz.pitanje10.value;

    // Provjera odgovora
    if (pitanje1 == "a") {
        rezultat++;
    }
    if (pitanje2 == "b") {
        rezultat++;
    }
    if (pitanje3 == "a") {
        rezultat++;
    }
    if (pitanje4 == "a") {
        rezultat++;
    }
    if (pitanje5 == "c") {
        rezultat++;
    }
    if (pitanje6 == "img") {
        rezultat++;
    }
    if (pitanje7 == "b") {
        rezultat++;
    }
    if (pitanje8 == "a") {
        rezultat++;
    }
    if (pitanje9 == "b") {
        rezultat++;
    }
    if (pitanje10 == "a") {
        rezultat++;
    }


    var messages = ["Bravo! Ostvario si zadovoljavajuć broj bodova.", "Prosječno", "Mrav na zemlji može bolje od tebe"];
    var range;


    if (rezultat <= 4) {
        range = 2;
    } else if (rezultat >= 5 && rezultat < 8) {
        range = 1;
    } else if (rezultat >= 8) {
        range = 0;
    }


    document.getElementById("after").style.visibility = "visible";
    document.getElementById("poruka").innerHTML = messages[range];
    document.getElementById("broj_tocnih").innerHTML = "Imaš " + rezultat + " točnih odgovora";
}
