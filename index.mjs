import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async () => {
  const tableName = 'Ingredients';         //table name  !!!improtant
  const thresholdDays = 3;                 //can edit value 

  const today = new Date();
  const thresholdDate = new Date(today);
  thresholdDate.setDate(today.getDate() + thresholdDays);

  const params = {
    TableName: tableName
  };

  try {
    const command = new ScanCommand(params);
    const result = await client.send(command);
    const expiringItems = [];

    result.Items.forEach(item => {
      const name = item.name.S;
      const expiry_date = item.expiry_date.S;
      const expiry = new Date(expiry_date);

      if (expiry <= thresholdDate) {
        expiringItems.push({ name, expiry_date });
      }
    });

    const response = {
      message: expiringItems.length > 0
        ? "Expiring ingredients found:"
        : "No expiring ingredients found.",
      count: expiringItems.length,
      items: expiringItems
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(response)
    };

  } catch (err) {
    console.error("Error scanning table:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};