declare module '@supabase/supabase-js' {
export type AuthChangeEvent =
| 'INITIAL_SESSION'
| 'SIGNED_IN'
| 'SIGNED_OUT'
| 'PASSWORD_RECOVERY'
| 'TOKEN_REFRESHED'
| 'USER_UPDATED';

export interface User {
id: string;
email?: string;
}

export interface Session {
access_token: string;
user: User;
}

interface SupabaseError {
message: string;
}

interface QueryBuilder {
select(columns: string): QueryBuilder;
eq(column: string, value: string): QueryBuilder;
single<T = Record<string, unknown>>(): Promise<{ data: T | null; error?: SupabaseError | null }>;
update(values: Record<string, unknown>): QueryBuilder;
upsert(values: Record<string, unknown>, options?: Record<string, unknown>): Promise;
}

interface AuthSubscription {
unsubscribe(): void;
}

interface SupabaseAuthOptions {
persistSession?: boolean;
autoRefreshToken?: boolean;
detectSessionInUrl?: boolean;
}

interface SupabaseClientOptions {
auth?: SupabaseAuthOptions;
global?: {
headers?: Record<string, string>;
};
}

interface AuthClient {
getSession(): Promise<{ data: { session: Session | null }; error?: SupabaseError | null }>;
getUser(token: string): Promise<{ data: { user: User | null }; error?: SupabaseError | null }>;
onAuthStateChange(
callback: (event: AuthChangeEvent, session: Session | null) => void | Promise
): { data: { subscription: AuthSubscription } };
signInWithPassword(credentials: { email: string; password: string }): Promise<{ error?: SupabaseError | null }>;
signInWithOtp(payload: { email: string; options?: { emailRedirectTo?: string } }): Promise<{ error?: SupabaseError | null }>;
signOut(): Promise;
}

interface SupabaseClient {
auth: AuthClient;
from(table: string): QueryBuilder;
}

export function createClient(url: string, key: string, options?: SupabaseClientOptions): SupabaseClient;
}

declare module 'stripe' {
declare class Stripe {
constructor(apiKey: string, options?: { apiVersion?: string });

 
checkout: {
  sessions: {
    create(payload: Record<string, unknown>): Promise<{ url?: string | null; id: string }>;
  };
};

webhooks: {
  constructEvent(payload: Buffer, signature: string, secret: string): Stripe.Event;
};
 

}

declare namespace Stripe {
interface Event {
type: string;
data: { object: unknown };
}

 
namespace Checkout {
  interface Session {
    customer_email?: string | null;
    metadata?: Record<string, string>;
    customer?: string | null;
    subscription?: string | null;
  }
}

interface Subscription {
  customer?: string | null;
  metadata?: Record<string, string>;
  status: string;
}

interface Invoice {
  customer?: string | null;
}
 

}

export default Stripe;
}
