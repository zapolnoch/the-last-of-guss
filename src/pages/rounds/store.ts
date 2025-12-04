import { makeAutoObservable, runInAction } from "mobx";
import type { ApiV1RoundsGet200ResponseDataInner } from "../../shared/api";
import { Configuration, ResponseError, RoundsApi } from "../../shared/api";
import authStore from "../auth/store";

class RoundsStore {
  rounds: ApiV1RoundsGet200ResponseDataInner[] = [];
  loading = false;
  createLoading = false;
  error: string | null = null;
  private api = new RoundsApi(
    new Configuration({
      accessToken: () => authStore.token || "",
    })
  );

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private async getErrorMessage(error: unknown) {
    if (error instanceof ResponseError) {
      try {
        const payload = await error.response.clone().json();
        if (typeof payload?.message === "string") return payload.message;
        if (typeof payload?.detail === "string") return payload.detail;
      } catch {
        alert("Server error"); // JSON parse errors
      }
      return `Ошибка ${error.response.status}`;
    }

    if (error instanceof Error) return error.message;
    return "Неизвестная ошибка";
  }

  async fetchRounds() {
    this.loading = true;
    this.error = null;

    try {
      const response = await this.api.apiV1RoundsGet();
      runInAction(() => {
        this.rounds = response.data;
      });
      return response.data;
    } catch (error) {
      const message = await this.getErrorMessage(error);
      runInAction(() => {
        this.error = message;
        this.rounds = [];
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createRound() {
    this.createLoading = true;
    this.error = null;

    try {
      const newRound = await this.api.apiV1RoundsPost();
      runInAction(() => {
        this.rounds = [newRound, ...this.rounds];
      });
      return newRound;
    } catch (error) {
      const message = await this.getErrorMessage(error);
      runInAction(() => {
        this.error = message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.createLoading = false;
      });
    }
  }
}

const roundsStore = new RoundsStore();

export default roundsStore;
