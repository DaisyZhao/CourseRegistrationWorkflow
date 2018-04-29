var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"});
var uuid = require("uuid");

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event));

    var res = {};
    res.studentId = event.studentId;
    res.courseName = event.courseName;

    var table = "Billing";
    var params = {
        TableName:table,
        Item:{
            "billingId": uuid.v1(),
            "studentId": res.studentId,
            "courseName": res.courseName,
            "totalFee": 6000,
            "paymentStatus": "Paid"
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        console.log(params);
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });

    res.paymentStatus = params.paymentStatus;
    callback(null, res);
};
