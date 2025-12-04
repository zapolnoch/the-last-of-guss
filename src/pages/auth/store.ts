import { makeAutoObservable, runInAction } from "mobx";
import { AuthApi, Configuration, ResponseError } from "../../shared/api";
import type {
  ApiV1AuthLoginPostRequest,
  ApiV1AuthMeGet200Response,
} from "../../shared/api";

class AuthStore {
  user: ApiV1AuthMeGet200Response | null = null;
  token: string | null = null;
  loginLoading = false;
  meLoading = false;
  logoutLoading = false;
  error: string | null = null;
  private api = new AuthApi(
    new Configuration({
      accessToken: () => this.token || "",
    })
  );

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    if (typeof window !== "undefined") {
      const savedToken = window.localStorage.getItem("auth_token");
      if (savedToken) {
        this.token = savedToken;
      }
    }
  }

  get isAuthenticated() {
    return Boolean(this.user && this.token);
  }

  private persistToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) {
      window.localStorage.setItem("auth_token", token);
    } else {
      window.localStorage.removeItem("auth_token");
    }
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

  async login(payload: ApiV1AuthLoginPostRequest) {
    this.loginLoading = true;
    this.error = null;
    try {
      const result = await this.api.apiV1AuthLoginPost({
        apiV1AuthLoginPostRequest: payload,
      });

      runInAction(() => {
        this.token = result.token;
        this.user = { username: result.username, role: result.role };
        this.persistToken(result.token);
      });

      return result;
    } catch (error) {
      const message = await this.getErrorMessage(error);
      runInAction(() => {
        this.error = message;
        this.user = null;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loginLoading = false;
      });
    }
  }

  async fetchMe() {
    if (!this.token) {
      this.user = null;
      return null;
    }

    this.meLoading = true;
    this.error = null;

    try {
      const result = await this.api.apiV1AuthMeGet();

      runInAction(() => {
        this.user = result;
      });

      return result;
    } catch (error) {
      const message = await this.getErrorMessage(error);
      runInAction(() => {
        this.error = message;
        this.user = null;
        this.token = null;
        this.persistToken(null);
      });
      return null;
    } finally {
      runInAction(() => {
        this.meLoading = false;
      });
    }
  }

  async logout() {
    if (!this.token) {
      this.user = null;
      return;
    }

    this.logoutLoading = true;
    try {
      await this.api.apiV1AuthLogoutPost();
    } catch (error) {
      const message = await this.getErrorMessage(error);
      runInAction(() => {
        this.error = message;
      });
    } finally {
      runInAction(() => {
        this.token = null;
        this.user = null;
        this.persistToken(null);
        this.logoutLoading = false;
      });
    }
  }

  get isAdmin() {
    return authStore.user?.role === "ADMIN";
  }

  get playerName() {
    return authStore.user?.username ?? "";
  }
}

const authStore = new AuthStore();

export default authStore;
