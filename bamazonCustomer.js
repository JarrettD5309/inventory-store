require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.password,
    database: "bamazon"
});

function showInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({
            head: ["ID","Product","Dept","Price","Stock"],
            colWidths:[5,20,15,10,8]
        });

        for (var i=0;i<res.length;i++) {
            table.push([res[i].id,res[i].product_name,res[i].department_name,res[i].price,res[i].stock_quantity]);
        }

        console.log(table.toString());
    });
}

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    showInventory();
});

