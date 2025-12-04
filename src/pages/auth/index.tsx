import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Spin,
} from "antd";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import authStore from "./store";
import type { ApiV1AuthLoginPostRequest } from "../../shared/api";
import "./auth.css";

const { Title, Text } = Typography;

function AuthPage() {
  const [form] = Form.useForm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    void authStore.fetchMe();
  }, []);

  const handleFinish = async (values: ApiV1AuthLoginPostRequest) => {
    setSubmitError(null);
    try {
      await authStore.login(values);
      await authStore.fetchMe();
      message.success("Успешный вход");
    } catch {
      setSubmitError(authStore.error ?? "Неверное имя или пароль");
    }
  };

  const handleLogout = async () => {
    await authStore.logout();
    form.resetFields();
    message.info("Вы вышли из аккаунта");
  };

  const renderContent = () => {
    if (authStore.meLoading) {
      return <div className="auth-spinner"><Spin /></div>;
    }

    if (authStore.isAuthenticated && authStore.user) {
      return (
        <Space orientation="vertical" className="auth-welcome">
          <Typography.Title level={4} className="auth-welcome__title">
            Привет, {authStore.user.username}!
          </Typography.Title>
          <Text type="secondary">Роль: {authStore.user.role}</Text>
          <Space>
            <Button type="primary">
              <Link to="/rounds">Перейти к раундам</Link>
            </Button>
            <Button onClick={handleLogout} loading={authStore.logoutLoading}>
              Выйти
            </Button>
          </Space>
        </Space>
      );
    }

    return (
      <Form
        form={form}
        layout="vertical"
        size="large"
        className="auth-form"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Имя пользователя:"
          name="username"
          rules={[{ required: true, message: "Введите имя пользователя" }]}
        >
          <Input disabled={authStore.loginLoading || authStore.meLoading} />
        </Form.Item>
        <Form.Item
          label="Пароль:"
          name="password"
          rules={[{ required: true, message: "Введите пароль" }]}
        >
          <Input.Password
            disabled={authStore.loginLoading || authStore.meLoading}
          />
        </Form.Item>
        <Text type="secondary">
          Если пользователя нет, мы создадим его после входа.
        </Text>
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={authStore.loginLoading}
        >
          Войти
        </Button>
        {submitError && (
          <Text type="danger" className="auth-error">
            {submitError}
          </Text>
        )}
      </Form>
    );
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Title level={3} className="auth-card__title">
          Войти
        </Title>
        <div className="auth-card__divider" />
        {renderContent()}
      </Card>
    </div>
  );
}

const AuthPageWithObserver = observer(AuthPage);

export default AuthPageWithObserver;
