// checkAllMenusAvailability.mjs
// AWS Lambda function ที่ใช้ตรวจสอบว่ามีวัตถุดิบเพียงพอสำหรับเมนูทั้งหมดในระบบ

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// สร้าง DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' }); // เปลี่ยน region ตามที่คุณใช้งาน
const docClient = DynamoDBDocumentClient.from(client);

/**
 * ดึงข้อมูลเมนูทั้งหมดจาก DynamoDB
 * @returns {Promise<Array>} - รายการเมนูทั้งหมด
 */
async function getAllMenus() {
    const params = {
        TableName: 'menu_cs232'
    };

    try {
        const result = await docClient.send(new ScanCommand(params));
        return result.Items || [];
    } catch (error) {
        console.error('Error getting menus:', error);
        throw error;
    }
}

/**
 * AWS Lambda Handler
 * @param {Object} event - Lambda Event
 * @returns {Object} - Response
 */
export const handler = async (event) => {
    try {
        // ดึงข้อมูลเมนูทั้งหมดและตรวจสอบความพร้อมของวัตถุดิบ
        const menus = await getAllMenus();
        //const result = await checkAllMenusAvailability();
        

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(menus)
        };
    } catch (error) {
        console.error('Lambda execution error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: error.message || 'Internal server error'
            })
        };
    }
};