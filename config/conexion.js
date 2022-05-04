const mysql = require('mysql');

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'login_appweb'
});

conexion.connect( (err) => {
  if (err) {
    console.log('Connection error.', err);
    return err;
  }

  console.log('Connection completed.');
})

module.exports = conexion;
