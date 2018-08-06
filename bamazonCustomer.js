//dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

//connection parameters
var connection = mysql.createConnection({
    host: "localhost",
    port: 3000,
    user: "root",
    password: "root",
    database: "bamazon"
});

//if there's no error, run the showData function
connection.connect(err => {
    if (err) throw err;
    showData();
});

//function that shows productData
function showData() {
    //send query to server
    var query = "SELECT * FROM products";
    connection.query(query, (err, res) => {
        if (err) throw err;
        var tableArray = [];

        //loop thru results.  add each as object inside tableArray
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

        //now print data as a table
        console.table(tableArray);

        //run function to prompt user on buying options
        promptUser();
    });
}

//function that will get the number of products available. used for validation.
var getProductCount = () => {
    return new Promise(resolve => {
        var query = "SELECT COUNT(*) AS count FROM products";
        connection.query(query, (err, res) => {
            if (err) throw err;
            resolve(res[0].count);
        });
    });
}

//get product_name based on item_id
var getProductByID = id => {
    return new Promise(resolve => {
        var query = "SELECT product_name FROM products WHERE item_id = ?";
        connection.query(query, [id], (err, res) => {
            if (err) throw err;
            resolve(res[0].product_name);
        });
    });
}

//get quantity of product with item_id. return price and stock_quantity
var getQuantityByID = id => {
    return new Promise(resolve => {
        var query = "SELECT price, stock_quantity FROM products WHERE item_id = ?";
        connection.query(query, [id], (err, res) => {
            if (err) throw err;
            resolve(res[0]);
        });
    });
}

//change quantity of product with matching item_id.
//params include price to feed that number back to the end user
function changeQuantity(quantity, id, price) {
    var query = "UPDATE products SET stock_quantity = stock_quantity - ?, product_sales = product_sales + price * ? WHERE item_id = ?";
    connection.query(query, [quantity, quantity, id], (err) => {
        if (err) throw err;
        console.log("Congratulations on your purchase!  Your card has been charged $" + price + " and we'll probably ship it out later!");
        promptReturn();
    });
}

//prompt user to buy an item. includes validation.
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
        //once the user answers, get the product by id. when that returns, prompt the user for quantity
        getProductByID(answer.id).then(product => {
            quantityPrompt(product, answer.id);
        });
    });
}

//prompt user for quantity. includes validation.
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
        //once the user answers, get how many are actually in stock.
        getQuantityByID(id).then(response => {
            //if the user orders more than are in stock, smack them
            if (quantity.quantity > response.stock_quantity) {
                console.log("We only have", response.stock_quantity, "left! You fool! Buy faster next time! \nYOU HAVE BEEN SMACKED");
                return quantityPrompt(product, id);
            }

            //else, get total to feed back to user and change the quantity
            var price = quantity.quantity * response.price;
            changeQuantity(quantity.quantity, id, price.toFixed(2));
        });
    });
}

//ask user if they'd like to order something else
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

        //if they don't, kick them out
        console.log("AND STAY OUT!");
        process.exit();
    });
}

//function to prompt user. waits for number of products for validation
function promptUser() {
    getProductCount().then(productCount => {
        itemSelect(productCount);
    });
}
