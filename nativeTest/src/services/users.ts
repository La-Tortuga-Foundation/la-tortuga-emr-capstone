import { run, queryOne, query } from './db';


export function createUser(
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    role: 'admin' | 'staff'
): void {
    run(`INSERT INTO users (firstName, lastName, username, password, role, isActive, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [firstName, lastName, username, password, role, 1, new Date().toISOString()])
}

export function getUserByUsername(username: string, password: string): any {
  const user:any = queryOne(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password]);

  if(user){
    return true;
  }

  return false;
}


