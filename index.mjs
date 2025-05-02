import { DynamoDB } from "aws-sdk";
import axios from "axios";

const dynamoDb = new DynamoDB.DocumentClient();
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const events = body.events || [];

        for (const e of events) {
            if (e.type !== "message") continue;

            const userId = e.source.userId;
            const userMessage = e.message.text.trim();

            if (userMessage === "เช็คของ") {
                const response = await dynamoDb
                    .query({
                        TableName: "FridgeItems",
                        KeyConditionExpression: "userID = :userId",
                        ExpressionAttributeValues: {
                            ":userId": userId,
                        },
                    })
                    .promise();

                const items = response.Items || [];

                let replyText = "ไม่พบของในตู้เย็นเลยครับ 😢";
                if (items.length > 0) {
                    replyText =
                        "ของในตู้เย็น:\n" +
                        items
                            .map((item) => `- ${item.itemID} ${item.itemName}`)
                            .join("\n");
                }

                await replyToLine(e.replyToken, replyText);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "OK" }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error" }),
        };
    }
};

async function replyToLine(replyToken, text) {
    const LINE_API = "https://api.line.me/v2/bot/message/reply";
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    };
    const body = {
        replyToken,
        messages: [{ type: "text", text }],
    };

    try {
        await axios.post(LINE_API, body, { headers });
    } catch (error) {
        console.error("Error replying to Line:", error);
    }
}
