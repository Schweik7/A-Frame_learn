export const backendhost = import.meta.env.API_URL;
if (import.meta.env.NODE_ENV === 'development') {
    console.log('Running in development mode', backendhost);
} else if (import.meta.env.NODE_ENV === 'production') {
    console.log('Running in production mode', backendhost);
}

export let USE_LOCAL_DATA = false; // 是否使用本地数据
const hostname = window.location.hostname;
export let backendLoginUrl = `${backendhost}/auth/jwt/login`;
export let backendQuezUrl = `${backendhost}/quez`;
export let frontendhost = `http://${hostname}`