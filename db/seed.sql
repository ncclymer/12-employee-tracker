USE emp_db;

INSERT INTO department (name)
VALUES ('AFE1'), ('AFE2'), ('HR'), ('Outbound');

INSERT INTO role (title, salary, department_id)
VALUES ('AFE1', 30000, 1), ('AFE2', 30000, 2), ('hr', 37000, 3), ('Outbound', 35000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('Mack', 'Lawrence', 1, null), ('Jose', 'Fernandez', 2, null), ('Sam', 'Beatty', 3, 2), ('IIuri', 'Petrov', 4, null);