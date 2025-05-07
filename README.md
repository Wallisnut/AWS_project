# AWS_project
## จัดการวัตถุดิบ (รับเป็น event.json)
- https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients
  -  add ingredient (post)
```
{
  "body": "{\"userId\":\"user124\",\"name\":\"Meat\",\"expiryDate\":\"2024-12-31\",\"quantity\":10}"
}
```
  -  get ingredient (get)
```
{
  "body": "{\"userId\": \"user124\"}"
}
```
  -  delete ingredient (delete)
```
{
  "body": "{\"userId\":\"user124\", \"ingredientId\":\"1746592990657\"}"
}
```

## เช๊ควันหมดอายุ
- https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients/checkexpiring
  - get
 
## แนะนำเมนู
- https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients/recommendMenu
  - get
