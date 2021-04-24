function readMemory () {
  document.getElementById('readMemory').classList.add('input--loading');
  disableButtons(true);
  eel.connectProgrammer()((port) => {
    console.log('Connecting on port: '+port)
    if (port != 'STOP'){
      if (getRadioValue('readRangeSelect') == 0) {                      // Read Entire Memory
        eel.readMemory(0, 2**ADDRESS_BITS-1)(readMemoryCallback);
      } else {
        eel.readMemory(0, 2**address_bit_showed-1)(readMemoryCallback); // Read Only Visible
      }
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


function writeMemory () {
  document.getElementById('writeMemory').classList.add('input--loading');
  disableButtons(true);
  eel.connectProgrammer()((port) => {
    console.log('Connecting on port: '+port)
    if (port != 'STOP') {
      if (getRadioValue('writeRangeSelect') == 0) {
        eel.writeMemory(0, toBase64(binaryData.slice(0, 2**ADDRESS_BITS)))(writeMemoryCallback);          // Write Entire Memory
      } else {
        eel.writeMemory(0, toBase64(binaryData.slice(0, 2**address_bit_showed)))(writeMemoryCallback);    // Write Only Visible
      }
    } else {
      alert('Port not Found! Make sure arduino is connected and programmed with https://github.com/francesco-scar/Parallel_EEPROM_programmer_arduino software.');
      document.getElementById('writeMemory').classList.remove('input--loading');
      disableButtons(false);
    }
  });
}

function writeMemoryCallback () {
  document.getElementById('writeMemory').classList.remove('input--loading');
  disableButtons(false);
  
  if (getRadioValue('readAfterWrite') == 1) {
    readMemory();
  }
}

let encoder = new TextEncoder("ascii");                                           // https://stackoverflow.com/a/63526839/13040240
let decoder = new TextDecoder("ascii");
let base64Table = encoder.encode('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=');
function toBase64(dataArr){
  let padding = dataArr.byteLength % 3;
  let len = dataArr.byteLength - padding;
  padding = padding > 0 ? (3 - padding) : 0;
  let outputLen = ((len/3) * 4) + (padding > 0 ? 4 : 0);
  let output = new Uint8Array(outputLen);
  let outputCtr = 0;
  for(let i=0; i<len; i+=3){
    let buffer = ((dataArr[i] & 0xFF) << 16) | ((dataArr[i+1] & 0xFF) << 8) | (dataArr[i+2] & 0xFF);
    output[outputCtr++] = base64Table[buffer >> 18];
    output[outputCtr++] = base64Table[(buffer >> 12) & 0x3F];
    output[outputCtr++] = base64Table[(buffer >> 6) & 0x3F];
    output[outputCtr++] = base64Table[buffer & 0x3F];
  }
  if (padding == 1) {
    let buffer = ((dataArr[len] & 0xFF) << 8) | (dataArr[len+1] & 0xFF);
    output[outputCtr++] = base64Table[buffer >> 10];
    output[outputCtr++] = base64Table[(buffer >> 4) & 0x3F];
    output[outputCtr++] = base64Table[(buffer << 2) & 0x3F];
    output[outputCtr++] = base64Table[64];
  } else if (padding == 2) {
    let buffer = dataArr[len] & 0xFF;
    output[outputCtr++] = base64Table[buffer >> 2];
    output[outputCtr++] = base64Table[(buffer << 4) & 0x3F];
    output[outputCtr++] = base64Table[64];
    output[outputCtr++] = base64Table[64];
  }
  
  let ret = decoder.decode(output);
  output = null;
  dataArr = null;
  return ret;
}


function getRadioValue (name) {
  return document.querySelector('input[name="'+name+'"]:checked').value;
  /*
  let radios = document.getElementsByName(name);
  for (let i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  */
}



function disableButtons (disable) {
  document.getElementById('loadFile').disabled = disable;
  document.getElementById('readMemory').disabled = disable;
  document.getElementById('writeMemory').disabled = disable;
  document.getElementById('saveFile').disabled = disable;
  for (el of document.querySelectorAll('[name="readRangeSelect"], [name="writeRangeSelect"], [name="readAfterWrite"]')) {
    el.disabled = disable;
    if (disable) {
      el.style.cursor = 'not-allowed';
    } else {
      el.style.cursor = '';
    }
  }
  for (el of document.querySelectorAll('[id="readRangeSelect"], [id="writeRangeSelect"], [id="readAfterWrite"]')) {
    if (disable) {
      el.style.cursor = 'not-allowed';
      el.style.color = '#aaa';
    } else {
      el.style.cursor = '';
      el.style.color = '';
    }
  }
}
