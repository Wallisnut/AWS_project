import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
  console.log("Raw event:", JSON.stringify(event, null, 2));

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { userId, ingredientId, name, expiryDate, quantity, category } = body;

  if (!userId || !ingredientId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Missing required fields: userId and ingredientId",
        received: { userId, ingredientId },
      }),
    };
  }
  let parsedQuantity = quantity;
  if (quantity !== undefined) {
    parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Quantity must be a number" }),
      };
    }
  }

  if (parsedQuantity === 0) {
    try {
      const deleteCommand = new DeleteCommand({
        TableName: "Ingredients",
        Key: { userId, ingredientId },
      });

      await docClient.send(deleteCommand);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Ingredient deleted successfully!" }),
      };
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: error.message }),
      };
    }
  }

  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (name) {
    updateExpression.push("#n = :name");
    expressionAttributeValues[":name"] = name;
    expressionAttributeNames["#n"] = "name";
  }
  if (expiryDate) {
    updateExpression.push("#expiryDate = :expiryDate");
    expressionAttributeValues[":expiryDate"] = expiryDate;
    expressionAttributeNames["#expiryDate"] = "expiryDate";
  }
  if (parsedQuantity !== undefined) {
    updateExpression.push("#quantity = :quantity");
    expressionAttributeValues[":quantity"] = parsedQuantity;
    expressionAttributeNames["#quantity"] = "quantity";
  }
  if (category) {
    updateExpression.push("#category = :category");
    expressionAttributeValues[":category"] = category;
    expressionAttributeNames["#category"] = "category";
  }

  if (updateExpression.length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "No valid fields to update" }),
    };
  }

  const updateCommand = new UpdateCommand({
    TableName: "Ingredients",
    Key: { userId, ingredientId },
    UpdateExpression: `SET ${updateExpression.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await docClient.send(updateCommand);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Ingredient updated successfully!",
        updatedItem: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
