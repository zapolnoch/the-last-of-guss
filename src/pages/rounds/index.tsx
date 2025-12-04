import { useEffect, useState } from "react";
import { Alert, Button, Card, Divider, Space, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { Link, useNavigate } from "react-router-dom";
import authStore from "../auth/store";
import roundsStore from "./store";
import "./rounds.css";
import { formatDate } from "../../shared/utils/formatDate";

function RoundsPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    token,
    user,
    meLoading,
    fetchMe,
    playerName,
    isAdmin,
  } = authStore;
  const { rounds, createLoading, error, loading, createRound, fetchRounds } =
    roundsStore;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (token && !user && !meLoading) {
      void fetchMe();
    }
  }, [token, user, meLoading]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchRounds();
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = async () => {
    try {
      const round = await createRound();
      message.success("Раунд создан");
      navigate(`/rounds/${round.id}`);
    } catch {
      message.error(error ?? "Не удалось создать раунд");
    }
  };

  const getRoundStatus = (roundStart: Date, roundEnd: Date) => {
    const duration = roundEnd.getTime() - roundStart.getTime();
    const elapsed = now - roundStart.getTime();

    if (elapsed < 0) return "Запланирован";
    if (elapsed <= duration) return "Активен";
    return "Завершен";
  };

  return (
    <div className="rounds-page">
      <Card className="rounds-shell">
        <div className="rounds-header">
          <Typography.Title level={3} className="rounds-title">
            Список РАУНДОВ
          </Typography.Title>
          <Typography.Text className="rounds-player-name">
            {playerName}
          </Typography.Text>
        </div>

        {isAdmin ? (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            className="rounds-create"
            block
            size="large"
            loading={createLoading}
            onClick={handleCreate}
          >
            Создать раунд
          </Button>
        ) : (
          <Alert
            type="info"
            title="Создание раундов доступно только админам"
            showIcon
            className="rounds-admin-hint"
          />
        )}

        {isAuthenticated && error && (
          <Alert
            type="error"
            title={error}
            showIcon
            className="rounds-admin-hint"
          />
        )}

        <Space orientation="vertical" size="large" className="rounds-list">
          {authStore.meLoading && (
            <Typography.Text type="secondary">
              Проверяем авторизацию...
            </Typography.Text>
          )}

          {!authStore.meLoading && !isAuthenticated && (
            <Typography.Text type="secondary">
              Авторизуйтесь, чтобы увидеть раунды.{" "}
              <Link to="/auth">Перейти к авторизации</Link>
            </Typography.Text>
          )}

          {isAuthenticated && loading && (
            <Typography.Text type="secondary">
              Загружаем раунды...
            </Typography.Text>
          )}

          {isAuthenticated && !loading && rounds.length === 0 && (
            <Typography.Text type="secondary">
              Нет активных или запланированных раундов
            </Typography.Text>
          )}

          {isAuthenticated &&
            rounds.map((round) => (
              <Card
                key={round.id}
                className="round-card"
                bodyStyle={{ padding: 20 }}
              >
                <Space
                  orientation="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Link className="round-id" to={`/rounds/${round.id}`}>
                    <span className="round-dot" />
                    <Typography.Text strong>Round ID:</Typography.Text>
                    <span className="round-id__value">{round.id}</span>
                  </Link>

                  <div className="round-dates">
                    <Typography.Text className="round-date">
                      <span className="round-date__label">Start:</span>{" "}
                      {formatDate(round.startTime)}
                    </Typography.Text>
                    <Typography.Text className="round-date">
                      <span className="round-date__label">End:</span>{" "}
                      {formatDate(round.endTime)}
                    </Typography.Text>
                  </div>

                  <Divider className="round-divider" />

                  <Typography.Text className="round-status">
                    Статус:{" "}
                    <strong>
                      {getRoundStatus(round.startTime, round.endTime)}
                    </strong>
                  </Typography.Text>
                </Space>
              </Card>
            ))}
        </Space>
      </Card>
    </div>
  );
}

const RoundsPageWithObserver = observer(RoundsPage);

export default RoundsPageWithObserver;
