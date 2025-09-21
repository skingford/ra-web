import { RouterProvider, createHashRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import type { RouteConfig } from "../types/routes";
import Root from "../Root";
import Loading from "../components/ui/Loading";

// 懒加载页面组件
const Login = lazy(() => import("../pages/Login"));
const Home = lazy(() => import("../pages/Home"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Users = lazy(() => import("../pages/Users"));
const UserDetail = lazy(() => import("../pages/UserDetail"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Categories = lazy(() => import("../pages/Categories"));
const CategoryDetail = lazy(() => import("../pages/CategoryDetail"));
const Settings = lazy(() => import("../pages/Settings"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));

// 路由配置
const routes: RouteConfig[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Root />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Home />,
        meta: {
          title: "首页",
          description: "系统首页",
          icon: "home",
        },
      },
      {
        path: "/login",
        element: <Login />,
        meta: {
          title: "登录",
          description: "登录页面",
          icon: "login",
        },
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        meta: {
          title: "仪表板",
          description: "数据仪表板",
          icon: "dashboard",
          requiresAuth: true,
        },
      },
      {
        path: "users",
        element: <Users />,
        meta: {
          title: "用户管理",
          description: "用户列表",
          icon: "users",
          requiresAuth: true,
          roles: ["admin", "manager"],
        },
      },
      {
        path: "users/:id",
        element: <UserDetail />,
        meta: {
          title: "用户详情",
          description: "用户详细信息",
          requiresAuth: true,
          roles: ["admin", "manager"],
          breadcrumb: true,
        },
      },
      {
        path: "products",
        element: <Products />,
        meta: {
          title: "产品管理",
          description: "产品列表",
          icon: "products",
          requiresAuth: true,
          roles: ["admin", "manager", "editor"],
        },
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
        meta: {
          title: "产品详情",
          description: "产品详细信息",
          requiresAuth: true,
          roles: ["admin", "manager", "editor"],
          breadcrumb: true,
        },
      },
      {
        path: "categories",
        element: <Categories />,
        meta: {
          title: "分类管理",
          description: "产品分类",
          icon: "categories",
          requiresAuth: true,
          roles: ["admin", "manager"],
        },
      },
      {
        path: "categories/:category",
        element: <CategoryDetail />,
        meta: {
          title: "分类详情",
          description: "分类详细信息",
          requiresAuth: true,
          roles: ["admin", "manager"],
          breadcrumb: true,
        },
      },
      {
        path: "settings",
        element: <Settings />,
        meta: {
          title: "系统设置",
          description: "系统配置",
          icon: "settings",
          requiresAuth: true,
          roles: ["admin"],
        },
      },
      {
        path: "profile",
        element: <Profile />,
        meta: {
          title: "个人资料",
          description: "用户个人资料",
          icon: "profile",
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
    meta: {
      title: "页面未找到",
      hidden: true,
    },
  },
];

// 创建路由器
const router = createHashRouter(routes as any);

// 路由提供者组件
export default function AppRouter() {
  return <RouterProvider router={router} />;
}

// 导出路由配置供其他模块使用
export { routes };
