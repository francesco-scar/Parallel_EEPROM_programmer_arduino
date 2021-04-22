const ADDRESS_BITS = 16;
const BYTES_PER_ROW = 16;
const MIN_ADDRESS_BIT_SHOWED = 6;

let address_bit_showed = MIN_ADDRESS_BIT_SHOWED;
let current_cell = 0;
let current_cell_type = 'hex';
let jump_next_cell = 0;

let binaryData = new Uint8Array(2**ADDRESS_BITS);
binaryData.fill(0xff);

drawTable()
