import eel
import base64
from comunication_functions import *

programmer = Programmer()
port = ''

@eel.expose
def connectProgrammer():
    global port
    if port == '' or port == 'STOP': 
        port = programmer.get_port_name()
        if port == 'STOP':
            return 'STOP'
    programmer.connect_to_arduino()
    return port
  
@eel.expose
def readMemory(start, size):
    read_bytes = programmer.read(begin=start, length=size)
#    print(base64.b64encode(read_bytes).decode('ascii'))
    return base64.b64encode(read_bytes).decode('ascii') # Encode in base64
