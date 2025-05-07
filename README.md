# AWS_project

**Lambda Endpoint URL**  
📍 `GET https://8ms6jhbfla.execute-api.us-east-1.amazonaws.com/api/CheckingExpirationDate`

**Description:**  
เช็ควัตถุดิบที่ใกล้หมดอายุภายใน 3 วันจาก DynamoDB

---

### ✅ ตัวอย่าง Response

```json
{
  "message": "Expiring ingredients found:",
  "count": 2,
  "items": [
    { "name": "นมสด", "expiry_date": "2025-05-05" },
    { "name": "ไข่ไก่", "expiry_date": "2025-05-08" }
  ]
}
