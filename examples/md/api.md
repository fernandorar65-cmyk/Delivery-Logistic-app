-- CHECK PROVIDER EMAIL


https://prologistic-api-dev.up.railway.app/api/v1/users/check-provider/?email=pumasretail%40gmail.com



-- send request company to provider

https://prologistic-api-dev.up.railway.app/api/v1/company-providers/send-request/ POST

dto
{
  "company_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "provider_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}