var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3000,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(err => {
    if (err) throw err;
    menuOptions();
});

//menu options for supervisor
function menuOptions() {
    inquirer
        .prompt({
            name: "option",
            type: "list",
            message: "Welcome! Please select an option!",
            choices: [
                "View Product Sales by Department",
                "Create New Department"
            ]
        })
        .then(function (answer) {
            switch (answer.option) {
                case "View Product Sales by Department":
                    viewSales();
                    break;

                case "Create New Department":
                    createDepartment();
                    break;
            }
        });
}

//function to view sales in a table
function viewSales() {
    var query = "SELECT department_id, d.department_name, over_head_costs, IFNULL(SUM(product_sales), 0) AS total_product_sales, IFNULL(SUM(product_sales) - over_head_costs, 0 - over_head_costs) AS total_profit FROM products p RIGHT JOIN departments d ON p.department_name = d.department_name GROUP BY d.department_name ORDER BY department_id;";
    connection.query(query, (err, res) => {
        if (err) throw err;
        var tableArray = [];
        res.forEach(function (el) {
            var tableObj = {
                "department id": el.department_id,
                "department name": el.department_name,
                "overhead cost": el.over_head_costs,
                "product sales": el.total_product_sales,
                "total profit": el.total_profit
            };
            tableArray.push(tableObj);
        });

        console.table(tableArray);

        promptReturn();
    });
}

//function to create a new department
function createDepartment() {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "Please enter your new department: "
        },
        {
            name: "overhead",
            type: "input",
            message: "Please enter this department's overhead: ",
            validate: function (val) {
                if (isNaN(val)) {
                    console.log("\nWe only accept numbers at this time. Sorry for the inconvenience!");
                    return false;
                }

                if (val < 0) {
                    console.log("\nWe only accept positive numbers at this time. Sorry for the inconvenience!");
                    return false;
                }

                return true;
            }
        }
    ]).then(answer => {
        addDepartment(answer.department, answer.overhead);
    });
}

//mysql function to add new department
function addDepartment(department, overhead) {
    var query = "INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)";
    connection.query(query, [department, overhead], (err) => {
        if (err) throw err;
        console.log("\"" + department + "\" has been added!");
        promptReturn();
    });
}

//ask supervisor to return to options
function promptReturn() {
    inquirer.prompt([
        {
            name: "confirmation",
            type: "confirm",
            message: "Return to menu options?"
        }
    ]).then(response => {
        if (response.confirmation) {
            return menuOptions();
        }

        console.log("Have a pleasant day!");
        process.exit();
    });
}