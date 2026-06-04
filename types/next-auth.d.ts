import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    rol: string;
  }

  interface Session {
    user: {
      id: string;
      rol: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: string;
  }
}
