import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DataTable.css";

const DataTable = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: "", position: "", salary: "" });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
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

  const fetchEmployees = async () => {
    const response = await axios.get("/api/employees");
    setEmployees(response.data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee({ ...editingEmployee, [name]: value });
  };

  const handleCreate = () => {
    const newEmp = { ...newEmployee, id: Date.now() };
    setEmployees([...employees, newEmp]);
    setCreateRows([...createRows, newEmp]);
    setNewEmployee({ name: "", position: "", salary: "" });
  };

  const handleUpdate = (employee) => {
    setEditingEmployee(employee);
  };

  const handleSaveUpdate = () => {
    setEmployees(employees.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp)));
    setUpdateRows([...updateRows, editingEmployee]);
    setEditingEmployee(null);
  };

  const handleDelete = (id) => {
    setDeletedEmployees([...deletedEmployees, id]);
    setDeleteRows([...deleteRows, id]);
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const handleSaveAll = async () => {
    if (createRows.length === 0 && updateRows.length === 0 && deleteRows.length === 0) {
      alert("Perubahan belum tersimpan.");
      return;
    }

    try {
      const bulkRequest = {
        create: createRows,
        update: updateRows,
        delete: deleteRows,
      };
      const response = await axios.post("/api/employees/bulk", bulkRequest);
      console.log(response.data);
      fetchEmployees();
      setCreateRows([]);
      setUpdateRows([]);
      setDeleteRows([]);
      alert("Data berhasil diupdate.");
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
              <td>{editingEmployee && editingEmployee.id === employee.id ? <input type="text" name="name" value={editingEmployee.name} onChange={handleEditInputChange} /> : employee.name}</td>
              <td>{editingEmployee && editingEmployee.id === employee.id ? <input type="text" name="position" value={editingEmployee.position} onChange={handleEditInputChange} /> : employee.position}</td>
              <td>{editingEmployee && editingEmployee.id === employee.id ? <input type="text" name="salary" value={editingEmployee.salary} onChange={handleEditInputChange} /> : employee.salary}</td>
              <td>
                {editingEmployee && editingEmployee.id === employee.id ? <button onClick={handleSaveUpdate}>Save</button> : <button onClick={() => handleUpdate(employee)}>Edit</button>}
                <button onClick={() => handleDelete(employee.id)}>Delete</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input type="text" name="name" value={newEmployee.name} onChange={handleInputChange} />
            </td>
            <td>
              <input type="text" name="position" value={newEmployee.position} onChange={handleInputChange} />
            </td>
            <td>
              <input type="text" name="salary" value={newEmployee.salary} onChange={handleInputChange} />
            </td>
            <td>
              <button onClick={handleCreate}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button onClick={handleSaveAll}>Save All</button>
    </div>
  );
};

export default DataTable;
