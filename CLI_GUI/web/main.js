const ADDRESS_BITS = 16;
const BYTES_PER_ROW = 16;
const MIN_ADDRESS_BIT_SHOWED = 6;

let address_bit_showed = MIN_ADDRESS_BIT_SHOWED;
let current_cell = 0;
let current_cell_type = 'hex';
let jump_next_cell = 0;

let binaryData = new Uint8Array(2**ADDRESS_BITS);
binaryData.fill(0xff);

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

table = document.getElementById('table');

function drawTable() {
  table.innerHTML = '';         // Empty table
  
  let row = document.createElement('tr');
  let cell_header = document.createElement('th');
  cell_header.innerText = 'Address';
  row.appendChild(cell_header);
  table.appendChild(row);

  for (let header = 0; header < (BYTES_PER_ROW+1)*2; header++) {
    let cell_header = document.createElement('th');
    if ((header % (BYTES_PER_ROW+1)) == 0) {
      cell_header.innerText = ' ';
    } else {
      cell_header.innerText = ((header-1)%(BYTES_PER_ROW+1)).toString(16);  // ('00'+((header-1)%(BYTES_PER_ROW+1)).toString(16)).slice(-2);
    }
    row.appendChild(cell_header);
  }

  let row_n = 0;
  let column_n = 0;
  for (row_n = 0; row_n < (2**address_bit_showed)/BYTES_PER_ROW; row_n++) {
    let row = document.createElement('tr');
    let cell_header = document.createElement('th');
    cell_header.innerText = ('0'.repeat(ADDRESS_BITS/4)+(row_n*BYTES_PER_ROW).toString(16)).slice(-(ADDRESS_BITS/4));
    cell_header.style.minWidth = '50px';
    row.appendChild(cell_header);
    
    cell = document.createElement('td');
    cell.innerText = ' ';
    row.appendChild(cell);
    
    for (column_n = 0; column_n < BYTES_PER_ROW; column_n++){
      let cell = document.createElement('td');
      cell.innerText = intToHexString(binaryData[row_n*BYTES_PER_ROW+column_n]);
      cell.id = 'hex_cell_' + (row_n*BYTES_PER_ROW+column_n);
      cell.setAttribute('onclick', 'manageCurrentCell('+(row_n*BYTES_PER_ROW+column_n)+', \'hex\')');
      row.appendChild(cell);
    }
    
    cell = document.createElement('td');
    cell.innerText = ' ';
    row.appendChild(cell);
    
    for (column_n = 0; column_n < BYTES_PER_ROW; column_n++){
      let cell = document.createElement('td');
      cell.innerText = hexToChar(binaryData[row_n*BYTES_PER_ROW+column_n]);
      cell.id = 'char_cell_' + (row_n*BYTES_PER_ROW+column_n);
      cell.setAttribute('onclick', 'manageCurrentCell('+(row_n*BYTES_PER_ROW+column_n)+', \'char\')');
      cell.style.width = '1%';
      row.appendChild(cell);
    }
    
    table.appendChild(row);
  }
  manageCurrentCell(current_cell, current_cell_type);
}

function hexToChar (hex) {
  if (hex >= 0x20 && hex <= 0x7e) {
    return String.fromCharCode(hex);
  } else {
    return '.';
  }
}

function intToHexString (int) {
  return ('0'+int.toString(16)).slice(-2);
}

function charToHex (char) {
  return char.charCodeAt(0);
}



document.onkeydown = function (event) {
 if(event.which == 9 || (event.which >= 37 && event.which <= 40)) { // disable tab and arrows effect (used for cells navigation)
  return false;
 }
}

