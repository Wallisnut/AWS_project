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

    const userIdToItems = {};
    const userIds = new Set();

    // ดึงรายการ ingredients และจัดกลุ่มตาม userId
    for (const item of data.Items) {
      const expiry = new Date(item.expiryDate);
      if (expiry >= today && expiry <= thresholdDate) {
        if (!userIdToItems[item.userId]) {
          userIdToItems[item.userId] = [];
        }
        userIdToItems[item.userId].push(item);
        userIds.add(item.userId);
      }
    }

    // เตรียม BatchGet สำหรับ table User
    const keys = Array.from(userIds).map(id => ({ userID: id }));

    const userData = await dynamodb.batchGet({
      RequestItems: {
        User: {
          Keys: keys,
        },
      },
    }).promise();

    const userIdToEmail = {};
    for (const user of userData.Responses.User) {
      userIdToEmail[user.userID] = user.email;
    }

    // จัดกลุ่ม item ตาม email
    const emailToItems = {};
    for (const [userId, items] of Object.entries(userIdToItems)) {
      const email = userIdToEmail[userId];
      if (!email) continue;

      if (!emailToItems[email]) {
        emailToItems[email] = [];
      }
      emailToItems[email].push(...items);
    }

    // ส่ง SNS ไปยังแต่ละ email
    for (const [email, items] of Object.entries(emailToItems)) {
      const topicName = `expiry-${email.replace(/[@.]/g, '-')}`;
      const topicResponse = await sns.createTopic({ Name: topicName }).promise();
      const topicArn = topicResponse.TopicArn;

      const subscriptions = await sns.listSubscriptionsByTopic({ TopicArn: topicArn }).promise();
      const isSubscribed = subscriptions.Subscriptions.some(sub =>
        sub.Endpoint === email && sub.Protocol === 'email'
      );

      if (!isSubscribed) {
        await sns.subscribe({
          Protocol: 'email',
          TopicArn: topicArn,
          Endpoint: email,
        }).promise();
        console.log(`ส่งคำเชิญ subscribe ไปยัง ${email}`);
      }

      const lines = items.map(i => `- ${i.name} (หมดอายุ: ${i.expiryDate})`).join('\n');
      const message = `สวัสดีครับ\n\nรายการวัตถุดิบของคุณที่ใกล้หมดอายุ:\n${lines}\nกรุณาตรวจสอบและจัดการให้เหมาะสม\nขอบคุณครับ`;

      await sns.publish({
        TopicArn: topicArn,
        Subject: 'แจ้งเตือนวัตถุดิบใกล้หมดอายุ',
        Message: message,
      }).promise();

      console.log(`แจ้งเตือนส่งไปยัง ${email} ผ่าน Topic: ${topicName}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        usersNotified: Object.keys(emailToItems).length,
      }),
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return { statusCode: 500, body: "ส่ง SNS ล้มเหลว" };
  }
};
