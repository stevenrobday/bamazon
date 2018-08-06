var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

var state;

const VIEW_PRODUCTS = 0;
const ADD_INVENTORY = 1;

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

function menuOptions() {
    inquirer
        .prompt({
            name: "option",
            type: "list",
            message: "Select an option!",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ]
        })
        .then(function (answer) {
            switch (answer.option) {
                case "View Products for Sale":
                    state = VIEW_PRODUCTS;
                    viewProducts();
                    break;

                case "View Low Inventory":
                    viewLowInventory();
                    break;

                case "Add to Inventory":
                    state = ADD_INVENTORY;
                    viewProducts();
                    break;

                case "Add New Product":
                    createProduct();
                    break;
            }
        });
}

var getProductCount = () => {
    return new Promise(resolve => {
        var query = "SELECT COUNT(*) AS count FROM products";
        connection.query(query, (err, res) => {
            if (err) throw err;
            resolve(res[0].count);
        });
    });
}

function viewProducts() {
    var query = "SELECT * FROM products";
    connection.query(query, (err, res) => {
        if (err) throw err;
        var tableArray = [];
        res.forEach(function (el) {
            var tableObj = {
                "item id": el.item_id,
                "product": el.product_name,
                "department": el.department_name,
                "price": el.price,
                "stock": el.stock_quantity
            };
            tableArray.push(tableObj);
        });

        console.table(tableArray);

        if (state === VIEW_PRODUCTS)
            promptReturn();
        else
            addQuantity();
    });
}

function viewLowInventory() {
    var query = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(query, (err, res) => {
        if (err) throw err;
        var tableArray = [];
        res.forEach(function (el) {
            var tableObj = {
                "item id": el.item_id,
                "product": el.product_name,
                "department": el.department_name,
                "price": el.price,
                "stock": el.stock_quantity
            };
            tableArray.push(tableObj);
        });

        console.table(tableArray);

        promptReturn();
    });
}

function itemSelect(productCount) {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "Enter id of product you will increase: ",
            validate: function (val) {
                if (isNaN(val)) {
                    console.log("\nThat's not a number! You fool! \nYOU HAVE BEEN SMACKED");
                    return false;
                }

                if (val % 1 !== 0) {
                    console.log("\nDecimals are not allowed! You fool! \nYOU HAVE BEEN SMACKED");
                    return false;
                }

                if (val < 1 || val > productCount) {
                    console.log("\nThat number is not listed! You fool! \nYOU HAVE BEEN SMACKED");
                    return false;
                }

                return true;
            }
        }
    ]).then(answer => {
        getProductByID(answer.id).then(product => {
            quantityPrompt(product, answer.id);
        });
    });
}

function quantityPrompt(product, id) {
    console.log("You will add to the \"" + product + "\"!");
    inquirer.prompt([
        {
            name: "quantity",
            type: "input",
            message: "Now tell me how many you will add: ",
            validate: function (val) {
                if (isNaN(val)) {
                    console.log("\nThat's not a number! You fool! \nYOU HAVE BEEN SMACKED");
                    return false;
                }

                if (val % 1 !== 0) {
                    console.log("\nDecimals are not allowed! You fool! \nYOU HAVE BEEN SMACKED");
                    return false;
                }

                if (val < 1) {
                    console.log("\nYou don't want to increase it any? You fool! \nYOU HAVE BEEN SMACKED");
                    return false;
                }

                return true;
            }
        }
    ]).then(quantity => {
        getQuantityByID(id).then(res => {
            var newQuantity = res.stock_quantity + parseInt(quantity.quantity);
            changeQuantity(newQuantity, id, res.product_name);
        });
    });
}

var getProductByID = id => {
    return new Promise(resolve => {
        var query = "SELECT product_name FROM products WHERE item_id = ?";
        connection.query(query, [id], (err, res) => {
            if (err) throw err;
            resolve(res[0].product_name);
        });
    });
}

var getQuantityByID = id => {
    return new Promise(resolve => {
        var query = "SELECT stock_quantity, product_name FROM products WHERE item_id = ?";
        connection.query(query, [id], (err, res) => {
            if (err) throw err;
            resolve(res[0]);
        });
    });
}

function changeQuantity(quantity, id, product) {
    var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
    connection.query(query, [quantity, id], (err) => {
        if (err) throw err;
        console.log("\"" + product + "\" count is now " + quantity + "!");
        promptReturn();
    });
}

function addQuantity() {
    getProductCount().then(productCount => {
        itemSelect(productCount);
    });
}

var getDepartments = () => {
    return new Promise(resolve => {
        var query = "SELECT department_name FROM departments ORDER BY department_id";
        connection.query(query, (err, res) => {
            if (err) throw err;
            var deptArray = [];
            res.forEach(function (el) {
                deptArray.push(el.department_name);
            });
            resolve(deptArray);
        });
    });
}

function createProduct() {
    getDepartments().then(departments => {
        inquirer.prompt([
            {
                name: "product",
                type: "input",
                message: "Enter product name: "
            },
            {
                name: "department",
                type: "list",
                message: "Select a department!",
                choices: departments
            },
            {
                name: "price",
                type: "input",
                message: "Enter product price: ",
                validate: function (val) {
                    if (isNaN(val)) {
                        console.log("\nThat's not a number! You fool! \nYOU HAVE BEEN SMACKED");
                        return false;
                    }

                    if (val == 0) {
                        console.log("\nYou want to give our products away for free? You fool! \nYOU HAVE BEEN SMACKED");
                        return false;
                    }

                    if (val < 0) {
                        console.log("\nYou want to give our products away for free, and then pay people for taking them? You fool! \nYOU HAVE BEEN SMACKED");
                        return false;
                    }

                    return true;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Enter quantity: ",
                validate: function (val) {
                    if (isNaN(val)) {
                        console.log("\nThat's not a number! You fool! \nYOU HAVE BEEN SMACKED");
                        return false;
                    }

                    if (val % 1 !== 0) {
                        console.log("\nDecimals are not allowed! You fool! \nYOU HAVE BEEN SMACKED");
                        return false;
                    }

                    if (val < 1) {
                        console.log("\nYou don't want to increase it any? You fool! \nYOU HAVE BEEN SMACKED");
                        return false;
                    }

                    return true;
                }
            }
        ]).then(answer => {
            addProduct(answer);
        });
    });
}

function addProduct(params) {
    var query = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?);";
    connection.query(query, [params.product, params.department, params.price, params.quantity], (err) => {
        if (err) throw err;
        console.log("\"" + params.product + "\" has been added!");
        promptReturn();
    });
}

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

        console.log("AND STAY OUT!");
        process.exit();
    });
}