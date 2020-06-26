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

function begin() {
    inquirer.prompt([
        {
            type: "list",
            message: "Please choose an option:",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "EXIT"],
            name: "selection"
        }
    ]).then(function (answer) {
        switch (answer.selection) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                lowInventory();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                newProduct();
                break;

            case "EXIT":
                connection.end();
                break;
        }
    });
}

function viewProducts() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product", "Dept", "Price", "Stock"],
            colWidths: [5, 20, 15, 10, 8]
        });

        for (var i = 0; i < res.length; i++) {
            table.push([res[i].id, res[i].product_name, res[i].department_name, Number(res[i].price).toFixed(2), res[i].stock_quantity]);
        }

        console.log(table.toString());

        inquirer.prompt([
            {
                type: "list",
                message: "Choose an option",
                choices: ["Return to Main Menu","EXIT"],
                name: "viewExit"
            }
        ]).then(function(answer){
            if (answer.viewExit==="EXIT") {
                connection.end();
            } else {
                begin();
            }
        })
    });

}

function lowInventory() {

}

function addInventory() {

}

function newProduct() {

}

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    begin();
});