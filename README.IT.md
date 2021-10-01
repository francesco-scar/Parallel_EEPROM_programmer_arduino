# Programmatore EEPROM parallela AT28C256 (ed equivalenti) con Arduino

*Read this in other languages: [English :uk: :us:](README.md).*


## Sommario
- [Componenti](#componenti)
- [Schema Circuitale](#schema-circuitale)
- [Librerie e Moduli](#librerie-e-moduli)
  - [Arduino](#arduino)
  - [Python](#python)
- [Software](#software)
  - [Sketch Arduino](#sketch-arduino)
  - [Interfaccia Python](interfaccia-python)
- [Utilizzo](#utilizzo)
  - [Interfaccia Grafica - GUI](#interfaccia-grafica-gui)
  - [Interface a Riga di Comando - CLI](#interfaccia-a-riga-di-comando-cli)
- [Licenza](#licenza)

# Componenti
Per questo progetto sono stati utilizzati i seguenti componenti:
- EEPROM AT28C256 o equivalenti
- Arduino UNO (possono essere usati anche altre versioni compatibili)
- Socket per integrato EEPROM (opzionale)
- Breadboad, jumpers e cavi di collegamento

Se si desidera realizzare il progetto su PCB l'ultimo punto non è necessario

NOTA: Se l'alimentazione tramite l'USB non è sufficiente per la EEPROM potrebbe essere opportuno usare un'alimentazione separata
