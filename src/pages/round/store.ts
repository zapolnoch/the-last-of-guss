import { makeAutoObservable, runInAction } from "mobx";
import type {
  ApiV1RoundsIdGet200Response,
  ApiV1RoundsIdTapPost200Response,
} from "../../shared/api";
import { Configuration, ResponseError, RoundsApi } from "../../shared/api";
import authStore from "../auth/store";

class RoundViewStore {
  data: ApiV1RoundsIdGet200Response | null = null;
  loading = false;
  tapLoading = false;
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

  async fetchRound(id: string) {
    this.loading = true;
    this.error = null;
    if (!this.data || this.data.round.id !== id) {
      this.data = null;
    }
    try {
      const result = await this.api.apiV1RoundsIdGet({ id });
      runInAction(() => {
        this.data = result;
      });
      return result;
    } catch (error) {
      const message = await this.getErrorMessage(error);
      runInAction(() => {
        this.error = message;
        this.data = null;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async tap(id: string) {
    this.tapLoading = true;
    this.error = null;
    try {
      const response: ApiV1RoundsIdTapPost200Response =
        await this.api.apiV1RoundsIdTapPost({ id });

      runInAction(() => {
        if (this.data) {
          this.data = {
            ...this.data,
            myStats: {
              taps: response.taps,
              score: response.score,
            },
          };
        }
      });

      return response;
    } catch (error) {
      const message = await this.getErrorMessage(error);
      runInAction(() => {
        this.error = message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.tapLoading = false;
      });
    }
  }
}

const roundViewStore = new RoundViewStore();

export default roundViewStore;
