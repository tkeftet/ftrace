import mongoose from 'mongoose';
import { env } from './env';

// DNS SRV failures look like ECONNREFUSED/ENOTFOUND/querySrv on `mongodb+srv://`
// URIs. On restricted networks (corporate/school firewalls that block TCP/53
// or public DNS) the SRV lookup fails even when Atlas itself is reachable.
const isDnsSrvError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const code = (err as NodeJS.ErrnoException).code;
  const syscall = (err as NodeJS.ErrnoException).syscall;
  return (
    syscall === 'querySrv' ||
    code === 'ENOTFOUND' ||
    (code === 'ECONNREFUSED' && /querySrv|_mongodb\._tcp/.test(err.message))
  );
};

const connectOnce = async (uri: string) =>
  mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5_000,
  });

const connectDB = async (): Promise<void> => {
  const primary = env.MONGO_URI;
  const fallback = env.MONGO_URI_FALLBACK;

  try {
    const conn = await connectOnce(primary);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    if (isDnsSrvError(error) && fallback) {
      console.warn('Primary MongoDB URI failed DNS SRV lookup — retrying with MONGO_URI_FALLBACK.');
      try {
        const conn = await connectOnce(fallback);
        console.log(`MongoDB connected (fallback): ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error('MongoDB fallback connection failed:', fallbackError);
        process.exit(1);
      }
    }

    console.error('MongoDB connection error:', error);
    if (isDnsSrvError(error)) {
      console.error(
        'Hint: this looks like a DNS SRV lookup failure. If you are on a ' +
          'restricted network, switch MONGO_URI to the non-SRV form (Atlas → ' +
          'Connect → Drivers → older driver version), or set MONGO_URI_FALLBACK ' +
          'to the non-SRV form to fall back automatically.'
      );
    }
    process.exit(1);
  }
};

export default connectDB;
