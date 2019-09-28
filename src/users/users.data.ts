import { User } from '../model/User';

export function getValidUser(): User {
  const users = getValidUsers();
  return users[Math.ceil(Math.random() * users.length) - 1];
}
export function getValidUsers(): User[] {
  return [{
    userId: '1',
    username: 'john',
    email: 'john@mail.com',
    password: 'changeme',
    confirmed: true,
    registrationDate: new Date(),
  },
  {
    userId: '2',
    username: 'chris',
    email: 'chris@mail.com',
    password: 'secret',
    confirmed: true,
    registrationDate: new Date(),
  },
  {
    userId: '3',
    username: 'maria',
    email: 'maria@mail.com',
    password: 'guess',
    confirmed: false,
    registrationDate: new Date(),
  },
  ];
}
