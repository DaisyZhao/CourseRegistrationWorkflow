// assume that we have added basic student information in system and database
var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"})

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event));
    if (event.studentId === undefined) {
        callback("400 Invalid Input");
    }

    var res = {};
    res.studentId = event.studentId;

    if (event.courseName !== undefined) {
        res.courseName = event.courseName;

        var table = "Student";
        var params = {
            TableName:table,
            Key:{
                "studentId": res.studentId,
            },
            UpdateExpression: "ADD enrolledCourseNames :attrValue SET enrolledStatus = :status",
            ExpressionAttributeValues:{
                ":attrValue": docClient.createSet([res.courseName]),
                ":status": "Active"
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
    } else {
        res.courseName = "";
    }

    callback(null, res);
};
