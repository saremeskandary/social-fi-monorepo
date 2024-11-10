import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Comment {
  'content' : string,
  'author' : Principal,
  'timestamp' : bigint,
}
export type Error = { 'InvalidInput' : null } |
  { 'AlreadyLiked' : null } |
  { 'SystemError' : null } |
  { 'NotFound' : null } |
  { 'NotAuthorized' : null } |
  { 'NotLiked' : null };
export interface Post {
  'id' : PostId__1,
  'content' : string,
  'user_likes' : Array<Principal>,
  'author' : Principal,
  'likes' : bigint,
  'timestamp' : bigint,
  'comments' : Array<Comment>,
}
export type PostId = bigint;
export type PostId__1 = bigint;
export type PostResult = { 'ok' : Post } |
  { 'err' : Error };
export interface Post__1 {
  'id' : PostId__1,
  'content' : string,
  'user_likes' : Array<Principal>,
  'author' : Principal,
  'likes' : bigint,
  'timestamp' : bigint,
  'comments' : Array<Comment>,
}
export interface SocialMediaDapp {
  'addComment' : ActorMethod<[PostId, string], PostResult>,
  'createPost' : ActorMethod<[string], PostResult>,
  'getAllPosts' : ActorMethod<[], Array<Post__1>>,
  'getPost' : ActorMethod<[PostId], PostResult>,
  'likePost' : ActorMethod<[PostId], PostResult>,
  'unlikePost' : ActorMethod<[PostId], PostResult>,
}
export interface _SERVICE extends SocialMediaDapp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
