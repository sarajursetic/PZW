let numb = Math.floor(Math.random() * 10) + 1;
const broj = prompt("Pogodi broj između 1 i 10: ");


if (broj == numb){
    alert("Bravo!");
} 
else {
    alert("Netočan broj, broj je bio: " + numb);
}
