import React from 'react';
import "../../Components/Table/Table.css"; // make sure this CSS file is imported

export default function UsersTable({
  sortedFilteredUsers,
  visibleColumn,
  handleEdit,
  handleDelete
}) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {visibleColumn === 'all'
              ? ['fullname', 'usertype'].map((col) => (
                  <th key={col}>
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </th>
                ))
              : (
                <th key={visibleColumn}>
                  {visibleColumn.charAt(0).toUpperCase() + visibleColumn.slice(1)}
                </th>
              )}
            <th className="actions-column"></th>
          </tr>
        </thead>

        <tbody>
          {sortedFilteredUsers.length === 0 ? (
            <tr>
              <td
                colSpan={visibleColumn === 'all' ? 3 : 2}
                className="text-center"
              >
                No users found.
              </td>
            </tr>
          ) : (
            sortedFilteredUsers.map((user) => (
              <tr key={user.idusers}>
                {visibleColumn === 'all'
                  ? ['fullname', 'usertype'].map((col) => (
                      <td key={col}>
                        {col === 'fullname'
                          ? (
                              user.firstname && user.lastname
                                ? `${user.firstname} ${user.lastname}`
                                : user.firstname
                                  ? user.firstname
                                  : user.lastname
                                    ? user.lastname
                                    : 'Unknown'
                            )
                          : user[col]
                        }
                      </td>
                    ))
                  : (
                    <td>
                      {visibleColumn === 'fullname'
                        ? (
                            user.firstname && user.lastname
                              ? `${user.firstname} ${user.lastname}`
                              : user.firstname
                                ? user.firstname
                                : user.lastname
                                  ? user.lastname
                                  : 'Unknown'
                          )
                        : user[visibleColumn]
                      }
                    </td>
                  )}
                <td className="actions-column">
                  <button className="btn-edit" onClick={() => handleEdit(user)}>
                    ✏️ Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(user.idusers)}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
