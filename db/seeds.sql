INSERT INTO department (name) VALUES ('Engineering'), ('Sales'), ('Finance');

INSERT INTO role (title, salary, department_id) VALUES 
('Software', 80000, 1),
('Sales Associate', 60000, 2),
('Accountant', 70000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Johnson', 2, NULL),
('Juan', 'Juanson', 3, NULL),
('Eli', 'Ruiz', 1, NULL);