document.onkeydown = function (event) {
 if(event.which == 9 || event.which == 32 || (event.which >= 37 && event.which <= 40)) { // disable tab and arrows effect (used for cells navigation)
//   console.log(event);
   event.preventDefault();        // TODO: if button (eg + or -) is pressed and focused, then space (code 32) will simulate button click (I wasn't able to avoid that) 
   return false;
 }
}

function key_pressed (event) {
//  console.log(event);
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
