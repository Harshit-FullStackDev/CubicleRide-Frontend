import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function ViewEmployees() {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        api.get("/admin/employees").then(res => setEmployees(res.data));
    }, []);

    return (
        <div>
            <h2>Employees</h2>
            {employees.map(emp => (
                <div key={emp.empId}>
                    {emp.name} - {emp.email} - {emp.route}
                </div>
            ))}
        </div>
    );
}

export default ViewEmployees;
