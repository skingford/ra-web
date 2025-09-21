import { Outlet, Link } from 'react-router-dom';
export default function Root() {
 
  return (
    <>
       <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/users">Users</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/categories">Categories</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/not-found">Not Found</Link></li>
        </ul>
      </nav>
      <main>
        {/* Outlet 是子路由的渲染出口 */}
        <Outlet />
      </main>
    </>
  );
}
