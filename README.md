# AWS_project

**Lambda Endpoint URL**  
📍 `GET https://oylr4xqzr6agtddkqbzz5wedde0lxlvz.lambda-url.us-east-1.on.aws/`

**Description:**  
เช็ควัตถุดิบที่ใกล้หมดอายุภายใน 3 วันจาก DynamoDB

---

### ✅ ตัวอย่าง Response

```json
{
  "message": "Expiring ingredients found:",
  "count": 3,
  "items": [
    { "name": "นมสด", "expiry_date": "2025-05-05" },
    { "name": "ไข่ไก่", "expiry_date": "2025-05-08" }
  ]
}
