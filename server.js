const mysql = require("mysql");
const inquirer = require("inquirer");
const conTable = require("console.table");

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Icanttellyou!",
    database: "emp_db"
});

function executeApp() {
    inquirer.prompt({
        name: "menu",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View Employees",
            "Edit Employees",
            "View Roles",
            "Edit Roles",
            "View Departments",
            "Edit Departments"
        ]
    }).then(responses => {
        switch (responses.menu) {
            case "View Employees":
                empSum();
                break;
            case "Edit Employees":
                editEmp();
                break;
            case "View Roles":
                roleSum();
                break;
            case "Edit Roles":
                editRole();
                break;
            case "View Departments":
                showDept();
                break;
            case "Edit Departments":
                addDept();
                break;
        }
    });
}

function editEmp() {
    inquirer.prompt({
        name: "editChoice",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Add an Employee",
            "Employee Role",
            // "Employee Manager",
            // "Remove Employee",
            "Main Menu"
        ]
    }).then(response => {
        switch (response.editChoice) {
            case "Add an Employee":
                addEmp();
                break;
            case "Employee Role":
                chngRole();
                break;
            case "Employee Manager":
                chngMngr();
                break;
            // case "Remove Employee":
            //     remvEmp();
            //     break;
            case "Main Menu":
                executeApp();
                break;
        }
    })
};

async function empSum() {
    console.log(' ');
    await db.query('SELECT e.id, e.first_name AS First_Name, e.last_name AS Last_Name, title AS Title, salary AS Salary, name AS Department, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id', (err, res) => {
        if (err) throw err;
        console.table(res);
        executeApp();
    });
};

async function addEmp() {
    let positions = await db.query('SELECT id, title FROM role');
    let managers = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS Manager FROM employee');
    managers.unshift({ id: null, Manager: "None" });

    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "Enter the employee's first name:",
        },
        {
            name: "last_name",
            type: "input",
            message: "Enter the employee's last name:",
        },
        {
            name: "role_id",
            type: "list",
            message: "Select a department for the employee:",
            choices: positions.map(obj => obj.title)
        },
        {
            name: "manager",
            type: "list",
            message: "Choose a manager:",
            choices: managers.map(obj => obj.Manager)
        }
    ]).then(answers => {
        let role = positions.find(obj => obj.title === answers.role_id);
        let manager = managers.find(obj => obj.Manager === answers.manager);
        db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)", [[answers.first_name.trim(), answers.last_name.trim(), role.id, manager.id]]);
        console.log("\x1b[32m", `${answers.first_name} was added.`);
        executeApp();
    });
};

function editEmp() {
    inquirer.prompt({
        name: "editChoice",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Add A New Employee",
            "Change Employee Role",
            // "Change Employee Manager",
            "Remove An Employee",
            "Return To Main Menu"
        ]
    }).then(response => {
        switch (response.editChoice) {
            case "Add A New Employee":
                addEmp();
                break;
            case "Change Employee Role":
                chngRole();
                break;
            // case "Change Employee Manager":
            //     chngMngr();
            //     break;
            case "Remove An Employee":
                remvEmp();
                break;
            case "Return To Main Menu":
                executeApp();
                break;
        }
    })
};

async function remvEmp() {
    let employees = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });

    inquirer.prompt([
        {
            name: "employeeName",
            type: "list",
            message: "Delete which employee?",
            choices: employees.map(obj => obj.name)
        }
    ]).then(response => {
        if (response.employeeName != "Cancel") {
            let termedEmp = employees.find(obj => obj.name === response.employeeName);
            db.query("DELETE FROM employee WHERE id=?", termedEmp.id);
            console.log("\x1b[32m", `${response.employeeName} was removed.`);
        }
        executeApp();
    })
};

function editRole() {
    inquirer.prompt({
        name: "editRoles",
        type: "list",
        message: "Please choose an option:",
        choices: [
            "Add New Role",
            "Update Role",
            "Remove Role",
            "Return To Main Menu"
        ]
    }).then(responses => {
        switch (responses.editRoles) {
            case "Add New Role":
                addRole();
                break;
            case "Update Role":
                chngRole();
                break;
            case "Remove Role":
                remvRole();
                break;
            case "Return To Main Menu":
                executeApp();
                break;
        }
    })
};

async function roleSum() {
    console.log(' ');
    await db.query('SELECT r.id, title, salary, name AS department FROM role r LEFT JOIN department d ON department_id = d.id', (err, res) => {
        if (err) throw err;
        console.table(res);
        executeApp();
    })
};

async function addRole() {
    let departments = await db.query('SELECT id, name FROM department');

    inquirer.prompt([
        {
            name: "role",
            type: "input",
            message: "Enter role:",
        },
        {
            name: "salAmt",
            type: "input",
            message: "Enter salary:",
            validate: input => {
                if (!isNaN(input)) {
                    return true;
                }
                return "Please enter a valid number."
            }
        },
        {
            name: "newRoleDept",
            type: "list",
            message: "Select role department:",
            choices: departments.map(obj => obj.name)
        }
    ]).then(answers => {
        let depID = departments.find(obj => obj.name === answers.newRoleDept).id
        db.query("INSERT INTO role (title, salary, department_id) VALUES (?)", [[answers.role, answers.salAmt, depID]]);
        console.log("\x1b[32m", `${answers.role} was added. Department: ${answers.newRoleDept}`);
        executeApp();
    })
};

async function chngRole() {
    let employees = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });
    let roles = await db.query('SELECT id, title FROM role');

    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "Which employee?",
            choices: employees.map(obj => obj.name)
        },
        {
            name: "newRole",
            type: "list",
            message: "Change their role to:",
            choices: roles.map(obj => obj.title)
        }
    ]).then(answers => {
        if (answers.empName != "Cancel") {
            let empID = employees.find(obj => obj.name === answers.empName).id
            let roleID = roles.find(obj => obj.title === answers.newRole).id
            db.query("UPDATE employee SET role_id=? WHERE id=?", [roleID, empID]);
            console.log("\x1b[32m", `${answers.empName} new role is ${answers.newRole}`);
        }
        executeApp();
    })
};

async function remvRole() {
    let roles = await db.query('SELECT id, title FROM role');
    roles.push({ id: null, title: "Cancel" });

    inquirer.prompt([
        {
            name: "roleName",
            type: "list",
            message: "Which role should be removed?",
            choices: roles.map(obj => obj.title)
        }
    ]).then(response => {
        if (response.roleName != "Cancel") {
            let roleDel = roles.find(obj => obj.title === response.roleName);
            db.query("DELETE FROM role WHERE id=?", roleDel.id);
            console.log("\x1b[32m", `${response.roleName} was removed.`);
        }
        executeApp();
    })
};




async function showDept() {
    console.log(' ');
    await db.query('SELECT id, name AS department FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        executeApp();
    })
};

async function addDept() {
    inquirer.prompt([
        {
            name: "dept",
            type: "input",
            message: "Enter the new department:",
        }
    ]).then(answers => {
        db.query("INSERT INTO department (name) VALUES (?)", [answers.dept]);
        console.log("\x1b[32m", `${answers.dept} was added to department listing.`);
        executeApp();
    })
};

console.log ('Welcome to the employee tracker!')

executeApp ();