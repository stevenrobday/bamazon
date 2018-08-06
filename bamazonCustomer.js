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
    showData();
});

function showData() {
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

        promptUser();
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
        var query = "SELECT price, stock_quantity FROM products WHERE item_id = ?";
        connection.query(query, [id], (err, res) => {
            if (err) throw err;
            resolve(res[0]);
        });
    });
}

function changeQuantity(quantity, id, price) {
    var query = "UPDATE products SET stock_quantity = stock_quantity - ?, product_sales = product_sales + price * ? WHERE item_id = ?";
    connection.query(query, [quantity, quantity, id], (err) => {
        if (err) throw err;
        console.log("Congratulations on your purchase!  Your card has been charged $" + price + " and we'll probably ship it out later!");
        promptReturn();
    });
}

function itemSelect(productCount) {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "Enter id of product you will buy: ",
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
    console.log("You will buy the \"" + product + "\"!");
    inquirer.prompt([
        {
            name: "quantity",
            type: "input",
            message: "Now tell me how many you will buy: ",
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
                    console.log("\nYou don't want any? You fool! \nYOU HAVE BEEN SMACKED");
                    return false;
                }

                return true;
            }
        }
    ]).then(quantity => {
        getQuantityByID(id).then(response => {
            if (quantity.quantity > response.stock_quantity) {
                console.log("We only have", response.stock_quantity, "left! You fool! Buy faster next time! \nYOU HAVE BEEN SMACKED");
                return quantityPrompt(product, id);
            }

            var price = quantity.quantity * response.price;
            changeQuantity(quantity.quantity, id, price.toFixed(2));
        });
    });
}

function promptReturn() {
    inquirer.prompt([
        {
            name: "confirmation",
            type: "confirm",
            message: "Return to item list?"
        }
    ]).then(response => {
        if (response.confirmation) {
            return showData();
        }

        console.log("AND STAY OUT!");
        process.exit();
    });
}

function promptUser() {
    getProductCount().then(productCount => {
        itemSelect(productCount);
    });
}
