USE bamazon;

CREATE TABLE departments(
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(45) NOT NULL,
  over_head_costs DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (department_id)
);