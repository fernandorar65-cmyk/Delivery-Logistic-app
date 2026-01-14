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

