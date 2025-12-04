import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import { formatTime } from "../../shared/utils/formatTime";
import authStore from "../auth/store";
import roundViewStore from "./store";
import "./round.css";

type RoundState = "pending" | "active" | "finished";

function RoundPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());
  const { data, loading, tapLoading, error, fetchRound, tap } = roundViewStore;

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!id) return;
    void fetchRound(id);
  }, [fetchRound, id]);

  const round = data?.round;
  const myStats = data?.myStats;
  const topStats = data?.topStats ?? [];

  const roundState: RoundState = useMemo(() => {
    if (!round) return "pending";
    const current = now;
    if (round.startTime.getTime() > current) return "pending";
    if (round.endTime.getTime() > current) return "active";
    return "finished";
  }, [now, round]);

  const remainingLabel = useMemo(() => {
    if (!round) return null;
    if (roundState === "pending") {
      const diff = round.startTime.getTime() - now;
      return `До начала раунда: ${formatTime(diff)}`;
    }
    if (roundState === "active") {
      const diff = round.endTime.getTime() - now;
      return `До конца осталось: ${formatTime(diff)}`;
    }
    return null;
  }, [now, round, roundState]);

  const statusTitle = useMemo(() => {
    switch (roundState) {
      case "pending":
        return "Cooldown";
      case "active":
        return "Раунд активен";
      case "finished":
        return "Раунд завершен";
      default:
        return "";
    }
  }, [roundState]);

  const handleTap = async () => {
    if (!id || roundState !== "active") return;
    try {
      await tap(id);
      message.success("Тап засчитан");
    } catch {
      message.error(error ?? "Не удалось отправить тап");
    }
  };

  const winner = useMemo(() => {
    if (!topStats.length) return null;
    const sorted = [...topStats].sort((a, b) => b.score - a.score);
    return sorted[0];
  }, [topStats]);

  const totalScore = round?.totalScore ?? 0;

  const showGoBack = roundState === "finished" || roundState === "pending";

  return (
    <div className="round-page">
      <Card className="round-card-shell">
        <div className="round-card-header">
          <Typography.Text className="round-card-status">
            {statusTitle}
          </Typography.Text>
          <Typography.Text className="round-card-player">
            {authStore.playerName}
          </Typography.Text>
        </div>

        <Divider className="round-divider-line" />

        {loading && !round ? (
          <div className="round-loading">
            <Spin />
          </div>
        ) : null}

        {error && (
          <Alert type="error" title={error} showIcon className="round-alert" />
        )}

        {!loading && !round && !error && (
          <Typography.Text type="secondary">
            Раунд не найден или не удалось загрузить данные.
          </Typography.Text>
        )}

        {round && (
          <Space direction="vertical" align="center" size={24} style={{ width: "100%" }}>
            <Button
              className={`round-goose ${
                roundState === "active" ? "round-goose--active" : ""
              }`}
              type="text"
              disabled={roundState !== "active"}
              loading={tapLoading}
              onClick={handleTap}
            >
              <img
                src="/duck.png"
                alt="Гусь"
                className="round-goose-img"
                aria-hidden
              />
              <Typography.Text className="round-goose-hint">
                {roundState === "active" ? "Тапни по гусю!" : "Раунд неактивен"}
              </Typography.Text>
            </Button>

            <div className="round-meta">
              <Typography.Paragraph
                className="round-meta-title"
              >
                {statusTitle}
              </Typography.Paragraph>

              {remainingLabel && (
                <Typography.Text className="round-meta-subtext">
                  {remainingLabel}
                </Typography.Text>
              )}

              {roundState === "active" && (
                <Typography.Text className="round-meta-subtext">
                  Мои очки — {myStats?.score ?? 0}
                </Typography.Text>
              )}

              {roundState === "finished" && (
                <div className="round-finish-stats">
                  <Divider dashed className="round-stats-divider" />
                  <div className="round-stat-row">
                    <Typography.Text>Всего</Typography.Text>
                    <Typography.Text>{totalScore}</Typography.Text>
                  </div>
                  {winner && (
                    <div className="round-stat-row">
                      <Typography.Text>
                        Победитель — {winner.user.username}
                      </Typography.Text>
                      <Typography.Text>{winner.score}</Typography.Text>
                    </div>
                  )}
                  <div className="round-stat-row">
                    <Typography.Text>Мои очки</Typography.Text>
                    <Typography.Text>{myStats?.score ?? 0}</Typography.Text>
                  </div>
                </div>
              )}
            </div>
          </Space>
        )}

        {showGoBack && (
          <Button
            className="round-back"
            type="link"
            onClick={() => navigate("/rounds")}
          >
            ← К списку раундов
          </Button>
        )}
      </Card>
    </div>
  );
}

const RoundPageWithObserver = observer(RoundPage);

export default RoundPageWithObserver;