function key_pressed (event) {
  console.log(event);
  if (event.key == 'ArrowRight' && current_cell < (2**address_bit_showed-1)){
    manageCurrentCell(current_cell+1, current_cell_type);
  } else if (event.key == 'ArrowLeft' && current_cell > 0) {
    manageCurrentCell(current_cell-1, current_cell_type);
  } else if (event.key == 'ArrowDown' && (current_cell + BYTES_PER_ROW) < 2**address_bit_showed) {
    manageCurrentCell(current_cell+BYTES_PER_ROW, current_cell_type);
  } else if (event.key == 'ArrowUp' && (current_cell - BYTES_PER_ROW) >= 0) {
    manageCurrentCell(current_cell-BYTES_PER_ROW, current_cell_type);
  } else if (event.key == 'Tab') {
    //console.log(current_cell_type == 'hex' ? 'char' : 'hex')
    manageCurrentCell(current_cell, current_cell_type == 'hex' ? 'char' : 'hex');
  } else {
    let keyCode = event.keyCode;
    if (current_cell_type == 'hex') {
      if ((keyCode >= 0x30 && keyCode <= 0x39) || (keyCode>= 0x61 && keyCode<= 0x66) || (keyCode >= 0x41 && keyCode <= 0x46)) {
        binaryData[current_cell] = ((binaryData[current_cell] << 4) & 0b11110000) + parseInt(String.fromCharCode(keyCode), 16);
        document.getElementById('hex_cell_'+current_cell).innerText = intToHexString(binaryData[current_cell]);
        document.getElementById('char_cell_'+current_cell).innerText = hexToChar(binaryData[current_cell]);
        if (jump_next_cell && (current_cell < (2**address_bit_showed-1))) {
          manageCurrentCell(current_cell+1, current_cell_type);
        } else {
          jump_next_cell = 1;
        }
      }
    } else if (current_cell_type == 'char') {
      if ((event.key).charCodeAt(0) >= 0x20 && (event.key).charCodeAt(0) <= 0x7e && event.key.length == 1) {
        binaryData[current_cell] = (event.key).charCodeAt(0);
        document.getElementById('hex_cell_'+current_cell).innerText = intToHexString(binaryData[current_cell]);
        document.getElementById('char_cell_'+current_cell).innerText = hexToChar(binaryData[current_cell]);
        if (current_cell < (2**address_bit_showed-1)) {
          manageCurrentCell(current_cell+1, current_cell_type);
        }
      }
    }
    
    if (keyCode == 8) {       // Backspace
        binaryData[current_cell] = 0xff;
        document.getElementById('hex_cell_'+current_cell).innerText = 'ff';
        document.getElementById('char_cell_'+current_cell).innerText = '.';
        if (current_cell > 0) {
          manageCurrentCell(current_cell-1, current_cell_type);
        }
    }
  }
}


function manageCurrentCell (number, type) {
  try {
    document.getElementById('hex_cell_'+current_cell).className = '';
    document.getElementById('char_cell_'+current_cell).className = '';
  } catch {}
  
  current_cell = number;
  current_cell_type = type;
  
  try {
    if (current_cell_type == 'hex'){
      document.getElementById('hex_cell_'+current_cell).className = 'selected_main';
      document.getElementById('char_cell_'+current_cell).className = 'selected_minor';
    } else if (current_cell_type == 'char') {
      document.getElementById('hex_cell_'+current_cell).className = 'selected_minor';
      document.getElementById('char_cell_'+current_cell).className = 'selected_main';
    }
  } catch (error) {
    console.log(error);
    manageCurrentCell(0, type);
  }
  jump_next_cell = 0;
}

function manageShowedBits (type) {
  if (type == '+' && address_bit_showed < ADDRESS_BITS) {
    address_bit_showed++;
    drawTable();
  } else if (type == '-' && address_bit_showed > MIN_ADDRESS_BIT_SHOWED) {
    address_bit_showed--;
    drawTable();
  }
  
  if (address_bit_showed == ADDRESS_BITS) {
    document.getElementById('plusButton').disabled = true;
  } else {
    document.getElementById('plusButton').disabled = false;
  }
  if (address_bit_showed == MIN_ADDRESS_BIT_SHOWED) {
    document.getElementById('minusButton').disabled = true;
  } else {
    document.getElementById('minusButton').disabled = false;
  }
}

drawTable()
