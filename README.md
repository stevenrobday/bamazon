# bamazon

Mock database application. Three different user levels.

## Customer

Use the following command to run bamazon customer edition:

    node bamazonCustomer

When this is run, the user will see the list of products available. 

![products](/images/products.PNG)

The user will then be instructed to buy something by entering its id.

![command](/images/command.PNG)

The user must choose wisely, or they will be smacked.

![user experience](/images/userExperience.PNG)

The customer also must choose wisely when purchasing, or they will be smacked.

![customer buy](/images/customerBuy.PNG)

The customer can then purchase something else, otherwise they will be thrown out of the store.

![kicked out](/images/kickedOut.PNG)

Here is the customer edition in action:

![customer flow](/images/flowCustomer.gif)

## Manager

Manager edition is opened with the following command:

    node bamazonManager

Upon log in, the manager will be prompted for an action.

![manager options](/images/managerOptions.PNG)

### View Products for Sale

Here, the manager can see all products for sale.

![manager view products](/images/managerViewProducts.PNG)

### View Low Inventory

Here, the manager can see what products have a quantity less than five.

![manager view low inventory](/images/managerViewLow.PNG)

### Add to Inventory

Here, the manager can increase the inventory for a product. They must choose their number wisely, or they will be smacked.

![manager add inventory](/images/managerAddInventory.PNG)

### Add New Product

The manager can also add a new product.

![manager add product](/images/managerAddProduct.PNG)

The manager will always be asked to return to the options afterwards.

![manager return](/images/managerReturn.PNG)

If the manager doesn't return to work, they will be ejected from the store.

![manager exit](/images/managerExit.PNG)

Here is manager edition in action:

![manager flow](/images/flowManager.gif)

## Supervisor

To open supervisor edition, enter the following command:

    node amazonSupervisor

The supervisor is then prompted to select an option.

![supervisor options](/images/supervisorOptions.PNG)

### View Sales by Department

Here sales grouped by department can be viewed.

![supervisor view sales](/images/supervisorViewSales.PNG)

### Create New Department

The supervisor can also create a new department.

![supervisor create department](/images/supervisorCreateDepartment.PNG)

The supervisor enjoys a much more cordial experience.

![supervisor experience](/images/supervisorExperience.PNG)

![supervisor exit](/images/supervisorExit.PNG)

Here is the supervisor edition in action:

![supervisor flow](/images/flowSupervisor.gif)














