import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB ?? "novabite";

mongoose.set("bufferCommands", false);

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

global.mongooseCache = cached;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "Falta MONGODB_URI. Crea el archivo .env.local a partir de .env.example y reinicia el servidor.",
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB,
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        cached.promise = null;
        throw new Error(
          `No fue posible conectar con MongoDB. Verifica MONGODB_URI/MONGODB_DB y que tu clúster permita conexiones. Detalle: ${error.message}`,
        );
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
