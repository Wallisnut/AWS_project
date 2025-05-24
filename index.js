const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

exports.handler = async () => {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + 3);

  const ingredientParams = {
    TableName: 'Ingredients',
  };

  try {
    const data = await dynamodb.scan(ingredientParams).promise();

    const userIdToItems = {};
    const userIds = new Set();

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

    const userData = await dynamodb.scan({ TableName: 'User' }).promise();

    const userIdToEmail = {};
    for (const user of userData.Items) {
      userIdToEmail[user.userID] = user.email;
    }

    const emailToItems = {};
    for (const [userId, items] of Object.entries(userIdToItems)) {
      const email = userIdToEmail[userId];
      if (!email) continue; 

      if (!emailToItems[email]) {
        emailToItems[email] = [];
      }
      emailToItems[email].push(...items);
    }

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
      const message = `สวัสดีครับ\n\nรายการวัตถุดิบของคุณที่ใกล้หมดอายุ:\n\n${lines}\n\nกรุณาตรวจสอบและจัดการให้เหมาะสม\n\nขอบคุณครับ`;

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
