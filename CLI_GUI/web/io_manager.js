function readMemory () {
  document.getElementById('readMemory').classList.add('input--loading');
  disableButtons(true);
  eel.connectProgrammer()((port) => {
    console.log('Connecting on port: '+port)
    if (port != 'STOP'){
      eel.readMemory(0, 2**ADDRESS_BITS-1)(readMemoryCallback);
    } else {
      alert('Port not Found! Make sure arduino is connected and programmed with https://github.com/francesco-scar/Parallel_EEPROM_programmer_arduino software.');
      document.getElementById('readMemory').classList.remove('input--loading');
      disableButtons(false);
    }
  });
  
}

function readMemoryCallback (read_bytes) {
//  console.log(read_bytes);
//  console.log(atob(read_bytes));
  let decoded = atob(read_bytes);   // Decode from base64
  let byte = 0;
  
  binaryData.fill(0xff);
  for (byte = 0; byte < decoded.length && byte < 2**ADDRESS_BITS; byte++) {
    binaryData[byte] = charToHex(decoded[byte]);
  }
  document.getElementById('readMemory').classList.remove('input--loading');
  disableButtons(false);
  drawTable();
}


function disableButtons (disable) {
  document.getElementById('loadFile').disabled = disable;
  document.getElementById('readMemory').disabled = disable;
  document.getElementById('writeMemory').disabled = disable;
  document.getElementById('saveFile').disabled = disable;
}
