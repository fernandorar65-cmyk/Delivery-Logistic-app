-- APIS COMPANIES

https://prologistic-api-dev.up.railway.app/api/v1/companies/ GET
https://prologistic-api-dev.up.railway.app/api/v1/companies/ POST
    DTO:
        {
            "company_name": "string",
            "ruc": "string",
            "description": "string",
            "email": "user@example.com",
            "password": "string"
        }
https://prologistic-api-dev.up.railway.app/api/v1/companies/iadspda/ GET el 'iadspda' es un id string por que es guid
https://prologistic-api-dev.up.railway.app/api/v1/companies/das/ DELETE el 'das' es un id string por que es guid




-- APIS PROVIDERS

https://prologistic-api-dev.up.railway.app/api/v1/providers/  -- GET PROVIDERS
https://prologistic-api-dev.up.railway.app/api/v1/providers/ -- POST PROVIDERS 

DTO -->
        {
        "provider_name": "Transportes Pumas",
        "ruc": "20660770221",
        "description": "Transportes Pumas los mejores camiones para el envio de productos",
        "email": "pumasretail@gmail.com",
        "password": "contraseña1234"
        }

https://prologistic-api-dev.up.railway.app/api/v1/providers/8ebe2249-7dd2-4a1b-a052-a5a3933f6f9e/  -- GET PROVIDER el ultimo string del url es el guid
--> dto response
{
  "errors": [],
  "result": {
    "id": "8ebe2249-7dd2-4a1b-a052-a5a3933f6f9e",
    "provider_name": "Transportes Pumas",
    "ruc": "20660770221",
    "description": "Transportes Pumas los mejores camiones para el envio de productos",
    "created_at": "2026-01-13T23:34:47+0000",
    "user_id": "014529cc-ef91-4a14-9a6d-cc940da37ddb",
    "user_email": "pumasretail@gmail.com",
    "user_type": "provider"
  }
}

https://prologistic-api-dev.up.railway.app/api/v1/providers/8ebe2249-7dd2-4a1b-a052-a5a3933f6f9e/ -- DELETE PROVIDER el ultimo string del url es el guid




-- API DE VEHICLES
https://prologistic-api-dev.up.railway.app/api/v1/providers/{idProvider}/vehicles/  GET VEHICLES DE UN PROVIDER O ALIADO
 
https://prologistic-api-dev.up.railway.app/api/v1/providers/{idProvider}/vehicles/ POST VEHICLE DE UN PROVIDER O ALIADO
  DTO-->{
    "plate_number": "string",
    "brand": "string",
    "model": "string",
    "color": "string",
    "year": 2147483647,
    "vehicle_type": "TRUCK",
    "body_type": "FLATBED",
    "tara_kg": "-48",
    "gross_weight_kg": "-249172.93",
    "net_capacity_kg": "476",
    "length_m": "572.9",
    "width_m": "-761.57",
    "height_m": "-",
    "status": "ACTIVE"
  }



https://prologistic-api-dev.up.railway.app/api/v1/providers/{idProvider}/vehicles/{idVehicle}/ GET PARA OBTENER EL VEHICLE de un PROVIDER
DTO QUE RETORNA -->
                    {
                      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                      "provider_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                      "provider_name": "string",
                      "plate_number": "string",
                      "brand": "string",
                      "model": "string",
                      "color": "string",
                      "year": 2147483647,
                      "vehicle_type": "TRUCK",
                      "body_type": "FLATBED",
                      "tara_kg": "-40802410",
                      "gross_weight_kg": "032834.9",
                      "net_capacity_kg": "5479886.71",
                      "length_m": ".74",
                      "width_m": "-425.4",
                      "height_m": "-341.",
                      "status": "ACTIVE",
                      "created_at": "2026-01-14T20:28:13.466Z",
                      "updated_at": "2026-01-14T20:28:13.466Z"
                    }


https://prologistic-api-dev.up.railway.app/api/v1/providers/{idProvider}/vehicles/{idVehicle}/ PUT PARA ACTUALIZAR UN VEHICLE

DTO QUE SE NECESITA --> 
    {
      "plate_number": "string",
      "brand": "string",
      "model": "string",
      "color": "string",
      "year": 2147483647,
      "vehicle_type": "TRUCK",
      "body_type": "FLATBED",
      "tara_kg": "935178.11",
      "gross_weight_kg": "",
      "net_capacity_kg": "-01097",
      "length_m": "845",
      "width_m": "9",
      "height_m": "-7",
      "status": "ACTIVE"
    }


https://prologistic-api-dev.up.railway.app/api/v1/providers/{idProvider}/vehicles/{idVehicle}/ PATCH PARA ACTUALIZAR UN VEHICLE

DTO QUE SE NECESITA --> 
    {
      "plate_number": "string",
      "brand": "string",
      "model": "string",
      "color": "string",
      "year": 2147483647,
      "vehicle_type": "TRUCK",
      "body_type": "FLATBED",
      "tara_kg": "935178.11",
      "gross_weight_kg": "",
      "net_capacity_kg": "-01097",
      "length_m": "845",
      "width_m": "9",
      "height_m": "-7",
      "status": "ACTIVE"
    }

https://prologistic-api-dev.up.railway.app/api/v1/providers/{idProvider}/vehicles/{idVehicle}/ DELETE DE UN VEHICLE ASOCIADO A UN PROVIDER 



-- APIS CLIENTES

-- https://prologistic-api-dev.up.railway.app/api/v1/clients/ GET CLIENTS


-- https://prologistic-api-dev.up.railway.app/api/v1/clients/ POST CLIENTS
DTO
  {
  "client_name": "aksjdnakjdn",
  "ruc": "12345678911",
  "description": "asnjkdankdja",
  "email": "user0101@example.com",
  "password": "Contra123#"
}

https://prologistic-api-dev.up.railway.app/api/v1/clients/{idClient}/ GET BY ID
https://prologistic-api-dev.up.railway.app/api/v1/clients/{idClient}/ DELETE BY ID
