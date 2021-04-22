document.getElementById("fileToRead").addEventListener("change",function(){
    var file = this.files[0];

    if (file) {
        var reader = new FileReader();
        
        reader.onload = function (evt) {
            let char = 0
            binaryData.fill(0xff);
            for (char = 0; char < evt.target.result.length && char < 2**ADDRESS_BITS; char++) {
              binaryData[char] = evt.target.result.charCodeAt(char);
            }
            if (char == 2**ADDRESS_BITS) {
              alert("File too long, only first "+(2**ADDRESS_BITS)+" bytes read.")
            }
            address_bit_showed = Math.ceil(Math.log2(char-1));
            if (address_bit_showed < MIN_ADDRESS_BIT_SHOWED) {
              address_bit_showed = MIN_ADDRESS_BIT_SHOWED;
            }
            drawTable();
        };

        reader.onerror = function (evt) {
            alert("An error ocurred reading the file", evt);
        };

        reader.readAsBinaryString(file,'ascii');
    }
},false);


function saveFile() {
  let blob = new Blob([binaryData], {type: 'application/x-binary'});
  let anchor = document.createElement('a');
  anchor.href=window.URL.createObjectURL(blob);
//  anchor.download="Parallel_EEPROM_programmer_arduino_"+(new Date().toLocaleString().replaceAll(',', '').replaceAll('/', '-').replaceAll(' ', '_'))+".bin";
  anchor.download="Parallel_EEPROM_programmer_arduino.bin";    // TODO: custom/decent name
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
 
