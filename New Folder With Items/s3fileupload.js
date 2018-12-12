var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var aws = require('aws-sdk');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');
var app = express();
var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

aws.config = new aws.Config();
aws.config.accessKeyId = "AKIAIURVZGWWP4G3WR5A";
aws.config.secretAccessKey = "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";

var s0 = new aws.S3({});
var upload =  multer({
    storage : multerS3({
        s3 : s0,
        bucket : 'myfirstbucket11157',
        acl : 'public-read',
        metadata : function(req,file,cb){
            cb(null, {fieldName : file.fieldname});
        },
        key : function(req, file, cb){
            cb(null, Date.now()+ file.originalname);
        }
    })
}).single('myfile');

aws.CredentialProviderChain.defaultProviders = [];

app.post('/upload', function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file." +err);
        }
         res.end("File is uploaded successfully!"+ res.req.file.location);
    });
});

app.listen(4001,function(){
    console.log("server listening on port:4001");
});

