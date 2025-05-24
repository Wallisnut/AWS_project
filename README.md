## How to Deploy Function

1. สร้าง lambda function
2. เลือก runtime ``NodeJs 20.X``
3. copy code ไปวางใน lambda (อย่าลืมเอา package.json, package-lock.json ไปวางไว้ด้วย ``NOTE:`` แนะนําทํา index.js, package.json, package-lock.json ให้เป็น zip file แล้วโยนเข้า Lambda เลยจะง่ายกว่า)
4. เข้าไปหน้า ``Amazon EventBridge`` 
5. ใน Section ```Scheduler``` คลิก ``Schedules``
6. คลิก ``Create schedule``
7. ตั้งชื่อให้เรียบร้อย
8. ใน Section ``Schedule pattern`` เลือก ``Recurring schedule``
9. Time zone ให้เลือก ``Asia/Bangkok``
10. ``Schedule type`` เลือกเป็น ``Cron-based schedule``
11. ตั้ง Cron expression เป็น ```* 8 * * ? *``` (หรือจะตั้งอย่างอื่นก็ได้ ถ้าจะเทส)
12. Flexible time window เลือก ``off``
13. คลิก ``Next``
14. หน้า Select Target เลือก ``Aws Lambda Invoke``
15. จะเด้งหน้าต่างข้างล่างขึ้นมาให้เลือก Lambda Function ที่พึ่งสร้างขึ้นมา
16. คลิก ``Next``
17. ใน ``Action after schedule completion`` เลือก ``NONE``
18. Permission เลือก ``Lab Role``
19. คลิก ``Next`` 
20. คลิก ``Create schedule``