import time
import sys
from comunication_functions import *


BAUD_RATE = 115200

#arduino.write(payload.encode())

programmer = Programmer(BAUD_RATE)
port = programmer.get_port_name()
programmer.connect_to_arduino()


programmer.benchmark()
