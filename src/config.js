let DEV_MODE = true; // 是否开发模式


export let USE_LOCAL_DATA = false; // 是否使用本地数据
const hostname = window.location.hostname;
export let backendhost = `http://${hostname}:8000`
export let backendLoginUrl = `${backendhost}/auth/jwt/login`;
export let backendQuezUrl = `${backendhost}/quez`;
export let frontendhost = `http://${hostname}`