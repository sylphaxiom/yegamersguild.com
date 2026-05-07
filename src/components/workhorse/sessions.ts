import { createCookieSessionStorage} from 'react-router';

type SessionData = {
    state:string;
    clientId:string;
    token:string;
    isValid:boolean;
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage<SessionData>({
    cookie:{
        name: "snickerdoodle",
        domain: "sylphaxiom.com",
        httpOnly: true,
        sameSite: "lax",
        path: "/shop",
        maxAge: 72000,
        secure: true,
    }
})

export {getSession,commitSession,destroySession}