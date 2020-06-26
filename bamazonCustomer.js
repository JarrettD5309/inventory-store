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
            head: ["ID", "Product", "Dept", "Price", "Stock"],
            colWidths: [5, 20, 15, 10, 8]
        });

        for (var i = 0; i < res.length; i++) {
            table.push([res[i].id, res[i].product_name, res[i].department_name, Number(res[i].price).toFixed(2), res[i].stock_quantity]);
        }

        console.log(table.toString());

        askCustomer();
    });
}

function askCustomer() {
    inquirer.prompt([
        {
            type: "list",
            message: "Please choose an option:",
            choices: ["Buy An Item", "EXIT"],
            name: "exit"
        }
    ]).then(function (answer) {
        if (answer.exit === "EXIT") {
            connection.end();
        } else {
            askItem();
        }
    })
}

function askItem() {
    inquirer.prompt([
        {
            type: "number",
            message: "What item would you like to buy? (Enter ID #)",
            name: "idNum"
        },
        {
            type: "number",
            message: "How many units would you like to purchase?",
            name: "amount"
        }
    ]).then(function (answers) {
        if (isNaN(answers.idNum) || isNaN(answers.amount)) {
            console.log("--------------------\nOne of your entries was not a number. Please try again.\n--------------------");
            askCustomer();
        } else {
            connection.query("SELECT * FROM products WHERE ?", { id: answers.idNum }, function (err, res) {
                var pickedItem = res;

                if (answers.amount > pickedItem[0].stock_quantity) {
                    console.log("--------------------\nInsufficient quantity. Please try again.\n--------------------");
                    askCustomer();
                } else {
                    reduceStock(pickedItem, answers.amount);
                }
            });
        }
    });
}

function reduceStock(item, amount) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: item[0].stock_quantity - amount
            },
            {
                id: item[0].id
            }
        ],
        function (err, res) {
            var totalCost = Number(amount * item[0].price).toFixed(2);
            console.log(`--------------------\nThank you for your purchase!\nYour total is $${totalCost}.\n--------------------`);
            inquirer.prompt([
                {
                    type: "confirm",
                    message: "Would you like to buy another item?",
                    name: "buyBol"
                }
            ]).then(function (answer) {
                if (answer.buyBol) {
                    showInventory();
                } else {
                    connection.end();
                }
            });
        }
    );
}

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    showInventory();
});

