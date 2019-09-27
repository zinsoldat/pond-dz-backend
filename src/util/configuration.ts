export const config = {
  port: 4000,
  certificates: {
    path: '',
  },
  confirmation: {
    duration: 60 * 10 * 1000, // 10 minutes
  },
  token: {
    duration: 60 * 10 * 1000, // 10 minutes
    secret: 'this!is?s3cr3t!?',
  },
};
