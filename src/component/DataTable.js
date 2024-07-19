import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DataTable.css";

const DataTable = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployees, setNewEmployees] = useState([{ name: "", position: "", salary: "" }]);
  const [createRows, setCreateRows] = useState([]);
  const [updateRows, setUpdateRows] = useState([]);
  const [deleteRows, setDeleteRows] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    console.log("Create Rows:", createRows);
    console.log("Update Rows:", updateRows);
    console.log("Delete Rows:", deleteRows);
  }, [createRows, updateRows, deleteRows]);

  useEffect(() => {
    if (newEmployees.length > 0 && newEmployees.some((emp) => emp.name || emp.position || emp.salary)) {
      setCreateRows(newEmployees);
    } else {
      setCreateRows([]);
    }
  }, [newEmployees]);

  const fetchEmployees = async () => {
    const response = await axios.get("/api/employees");
    setEmployees(response.data);
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedNewEmployees = [...newEmployees];
    updatedNewEmployees[index][name] = value;
    setNewEmployees(updatedNewEmployees);
  };

  const handleAddNewRow = () => {
    setNewEmployees([...newEmployees, { name: "", position: "", salary: "" }]);
  };

  const handleCellChange = (id, name, value) => {
    const updatedEmployees = employees.map((employee) => (employee.id === id ? { ...employee, [name]: value } : employee));
    setEmployees(updatedEmployees);
    if (!updateRows.some((emp) => emp.id === id)) {
      const updatedEmployee = updatedEmployees.find((emp) => emp.id === id);
      setUpdateRows([...updateRows, updatedEmployee]);
    } else {
      const updatedEmployee = updatedEmployees.find((emp) => emp.id === id);
      setUpdateRows(updateRows.map((emp) => (emp.id === id ? updatedEmployee : emp)));
    }
  };

  const handleDelete = (id, isNew = false) => {
    if (isNew) {
      setNewEmployees(newEmployees.filter((_, index) => index !== id));
    } else {
      setDeleteRows([...deleteRows, id]);
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  const handleSaveAll = async () => {
    const hasNewEmployee = newEmployees.some((emp) => emp.name || emp.position || emp.salary);
    if (!hasNewEmployee && createRows.length === 0 && updateRows.length === 0 && deleteRows.length === 0) {
      alert("No changes to save.");
      return;
    }

    try {
      const bulkRequest = {
        create: hasNewEmployee ? newEmployees : createRows,
        update: updateRows,
        delete: deleteRows,
      };
      const response = await axios.post("/api/employees/bulk", bulkRequest);
      console.log(response.data);
      fetchEmployees();
      setNewEmployees([{ name: "", position: "", salary: "" }]);
      setCreateRows([]);
      setUpdateRows([]);
      setDeleteRows([]);
      alert("Data updated successfully.");
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        alert(`Error: ${error.response.data.message || "Something went wrong"}`);
      } else {
        console.error("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h1>Employee Data Table</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <input type="text" value={employee.name} onChange={(e) => handleCellChange(employee.id, "name", e.target.value)} />
              </td>
              <td>
                <input type="text" value={employee.position} onChange={(e) => handleCellChange(employee.id, "position", e.target.value)} />
              </td>
              <td>
                <input type="text" value={employee.salary} onChange={(e) => handleCellChange(employee.id, "salary", e.target.value)} />
              </td>
              <td>
                <button onClick={() => handleDelete(employee.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {newEmployees.map((newEmployee, index) => (
            <tr key={`new-${index}`}>
              <td>
                <input type="text" name="name" value={newEmployee.name} onChange={(e) => handleInputChange(index, e)} />
              </td>
              <td>
                <input type="text" name="position" value={newEmployee.position} onChange={(e) => handleInputChange(index, e)} />
              </td>
              <td>
                <input type="text" name="salary" value={newEmployee.salary} onChange={(e) => handleInputChange(index, e)} />
              </td>
              <td>
                <button onClick={() => handleDelete(index, true)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddNewRow}>Add Row</button>
      <button onClick={handleSaveAll}>Save All</button>
    </div>
  );
};

export default DataTable;
