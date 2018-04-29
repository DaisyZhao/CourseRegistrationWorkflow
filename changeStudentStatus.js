var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"})

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event));

    var res = {};
    res.studentId = event.studentId;

    var table = "Student";
    var params = {
        TableName:table,
        Key:{
            "studentId": res.studentId,
        },
        UpdateExpression: "SET enrolledStatus = :attrValue",
        ExpressionAttributeValues:{
            ":attrValue": "Inactive"
        },
        ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating the item...");
    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });

    callback(null, params);
};
