# AWS_project

## register
- https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/register-login
- post
## login post
- https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/login
- post
## จัดการวัตถุดิบ (รับเป็น event.json)
- https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/ingredient
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
## line notification
- https://m2j6dg2ede.execute-api.us-east-1.amazonaws.com/webhook 
- post
