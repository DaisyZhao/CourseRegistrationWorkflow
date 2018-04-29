var AWS = require('aws-sdk');
var ses = new AWS.SES({region: 'us-west-2'});
var docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"});

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event));

    var res = {};
    res.studentId = event.studentId;
    res.courseName = event.courseName;

    var systemAddress = "zhao.xuey@husky.neu.edu";

    var studentInfo = {
        TableName: "Student",
        Key:{
            "studentId": res.studentId
        }
    };

    // use AWS SES service to send notification email
    docClient.get(studentInfo, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            var email = data.Item.email;
            // send to students
            var toStudent = {
                Destination: {
                    ToAddresses: [email]
                },
                Message: {
                    Body: {
                        Text: {
                            Data: "Dear " + data.Item.name
                                + "\n\nYou successfully registered for Course " + res.courseName,
                        }
                    },
                    Subject: {
                        Data: "Successful Registration"
                    }
                },
                Source: systemAddress
            };

            var emailToStudent = ses.sendEmail(toStudent, function(err, data){
                if(err) {
                    console.log(err);
                } else {
                    console.log("Email sent to student");
                    console.log(data);
                }
            });
        }
    });

    // send to professor
    var courseInfo = {
        TableName: "Course",
        Key:{
            "courseName": res.courseName
        }
    }

    docClient.get(courseInfo, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            var professorInfo = {
                TableName: "Professor",
                Key:{
                    "professorName": data.Item.professorName
                }
            }

            docClient.get(professorInfo, function(err, data) {
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                    var toProfessor = {
                        Destination: {
                            ToAddresses: [data.Item.email]
                        },
                        Message: {
                            Body: {
                                Text: {
                                    Data: "Dear " + data.Item.professorName + "\n\nStudent "
                                      + res.studentId + " registered for your Course " + res.courseName
                                }
                            },
                            Subject: {
                                Data: "Student Registration"
                            }
                        },
                        Source: systemAddress
                    };

                    var emailToProfessor = ses.sendEmail(toProfessor, function(err, data){
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("Email sent to professor");
                            console.log(data);
                        }
                    });
                }
            });
        }
    });
};
