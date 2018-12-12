var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var aws = require('aws-sdk');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var passwordHash = require('password-hash');
var passwordHash = require('./node_modules/password-hash/lib/password-hash');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function(req,res){
    res.sendFile(__dirname + "/profile.html");
});

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb"
});

con.connect(function(err){
    if (err){
        console.log("oops! there is an error");
    }
    else{
        console.log("connected");
    }
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
        var profile = {};
        profile.firstname = req.body.firstname;
        profile.lastname = req.body.lastname;
        profile.email = req.body.email;
        profile.mobile = req.body.mobile;
        profile.password = req.body.password;
        profile.prof_pic = res.req.file.location;
        var pwdLength=req.body.password.length;
        var fnameLength=req.body.firstname.length;
        var moblength = req.body.mobile.length;
        req.body.prof_pic = res.req.file.location;

        if(pwdLength < 6 || pwdLength > 10){
            res.end("password s/b in b/n 6 to 10 chars");
        }
        if(moblength > 10 || moblength < 10){
            res.end("enter valid mobile number");
        }
        else if(fnameLength === 0){
            res.end("fname cannot be empty");
        }
        else{
            var hashedPassword = passwordHash.generate(req.body.password);
            profile.password = hashedPassword;
            var query = con.query('insert into stud_details set ?', profile, function (err, result) {
                if (err) {

                    res.end("error"+err);
                }
                if (result) {

                    res.redirect('/new_record');
                }

            });
        }
    });
});
app.get('/new_record',function (req,res,err) {
    var sqldisplay = "SELECT * FROM stud_details order by id desc limit 1";
    con.query(sqldisplay, function (err, result,fields) {
        res.send(result);
        if (err) throw err;
    });
});

app.listen(4001,function(){
    console.log("server listening on port:4001");
});

