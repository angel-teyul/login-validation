const express = require('express');
const cors = require('cors');
const db = require('./config/conexion');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();

// data encoded
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// allow access
app.use(cors());

// register new user
app.post('/register', (req, res) => {
  const values = Object.values(req.body);
  const username = req.body.username;
  const email = req.body.email;

  // generate token and add it to new user
  const token = jwt.sign({user: username}, 'secret', {
    expiresIn: 60 * 60 * 24
  });

  values.push(token);

  // query to insert new user
  const sql = 'insert into tb_user (nombre, apellido, username, email, password, token) values(?,?,?,?,?,?)';

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return err;
    }

    // create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'sznjfacysedtpjsq@ethereal.email',
        pass: 'feFH6DmN7jVRYJqNqm'
      }
    });

    // setup email content and send it
    const mailOptions = {
      from: 'app_token',
      to: email,
      subject: 'Email sent from nodemailer',
      text: `Hello ${username}. This is your token: ${token}`
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        return res.status(500).send(error.message);
      }

      console.log('Email sent!');
    })

    res.json({
      message: `User added, check email ${email} for token.`,
      result: result.affectedRows
    })
  })
})


// validate token funcionality

app.post('/validate', (req, res) => {
  // get token and validate it
  const userToken = req.body.token;
  const username = req.body.username;

  if (!userToken) {
    return res.status(401).json({
      auth: false,
      message: 'No token provided'
    })
  }

  // verify and decode token
  const decoded = jwt.verify(userToken, 'secret');

  // validate if token matches username
  if (decoded.user == username) {
    // update status on database
    const sql = 'update tb_user set isActive=true where username=?'

    db.query(sql, username, (err, data) => {
      if (err) { return err; }

      console.log('User has been updated and now is active!');
    })

    res.json('Token accepted and updated in database.');
  } else {
    res.json('No valid token, no user found.')
  }
})


// login functionality

app.post('/login', (req, res) => {
  const user = req.body.user || req.body.username;
  const pass = req.body.pass || req.body.password;
  const loginData = [user, pass]

  const sql = 'select isActive from tb_user where username=? and password=?'

  db.query(sql, loginData, (err, data) => {
    if (err) { return err; }

    if (data[0] == undefined) {
      res.json({
        message: 'Invalid credentials or user is not active.'
      })
    } else {
      if (data[0].isActive == 1) {
        res.json({
          message: 'Logged in successfully!'
        })
      }
    }
  })
})

// server listening
app.listen(3000, () => {
  console.log(`Server listening on port: 3000`);
})
