const inquirer = require('inquirer');
const db = require('./db');

async function viewAllDepartments() {
  const res = await db.query('SELECT * FROM department');
  console.table(res.rows);
}

async function viewAllRoles() {
  const res = await db.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    JOIN department ON role.department_id = department.id
  `);
  console.table(res.rows);
}

async function viewAllEmployees() {
  const res = await db.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, manager.first_name AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `);
  console.table(res.rows);
}

async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the name of the department:',
  });

  await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Added ${name} to the database`);
}

async function addRole() {
  const departments = await db.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map(({ id, name }) => ({
    name: name,
    value: id,
  }));

  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the name of the role:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary of the role:',
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department for the role:',
      choices: departmentChoices,
    },
  ]);

  await db.query(
    'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
    [title, salary, department_id]
  );
  console.log(`Added ${title} role to the database`);
}

async function addEmployee() {
  const roles = await db.query('SELECT * FROM role');
  const roleChoices = roles.rows.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const employees = await db.query('SELECT * FROM employee');
  const managerChoices = employees.rows.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));
  managerChoices.unshift({ name: 'None', value: null });

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter the employee\'s first name:',
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter the employee\'s last name:',
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the role for the employee:',
      choices: roleChoices,
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select the manager for the employee:',
      choices: managerChoices,
    },
  ]);

  await db.query(
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [first_name, last_name, role_id, manager_id]
  );
  console.log(`Added ${first_name} ${last_name} to the database`);
}

async function updateEmployeeRole() {
  const employees = await db.query('SELECT * FROM employee');
  const employeeChoices = employees.rows.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const roles = await db.query('SELECT * FROM role');
  const roleChoices = roles.rows.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select the employee to update:',
      choices: employeeChoices,
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the new role:',
      choices: roleChoices,
    },
  ]);

  await db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [
    role_id,
    employee_id,
  ]);
  console.log(`Updated employee's role`);
}

async function mainMenu() {
  const { choice } = await inquirer.prompt({
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
      { name: 'View all departments', value: 'VIEW_DEPARTMENTS' },
      { name: 'View all roles', value: 'VIEW_ROLES' },
      { name: 'View all employees', value: 'VIEW_EMPLOYEES' },
      { name: 'Add a department', value: 'ADD_DEPARTMENT' },
      { name: 'Add a role', value: 'ADD_ROLE' },
      { name: 'Add an employee', value: 'ADD_EMPLOYEE' },
      { name: 'Update an employee role', value: 'UPDATE_EMPLOYEE_ROLE' },
      { name: 'Quit', value: 'QUIT' },
    ],
  });

  switch (choice) {
    case 'VIEW_DEPARTMENTS':
      await viewAllDepartments();
      break;
    case 'VIEW_ROLES':
      await viewAllRoles();
      break;
    case 'VIEW_EMPLOYEES':
      await viewAllEmployees();
      break;
    case 'ADD_DEPARTMENT':
      await addDepartment();
      break;
    case 'ADD_ROLE':
      await addRole();
      break;
    case 'ADD_EMPLOYEE':
      await addEmployee();
      break;
    case 'UPDATE_EMPLOYEE_ROLE':
      await updateEmployeeRole();
      break;
    default:
      process.exit();
  }

  await mainMenu();
}

mainMenu();