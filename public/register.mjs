import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

const generateUserID = () => {
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).substr(2, 9);

  return `${timestamp}-${randomValue}`;
};

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: "All fields are required." }),
      };
    }

    const userID = generateUserID();

    const params = {
      TableName: "User",
      Item: {
        userID: { S: userID },
        username: { S: username },
        email: { S: email },
        password: { S: password },
      },
      ConditionExpression:
        "attribute_not_exists(userID) AND attribute_not_exists(username)",
    };

    await client.send(new PutItemCommand(params));

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Signup successful.", userID: userID }),
    };
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: "Username or userID already exists." }),
      };
    }
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        message: "Internal server error.",
        error: error.message,
      }),
    };
  }
};
