USE bamazon;

CREATE TABLE departments(
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(40) NOT NULL,
  over_head_costs INT,
  PRIMARY KEY (department_id)
);