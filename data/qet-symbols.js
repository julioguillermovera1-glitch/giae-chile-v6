// Simbolos importados desde la coleccion QElectroTech (qelectrotech.org)
// Licencia CC-BY 3.0 - ver ELEMENTS.LICENSE en qelectrotech/qelectrotech-elements.
// Convertidos automaticamente desde formato .elmt (XML) a primitivas SVG normalizadas.
// Solo se incluyen categorias con pictogramas simples aptos para planta (arquitectura + medidores);
// se excluyo home_appliances porque sus simbolos traen bloques de anotacion de linea unifilar
// (calibre de cable, breaker, etc.) que se ven saturados y mal a escala de icono de plano.
export const QET_SYMBOLS = [
  {
    "id": "qet-architectural-2-electrical-sockets-11-13-02-en60617",
    "label": "Enchufe doble (EN 60617)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": -0.56,
        "cy": 8.73,
        "rx": 11.27,
        "ry": 11.27,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": -0.56,
        "y1": -3.1,
        "x2": -0.56,
        "y2": -20
      },
      {
        "tag": "text",
        "x": 11.83,
        "y": -1.97,
        "text": "2"
      },
      {
        "tag": "line",
        "x1": 9.58,
        "y1": -3.1,
        "x2": 0.56,
        "y2": 3.66
      }
    ]
  },
  {
    "id": "qet-architectural-3-electrical-sockets-11-13-02-en60617",
    "label": "Enchufe triple (EN 60617)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": -0.56,
        "cy": 8.73,
        "rx": 11.27,
        "ry": 11.27,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": -0.56,
        "y1": -3.1,
        "x2": -0.56,
        "y2": -20
      },
      {
        "tag": "text",
        "x": 11.83,
        "y": -3.1,
        "text": "3"
      },
      {
        "tag": "line",
        "x1": 10.7,
        "y1": -0.85,
        "x2": 1.69,
        "y2": 5.92
      }
    ]
  },
  {
    "id": "qet-architectural-alimentation",
    "label": "Alimentación (acometida)",
    "layer": "fuerza",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 20,
        "ry": 20
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 6.67,
        "ry": 6.67
      }
    ]
  },
  {
    "id": "qet-architectural-bouton-poussoir",
    "label": "Pulsador",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 20,
        "ry": 20
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 11.33,
        "ry": 11.33
      }
    ]
  },
  {
    "id": "qet-architectural-bouton-poussoir-lumineux",
    "label": "Pulsador con luz piloto",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -8,
        "y1": 8,
        "x2": 8,
        "y2": -8
      },
      {
        "tag": "line",
        "x1": -8,
        "y1": -8,
        "x2": 8,
        "y2": 8
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 20,
        "ry": 20
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 11.33,
        "ry": 11.33
      }
    ]
  },
  {
    "id": "qet-architectural-bouton-poussoir-protege",
    "label": "Pulsador protegido",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 5,
        "y1": 13.33,
        "x2": 5,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 5,
        "y1": -13.33,
        "x2": 5,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": 5,
        "y1": -13.33,
        "x2": 11.67,
        "y2": -13.33
      },
      {
        "tag": "line",
        "x1": 5,
        "y1": 13.33,
        "x2": 11.67,
        "y2": 13.33
      },
      {
        "tag": "line",
        "x1": 11.67,
        "y1": -13.33,
        "x2": 11.67,
        "y2": 13.33
      },
      {
        "tag": "ellipse",
        "cx": -1.67,
        "cy": 0,
        "rx": 10,
        "ry": 10
      },
      {
        "tag": "ellipse",
        "cx": -1.67,
        "cy": 0,
        "rx": 5.67,
        "ry": 5.67
      }
    ]
  },
  {
    "id": "qet-architectural-brisvitre",
    "label": "Detector de rotura de vidrio",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 10,
        "ry": 10,
        "start": 180,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 10,
        "ry": 10,
        "start": 90,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 10,
        "ry": 10,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 10,
        "ry": 10,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": -10,
        "x2": -20,
        "y2": 10
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 0,
        "x2": 10,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 10,
        "y1": 0,
        "x2": 20,
        "y2": 0
      }
    ]
  },
  {
    "id": "qet-architectural-camera",
    "label": "Cámara",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -20,
        "y": -5.71,
        "width": 28.57,
        "height": 11.43
      },
      {
        "tag": "text",
        "x": -14.86,
        "y": 2.86,
        "text": "CCTV"
      },
      {
        "tag": "rect",
        "x": 9.14,
        "y": -2.29,
        "width": 1.14,
        "height": 4.57
      },
      {
        "tag": "rect",
        "x": 10.86,
        "y": -3.43,
        "width": 9.14,
        "height": 6.86
      }
    ]
  },
  {
    "id": "qet-architectural-centrale",
    "label": "Central de alarma",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -20,
        "y": -20,
        "width": 40,
        "height": 40
      }
    ]
  },
  {
    "id": "qet-architectural-clavier",
    "label": "Teclado de control",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -20,
        "y": -20,
        "width": 40,
        "height": 40
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": -20,
        "x2": -10,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -20,
        "x2": 0,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 10,
        "y1": -20,
        "x2": 10,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": -10,
        "x2": 20,
        "y2": -10
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 10,
        "x2": 20,
        "y2": 10
      }
    ]
  },
  {
    "id": "qet-architectural-cm",
    "label": "Contacto magnético",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -10,
        "y": -20,
        "width": 20,
        "height": 40
      }
    ]
  },
  {
    "id": "qet-architectural-coffret-de-repartition1",
    "label": "Gabinete de distribución (4 canalizaciones)",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -2.86,
        "y": -20,
        "width": 5.71,
        "height": 40
      },
      {
        "tag": "line",
        "x1": -8.57,
        "y1": 0,
        "x2": -2.86,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": 17.14,
        "x2": 8.57,
        "y2": 17.14
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": 5.71,
        "x2": 8.57,
        "y2": 5.71
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": -5.71,
        "x2": 8.57,
        "y2": -5.71
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": -17.14,
        "x2": 8.57,
        "y2": -17.14
      }
    ]
  },
  {
    "id": "qet-architectural-coffret-de-repartition2",
    "label": "Gabinete de distribución",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -0.57,
        "y1": -20,
        "x2": -0.57,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 0.57,
        "y1": -20,
        "x2": 0.57,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -20,
        "x2": 0,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": -5.71,
        "y1": 0,
        "x2": 0,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 17.14,
        "x2": 5.71,
        "y2": 17.14
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 5.71,
        "x2": 5.71,
        "y2": 5.71
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -5.71,
        "x2": 5.71,
        "y2": -5.71
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -17.14,
        "x2": 5.71,
        "y2": -17.14
      }
    ]
  },
  {
    "id": "qet-architectural-commutateur-pour-va-et-vient",
    "label": "Conmutador intermedio (cruzamiento)",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            -2.58,
            7.1
          ],
          [
            -11.61,
            20
          ],
          [
            -15.48,
            17.42
          ]
        ],
        "closed": false
      },
      {
        "tag": "polygon",
        "points": [
          [
            2.58,
            7.1
          ],
          [
            11.61,
            20
          ],
          [
            15.48,
            17.42
          ]
        ],
        "closed": false
      },
      {
        "tag": "polygon",
        "points": [
          [
            -2.58,
            -5.81
          ],
          [
            -11.61,
            -20
          ],
          [
            -15.48,
            -17.42
          ]
        ],
        "closed": false
      },
      {
        "tag": "polygon",
        "points": [
          [
            2.58,
            -5.81
          ],
          [
            11.61,
            -20
          ],
          [
            15.48,
            -17.42
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0.65,
        "rx": 6.45,
        "ry": 6.45
      }
    ]
  },
  {
    "id": "qet-architectural-commutateur-unipolaire",
    "label": "Conmutador unipolar",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            -3.33,
            0.83
          ],
          [
            -15,
            -17.5
          ],
          [
            -20,
            -14.17
          ]
        ],
        "closed": false
      },
      {
        "tag": "polygon",
        "points": [
          [
            3.33,
            0.83
          ],
          [
            15,
            -17.5
          ],
          [
            20,
            -14.17
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 9.17,
        "rx": 8.33,
        "ry": 8.33
      }
    ]
  },
  {
    "id": "qet-architectural-connecteur",
    "label": "Conector",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 6.67,
        "y1": 0,
        "x2": 20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": -6.67,
        "y2": 0
      },
      {
        "tag": "polygon",
        "points": [
          [
            -6.67,
            0
          ],
          [
            6.67,
            -6.67
          ],
          [
            6.67,
            6.67
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-covered-isolated-ground-receptacle-11-13-0x-en60617",
    "label": "Enchufe con tapa y tierra aislada (EN 60617)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 20,
        "y1": 8.75,
        "x2": 10,
        "y2": 8.75
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": 8.25,
        "rx": 10,
        "ry": 10,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -3.25,
        "x2": 0,
        "y2": -18.25
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": -2.25,
        "x2": 10,
        "y2": -2.25
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": 8.75,
        "x2": -20,
        "y2": 8.75
      }
    ]
  },
  {
    "id": "qet-architectural-detecteurdemouvement",
    "label": "Detector de movimiento",
    "layer": "fuerza",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 10,
        "y1": -8,
        "x2": 10,
        "y2": 8
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": -8,
        "x2": -10,
        "y2": 8
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 0,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -20,
        "x2": 20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": 0,
        "x2": 0,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 20,
        "x2": -20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": -14,
        "y1": 0,
        "x2": 14,
        "y2": 0
      }
    ]
  },
  {
    "id": "qet-architectural-det-vibration",
    "label": "Detector de vibraciones",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -15,
        "y1": -20,
        "x2": -15,
        "y2": 20
      },
      {
        "tag": "polygon",
        "points": [
          [
            -15,
            0
          ],
          [
            15,
            -20
          ],
          [
            15,
            20
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-dm-mo",
    "label": "Detector de microondas",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            -20,
            0
          ],
          [
            8.57,
            -14.29
          ],
          [
            8.57,
            14.29
          ]
        ],
        "closed": false
      },
      {
        "tag": "arc",
        "cx": 11.43,
        "cy": 0,
        "rx": 2.86,
        "ry": 14.29,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 11.43,
        "cy": 0,
        "rx": 2.86,
        "ry": 14.29,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 14.29,
        "cy": 0,
        "rx": 2.86,
        "ry": 15.71,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 14.29,
        "cy": 0,
        "rx": 2.86,
        "ry": 17.14,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 17.14,
        "cy": 0,
        "rx": 2.86,
        "ry": 17.14,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 17.14,
        "cy": 0,
        "rx": 2.86,
        "ry": 20,
        "start": 270,
        "angle": 90
      }
    ]
  },
  {
    "id": "qet-architectural-dm-pir",
    "label": "Detector PIR (infrarrojo)",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            0,
            -10
          ],
          [
            -20,
            0
          ],
          [
            0,
            10
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": 5,
        "y1": -5,
        "x2": 20,
        "y2": -10
      },
      {
        "tag": "line",
        "x1": 5,
        "y1": 0,
        "x2": 20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 5,
        "y1": 5,
        "x2": 20,
        "y2": 10
      }
    ]
  },
  {
    "id": "qet-architectural-dm-pir-mo",
    "label": "Detector PIR + microondas",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": 15.43,
        "cy": 0,
        "rx": 1.52,
        "ry": 7.62,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 15.43,
        "cy": 0,
        "rx": 1.52,
        "ry": 7.62,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 16.95,
        "cy": 0,
        "rx": 1.52,
        "ry": 8.38,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 16.95,
        "cy": 0,
        "rx": 1.52,
        "ry": 9.14,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 18.48,
        "cy": 0,
        "rx": 1.52,
        "ry": 9.14,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 18.48,
        "cy": 0,
        "rx": 1.52,
        "ry": 10.67,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "polygon",
        "points": [
          [
            -4.76,
            -8
          ],
          [
            -20,
            -0.38
          ],
          [
            -4.76,
            7.24
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": -0.95,
        "y1": -4.19,
        "x2": 10.48,
        "y2": -8
      },
      {
        "tag": "line",
        "x1": -0.95,
        "y1": -0.38,
        "x2": 10.48,
        "y2": -0.38
      },
      {
        "tag": "line",
        "x1": -0.95,
        "y1": 3.43,
        "x2": 10.48,
        "y2": 7.24
      }
    ]
  },
  {
    "id": "qet-architectural-dm-pir-us",
    "label": "Detector PIR + ultrasonido",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": 15.43,
        "cy": 0,
        "rx": 1.52,
        "ry": 7.62,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 15.43,
        "cy": 0,
        "rx": 1.52,
        "ry": 7.62,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 16.95,
        "cy": 0,
        "rx": 1.52,
        "ry": 8.38,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 16.95,
        "cy": 0,
        "rx": 1.52,
        "ry": 9.14,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 18.48,
        "cy": 0,
        "rx": 1.52,
        "ry": 9.14,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 18.48,
        "cy": 0,
        "rx": 1.52,
        "ry": 10.67,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "polygon",
        "points": [
          [
            -4.76,
            -8
          ],
          [
            -20,
            -0.38
          ],
          [
            -4.76,
            7.24
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": -0.95,
        "y1": -4.19,
        "x2": 10.48,
        "y2": -8
      },
      {
        "tag": "line",
        "x1": -0.95,
        "y1": -0.38,
        "x2": 10.48,
        "y2": -0.38
      },
      {
        "tag": "line",
        "x1": -0.95,
        "y1": 3.43,
        "x2": 10.48,
        "y2": 7.24
      }
    ]
  },
  {
    "id": "qet-architectural-dm-us",
    "label": "Detector ultrasónico",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": 11.86,
        "cy": 0,
        "rx": 2.71,
        "ry": 13.56,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 11.86,
        "cy": 0,
        "rx": 2.71,
        "ry": 13.56,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 17.29,
        "cy": 0,
        "rx": 2.71,
        "ry": 16.27,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 17.29,
        "cy": 0,
        "rx": 2.71,
        "ry": 18.98,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "polygon",
        "points": [
          [
            7.12,
            -12.88
          ],
          [
            -20,
            0.68
          ],
          [
            7.12,
            14.24
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-eclairage1",
    "label": "Punto de luz en muro",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 9.63,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -16.3,
        "x2": 20,
        "y2": 16.3
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -10.37,
        "x2": -0.74,
        "y2": 10.37
      },
      {
        "tag": "line",
        "x1": -0.74,
        "y1": -10.37,
        "x2": 20,
        "y2": 10.37
      }
    ]
  },
  {
    "id": "qet-architectural-eclairage2",
    "label": "Punto de luz (centro)",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 9.63,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -10.37,
        "x2": -0.74,
        "y2": 10.37
      },
      {
        "tag": "line",
        "x1": -0.74,
        "y1": -10.37,
        "x2": 20,
        "y2": 10.37
      }
    ]
  },
  {
    "id": "qet-architectural-electrical-socket-11-13-01-en60617",
    "label": "Enchufe simple (EN 60617)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": 0,
        "cy": 8.73,
        "rx": 11.27,
        "ry": 11.27,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -3.1,
        "x2": 0,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-gache-electrique",
    "label": "Cerradura eléctrica",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            6.67,
            6.67
          ],
          [
            20,
            6.67
          ],
          [
            6.67,
            -6.67
          ]
        ],
        "closed": false
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -6.67,
        "width": 26.67,
        "height": 13.33
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 1.33,
        "rx": 3.33,
        "ry": 3.33,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "arc",
        "cx": -3.33,
        "cy": 1.33,
        "rx": 3.33,
        "ry": 3.33,
        "start": 0,
        "angle": 180
      }
    ]
  },
  {
    "id": "qet-architectural-horloge-pointage",
    "label": "Reloj control / registrador horario",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -6.67,
        "y1": 6.67,
        "x2": 0,
        "y2": 6.67
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 0,
        "x2": 0,
        "y2": 6.67
      },
      {
        "tag": "line",
        "x1": -9.33,
        "y1": -10.67,
        "x2": 9.33,
        "y2": -10.67
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 6.67,
        "rx": 9.33,
        "ry": 9.33
      },
      {
        "tag": "rect",
        "x": -13.33,
        "y": -20,
        "width": 26.67,
        "height": 40
      }
    ]
  },
  {
    "id": "qet-architectural-interphone",
    "label": "Citófono / intercomunicador",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 8.57,
        "y1": 0,
        "x2": 20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": 4.57,
        "x2": 13.14,
        "y2": 10.29
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": -4.57,
        "x2": 13.14,
        "y2": -10.29
      },
      {
        "tag": "rect",
        "x": -1.71,
        "y": -4.57,
        "width": 4.57,
        "height": 9.14
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -11.43,
        "width": 34.29,
        "height": 22.86
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur",
    "label": "Interruptor",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 0,
        "y1": 0.95,
        "x2": 13.33,
        "y2": -20
      },
      {
        "tag": "ellipse",
        "cx": -3.81,
        "cy": 10.48,
        "rx": 9.52,
        "ry": 9.52
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteurdeuxallumages",
    "label": "Interruptor de dos encendidos",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 4.29,
        "rx": 7.14,
        "ry": 7.14
      },
      {
        "tag": "line",
        "x1": 5.71,
        "y1": -1.43,
        "x2": 15.71,
        "y2": -11.43
      },
      {
        "tag": "line",
        "x1": 15.71,
        "y1": -11.43,
        "x2": 20,
        "y2": -7.14
      },
      {
        "tag": "line",
        "x1": -5.71,
        "y1": -1.43,
        "x2": -15.71,
        "y2": -11.43
      },
      {
        "tag": "line",
        "x1": -15.71,
        "y1": -11.43,
        "x2": -20,
        "y2": -7.14
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-a-lampe-temoin",
    "label": "Interruptor con luz piloto",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -9.52,
        "y1": 16.19,
        "x2": 1.9,
        "y2": 4.76
      },
      {
        "tag": "line",
        "x1": 1.9,
        "y1": 16.19,
        "x2": -9.52,
        "y2": 4.76
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 0.95,
        "x2": 13.33,
        "y2": -20
      },
      {
        "tag": "ellipse",
        "cx": -3.81,
        "cy": 10.48,
        "rx": 9.52,
        "ry": 9.52
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-a-temps-de-fermeture-limite",
    "label": "Interruptor horario unipolar",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "text",
        "x": 8.57,
        "y": -4.76,
        "text": "t"
      },
      {
        "tag": "polygon",
        "points": [
          [
            -2.86,
            0.95
          ],
          [
            10.48,
            -20
          ],
          [
            16.19,
            -16.19
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": -6.67,
        "cy": 10.48,
        "rx": 9.52,
        "ry": 9.52
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-bipolaire",
    "label": "Interruptor bipolar",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 6.67,
        "y1": -14.29,
        "x2": 12.38,
        "y2": -10.48
      },
      {
        "tag": "polygon",
        "points": [
          [
            -2.86,
            0.95
          ],
          [
            10.48,
            -20
          ],
          [
            16.19,
            -16.19
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": -6.67,
        "cy": 10.48,
        "rx": 9.52,
        "ry": 9.52
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-fin-de-course",
    "label": "Fin de carrera",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -1.98,
        "y1": 2.42,
        "x2": 8.57,
        "y2": -13.41
      },
      {
        "tag": "ellipse",
        "cx": 11.21,
        "cy": -16.92,
        "rx": 3.08,
        "ry": 3.08
      },
      {
        "tag": "ellipse",
        "cx": -5.49,
        "cy": 11.21,
        "rx": 8.79,
        "ry": 8.79
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-gradateur",
    "label": "Regulador de intensidad (dimmer)",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 0,
        "y1": -1.05,
        "x2": 12.63,
        "y2": -20
      },
      {
        "tag": "polygon",
        "points": [
          [
            -4.21,
            -7.37
          ],
          [
            14.74,
            -7.37
          ],
          [
            14.74,
            -15.79
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": -4.21,
        "cy": 9.47,
        "rx": 10.53,
        "ry": 10.53
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-horaire",
    "label": "Interruptor horario",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            14.67,
            0
          ],
          [
            11.33,
            0
          ],
          [
            2,
            2
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": 2,
        "y1": 0,
        "x2": -1.33,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": -13.33,
        "y1": 0,
        "x2": -10,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": -3.33,
        "x2": -10,
        "y2": 0
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -10,
        "width": 40,
        "height": 20
      },
      {
        "tag": "ellipse",
        "cx": -10,
        "cy": 0,
        "rx": 4.67,
        "ry": 4.67
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-tripolaire",
    "label": "Interruptor tripolar",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 3.45,
        "y1": -6.21,
        "x2": 8.97,
        "y2": -0.69
      },
      {
        "tag": "line",
        "x1": 8.97,
        "y1": -11.72,
        "x2": 14.48,
        "y2": -6.21
      },
      {
        "tag": "polygon",
        "points": [
          [
            -7.59,
            4.83
          ],
          [
            14.48,
            -17.24
          ],
          [
            20,
            -11.72
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": -13.1,
        "cy": 10.34,
        "rx": 6.9,
        "ry": 6.9
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-unipolaire",
    "label": "Interruptor unipolar",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            -7.59,
            4.83
          ],
          [
            14.48,
            -17.24
          ],
          [
            20,
            -11.72
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": -13.1,
        "cy": 10.34,
        "rx": 6.9,
        "ry": 6.9
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-unipolaire-a-tirette",
    "label": "Interruptor unipolar de tirador",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            -2.86,
            0.95
          ],
          [
            10.48,
            -20
          ],
          [
            16.19,
            -16.19
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": 10.48,
        "y1": -18.1,
        "x2": 10.48,
        "y2": -8.57
      },
      {
        "tag": "ellipse",
        "cx": -6.67,
        "cy": 10.48,
        "rx": 9.52,
        "ry": 9.52
      }
    ]
  },
  {
    "id": "qet-architectural-interrupteur-unipolaire-va-et-vient",
    "label": "Interruptor de combinación (cruzamiento)",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            -2.58,
            7.1
          ],
          [
            -11.61,
            20
          ],
          [
            -15.48,
            17.42
          ]
        ],
        "closed": false
      },
      {
        "tag": "polygon",
        "points": [
          [
            2.58,
            -5.81
          ],
          [
            11.61,
            -20
          ],
          [
            15.48,
            -17.42
          ]
        ],
        "closed": false
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0.65,
        "rx": 6.45,
        "ry": 6.45
      }
    ]
  },
  {
    "id": "qet-architectural-isolated-ground-receptacle-11-13-04-en60617",
    "label": "Enchufe con tierra aislada (EN 60617)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": 0,
        "cy": 8.73,
        "rx": 11.27,
        "ry": 11.27,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -3.1,
        "x2": 0,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": -11.27,
        "y1": -3.1,
        "x2": 11.27,
        "y2": -3.1
      }
    ]
  },
  {
    "id": "qet-architectural-lampe",
    "label": "Lámpara",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 20,
        "ry": 20
      },
      {
        "tag": "line",
        "x1": 14,
        "y1": -14,
        "x2": -14,
        "y2": 14
      },
      {
        "tag": "line",
        "x1": -14,
        "y1": -14,
        "x2": 14,
        "y2": 14
      }
    ]
  },
  {
    "id": "qet-architectural-lampe-1",
    "label": "Lámpara (2)",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -20,
        "y1": -20,
        "x2": 20,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 20,
        "x2": 20,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-lampe-a-fluorescence",
    "label": "Lámpara fluorescente",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -20,
        "y1": -2,
        "x2": -20,
        "y2": 2
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -2,
        "x2": 20,
        "y2": 2
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 20,
        "y2": 0
      }
    ]
  },
  {
    "id": "qet-architectural-luminaire3",
    "label": "Luminaria de 3 tubos fluorescentes",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -20,
        "y1": -8.67,
        "x2": -20,
        "y2": 8.67
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -8.67,
        "x2": 20,
        "y2": 8.67
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": -6.67,
        "x2": 20,
        "y2": -6.67
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 6.67,
        "x2": 20,
        "y2": 6.67
      }
    ]
  },
  {
    "id": "qet-architectural-luminaire5",
    "label": "Luminaria de 5 tubos fluorescentes",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "text",
        "x": -20,
        "y": 0,
        "text": "5"
      },
      {
        "tag": "line",
        "x1": -2,
        "y1": 2,
        "x2": 2,
        "y2": -2
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": -2,
        "x2": -20,
        "y2": 2
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -2,
        "x2": 20,
        "y2": 2
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 20,
        "y2": 0
      }
    ]
  },
  {
    "id": "qet-architectural-masa",
    "label": "Masa",
    "layer": "tierra",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 14.29,
        "y1": 8.57,
        "x2": 5.71,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": 8.57,
        "x2": -5.71,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": -11.43,
        "y1": 8.57,
        "x2": 17.14,
        "y2": 8.57
      },
      {
        "tag": "line",
        "x1": 2.86,
        "y1": 8.57,
        "x2": 2.86,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": -8.57,
        "y1": 8.57,
        "x2": -17.14,
        "y2": 20
      }
    ]
  },
  {
    "id": "qet-architectural-micro",
    "label": "Micrófono selectivo",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": -4,
        "cy": -2,
        "rx": 8,
        "ry": 8,
        "start": 90,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -4,
        "cy": -2,
        "rx": 8,
        "ry": 8,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -4,
        "cy": -2,
        "rx": 8,
        "ry": 8,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -4,
        "cy": -2,
        "rx": 8,
        "ry": 8,
        "start": 180,
        "angle": 90
      },
      {
        "tag": "line",
        "x1": -12,
        "y1": -10,
        "x2": -12,
        "y2": 6
      },
      {
        "tag": "line",
        "x1": -12,
        "y1": -10,
        "x2": -20,
        "y2": -6
      },
      {
        "tag": "line",
        "x1": -12,
        "y1": -2,
        "x2": -20,
        "y2": 2
      },
      {
        "tag": "line",
        "x1": -12,
        "y1": 6,
        "x2": -20,
        "y2": 10
      },
      {
        "tag": "line",
        "x1": 4,
        "y1": -2,
        "x2": 20,
        "y2": -2
      }
    ]
  },
  {
    "id": "qet-architectural-microphone",
    "label": "Micrófono",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 11.54,
        "cy": -16.15,
        "rx": 3.85,
        "ry": 3.85
      },
      {
        "tag": "line",
        "x1": 7.69,
        "y1": -12.31,
        "x2": -7.69,
        "y2": 3.08
      },
      {
        "tag": "line",
        "x1": -4.62,
        "y1": 1.54,
        "x2": -4.62,
        "y2": 18.46
      },
      {
        "tag": "line",
        "x1": -3.85,
        "y1": 1.54,
        "x2": -3.85,
        "y2": 18.46
      },
      {
        "tag": "polygon",
        "points": [
          [
            -11.54,
            18.46
          ],
          [
            2.31,
            18.46
          ],
          [
            6.15,
            20
          ],
          [
            -15.38,
            20
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-minuterie",
    "label": "Temporizador",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "text",
        "x": -2,
        "y": 4,
        "text": "t"
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -10,
        "width": 40,
        "height": 20
      }
    ]
  },
  {
    "id": "qet-architectural-moteur",
    "label": "Motor",
    "layer": "fuerza",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 20,
        "ry": 20
      },
      {
        "tag": "text",
        "x": -8.33,
        "y": 6.67,
        "text": "M"
      }
    ]
  },
  {
    "id": "qet-architectural-moteur-pas-a-pas",
    "label": "Motor paso a paso",
    "layer": "fuerza",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 10,
        "y1": 8.33,
        "x2": 10,
        "y2": 3.33
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": 8.33,
        "x2": -10,
        "y2": 11.67
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": 8.33,
        "x2": 10,
        "y2": 8.33
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 20,
        "ry": 20
      },
      {
        "tag": "text",
        "x": -7.5,
        "y": 3.33,
        "text": "M"
      }
    ]
  },
  {
    "id": "qet-architectural-pc",
    "label": "Enchufe",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 4.24,
        "rx": 15.76,
        "ry": 15.76
      },
      {
        "tag": "ellipse",
        "cx": -7.27,
        "cy": 6.67,
        "rx": 3.64,
        "ry": 3.64
      },
      {
        "tag": "ellipse",
        "cx": 7.27,
        "cy": 6.67,
        "rx": 3.64,
        "ry": 3.64
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -11.52,
        "x2": 0,
        "y2": -20
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": -3.03,
        "rx": 3.03,
        "ry": 3.03
      }
    ]
  },
  {
    "id": "qet-architectural-pc1",
    "label": "Enchufe con contacto de protección",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -13.33,
        "y1": -6.67,
        "x2": 13.33,
        "y2": -6.67
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": 6.67,
        "rx": 13.33,
        "ry": 13.33,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -6.67,
        "x2": 0,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-pc10",
    "label": "Enchufe con tapa y tierra aislada (EN 60617)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "text",
        "x": -2,
        "y": -16.8,
        "text": "L1"
      },
      {
        "tag": "text",
        "x": 10,
        "y": -16.8,
        "text": "L3"
      },
      {
        "tag": "text",
        "x": -8,
        "y": -16.8,
        "text": "N"
      },
      {
        "tag": "line",
        "x1": -11.6,
        "y1": -16,
        "x2": -10,
        "y2": -16
      },
      {
        "tag": "text",
        "x": 4,
        "y": -16.8,
        "text": "L2"
      },
      {
        "tag": "line",
        "x1": 6.4,
        "y1": -16,
        "x2": 8,
        "y2": -16
      },
      {
        "tag": "line",
        "x1": -10.8,
        "y1": -18.4,
        "x2": -10.8,
        "y2": -16
      },
      {
        "tag": "line",
        "x1": 7.2,
        "y1": -18.4,
        "x2": 7.2,
        "y2": -16
      },
      {
        "tag": "text",
        "x": 8,
        "y": 3.6,
        "text": "PE"
      },
      {
        "tag": "line",
        "x1": -5.6,
        "y1": -16,
        "x2": -4,
        "y2": -16
      },
      {
        "tag": "line",
        "x1": -4.8,
        "y1": -18.4,
        "x2": -4.8,
        "y2": -16
      },
      {
        "tag": "ellipse",
        "cx": 1.2,
        "cy": -14,
        "rx": 0.8,
        "ry": 0.8
      },
      {
        "tag": "polygon",
        "points": [
          [
            -0.8,
            -14
          ],
          [
            1.2,
            -6
          ],
          [
            1.2,
            -2
          ]
        ],
        "closed": false
      },
      {
        "tag": "arc",
        "cx": 1.2,
        "cy": 15.8,
        "rx": 4,
        "ry": 4,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 11.69,
        "x2": 1.2,
        "y2": -3.29
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": -18,
        "x2": 1.2,
        "y2": -14.8
      },
      {
        "tag": "line",
        "x1": -2.8,
        "y1": 11.6,
        "x2": 5.2,
        "y2": 11.6
      },
      {
        "tag": "line",
        "x1": 2,
        "y1": -14.8,
        "x2": 0.4,
        "y2": -14.8
      },
      {
        "tag": "polygon",
        "points": [
          [
            -0.12,
            -9.8
          ],
          [
            -6.8,
            -9.8
          ],
          [
            -6.8,
            16.2
          ],
          [
            -0.12,
            16.2
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 14.6,
        "x2": 1.2,
        "y2": 16.2
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 16.1,
        "x2": 1.2,
        "y2": 16.7
      },
      {
        "tag": "polygon",
        "points": [
          [
            -8.8,
            -0.8
          ],
          [
            -8.8,
            0.8
          ],
          [
            -7.2,
            0
          ]
        ],
        "closed": false
      },
      {
        "tag": "rect",
        "x": -13.2,
        "y": -20,
        "width": 26.4,
        "height": 40
      },
      {
        "tag": "polygon",
        "points": [
          [
            -2.8,
            10
          ],
          [
            5.2,
            4.08
          ],
          [
            5.2,
            2.12
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-pc11",
    "label": "Enchufe con tapa y tierra aislada (EN 60617) (2)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "text",
        "x": -2,
        "y": -16.8,
        "text": "N"
      },
      {
        "tag": "text",
        "x": 4,
        "y": -16.8,
        "text": "L"
      },
      {
        "tag": "text",
        "x": 8,
        "y": 3.6,
        "text": "PE"
      },
      {
        "tag": "line",
        "x1": -5.6,
        "y1": -16,
        "x2": -4,
        "y2": -16
      },
      {
        "tag": "line",
        "x1": -4.8,
        "y1": -18.4,
        "x2": -4.8,
        "y2": -16
      },
      {
        "tag": "ellipse",
        "cx": 1.2,
        "cy": -14,
        "rx": 0.8,
        "ry": 0.8
      },
      {
        "tag": "polygon",
        "points": [
          [
            -0.8,
            -14
          ],
          [
            1.2,
            -6
          ],
          [
            1.2,
            -2
          ]
        ],
        "closed": false
      },
      {
        "tag": "arc",
        "cx": 1.2,
        "cy": 15.8,
        "rx": 4,
        "ry": 4,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 11.69,
        "x2": 1.2,
        "y2": -3.29
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": -18,
        "x2": 1.2,
        "y2": -14.8
      },
      {
        "tag": "line",
        "x1": -2.8,
        "y1": 11.6,
        "x2": 5.2,
        "y2": 11.6
      },
      {
        "tag": "line",
        "x1": 2,
        "y1": -14.8,
        "x2": 0.4,
        "y2": -14.8
      },
      {
        "tag": "polygon",
        "points": [
          [
            -0.12,
            -9.8
          ],
          [
            -6.8,
            -9.8
          ],
          [
            -6.8,
            16.2
          ],
          [
            -0.12,
            16.2
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 14.6,
        "x2": 1.2,
        "y2": 16.2
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 16.1,
        "x2": 1.2,
        "y2": 16.7
      },
      {
        "tag": "polygon",
        "points": [
          [
            -8.8,
            -0.8
          ],
          [
            -8.8,
            0.8
          ],
          [
            -7.2,
            0
          ]
        ],
        "closed": false
      },
      {
        "tag": "rect",
        "x": -13.2,
        "y": -20,
        "width": 26.4,
        "height": 40
      },
      {
        "tag": "polygon",
        "points": [
          [
            -2.8,
            10
          ],
          [
            5.2,
            4.08
          ],
          [
            5.2,
            2.12
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-pc2",
    "label": "Enchufe (símbolo general)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "arc",
        "cx": 0,
        "cy": 6.67,
        "rx": 13.33,
        "ry": 13.33,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -6.67,
        "x2": 0,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-pc3",
    "label": "Enchufe múltiple (3 salidas)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "text",
        "x": 0,
        "y": 5.81,
        "text": "3"
      },
      {
        "tag": "line",
        "x1": 2.58,
        "y1": -1.94,
        "x2": 9.03,
        "y2": -9.68
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": 7.1,
        "rx": 12.9,
        "ry": 12.9,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -7.1,
        "x2": 0,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-pc4",
    "label": "Toma de telecomunicaciones",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 20,
        "y1": 0,
        "x2": 20,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": -20,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": 0,
        "x2": 20,
        "y2": 0
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 0,
        "x2": 0,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-pc5",
    "label": "Enchufe con interruptor unipolar",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            0,
            -6.67
          ],
          [
            10.67,
            -17.33
          ],
          [
            13.33,
            -14.67
          ]
        ],
        "closed": false
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": 6.67,
        "rx": 13.33,
        "ry": 13.33,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -6.67,
        "x2": 0,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-pc6",
    "label": "Enchufe con tapa de seguridad",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -20,
        "y1": 5.13,
        "x2": -10.77,
        "y2": 5.13
      },
      {
        "tag": "line",
        "x1": 10.77,
        "y1": 5.13,
        "x2": 20,
        "y2": 5.13
      },
      {
        "tag": "arc",
        "cx": 0.51,
        "cy": 5.13,
        "rx": 10.26,
        "ry": 10.26,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0.51,
        "y1": -5.13,
        "x2": 0.51,
        "y2": -15.38
      }
    ]
  },
  {
    "id": "qet-architectural-pc7",
    "label": "Enchufe con transformador de aislación",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 10,
        "ry": 10
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": 10,
        "rx": 10,
        "ry": 10,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -10,
        "x2": 0,
        "y2": -20
      }
    ]
  },
  {
    "id": "qet-architectural-pc8",
    "label": "Enchufe con tapa y tierra aislada (EN 60617) (3)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": -12.34,
        "rx": 0.77,
        "ry": 0.77
      },
      {
        "tag": "polygon",
        "points": [
          [
            -1.91,
            -12.34
          ],
          [
            0,
            -4.69
          ],
          [
            0,
            -0.86
          ]
        ],
        "closed": false
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": 16.17,
        "rx": 3.83,
        "ry": 3.83,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 12.24,
        "x2": 0,
        "y2": -2.09
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": -16.17,
        "x2": 0,
        "y2": -13.11
      },
      {
        "tag": "line",
        "x1": -3.83,
        "y1": 12.15,
        "x2": 3.83,
        "y2": 12.15
      },
      {
        "tag": "line",
        "x1": 0.77,
        "y1": -13.11,
        "x2": -0.77,
        "y2": -13.11
      },
      {
        "tag": "polygon",
        "points": [
          [
            -0.88,
            -8.32
          ],
          [
            -7.27,
            -8.32
          ],
          [
            -7.27,
            16.56
          ],
          [
            -0.88,
            16.56
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 15.02,
        "x2": 0,
        "y2": 16.56
      },
      {
        "tag": "line",
        "x1": 0,
        "y1": 16.46,
        "x2": 0,
        "y2": 17.03
      },
      {
        "tag": "polygon",
        "points": [
          [
            -9.19,
            3.35
          ],
          [
            -9.19,
            4.88
          ],
          [
            -7.66,
            4.11
          ]
        ],
        "closed": false
      },
      {
        "tag": "rect",
        "x": -11.48,
        "y": -20,
        "width": 22.97,
        "height": 38.28
      },
      {
        "tag": "polygon",
        "points": [
          [
            -1.91,
            10.62
          ],
          [
            1.91,
            6.87
          ],
          [
            1.91,
            4.99
          ]
        ],
        "closed": false
      },
      {
        "tag": "text",
        "x": 0,
        "y": 8.71,
        "text": "_"
      }
    ]
  },
  {
    "id": "qet-architectural-pc9",
    "label": "Enchufe con tapa y tierra aislada (EN 60617) (4)",
    "layer": "enchufes",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "text",
        "x": -2,
        "y": -16.8,
        "text": "L1"
      },
      {
        "tag": "text",
        "x": 10,
        "y": -16.8,
        "text": "L3"
      },
      {
        "tag": "text",
        "x": 4,
        "y": -16.8,
        "text": "L2"
      },
      {
        "tag": "line",
        "x1": 6.4,
        "y1": -16,
        "x2": 8,
        "y2": -16
      },
      {
        "tag": "line",
        "x1": 7.2,
        "y1": -18.4,
        "x2": 7.2,
        "y2": -16
      },
      {
        "tag": "text",
        "x": 8,
        "y": 3.6,
        "text": "PE"
      },
      {
        "tag": "line",
        "x1": -5.6,
        "y1": -16,
        "x2": -4,
        "y2": -16
      },
      {
        "tag": "line",
        "x1": -4.8,
        "y1": -18.4,
        "x2": -4.8,
        "y2": -16
      },
      {
        "tag": "ellipse",
        "cx": 1.2,
        "cy": -14,
        "rx": 0.8,
        "ry": 0.8
      },
      {
        "tag": "polygon",
        "points": [
          [
            -0.8,
            -14
          ],
          [
            1.2,
            -6
          ],
          [
            1.2,
            -2
          ]
        ],
        "closed": false
      },
      {
        "tag": "arc",
        "cx": 1.2,
        "cy": 15.8,
        "rx": 4,
        "ry": 4,
        "start": 0,
        "angle": 180
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 11.69,
        "x2": 1.2,
        "y2": -3.29
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": -18,
        "x2": 1.2,
        "y2": -14.8
      },
      {
        "tag": "line",
        "x1": -2.8,
        "y1": 11.6,
        "x2": 5.2,
        "y2": 11.6
      },
      {
        "tag": "line",
        "x1": 2,
        "y1": -14.8,
        "x2": 0.4,
        "y2": -14.8
      },
      {
        "tag": "polygon",
        "points": [
          [
            -0.12,
            -9.8
          ],
          [
            -6.8,
            -9.8
          ],
          [
            -6.8,
            16.2
          ],
          [
            -0.12,
            16.2
          ]
        ],
        "closed": false
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 14.6,
        "x2": 1.2,
        "y2": 16.2
      },
      {
        "tag": "line",
        "x1": 1.2,
        "y1": 16.1,
        "x2": 1.2,
        "y2": 16.7
      },
      {
        "tag": "polygon",
        "points": [
          [
            -8.8,
            -0.8
          ],
          [
            -8.8,
            0.8
          ],
          [
            -7.2,
            0
          ]
        ],
        "closed": false
      },
      {
        "tag": "rect",
        "x": -13.2,
        "y": -20,
        "width": 26.4,
        "height": 40
      },
      {
        "tag": "polygon",
        "points": [
          [
            -2.8,
            10
          ],
          [
            5.2,
            4.08
          ],
          [
            5.2,
            2.12
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-point-eclairage-1",
    "label": "Luminaria de emergencia (circuito especial)",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -20,
        "y1": 20,
        "x2": 20,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": -20,
        "y1": -20,
        "x2": 20,
        "y2": 20
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 3.75,
        "ry": 3.75
      }
    ]
  },
  {
    "id": "qet-architectural-point-eclairage-2",
    "label": "Luminaria de emergencia autónoma",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -16,
        "y1": 16,
        "x2": 16,
        "y2": -16
      },
      {
        "tag": "line",
        "x1": -16,
        "y1": -16,
        "x2": 16,
        "y2": 16
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -20,
        "width": 40,
        "height": 40
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 3,
        "ry": 3
      }
    ]
  },
  {
    "id": "qet-architectural-printer",
    "label": "Impresora",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -13.33,
        "y1": -12.5,
        "x2": -13.33,
        "y2": -10.17
      },
      {
        "tag": "arc",
        "cx": 11.67,
        "cy": -12.83,
        "rx": 1.67,
        "ry": 1.67,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -11.67,
        "cy": -12.83,
        "rx": 1.67,
        "ry": 1.67,
        "start": 90,
        "angle": 90
      },
      {
        "tag": "line",
        "x1": 13.33,
        "y1": -12.5,
        "x2": 13.33,
        "y2": -10.17
      },
      {
        "tag": "rect",
        "x": -16.67,
        "y": 13.17,
        "width": 33.33,
        "height": 3.33
      },
      {
        "tag": "rect",
        "x": -16.67,
        "y": 9.17,
        "width": 33.33,
        "height": 3.33
      },
      {
        "tag": "polygon",
        "points": [
          [
            12,
            -10.17
          ],
          [
            12,
            -3.5
          ],
          [
            -12,
            -3.5
          ],
          [
            -12,
            -10.17
          ],
          [
            -20,
            -10.17
          ],
          [
            -20,
            17.83
          ],
          [
            20,
            17.83
          ],
          [
            20,
            -10.17
          ]
        ],
        "closed": false
      },
      {
        "tag": "polygon",
        "points": [
          [
            -11.33,
            -17.83
          ],
          [
            -11.33,
            -4.17
          ],
          [
            11.33,
            -4.17
          ],
          [
            11.33,
            -15.17
          ],
          [
            8.67,
            -17.83
          ]
        ],
        "closed": false
      },
      {
        "tag": "polygon",
        "points": [
          [
            8.67,
            -17.83
          ],
          [
            8.67,
            -15.17
          ],
          [
            11.33,
            -15.17
          ]
        ],
        "closed": false
      }
    ]
  },
  {
    "id": "qet-architectural-projecteur-1",
    "label": "Proyector",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": -6,
        "y1": -6,
        "x2": 6,
        "y2": 6
      },
      {
        "tag": "line",
        "x1": -6,
        "y1": 6,
        "x2": 6,
        "y2": -6
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": 0,
        "rx": 9,
        "ry": 9
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": 0,
        "rx": 20,
        "ry": 20,
        "start": 90,
        "angle": 180
      }
    ]
  },
  {
    "id": "qet-architectural-projecteur-2",
    "label": "Proyector de haz poco divergente",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 4,
        "y1": 4,
        "x2": 20,
        "y2": 4
      },
      {
        "tag": "line",
        "x1": 4,
        "y1": -4,
        "x2": 20,
        "y2": -4
      },
      {
        "tag": "line",
        "x1": -10.67,
        "y1": -4,
        "x2": -2.67,
        "y2": 4
      },
      {
        "tag": "line",
        "x1": -10.67,
        "y1": 4,
        "x2": -2.67,
        "y2": -4
      },
      {
        "tag": "ellipse",
        "cx": -6.67,
        "cy": 0,
        "rx": 6,
        "ry": 6
      },
      {
        "tag": "arc",
        "cx": -6.67,
        "cy": 0,
        "rx": 13.33,
        "ry": 13.33,
        "start": 90,
        "angle": 180
      }
    ]
  },
  {
    "id": "qet-architectural-projecteur-3",
    "label": "Reflector de iluminación",
    "layer": "alumbrado",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "line",
        "x1": 20,
        "y1": 19.31,
        "x2": 4.83,
        "y2": 4.14
      },
      {
        "tag": "line",
        "x1": 4.83,
        "y1": -4.14,
        "x2": 20,
        "y2": -19.31
      },
      {
        "tag": "line",
        "x1": -10.34,
        "y1": -4.14,
        "x2": -2.07,
        "y2": 4.14
      },
      {
        "tag": "line",
        "x1": -10.34,
        "y1": 4.14,
        "x2": -2.07,
        "y2": -4.14
      },
      {
        "tag": "ellipse",
        "cx": -6.21,
        "cy": 0,
        "rx": 6.21,
        "ry": 6.21
      },
      {
        "tag": "arc",
        "cx": -6.21,
        "cy": 0,
        "rx": 13.79,
        "ry": 13.79,
        "start": 90,
        "angle": 180
      }
    ]
  },
  {
    "id": "qet-architectural-protege-par-cle",
    "label": "Accionado por llave",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "polygon",
        "points": [
          [
            -2.29,
            1.71
          ],
          [
            -6.86,
            10.86
          ],
          [
            6.86,
            10.86
          ],
          [
            2.29,
            1.71
          ]
        ],
        "closed": false
      },
      {
        "tag": "rect",
        "x": -14.86,
        "y": -20,
        "width": 29.71,
        "height": 40
      },
      {
        "tag": "ellipse",
        "cx": 0,
        "cy": -4,
        "rx": 5.71,
        "ry": 5.71
      }
    ]
  },
  {
    "id": "qet-architectural-sir-ext",
    "label": "Sirena exterior",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -20,
        "y": -10,
        "width": 30,
        "height": 20
      },
      {
        "tag": "line",
        "x1": 10,
        "y1": -10,
        "x2": 20,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -20,
        "x2": 20,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": 20,
        "x2": 10,
        "y2": 10
      },
      {
        "tag": "line",
        "x1": -19.5,
        "y1": -0.25,
        "x2": -17.5,
        "y2": -0.25
      },
      {
        "tag": "line",
        "x1": -17.5,
        "y1": -2.25,
        "x2": -17.5,
        "y2": 1.75
      },
      {
        "tag": "line",
        "x1": -15.5,
        "y1": -4.25,
        "x2": -15.5,
        "y2": 3.75
      },
      {
        "tag": "line",
        "x1": -15.5,
        "y1": -0.25,
        "x2": -13.5,
        "y2": -0.25
      }
    ]
  },
  {
    "id": "qet-architectural-sir-ext-flash",
    "label": "Sirena exterior con flash",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -20,
        "y": -10,
        "width": 30,
        "height": 20
      },
      {
        "tag": "line",
        "x1": 10,
        "y1": -10,
        "x2": 20,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -20,
        "x2": 20,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": 20,
        "x2": 10,
        "y2": 10
      },
      {
        "tag": "line",
        "x1": -19.5,
        "y1": -0.25,
        "x2": -17.5,
        "y2": -0.25
      },
      {
        "tag": "line",
        "x1": -17.5,
        "y1": -2.25,
        "x2": -17.5,
        "y2": 1.75
      },
      {
        "tag": "line",
        "x1": -15.5,
        "y1": -4.25,
        "x2": -15.5,
        "y2": 3.75
      },
      {
        "tag": "line",
        "x1": -15.5,
        "y1": -0.25,
        "x2": -13.5,
        "y2": -0.25
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": -0.25,
        "rx": 5,
        "ry": 5,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": -0.25,
        "rx": 5,
        "ry": 5,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": -0.25,
        "rx": 5,
        "ry": 5,
        "start": 180,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 0,
        "cy": -0.25,
        "rx": 5,
        "ry": 5,
        "start": 90,
        "angle": 90
      },
      {
        "tag": "line",
        "x1": -3,
        "y1": 2.75,
        "x2": 3,
        "y2": -3.25
      },
      {
        "tag": "line",
        "x1": -3,
        "y1": -3.25,
        "x2": 3,
        "y2": 2.75
      }
    ]
  },
  {
    "id": "qet-architectural-sir-int",
    "label": "Sirena interior",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -20,
        "y": -10,
        "width": 30,
        "height": 20
      },
      {
        "tag": "line",
        "x1": 10,
        "y1": -10,
        "x2": 20,
        "y2": -20
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": -20,
        "x2": 20,
        "y2": 20
      },
      {
        "tag": "line",
        "x1": 20,
        "y1": 20,
        "x2": 10,
        "y2": 10
      }
    ]
  },
  {
    "id": "qet-architectural-transmetteur",
    "label": "Transmisor",
    "layer": "senales",
    "source": "qelectrotech",
    "category": "30_architectural",
    "primitives": [
      {
        "tag": "rect",
        "x": -20,
        "y": -6.67,
        "width": 40,
        "height": 13.33
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 180,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": -10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 90,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 0,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 270,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 180,
        "angle": 90
      },
      {
        "tag": "arc",
        "cx": 10,
        "cy": 0,
        "rx": 3.33,
        "ry": 3.33,
        "start": 90,
        "angle": 90
      },
      {
        "tag": "line",
        "x1": -10,
        "y1": -3.33,
        "x2": 10,
        "y2": -3.33
      }
    ]
  },
  {
    "id": "qet-meters-ampereheuremetre",
    "label": "Amperímetro horario",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "text",
        "x": -10.67,
        "y": 8.44,
        "text": "Ah"
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -9.33,
        "width": 40,
        "height": 29.33
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -20,
        "width": 40,
        "height": 10.67
      }
    ]
  },
  {
    "id": "qet-meters-compteur-220v-monophase",
    "label": "Medidor monofásico 220 V",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "rect",
        "x": -10.26,
        "y": 10.77,
        "width": 20.51,
        "height": 9.23
      },
      {
        "tag": "rect",
        "x": -10.26,
        "y": -14.87,
        "width": 20.51,
        "height": 8.21
      },
      {
        "tag": "rect",
        "x": -15.38,
        "y": -20,
        "width": 30.77,
        "height": 30.77
      }
    ]
  },
  {
    "id": "qet-meters-compteur-energie",
    "label": "Medidor de energía",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "line",
        "x1": -16,
        "y1": -10,
        "x2": 16,
        "y2": -10
      },
      {
        "tag": "rect",
        "x": -16,
        "y": -20,
        "width": 32,
        "height": 40
      },
      {
        "tag": "text",
        "x": -14,
        "y": 10,
        "text": "kWh"
      }
    ]
  },
  {
    "id": "qet-meters-compteur-energie-active-a-depassement-de-puissance",
    "label": "Medidor de excedente de potencia",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "text",
        "x": -13.33,
        "y": 2.67,
        "text": "Wh"
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -9.33,
        "width": 40,
        "height": 29.33
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -20,
        "width": 40,
        "height": 10.67
      }
    ]
  },
  {
    "id": "qet-meters-compteur-horaire",
    "label": "Contador horario",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "text",
        "x": -4,
        "y": 8.44,
        "text": "h"
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -9.33,
        "width": 40,
        "height": 29.33
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -20,
        "width": 40,
        "height": 10.67
      }
    ]
  },
  {
    "id": "qet-meters-compteur-horaire-08-04-03-en60617",
    "label": "Contador horario (EN 60617)",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "text",
        "x": -2.67,
        "y": 8,
        "text": "h"
      },
      {
        "tag": "rect",
        "x": -13.33,
        "y": -6.67,
        "width": 26.67,
        "height": 26.67
      },
      {
        "tag": "rect",
        "x": -13.33,
        "y": -20,
        "width": 26.67,
        "height": 13.33
      }
    ]
  },
  {
    "id": "qet-meters-varheuremetre",
    "label": "Medidor de VARh",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "text",
        "x": -17.33,
        "y": 8.44,
        "text": "Varh"
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -9.33,
        "width": 40,
        "height": 29.33
      },
      {
        "tag": "rect",
        "x": -20,
        "y": -20,
        "width": 40,
        "height": 10.67
      }
    ]
  },
  {
    "id": "qet-meters-varh-08-04-15-en60617",
    "label": "Medidor de energía reactiva (EN 60617)",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "rect",
        "x": -17.65,
        "y": -10.59,
        "width": 35.29,
        "height": 30.59
      },
      {
        "tag": "rect",
        "x": -17.65,
        "y": -20,
        "width": 35.29,
        "height": 9.41
      },
      {
        "tag": "text",
        "x": -14.12,
        "y": 10.59,
        "text": "varh"
      }
    ]
  },
  {
    "id": "qet-meters-wattheuremetre",
    "label": "Medidor de kWh",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "rect",
        "x": -12.8,
        "y": -20,
        "width": 25.6,
        "height": 40
      },
      {
        "tag": "line",
        "x1": -12.8,
        "y1": -8.8,
        "x2": 12.8,
        "y2": -8.8
      },
      {
        "tag": "text",
        "x": -8,
        "y": 8,
        "text": "Wh"
      }
    ]
  },
  {
    "id": "qet-meters-wattheuremetre-08-04-03-en60617",
    "label": "Medidor de kWh (EN 60617)",
    "layer": "tablero",
    "source": "qelectrotech",
    "category": "40_meters",
    "primitives": [
      {
        "tag": "text",
        "x": -6.67,
        "y": 8,
        "text": "Wh"
      },
      {
        "tag": "rect",
        "x": -13.33,
        "y": -6.67,
        "width": 26.67,
        "height": 26.67
      },
      {
        "tag": "rect",
        "x": -13.33,
        "y": -20,
        "width": 26.67,
        "height": 13.33
      }
    ]
  }
];
