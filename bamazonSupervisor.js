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

function beginSuper() {
    inquirer.prompt([
        {
            type: "list",
            message: "Please choose an option:",
            choices: ["View Product Sales by Department", "Create New Department", "EXIT"],
            name: "selection"
        }
    ]).then(function (answer) {
        if (answer.selection === "EXIT") {
            connection.end();
        } else if (answer.selection === "View Product Sales by Department") {
            productSales();
        } else if (answer.selection === "Create New Department") {
            createDepartment();
        }
    });
}

function productSales() {
    // connection.query("SELECT department_name, product_sales FROM products", function(err,res) {
    //     if (err) throw err;
    //     console.log(res);
    //     var stereoTotal = 0;
    //     var kitchenTotal = 0;
    //     var hygieneTotal = 0;
    //     for (var i=0;i<res.length;i++) {
    //         if (res[i].department_name==="stereo") {
    //             stereoTotal += res[i].product_sales;
    //         } else if (res[i].department_name==="kitchen") {
    //             kitchenTotal += res[i].product_sales;
    //         } else if (res[i].department_name==="hygiene") {
    //             hygieneTotal += res[i].product_sales;
    //         }
    //     }
    //     console.log(`Stereo: ${stereoTotal} || Kitchen: ${kitchenTotal} || Hygiene: ${hygieneTotal}`);
    // });
    // connection.query("SELECT department_name, SUM(product_sales) dept_total FROM products GROUP BY department_name",function(err,res) {
    //     console.log(res);
    // });
    connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS total_sales, SUM(products.product_sales)-departments.over_head_costs AS total_profit FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_name, departments.over_head_costs", function(err,res) {
        if (err) throw err;
        makeTableOne(res);
        beginSuper();
    })
}

function createDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new department?",
            name: "newDepartment"
        },
        {
            type: "number",
            message: "What is the overhead of the new department? (please enter a only whole number)(ex 10000)",
            name: "overhead"
        }
    ]).then(function (answers) {
        if (isNaN(answers.overhead)) {
            console.log("--------------------\nThe overhead entered was not a number. Please try again.\n--------------------");
            createDepartment();
        } else {
            connection.query("INSERT INTO departments SET ?", {
                department_name: answers.newDepartment,
                over_head_costs: answers.overhead
            }, function (err, res) {
                if (err) throw err;
                console.log("You have successfully added a new department.");
                connection.query("SELECT * FROM departments WHERE ?",{
                    department_id: res.insertId
                },function(err,res) {
                    if (err) throw err;
                    makeTableTwo(res);
                    beginSuper();
                });
            });
        }
    });
}

function makeTableOne(res) {

    var table = new Table({
        head: ["Dept ID", "Dept Name", "Overhead Costs", "Total Sales","Total Profit"],
        colWidths: [10, 20, 20, 20, 20]
    });

    for (var i = 0; i < res.length; i++) {
        table.push([res[i].department_id, res[i].department_name, res[i].over_head_costs,Number(res[i].total_sales).toFixed(2),Number(res[i].total_profit).toFixed(2)]);
    }

    console.log(table.toString());

}

function makeTableTwo(res) {

    var table = new Table({
        head: ["Dept ID", "Dept Name", "Overhead Costs"],
        colWidths: [10, 20, 20]
    });

    for (var i = 0; i < res.length; i++) {
        table.push([res[i].department_id, res[i].department_name, res[i].over_head_costs]);
    }

    console.log(table.toString());

}

connection.connect(function (err) {
    if (err) throw err;
    beginSuper();
});