import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL, SUPABASE_ANON_KEY} from '../utils/constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signIn(phone: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({
    phone,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(name: string, phone: string, password: string, role: string) {
  const {data: authData, error: authError} = await supabase.auth.signUp({
    phone,
    password,
  });
  if (authError) throw authError;
  if (authData.user) {
    const {error: dbError} = await supabase.from('users').insert({
      id: authData.user.id,
      name,
      phone,
      role,
    });
    if (dbError) throw dbError;
  }
  return authData;
}

export async function signOut() {
  const {error} = await supabase.auth.signOut();
  if (error) throw error;
}
