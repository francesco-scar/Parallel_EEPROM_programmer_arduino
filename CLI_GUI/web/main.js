const ADDRESS_BITS = 15;
const BYTES_PER_ROW = 16;
const MIN_ADDRESS_BIT_SHOWED = 6;

let address_bit_showed = MIN_ADDRESS_BIT_SHOWED;
let current_cell = 0;
let current_cell_type = 'hex';
let jump_next_cell = 0;

let binaryData = new Uint8Array(2**ADDRESS_BITS);
binaryData.fill(0xff);

let link = document.querySelector("link[rel~='icon']");
if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
}
link.href = 'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAACMklEQVRIx93WT27bVhAG8N8opFFYZg3lGA2S3CK7bvoH8M5HKXqMLlLAOwPNAYIcwgHipMewZVN0A5PR64KkTctWJCHWJgOCC77hzDfzzYd54TQMLfEDZ7xKLgkhUkpFURwfH+/v7+Pi4uLg4KAsy4hIksSPvAsTrml4T93FyzR34pvzH1OSELvj3RCz2SylNJ1O5/M5Li8vU0qLsKYEOXPawxzC67h1yij5M8Us0uc0Ho+Pjo5weHhYVdXe3l7nmNLV1dWdHMEOBX+Egs9kvCSTWduqqloEvswy8u4d3t/jYM4Zv6YoY3dvV9Lijbj1vM0UOg7ehKeMiEEaX6kgJKmqKule0DWtXs6BkmuSFvXq0AscNLd1rOBgY9QPpD6JDsICB791OpBWBFjKQVdBDotqeDwLH0PNB+oHOFg/zDIORmoa3XsrFfwd9PBf8oQvj8tBPXDdSgV/DQLvMHtkDvopQtpKEd+DDk5Ds1UdtG1ptlVEJvpsGc94wtvYmINiKQe9klO/UTdYcWtWcAIaMkaU/JKc9x1bSUPrUPJzWuQgur5gK9j7jXYy6Fl76agfQwf9ZA6U3Ob81g3WA42uJeFDwIiaT5x/sw4mPCPneshBPXhu/lnfbpyHQbL25nmz0VqtjfiJkt+TchMd/BMK/mVORsYL8nYftBvtS38wIaPov6xM0FAwoWCnB5q6Qb+70Z6TMyJRbcjBmOiH8JSmu/ze3Wh5P6nBZLPB6YSZDyip4X+J1Bh7fF2fhAAAAABJRU5ErkJggg==';


drawTable()
