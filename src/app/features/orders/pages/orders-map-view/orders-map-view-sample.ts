/** Datos de ejemplo: rutas en formato OpenRouteService (geojson + steps VRP). Tipado en el componente. */
export const ORS_ROUTES_SAMPLE = {
  routes: [
    {
      vehicle: 1,
      geojson: {
        bbox: [-77.05083, -12.070102, -77.028423, -12.055173],
        routes: [
          {
            summary: { distance: 8772.7, duration: 1054.0 },
            segments: [
              {
                distance: 2808.1,
                duration: 339.5,
                steps: [
                  { distance: 114.5, duration: 10.3, type: 11, instruction: 'Head west on Avenida 9 de Diciembre', name: 'Avenida 9 de Diciembre', way_points: [0, 4] },
                  { distance: 226.9, duration: 22.2, type: 7, instruction: 'Enter the roundabout and take the 1st exit onto Avenida Alfonso Ugarte', name: 'Avenida Alfonso Ugarte', exit_number: 1, way_points: [4, 12] },
                  { distance: 368.2, duration: 37.9, type: 1, instruction: 'Turn right onto Avenida España', name: 'Avenida España', way_points: [12, 15] },
                  { distance: 240.4, duration: 38.0, type: 12, instruction: 'Keep left onto Avenida España', name: 'Avenida España', way_points: [15, 21] },
                  { distance: 120.6, duration: 15.3, type: 1, instruction: 'Turn right onto Avenida Bolivia', name: 'Avenida Bolivia', way_points: [21, 24] },
                  { distance: 163.5, duration: 24.2, type: 13, instruction: 'Keep right', name: '-', way_points: [24, 31] },
                  { distance: 381.5, duration: 55.4, type: 13, instruction: 'Keep right', name: '-', way_points: [31, 38] },
                  { distance: 706.3, duration: 74.5, type: 0, instruction: 'Turn left onto Avenida Almirante Miguel Grau', name: 'Avenida Almirante Miguel Grau', way_points: [38, 54] },
                  { distance: 454.5, duration: 54.2, type: 0, instruction: 'Turn left onto Avenida Manco Cápac', name: 'Avenida Manco Cápac', way_points: [54, 61] },
                  { distance: 31.7, duration: 7.6, type: 3, instruction: 'Turn sharp right onto Jirón Inambari', name: 'Jirón Inambari', way_points: [61, 62] },
                  { distance: 0.0, duration: 0.0, type: 10, instruction: 'Arrive at Jirón Inambari, on the right', name: '-', way_points: [62, 62] }
                ]
              },
              {
                distance: 3664.4,
                duration: 430.8,
                steps: [
                  { distance: 130.1, duration: 26.8, type: 11, instruction: 'Head east on Jirón Inambari', name: 'Jirón Inambari', way_points: [62, 65] },
                  { distance: 369.3, duration: 38.0, type: 1, instruction: 'Turn right onto Jirón Ayacucho', name: 'Jirón Ayacucho', way_points: [65, 69] },
                  { distance: 340.7, duration: 35.9, type: 1, instruction: 'Turn right onto Avenida Almirante Miguel Grau', name: 'Avenida Almirante Miguel Grau', way_points: [69, 73] },
                  { distance: 471.6, duration: 44.4, type: 0, instruction: 'Turn left onto Avenida Iquitos', name: 'Avenida Iquitos', way_points: [73, 79] },
                  { distance: 895.9, duration: 129.5, type: 1, instruction: 'Turn right onto Avenida 28 de Julio', name: 'Avenida 28 de Julio', way_points: [79, 102] },
                  { distance: 731.7, duration: 83.4, type: 7, instruction: 'Enter the roundabout and take the 2nd exit onto Avenida 28 de Julio', name: 'Avenida 28 de Julio', exit_number: 2, way_points: [102, 120] },
                  { distance: 414.1, duration: 29.8, type: 12, instruction: 'Keep left onto Avenida Brasil', name: 'Avenida Brasil', way_points: [120, 122] },
                  { distance: 8.6, duration: 2.1, type: 1, instruction: 'Turn right onto Jirón General Orbegoso', name: 'Jirón General Orbegoso', way_points: [122, 123] },
                  { distance: 279.9, duration: 36.9, type: 0, instruction: 'Turn left onto Avenida Brasil', name: 'Avenida Brasil', way_points: [123, 126] },
                  { distance: 22.7, duration: 4.1, type: 1, instruction: 'Turn right onto Jirón Pedro Ruiz Gallo', name: 'Jirón Pedro Ruiz Gallo', way_points: [126, 127] },
                  { distance: 0.0, duration: 0.0, type: 10, instruction: 'Arrive at Jirón Pedro Ruiz Gallo, on the right', name: '-', way_points: [127, 127] }
                ]
              },
              {
                distance: 1877.4,
                duration: 226.4,
                steps: [
                  { distance: 119.0, duration: 21.4, type: 11, instruction: 'Head northwest on Jirón Pedro Ruiz Gallo', name: 'Jirón Pedro Ruiz Gallo', way_points: [127, 129] },
                  { distance: 141.1, duration: 25.4, type: 1, instruction: 'Turn right onto Jirón Juan Pablo Fernandini', name: 'Jirón Juan Pablo Fernandini', way_points: [129, 131] },
                  { distance: 156.2, duration: 28.1, type: 1, instruction: 'Turn right onto Jirón Castrovirreyna', name: 'Jirón Castrovirreyna', way_points: [131, 134] },
                  { distance: 281.0, duration: 20.2, type: 0, instruction: 'Turn left onto Avenida Brasil', name: 'Avenida Brasil', way_points: [134, 136] },
                  { distance: 6.6, duration: 1.2, type: 1, instruction: 'Turn right onto Jirón Nazca', name: 'Jirón Nazca', way_points: [136, 137] },
                  { distance: 940.2, duration: 103.7, type: 0, instruction: 'Turn left onto Avenida Brasil', name: 'Avenida Brasil', way_points: [137, 153] },
                  { distance: 155.4, duration: 16.7, type: 7, instruction: 'Enter the roundabout and take the 1st exit onto Avenida Guzmán Blanco', name: 'Avenida Guzmán Blanco', exit_number: 1, way_points: [153, 158] },
                  { distance: 78.0, duration: 9.6, type: 6, instruction: 'Continue straight onto Avenida Guzmán Blanco', name: 'Avenida Guzmán Blanco', way_points: [158, 160] },
                  { distance: 0.0, duration: 0.0, type: 10, instruction: 'Arrive at Avenida Guzmán Blanco, on the right', name: '-', way_points: [160, 160] }
                ]
              },
              {
                distance: 422.8,
                duration: 57.3,
                steps: [
                  { distance: 44.0, duration: 4.5, type: 11, instruction: 'Head northwest on Avenida Guzmán Blanco', name: 'Avenida Guzmán Blanco', way_points: [160, 162] },
                  { distance: 255.7, duration: 30.9, type: 7, instruction: 'Enter the roundabout and take the 1st exit onto Avenida 9 de Diciembre', name: 'Avenida 9 de Diciembre', exit_number: 1, way_points: [162, 169] },
                  { distance: 123.1, duration: 21.9, type: 6, instruction: 'Continue straight onto Avenida 9 de Diciembre', name: 'Avenida 9 de Diciembre', way_points: [169, 172] },
                  { distance: 0.0, duration: 0.0, type: 10, instruction: 'Arrive at Avenida 9 de Diciembre, on the right', name: '-', way_points: [172, 172] }
                ]
              }
            ],
            geometry: 'bnrhA~zeuM@ZL|CAFGJ[NKHQVIZUH[DmBHkCJUcGOqEQmECKGKCEQME?oJ\\?IUiE?IDQ?g@BURUb@O`@ClBE`@RbBIf@QX?lCKtDStC[Nc@B]C[EMQYa@c@MYEWYmE[yEAQO{BQcCASe@iHAWM@i@DE?aFZ}E^oCR}CTFy@HsAFcB\\m@\\CrDU`Fc@|E]b@tGBXd@fH@TDAl@EFA~Fa@Gc@hGa@F`AFbADp@?BF`A@PVxDL~A?LFv@@JHdAh@zHD^H@Fb@H~@HnAFbALxBFnABh@Hr@CJ?JHTFFGRCVN`C\\fFLjB\\vENjBNvBJtANrBBLFz@@RBP~J|H`E`DGJvB`BlA|@`E`DY^qAdBs@bAuB}AoAcAbDiEHIDIeEaDcE_DDIcEeDKI_@YWUwBaBQOq@g@IGq@i@{@q@cBuAiCsBgEcDaE}C_BmAGMHa@Ac@BKPQxCoAOOiBv@q@XUBIMWQ]KMSIqBO_FA[k@@B\\LvC',
            way_points: [0, 62, 127, 160, 172]
          }
        ],
        metadata: {}
      },
      steps: [
        { type: 'start', location: [-77.04, -12.06], setup: 0, service: 0, waiting_time: 0, arrival: 0, duration: 0, violations: [] },
        { type: 'job', location: [-77.03, -12.055], id: 2, setup: 0, service: 300, waiting_time: 0, job: 2, arrival: 340, duration: 340, violations: [] },
        { type: 'job', location: [-77.05, -12.07], id: 3, setup: 0, service: 300, waiting_time: 0, job: 3, arrival: 1071, duration: 771, violations: [] },
        { type: 'job', location: [-77.041, -12.061], id: 1, setup: 0, service: 300, waiting_time: 0, job: 1, arrival: 1597, duration: 997, violations: [] },
        { type: 'end', location: [-77.04, -12.06], setup: 0, service: 0, waiting_time: 0, arrival: 1954, duration: 1054, violations: [] }
      ]
    }
  ],
  unassigned: []
};
