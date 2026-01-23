import bcrypt from "bcrypt";
import { User } from "@shared/schema";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByUsername(username: string) {
  return await User.findOne({ username });
}

export async function findUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function findUserById(id: string) {
  return await User.findById(id);
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  const passwordHash = await hashPassword(data.password);
  
  const newUser = new User({
    username: data.username,
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "user",
  });

  await newUser.save();
  
  return {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    role: newUser.role,
  };
}

export async function updateUserProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
}) {
  const updated = await User.findByIdAndUpdate(
    userId,
    { ...data },
    { new: true }
  );

  return updated;
}
