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

        makeTable(res);

        menuReturn();

    });

}

function lowInventory() {

    connection.query("SELECT * FROM products WHERE stock_quantity<5", function (err, res) {
        if (err) throw err;

        makeTable(res);

        menuReturn();

    });

}

function addInventory() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        makeTable(res);

        inquirer.prompt([
            {
                type: "number",
                message: "Pick a product to add inventory to (Enter ID #)",
                name: "idNum"
            },
            {
                type: "number",
                message: "How many units do you want to add?",
                name: "addUnits"
            }
        ]).then(function (answer) {
            if (isNaN(answer.idNum) || isNaN(answer.addUnits)) {
                console.log("--------------------\nOne of your entries was not a number. Please try again.\n--------------------");
                addInventory();
            } else {
                connection.query("SELECT * FROM products WHERE ?", { id: answer.idNum }, function (err, res) {
                    if (err) throw err;
                    var pickedItem = res;

                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: pickedItem[0].stock_quantity + answer.addUnits
                            },
                            {
                                id: pickedItem[0].id
                            }
                        ],
                        function (err, res) {
                            if (err) throw err;

                            console.log(`--------------------\nThe product "${pickedItem[0].product_name}" now has an inventory stock of ${pickedItem[0].stock_quantity + answer.addUnits}.\n--------------------`);

                            menuReturn();
                        }
                    );
                });

            }
        });

    });

}

function newProduct() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new product you would like to add?",
            name: "newProductName"
        },
        {
            type: "input",
            message: "What department is this product in?",
            name: "newProductDepartment"
        },
        {
            type: "number",
            message: "What is the price of the product? (please use only numbers ie do not enter $)(ex 19.99)",
            name: "newProductPrice"
        },
        {
            type: "number",
            message: "How many units should be added to the stock?",
            name: "newProductStock"
        }
    ]).then(function (answers) {
        if (isNaN(answers.newProductPrice) || isNaN(answers.newProductStock)) {
            console.log("--------------------\nOne of your entries was not a number. Please try again.\n--------------------");
            newProduct();
        } else {
            connection.query("INSERT INTO products SET ?",
            {
                product_name: answers.newProductName,
                department_name: answers.newProductDepartment,
                price: Number(answers.newProductPrice).toFixed(2),
                stock_quantity: answers.newProductStock
            }, function (err, res) {
                if (err) throw err;
                console.log("You have successfully added a new product.");
                connection.query("SELECT * FROM products WHERE ?",{
                    id: res.insertId
                },function(err,res) {
                    if (err) throw err;
                    makeTable(res);
                    menuReturn();
                });
                
            });
        }

    });

}

function menuReturn() {
    inquirer.prompt([
        {
            type: "list",
            message: "Choose an option",
            choices: ["Return to Main Menu", "EXIT"],
            name: "viewExit"
        }
    ]).then(function (answer) {
        if (answer.viewExit === "EXIT") {
            connection.end();
        } else {
            begin();
        }
    });

}

function makeTable(res) {

    var table = new Table({
        head: ["ID", "Product", "Dept", "Price", "Stock"],
        colWidths: [5, 25, 20, 15, 10]
    });

    for (var i = 0; i < res.length; i++) {
        table.push([res[i].id, res[i].product_name, res[i].department_name, Number(res[i].price).toFixed(2), res[i].stock_quantity]);
    }

    console.log(table.toString());

}

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    begin();
});