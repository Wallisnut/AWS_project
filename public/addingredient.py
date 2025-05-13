
import json
import uuid
import base64
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

S3_BUCKET = 'bitebrightmembers'  
TABLE_NAME = 'Ingredients'      

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
}

def lambda_handler(event, context):
    print("Received event:", json.dumps(event, indent=2))
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
    
    try:
        body = json.loads(event['body']) if event.get('body') else {}
    except json.JSONDecodeError as e:
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Invalid JSON body', 'details': str(e)})
        }
    
    required_fields = ['userId', 'name', 'expiryDate', 'quantity', 'category']
    missing_fields = [field for field in required_fields if not body.get(field)]
    
    if missing_fields:
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'error': 'Missing required fields',
                'missingFields': missing_fields,
                'received': {k: body.get(k) for k in required_fields}
            })
        }
    
    ingredient_id = str(uuid.uuid4())
    image_url = ''
    
    if body.get('imageBase64'):
        try:
            image_data = body['imageBase64']
            if ',' in image_data:
                _, encoded = image_data.split(',', 1)
            else:
                encoded = image_data

            encoded += '=' * (-len(encoded) % 4)

            image_data = base64.b64decode(encoded)
            file_name = f"{ingredient_id}.jpg"

            s3.put_object(
                Bucket=S3_BUCKET,
                Key=file_name,
                Body=image_data,
                ContentType='image/jpeg'
            )

            image_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{file_name}"
        except Exception as e:
            print(f"S3 upload failed: {str(e)}")
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Image upload failed', 'details': str(e)})
            }
    
    try:
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(
            Item={
                'userId': body['userId'],
                'ingredientId': ingredient_id,
                'name': body['name'],
                'expiryDate': body['expiryDate'],
                'quantity': int(body['quantity']),
                'category': body['category'],
                'imageUrl': image_url,
                'createdAt': datetime.utcnow().isoformat(),
                'updatedAt': datetime.utcnow().isoformat()
            }
        )
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Ingredient added successfully!',
                'ingredientId': ingredient_id,
                'imageUrl': image_url
            })
        }
    except Exception as e:
        print(f"DynamoDB error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Database operation failed', 'details': str(e)})
        }
