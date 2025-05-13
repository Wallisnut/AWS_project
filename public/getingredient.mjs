import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);
const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const userId = event.queryStringParameters?.userId;

  if (!userId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Missing userId in the query parameters" }),
    };
  }

  const params = {
    TableName: "Ingredients",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId },
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    const items = data.Items;

    for (const item of items) {
      if (item.imageUrl) {
        try {
          const bucketName = "bitebrightmembers";
          const fileName = item.imageUrl.split("/").pop();

          const getObjectParams = {
            Bucket: bucketName,
            Key: fileName,
          };

          const signedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand(getObjectParams),
            { expiresIn: 3600 },
          );

          item.signedImageUrl = signedUrl;
        } catch (err) {
          console.error("Error generating signed URL:", err.message);
          item.signedImageUrl = "Error fetching image";
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
