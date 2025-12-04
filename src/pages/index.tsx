import { Layout, Menu, Typography } from "antd";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AuthPage from "./auth/index.tsx";
import RoundsPage from "./rounds/index.tsx";
import RoundPage from "./round/index.tsx";
import "./index.css";

const { Header, Content, Footer } = Layout;

const menuItems = [
  { key: "/auth", label: <NavLink to="/auth">Главная</NavLink> },
  { key: "/rounds", label: <NavLink to="/rounds">Раунды</NavLink> },
];

function App() {
  const location = useLocation();
  const rootSegment = location.pathname.split("/")[1] || "auth";
  const currentKey = `/${rootSegment}`;

  return (
    <Layout className="app">
      <Header className="app__header">
        <Typography.Title level={4} className="app__logo">
          The Last of Guss
        </Typography.Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[currentKey]}
          items={menuItems}
          className="app__menu"
        />
      </Header>

      <Content className="app__content">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/rounds" element={<RoundsPage />} />
          <Route path="/rounds/:id" element={<RoundPage />} />
        </Routes>
      </Content>

      <Footer className="app__footer">
        <Typography.Text type="secondary">
          React + TypeScript + Vite + MobX + Ant Design
        </Typography.Text>
      </Footer>
    </Layout>
  );
}

export default App;
