const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

exports.handler = async () => {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + 3);

  const params = {
    TableName: 'Ingredients',
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const userItemsMap = {};

    for (const item of data.Items) {
      const expiry = new Date(item.expiryDate);
      if (expiry >= today && expiry <= thresholdDate) {
        if (!userItemsMap[item.userEmail]) {
          userItemsMap[item.userEmail] = [];
        }
        userItemsMap[item.userEmail].push(item);
      }
    }

    for (const [userEmail, items] of Object.entries(userItemsMap)) {
      const topicName = `expiry-${userEmail.replace(/[@.]/g, '-')}`;
      const topicResponse = await sns.createTopic({ Name: topicName }).promise();
      const topicArn = topicResponse.TopicArn;

      // ตรวจว่า email ได้ subscribe แล้วหรือยัง
      const subscriptions = await sns.listSubscriptionsByTopic({ TopicArn: topicArn }).promise();
      const isSubscribed = subscriptions.Subscriptions.some(sub =>
        sub.Endpoint === userEmail && sub.Protocol === 'email'
      );

      //  subscribe อัตโนมัติถ้ายังไม่มี (user จะได้อีเมลยืนยัน)
      if (!isSubscribed) {
        await sns.subscribe({
          Protocol: 'email',
          TopicArn: topicArn,
          Endpoint: userEmail,
        }).promise();
        console.log(`ส่งคำเชิญ subscribe ไปยัง ${userEmail}`);
      }

      // เตรียมข้อความแจ้งเตือน
      const lines = items.map(i => `- ${i.name} (หมดอายุ: ${i.expiryDate})`).join('\n');

      const message = `สวัสดีครับ\n\nรายการวัตถุดิบของคุณที่ใกล้หมดอายุ:\n\n${lines}\n\nกรุณาตรวจสอบและจัดการให้เหมาะสม\n\nขอบคุณครับ`;

      // ส่งข้อความผ่าน SNS
      await sns.publish({
        TopicArn: topicArn,
        Subject: 'แจ้งเตือนวัตถุดิบใกล้หมดอายุ',
        Message: message,
      }).promise();

      console.log(`แจ้งเตือนส่งไปยัง ${userEmail} ผ่าน Topic: ${topicName}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        usersNotified: Object.keys(userItemsMap).length,
      }),
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return { statusCode: 500, body: "ส่ง SNS ล้มเหลว" };
  }
};
