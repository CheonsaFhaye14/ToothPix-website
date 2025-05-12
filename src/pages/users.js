import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index';

const Users = () => {
  // Sample users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample function to fetch users (you would replace this with actual API calls)
  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = [
        { id: 1, name: 'John Doe', role: 'Dentist', contact: '123-456-7890', status: 'active' },
        { id: 2, name: 'Jane Smith', role: 'Patient', contact: '987-654-3210', status: 'active' },
        { id: 3, name: 'Alice Johnson', role: 'Dentist', contact: '555-123-4567', status: 'inactive' },
      ];
      setUsers(usersData);
      setFilteredUsers(usersData);
    };
    fetchUsers();
  }, []);

  // Filter users by search term
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(term.toLowerCase()) ||
      user.role.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Function to handle adding a new user (replace with form/modal)
  const handleAddUser = () => {
    console.log('Add New User');
    // Implement your add user logic here
  };

  // Function to handle user deactivation or deletion
  const handleDeactivateDelete = (userId) => {
    console.log(`Deactivate/Delete user with ID: ${userId}`);
    // Implement your deactivate/delete logic here
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">User Management</h2>

      {/* Search Bar */}
      <div className="d-flex mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="btn btn-primary ml-2" onClick={handleAddUser}>
          <FontAwesomeIcon icon={faUserPlus} /> Add User
        </button>
      </div>

      {/* User Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>{user.contact}</td>
              <td>
                <span className={user.status === 'active' ? 'text-success' : 'text-danger'}>
                  {user.status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => console.log(`Edit user with ID: ${user.id}`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className="btn btn-danger btn-sm ml-2"
                  onClick={() => handleDeactivateDelete(user.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
