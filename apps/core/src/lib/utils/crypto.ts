import * as bcrypt from 'bcrypt';

export function createBcryptHash(password): Promise<string> {
  const SALT_ROUNDS = 10;

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, function (err, hash) {
      if (err) {
        return reject(err);
      }

      resolve(hash);
    });
  });
}

export function compareBcryptHashes(original, comparison): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(original, comparison, function (err, hash) {
      if (err) {
        return reject(err);
      }

      resolve(hash);
    });
  });
}
