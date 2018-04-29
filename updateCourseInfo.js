var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"})

exports.handler = function(event, context, callback) {
    var res = event;

    var table = "Course";
    var params = {
        TableName:table,
        Key:{
            "courseName": res.courseName,
        },
        UpdateExpression: "ADD #attrName :attrValue",
        ExpressionAttributeNames: {
            "#attrName": "enrolledStudentIds"
        },
        ExpressionAttributeValues:{
            ":attrValue": docClient.createSet([res.studentId])
        },
        ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating the item...");
    docClient.update(params, function(err, data) {
        console.log(params);

        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });

    callback(null, res);
};
