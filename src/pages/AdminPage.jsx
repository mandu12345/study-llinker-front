// src/pages/AdminPage.jsx
import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import OpsChart from "./admin/OpsChart";   // 관리자 대시보드
import UserList from "./admin/UserList";   // 사용자 관리
import GroupList from "./admin/GroupList"; // 그룹 관리

const AdminPage = () => {
  const adminName = "관리자";

  return (
    <div className="admin-wrapper">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="/admin">
          Admin Panel
        </a>
        <span className="text-light">{adminName}님</span>
      </nav>

      {/* Sidebar + Main */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-2 bg-light vh-100 p-3 border-end">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <Link to="/admin/dashboard" className="nav-link">대시보드</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/users" className="nav-link">사용자 관리</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/groups" className="nav-link">스터디 그룹 관리</Link>
              </li>
            </ul>
          </div>

          {/* Main content */}
          <div className="col-10 p-4">
            <Routes>
              <Route path="dashboard" element={<OpsChart />} />
              <Route path="users" element={<UserList />} />
              <Route path="groups" element={<GroupList />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
